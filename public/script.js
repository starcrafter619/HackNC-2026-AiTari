const $ = (id) => document.getElementById(id);

// ---------- Scale the 1280x800 stage to fit the window ----------
const stage = $("stage");
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 800);
  stage.style.transform = `scale(${s}) translate(-50%, -50%)`;
}
addEventListener("resize", fit);
fit();

// ---------- Screen navigation (replaces Penpot's click interactions) ----------
function go(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
}
$("cartridge").addEventListener("click", () => go("home"));
document.querySelectorAll("[data-go]").forEach((el) =>
  el.addEventListener("click", () => go(el.dataset.go))
);

// ---------- Notes (saved in the browser; sent to Gemini with each chat message) ----------
let notes = "";
try { notes = localStorage.getItem("aitari-notes") || ""; } catch {}
$("notesText").value = notes;

function updateStatus() {
  $("notesStatus").textContent = notes.trim() ? `Notes loaded (${notes.length} chars)` : "No notes yet";
}
updateStatus();

$("saveNotes").addEventListener("click", () => {
  notes = $("notesText").value;
  try { localStorage.setItem("aitari-notes", notes); } catch {}
  updateStatus();
  $("saved").textContent = "Saved!";
  setTimeout(() => ($("saved").textContent = ""), 1500);
});
$("clearNotes").addEventListener("click", () => {
  $("notesText").value = "";
  $("saveNotes").click();
});
$("file").addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (f) $("notesText").value = await f.text();
});

// ---------- Pomodoro ----------
let timer = null, remaining = 25 * 60, focusMode = true, focusAcc = 0;
const show = () => {
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  $("time").textContent = `${m}:${s}`;
};
function setMinutes(min) {
  clearInterval(timer); timer = null;
  $("startBtn").textContent = "Start";
  remaining = Math.max(1, Number(min) || 25) * 60;
  $("minutes").value = remaining / 60;
  show();
}
function beep() {
  try {
    const ctx = new AudioContext(), o = ctx.createOscillator();
    o.connect(ctx.destination); o.frequency.value = 660; o.start(); o.stop(ctx.currentTime + 0.6);
  } catch {}
}
$("startBtn").addEventListener("click", () => {
  if (timer) { clearInterval(timer); timer = null; $("startBtn").textContent = "Resume"; return; }
  $("startBtn").textContent = "Pause";
  timer = setInterval(() => {
    remaining--; show();
    if (focusMode && ++focusAcc >= 300) { focusAcc -= 300; addCoins(COINS_PER_5MIN, "5 focused minutes"); }
    if (remaining <= 0) {
      clearInterval(timer); timer = null;
      $("startBtn").textContent = "Start";
      $("time").textContent = "DONE!";
      beep();
    }
  }, 1000);
});
$("resetBtn").addEventListener("click", () => setMinutes($("minutes").value));
$("minutes").addEventListener("change", () => setMinutes($("minutes").value));
document.querySelectorAll(".modes button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".modes button").forEach((x) => x.classList.toggle("on", x === b));
    focusMode = b.textContent === "Focus";
    setMinutes(b.dataset.mode);
  })
);

// ---------- Chat with Gemini (calls your /api/chat) ----------
const chat = $("chat");
function addMsg(cls, text) {
  const p = document.createElement("p");
  p.className = cls; p.textContent = text;
  chat.appendChild(p); chat.scrollTop = chat.scrollHeight;
  return p;
}
async function send() {
  const message = $("message").value.trim();
  if (!message) return;
  $("message").value = "";
  addMsg("me", message);
  if (/^quiz/i.test(message)) return startQuiz();
  const wait = addMsg("bot", "...");
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, message }),
    });
    const data = await res.json();
    wait.textContent = data.reply;
  } catch (err) {
    wait.textContent = "Error: " + err.message;
  }
  chat.scrollTop = chat.scrollHeight;
}
$("sendBtn").addEventListener("click", send);
$("message").addEventListener("keydown", (e) => e.key === "Enter" && send());

// ================= Leaves (coins) + shop =================
const COINS_PER_5MIN = 5;     // per 5 focused minutes on the timer
const COINS_PER_CORRECT = 3;  // per correct quiz answer

// x,y = slot position from Penpot. For "head" items: w = width (in head-widths),
// ax = sideways offset, k = height offset from the top of the head. Tweak these to fit your art!
const ITEMS = [
  { id: "buns",      name: "Bubble Buns",        price: 0,  x: 736,  y: 85,  group: "head", w: 1.2,  ax: 0,   k: 0.5 },
  { id: "spikes",    name: "Bubble Spikes",      price: 0,  x: 1019, y: 84,  group: "head", w: 1.0,  ax: 0,   k: 0.02 },
  { id: "fish",      name: "Bubble The Fish",    price: 15, x: 737,  y: 310, group: "pet" },
  { id: "leaf",      name: "Leaf Hat",           price: 20, x: 1019, y: 310, group: "head", w: 0.42, ax: 0,   k: -0.08 },
  { id: "sunflower", name: "Sunflower",          price: 25, x: 737,  y: 535, group: "head", w: 0.5,  ax: 0.32, k: 0.02 },
  { id: "greenleaf", name: "Leaf Hat But Green", price: 30, x: 1019, y: 538, group: "head", w: 0.42, ax: 0,   k: -0.08 },
];
// head position inside each character image (stage px): centre x, top y, head width
const HEADS = {
  avatar: { el: $("avatar"), W: 739, H: 739, cx: 369, top: 85, hw: 315, petX: 0.82, petY: 0.62, petW: 0.6 },
  mascot: { el: $("mascot"), W: 627, H: 838, cx: 352, top: 59, hw: 315, petX: 0.86, petY: 0.55, petW: 0.5 },
};

