require('dotenv').config();
const express = require('express');
const cors = require('cors');
// 我们将重新使用 OpenAI 的 SDK，因为它能兼容绝大多数中转服务
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 初始化一个指向中转服务的 OpenAI 客户端
const client = new OpenAI({
  apiKey: process.env.FORWARD_API_KEY,      // 使用中转服务的密钥
  baseURL: process.env.FORWARD_BASE_URL,    // 使用中转服务的地址
});

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
    
    // 使用性价比最高的 gemini-1.5-flash-latest 模型
    const completion = await client.chat.completions.create({
      model: "gemini-1.5-flash-latest", 
      messages: [{ role: "user", content: megaPrompt }],
    });

    const text = completion.choices[0].message.content;
    res.json({ proposal: text });

  } catch (error) {
    console.error("Error generating proposal via Forwarding API:", error);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
