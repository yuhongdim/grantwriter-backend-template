require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 初始化 Google AI，确保环境变量名称正确
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/generate', async (req, res) => {
  try {
    const { topic, hypothesis, aim1, aim2 } = req.body;

    const megaPrompt = `
      **Role:** You are an expert grant writer with 20 years of experience helping postdocs secure funding from the NIH. You are precise, persuasive, and an expert in biomedical terminology.
      **Task:** Write a compelling 'Specific Aims' page for an NIH grant proposal based on the user's input. The tone should be confident and scholarly. Structure the output into the following four distinct paragraphs.
      **User's Input:**
      - Research Topic: ${topic}
      - Central Hypothesis: ${hypothesis}
      - Specific Aim 1: ${aim1}
      - Specific Aim 2: ${aim2}
      **Constraint:** The total length should be approximately one page (around 500 words). Do not invent technical details. Generate the text now.
    `;
    
    // 使用最稳定通用的 gemini-pro 模型，避免权限问题
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    const result = await model.generateContent(megaPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ proposal: text });

  } catch (error) {
    console.error("Error generating proposal with Google AI:", error);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
