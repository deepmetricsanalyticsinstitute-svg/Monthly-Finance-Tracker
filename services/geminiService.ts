import { GoogleGenAI } from "@google/genai";
import { Transaction, FinancialSummary } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFinancialAdvice = async (
  summary: FinancialSummary,
  recentTransactions: Transaction[]
): Promise<string> => {
  if (!apiKey) {
    return "Please configure your API Key to receive AI insights.";
  }

  try {
    const transactionHistory = recentTransactions
      .slice(0, 10)
      .map(t => `- ${t.date}: ${t.type.toUpperCase()} $${t.amount} (${t.description})`)
      .join('\n');

    const prompt = `
      You are a helpful financial advisor. Analyze the following monthly financial summary and recent transactions.
      
      Summary:
      - Total Income: $${summary.totalIncome.toFixed(2)}
      - Total Expenses: $${summary.totalExpenses.toFixed(2)}
      - Net Savings: $${summary.savings.toFixed(2)}

      Recent Transactions (Last 10):
      ${transactionHistory}

      Provide 3 short, actionable, and encouraging bullet points of advice to improve savings or manage expenses better. Keep it under 100 words total.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate advice at this time.";
  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Sorry, I encountered an error while analyzing your finances.";
  }
};