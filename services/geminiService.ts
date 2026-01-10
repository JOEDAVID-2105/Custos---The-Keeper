
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export class GeminiService {
  static async analyzeFinances(transactions: Transaction[], currency: string, language: 'en' | 'ta' = 'en') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const transactionsSummary = transactions.map(t => ({
      amount: t.amount,
      type: t.type,
      category: t.category,
      note: t.note,
      date: new Date(t.timestamp).toLocaleDateString()
    }));

    const langInstruction = language === 'ta' 
      ? "Respond entirely in simple, clear Tamil. Avoid complex words." 
      : "Respond in simple, clear English (Grade 6 level).";

    const prompt = `
      Act as a helpful financial advisor. Analyze this family spending data:
      ${JSON.stringify(transactionsSummary)}
      
      Currency: ${currency}
      ${langInstruction}
      
      Requirements:
      - Use very simple language.
      - Use short bullet points.
      - 1. Money In and Out (2 bullets)
      - 2. What you spend on most (2 bullets)
      - 3. 3 Simple tips to save money (3 bullets)
      - 4. One specific goal for the family.
      
      Tone: Friendly and easy to understand.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return language === 'ta' 
        ? "ஆலோசகர் தற்போது இல்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
        : "The Guardian is temporarily unavailable for consultation.";
    }
  }
}
