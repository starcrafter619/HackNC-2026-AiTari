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
let timer = null, remaining = 25 * 60;
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
