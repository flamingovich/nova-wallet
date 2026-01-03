
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (balance: number, transactions: Transaction[]) => {
  // Fix: Strictly use process.env.API_KEY for initialization as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const historyString = transactions
    .slice(0, 5)
    .map(t => `${t.merchant}: ${t.type === 'expense' ? '-' : '+'}${t.amount}$`)
    .join(', ');

  const prompt = `Analyze this user's current financial situation. 
  Current Balance: ${balance}$. 
  Recent Activity: ${historyString}. 
  Provide a concise summary and 3 actionable financial tips in Russian.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "tips"]
        }
      }
    });

    // Fix: access response.text property (not a method) and handle potential undefined
    const responseText = response.text?.trim() || "{}";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Не удалось получить анализ. Проверьте подключение.",
      tips: ["Следите за расходами вручную", "Установите лимиты", "Копите на мечту"]
    };
  }
};
