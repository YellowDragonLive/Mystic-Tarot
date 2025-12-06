import { GoogleGenAI } from "@google/genai";
import { DrawnCard, SpreadConfig } from "../types";

// Note: In a real environment, verify API key existence before init.
// The prompt ensures we don't ask user for key in UI, but rely on env.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const getTarotInterpretation = async (
  spread: SpreadConfig,
  drawnCards: DrawnCard[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key not found. Please configure the environment variable.";
  }

  const model = "gemini-2.5-flash"; // Fast and creative

  let promptContext = `You are a professional, mystical Tarot Reader with deep knowledge of the Rider-Waite system. 
  Please interpret the following ${spread.name} spread for the user. 
  Use a mysterious yet comforting tone. Keep the language Chinese (Simplified).\n\n`;

  promptContext += `Spread Type: ${spread.name} - ${spread.description}\n\n`;
  
  promptContext += `Cards Drawn:\n`;
  drawnCards.forEach((dc, index) => {
    const pos = spread.positions[index];
    const status = dc.isReversed ? "逆位 (Reversed)" : "正位 (Upright)";
    promptContext += `${index + 1}. Position: ${pos.name} (${pos.description})\n`;
    promptContext += `   Card: ${dc.card.name_cn} (${dc.card.name}) - ${status}\n`;
  });

  promptContext += `\nPlease provide a comprehensive reading. 
  1. briefly explain each card in its position.
  2. provide a synthesis/summary of the overall energy.
  3. give actionable advice.
  Format the output using clear Markdown headers and bullet points.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: promptContext,
      config: {
        systemInstruction: "You are a mystical Tarot AI. Your output should be elegant, insightful, and formatted in Markdown.",
        temperature: 1.0, // High creativity
      }
    });

    return response.text || "The spirits are silent (No response from AI).";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The connection to the ether is weak. Please try again later. (API Error)";
  }
};

export const generateTarotImage = async (cardName: string): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a stunning, high-fantasy static tarot card illustration for: ${cardName}. 
            Style: Mystical, dark academia, intricate gold filigree details, ethereal lighting, masterpiece, 8k resolution.
            The image should be a single, static pictorial representation of the card's meaning.
            Do not include text on the card. Focus on the symbolism.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};