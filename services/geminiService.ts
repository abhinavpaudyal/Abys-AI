
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export const getGeminiResponse = async (prompt: string, history: { role: string; parts: string }[] = []) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Switch to Flash Lite for higher rate limits and reliability
    const chat = ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [
        ...history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.parts }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const result: GenerateContentResponse = await chat;
    return result.text || "I apologize, but I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("429") || error?.status === 429) {
      return "The service is currently under heavy load. Please wait about 10-15 seconds before trying again.";
    }
    return "I'm having trouble connecting to my brain right now. Please check your connection and try again.";
  }
};
