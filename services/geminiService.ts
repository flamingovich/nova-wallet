
// Updated to follow @google/genai guidelines and use gemini-3-pro-preview
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (balance: number, transactions: Transaction[]) => {
  // Always use process.env.API_KEY directly as per guidelines
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return {
      summary: "Искусственный интеллект Nova временно недоступен. Настройте API ключ.",
      tips: ["Планируйте бюджет заранее", "Создайте финансовую подушку", "Диверсифицируйте накопления"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const historyString = transactions
    .slice(0, 10) // More context for pro model
    .map(t => `${t.merchant}: ${t.type === 'expense' ? '-' : '+'}${t.amount}${t.currency}`)
    .join(', ');

  const prompt = `Проанализируй финансовую ситуацию пользователя. 
  Текущий баланс (в эквиваленте RUB): ${balance}₽. 
  Последние операции: ${historyString}. 
  Предоставь краткое резюме (summary) и 3 конкретных совета (tips) на русском языке.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Upgraded for complex reasoning
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING,
              description: "Краткий финансовый итог"
            },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 совета по управлению деньгами"
            }
          },
          required: ["summary", "tips"],
          propertyOrdering: ["summary", "tips"]
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
