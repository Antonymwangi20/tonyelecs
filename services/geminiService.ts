
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

// Fix: Initialize GoogleGenAI strictly following the guideline using process.env.API_KEY directly.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const getShoppingAdvice = async (userPrompt: string, history: {role: string, content: string}[]) => {
  try {
    const productsContext = PRODUCTS.map(p => 
      `${p.name} (${p.category}): $${p.price}. ${p.description}`
    ).join("\n");

    // Fix: Filter history to ensure it alternates correctly. Skip the initial assistant greeting if it's the start of the list.
    const historyParts = history
      .filter((h, i) => !(i === 0 && h.role === 'assistant'))
      .map(h => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: h.content }] 
      }));

    // Fix: Move system instructions and product context to the systemInstruction config property.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...historyParts,
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: `You are an expert electronics shopping assistant for VoltVibe Electronics.
        The current catalog includes:
        ${productsContext}
        
        Answer user questions about electronics, suggest specific products from the list above, and explain technical specs.
        Be helpful, concise, and professional. Use markdown for lists and bolding.`,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    // Fix: Access text directly as a property, not a method, as per guidelines.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting to my database. Feel free to browse our products manually or try asking me again in a moment!";
  }
};
