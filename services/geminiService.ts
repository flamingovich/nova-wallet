
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (balance: number, transactions: Transaction[]) => {
  // Проверка на наличие API_KEY для предотвращения падения приложения
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Check your environment variables.");
    return {
      summary: "Искусственный интеллект Nova временно недоступен. Настройте API ключ.",
      tips: ["Планируйте бюджет заранее", "Создайте финансовую подушку", "Диверсифицируйте накопления"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
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

    const responseText = response.text?.trim() || "{}";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Не удалось получить анализ от нейросети. Попробуйте позже.",
      tips: ["Следите за расходами вручную", "Установите лимиты", "Копите на мечту"]
    };
  }
};
