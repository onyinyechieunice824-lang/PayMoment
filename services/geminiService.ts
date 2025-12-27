
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const analyzeFinances = async (query: string, transactions: Transaction[]) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please check your environment variables.");
    return "I'm currently unable to access my intelligence core. Please ensure the API Key is configured.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const transactionContext = JSON.stringify(transactions.map(t => ({
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.timestamp
  })));

  const systemInstruction = `
    You are PayAI, the intelligent assistant for PayMoment, a premium Nigerian fintech app.
    Your goal is to help users manage their finances better locally and globally.
    You have access to their recent transactions: ${transactionContext}.
    
    NEW FEATURE INFO:
    - Users can now send money to China (Alipay/WeChat), USA, UK, EU, and Canada via "Global Wire".
    - Users have virtual international bank accounts (USD, GBP, EUR) to receive money from anywhere.
    - Peer-to-peer transfers are done using "PayMoment ID" (e.g., @tobi_pay).
    - Exchange rates are real-time and competitive.
    
    Keep responses concise, friendly, and helpful. Use Nigerian context where appropriate (e.g., mention "Naira" or "NGN").
    If they ask about international transfers, explain that PayMoment handles Global Wires to 100+ countries.
    If they ask about receiving dollars, mention their "Receive USD" account details in the Global section.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text || "I'm sorry, I couldn't process that right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "PayAI is currently resting. Please try again in a bit.";
  }
};
