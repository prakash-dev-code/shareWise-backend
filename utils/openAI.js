// utils/openai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummary(content) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Summarize the following content in 5-6 lines:\n\n${content}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text.trim();
}

module.exports = { generateSummary };
