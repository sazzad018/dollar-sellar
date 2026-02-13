import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

// Initialize Gemini Client
// Note: In a real production app, ensure API_KEY is handled securely via backend proxy if possible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTradeHistory = async (transactions: Transaction[], currentStats: any): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure your environment.";
  }

  if (transactions.length === 0) {
    return "No transactions to analyze yet. Add some buy/sell records!";
  }

  // Format data for the model
  const dataSummary = JSON.stringify({
    stats: currentStats,
    recentTransactions: transactions.slice(0, 10), // Analyze last 10 for brevity
  });

  const prompt = `
    You are a financial analyst helper for a small currency trader in Bangladesh.
    The user speaks Bengali and English. 
    Analyze the following trading data (Dollar Buy/Sell).
    
    Data: ${dataSummary}
    
    Provide a concise summary in **Bengali** (Bangla) covering:
    1. Their current performance (Profit/Loss).
    2. A comment on their average buy rate vs current selling rates.
    3. Any warning if they are holding too much stock or selling at a loss.
    
    Keep the tone professional yet encouraging. Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Analysis failed to generate text.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to generate analysis at this moment. Please try again later.";
  }
};