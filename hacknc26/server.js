import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from the environment

// Set to true if you want Gemini to be able to search the web too
const USE_SEARCH = false;

app.post("/api/chat", async (req, res) => {
  try {
    const { notes, message } = req.body;

    const input =
      `You are a helpful study assistant. Base your answers on the student's notes below. ` +
      `If the notes don't cover something, say so.\n\n` +
      `NOTES:\n${notes || "(no notes provided)"}\n\n` +
      `STUDENT QUESTION:\n${message}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input,
      ...(USE_SEARCH && { tools: [{ type: "google_search" }] }),
    });

    // Collect citations (only present when search is used)
    const citations = [];
    for (const step of interaction.steps) {
      if (step.type === "model_output") {
        for (const block of step.content) {
          if (block.type === "text" && block.annotations) {
            for (const a of block.annotations) {
              if (a.type === "url_citation") {
                citations.push({ title: a.title, url: a.url });
              }
            }
          }
        }
      }
    }

    res.json({ reply: interaction.output_text, citations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error: " + err.message, citations: [] });
  }
});

app.listen(3000, () => console.log("Running at http://localhost:3000"));