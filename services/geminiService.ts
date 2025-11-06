import { GoogleGenAI, Type, Content } from "@google/genai";
import type { Mood } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const dialogueSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: { type: Type.STRING, description: 'What they say when ordering bread, reflecting their mood.' },
    coffeeDialogue: { type: Type.STRING, description: 'What they say when deciding to stay for a coffee, reflecting their mood.' },
  },
  required: ['dialogue', 'coffeeDialogue'],
};

export const generateDailyDialogue = async (personality: string, name: string, mood: Mood, desiredBread: string): Promise<{dialogue: string, coffeeDialogue: string}> => {
    try {
        const prompt = `You are a character named ${name} in a bakery game. Your personality is: "${personality}". 
        Today, your mood is ${mood}. 
        Generate two short, in-character lines of dialogue based on this mood:
        1. A greeting when you enter the bakery to order a ${desiredBread}.
        2. A comment you'd make if you decide to stay for a coffee.
        Return the response strictly as a JSON object matching the provided schema. Do not include any markdown formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: dialogueSchema,
            },
        });

        const dialogueData = JSON.parse(response.text);
        
        if (dialogueData.dialogue && dialogueData.coffeeDialogue) {
            return dialogueData;
        } else {
            throw new Error("Generated data is missing required fields.");
        }

    } catch (error) {
        console.error(`Error generating dialogue for ${name}:`, error);
        // Fallback dialogue
        return {
            dialogue: `Just a ${desiredBread} for me, please.`,
            coffeeDialogue: "I suppose I have time for a coffee.",
        };
    }
};


export const continueConversation = async (
    personality: string,
    history: { role: string; text: string }[]
): Promise<string> => {
    try {
        const systemInstruction = `You are a character in a bakery game. Your personality is: "${personality}". You are talking to the baker. Respond to the player as this character. Keep your responses very short and in character, like a brief chat in a shop.`;

        const contents: Content[] = history.map(msg => ({
            role: msg.role === 'player' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error continuing conversation:", error);
        return "I'm sorry, I'm a bit lost for words right now.";
    }
};