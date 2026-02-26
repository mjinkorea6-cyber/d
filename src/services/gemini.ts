import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DictionaryResult {
  word: string;
  definition: string;
  usage: string;
}

export async function lookupWord(word: string): Promise<DictionaryResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a helpful English-Chinese dictionary.
    User input: "${word}"
    
    Please provide:
    1. The Chinese definition (definition).
    2. A common usage example sentence in English, followed by its Chinese translation (usage).
    
    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING, description: "The Chinese definition of the word" },
          usage: { type: Type.STRING, description: "Example sentence in English and Chinese" },
        },
        required: ["definition", "usage"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  const data = JSON.parse(text);
  return {
    word,
    definition: data.definition,
    usage: data.usage,
  };
}
