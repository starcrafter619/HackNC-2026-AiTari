// ---------- Pomodoro ----------
let interval;

document.getElementById("startBtn").addEventListener("click", () => {
  clearInterval(interval);
  let remaining = Number(document.getElementById("minutes").value) * 60;
  interval = setInterval(() => {
    remaining--;
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(interval);
      alert("Time's up! Take a break.");
    }
  }, 1000);
});

// ---------- Chat ----------
const chat = document.getElementById("chat");

function addMessage(who, text) {
  const p = document.createElement("p");
  p.textContent = `${who}: ${text}`;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("message");
  const message = input.value.trim();
  if (!message) return;
  input.value = "";
  addMessage("You", message);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notes: document.getElementById("notes").value,
      message,
    }),
  });
  const data = await res.json();
  addMessage("Gemini", data.reply);
}

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});