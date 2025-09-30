require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
  try {
    const { topic, hypothesis, aim1, aim2 } = req.body;

    const megaPrompt = `
      **Role:** You are an expert grant writer with 20 years of experience helping postdocs secure funding from the NIH. You are precise, persuasive, and an expert in biomedical terminology.
      **Task:** Write a compelling 'Specific Aims' page for an NIH grant proposal based on the user's input. The tone should be confident and scholarly. Structure the output into four distinct paragraphs.
      **User's Input:**
      - Research Topic: ${topic}
      - Central Hypothesis: ${hypothesis}
      - Specific Aim 1: ${aim1}
      - Specific Aim 2: ${aim2}
      **Constraint:** The total length should be approximately one page (around 500 words). Do not invent technical details. Generate the text now.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: megaPrompt }],
    });

    res.json({ proposal: completion.choices[0].message.content });

  } catch (error) {
    console.error("Error generating proposal:", error);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
