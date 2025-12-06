import { DrawnCard, SpreadConfig } from "../types";

// Configuration from test.js
const BASE_URL = import.meta.env.VITE_API_URL || "https://ai.megallm.io";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const MODEL = import.meta.env.VITE_API_MODEL || "moonshotai/kimi-k2-thinking";

// Proxy configuration
const PROXY_URL = BASE_URL;
const PROXY_PASSWORD = API_KEY;
const MODEL_TO_USE = MODEL;
const API_ENDPOINT = `${PROXY_URL}/v1/chat/completions`;

export const getTarotInterpretation = async (
  spread: SpreadConfig,
  drawnCards: DrawnCard[],
  onChunk?: (text: string) => void
): Promise<string> => {

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

  // Construct OpenAI format payload
  const payload = {
    model: MODEL_TO_USE,
    messages: [
      {
        role: "user",
        content: promptContext
      }
    ],
    stream: true, // Enable streaming
    temperature: 0.7,
    max_tokens: 2048
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PROXY_PASSWORD}`
    },
    body: JSON.stringify(payload)
  };

  try {
    console.log(`[Request] Sending to ${API_ENDPOINT}...`);
    console.log(`[Request] Model: ${MODEL_TO_USE}`);

    const response = await fetch(API_ENDPOINT, options);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Error] HTTP Status: ${response.status} ${response.statusText}`);
      console.error("[Error] Response Details:", errorBody);
      return `The spirits are silent. (HTTP Error: ${response.status})`;
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

        const dataStr = trimmedLine.replace("data: ", "");
        if (dataStr === "[DONE]") break;

        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content || "";
          if (content) {
            fullText += content;
            if (onChunk) {
              onChunk(content);
            }
          }
        } catch (e) {
          console.warn("Error parsing SSE JSON:", e);
        }
      }
    }

    return fullText;

  } catch (error: any) {
    console.error("[Critical Error] Request failed:", error.message);
    return "The connection to the ether is weak. Please try again later. (Network Error)";
  }
};

// Removed generateTarotImage as it was not part of the request to port test.js logic 
// and the new endpoint might not support image generation in the same way.
export const generateTarotImage = async (cardName: string): Promise<string | null> => {
  return null;
};