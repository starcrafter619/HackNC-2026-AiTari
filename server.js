import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from the environment
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"; // change in Render > Environment, no code edit needed

const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

app.post("/api/chat", async (req, res) => {
  try {
    const { notes, message, mode, asked = [] } = req.body || {};

    // ----- QUIZ MODE: returns one multiple-choice question as JSON -----
    if (mode === "quiz") {
      const input =
        `You are a quiz master. Using ONLY the study notes below, write ONE multiple-choice question with exactly 4 options.\n` +
        `Reply with ONLY raw JSON (no markdown, no code fences) in this shape:\n` +
        `{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"one short sentence"}\n` +
        `"answer" is the index (0-3) of the correct option. Do not repeat these earlier questions: ${JSON.stringify(asked)}\n\n` +
        `NOTES:\n${notes || "(none)"}`;
      const interaction = await ai.interactions.create({ model: MODEL, input });
      const raw = (interaction.output_text || "").replace(/```json|```/g, "");
      const q = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !(q.answer >= 0 && q.answer < 4)) {
        throw new Error("Bad quiz format");
      }
      const correct = q.options[q.answer];
      const options = shuffle(q.options); // so the right answer isn't always in the same spot
      return res.json({ quiz: { question: q.question, options, answer: options.indexOf(correct), explanation: q.explanation || "" } });
    }

    // ----- NORMAL CHAT -----
    const input =
      `You are a helpful study assistant. Base your answers on the student's notes below. ` +
      `If the notes don't cover something, say so.\n\nNOTES:\n${notes || "(no notes provided)"}\n\nSTUDENT QUESTION:\n${message}`;
    const interaction = await ai.interactions.create({ model: MODEL, input });
    res.json({ reply: interaction.output_text || "(empty response)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error: " + err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Running"));