let game = { coins: 0, owned: ["buns", "spikes"], equipped: [] };
try { Object.assign(game, JSON.parse(localStorage.getItem("aitari-game") || "{}")); } catch {}
const saveGame = () => { try { localStorage.setItem("aitari-game", JSON.stringify(game)); } catch {} };

let toastT;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800);
}
function addCoins(n, why) {
  game.coins += n; saveGame(); refresh();
  toast(`+${n} leaves! ${why}`);
  document.querySelectorAll(".coin").forEach((c) => { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
}

function drawAccessories() {
  for (const h of Object.values(HEADS)) {
    h.el.querySelectorAll(".acc").forEach((a) => a.remove());
    for (const id of game.equipped) {
      const it = ITEMS.find((i) => i.id === id), img = document.createElement("img");
      img.className = "acc"; img.src = `img/${id}.png`; img.alt = it.name;
      if (it.group === "head") {
        img.style.width = it.w * h.hw + "px";
        img.style.left = h.cx + it.ax * h.hw + "px";
        img.style.top = h.top + it.k * h.hw + "px";
      } else {
        img.style.width = h.petW * h.hw * 0.5 + "px";
        img.style.left = h.petX * h.W + "px";
        img.style.top = h.petY * h.H + "px";
      }
      h.el.appendChild(img);
    }
  }
}

function buildShop() {
  $("slots").innerHTML = "";
  for (const it of ITEMS) {
    const owned = game.owned.includes(it.id), on = game.equipped.includes(it.id);
    const b = document.createElement("button");
    b.className = "slot a" + (owned ? "" : " locked") + (on ? " on" : "");
    b.style.setProperty("--x", it.x); b.style.setProperty("--y", it.y);
    const tag = on ? "Equipped" : owned ? (it.price ? "Owned" : "Free") : `<img src="img/leaf.png" alt="">${it.price}`;
    b.innerHTML = `<img src="img/${it.id}.png" alt=""><span class="tag">${tag}</span><span class="nm">${it.name}</span>`;
    b.onclick = () => onSlot(it, b);
    $("slots").appendChild(b);
  }
}
function onSlot(it, b) {
  if (!game.owned.includes(it.id)) {
    if (game.coins < it.price) {
      b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400);
      return toast(`Need ${it.price - game.coins} more leaves`);
    }
    game.coins -= it.price; game.owned.push(it.id); toast(`Unlocked ${it.name}!`);
  }
  if (game.equipped.includes(it.id)) game.equipped = game.equipped.filter((i) => i !== it.id);
  else {
    // only one head accessory at a time
    if (it.group === "head") game.equipped = game.equipped.filter((i) => ITEMS.find((x) => x.id === i).group !== "head");
    game.equipped.push(it.id);
  }
  saveGame(); refresh();
}
function refresh() {
  document.querySelectorAll("[data-coins]").forEach((e) => (e.textContent = game.coins));
  buildShop(); drawAccessories();
}
refresh();

// ================= Quiz mode (correct answers = leaves) =================
const asked = [];
async function startQuiz() {
  if (!notes.trim()) return addMsg("bot", "Add some notes on the Import Notes screen first, then I can quiz you!");
  const wait = addMsg("bot", "Thinking of a question...");
  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, mode: "quiz", asked: asked.slice(-10) }),
    });
    const data = await res.json();
    wait.remove();
    if (!data.quiz) return addMsg("bot", data.reply || "I couldn't make a question. Try again!");
    showQuiz(data.quiz);
  } catch (err) { wait.textContent = "Error: " + err.message; }
}
function showQuiz(q) {
  asked.push(q.question);
  const box = document.createElement("div"); box.className = "quiz";
  const title = document.createElement("b"); title.textContent = q.question;
  const opts = document.createElement("div"); opts.className = "opts";
  box.append(title, opts);
  q.options.forEach((text, i) => {
    const btn = document.createElement("button"); btn.textContent = text;
    btn.onclick = () => {
      opts.querySelectorAll("button").forEach((x, j) => { x.disabled = true; if (j === q.answer) x.classList.add("right"); });
      if (i === q.answer) addCoins(COINS_PER_CORRECT, "Correct!"); else btn.classList.add("wrong");
      const note = document.createElement("div"); note.textContent = q.explanation || ""; note.style.marginTop = "8px";
      const next = document.createElement("button"); next.className = "next"; next.textContent = "Next question";
      next.onclick = () => { next.remove(); startQuiz(); };
      box.append(note, next); chat.scrollTop = chat.scrollHeight;
    };
    opts.appendChild(btn);
  });
  chat.appendChild(box); chat.scrollTop = chat.scrollHeight;
}
$("quizBtn").addEventListener("click", startQuiz);
