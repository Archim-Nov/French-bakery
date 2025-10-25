import { GoogleGenAI, Type } from "@google/genai";
import type { Customer } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const customerSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'The customer\'s name.' },
    personality: { type: Type.STRING, description: 'A short, quirky personality description.' },
    dialogue: { type: Type.STRING, description: 'What they say when ordering bread.' },
    avatarUrl: { type: Type.STRING, description: 'A URL from picsum.photos, size 100x100.' },
  },
  required: ['name', 'personality', 'dialogue', 'avatarUrl'],
};

export const generateCustomer = async (): Promise<Omit<Customer, 'id' | 'favorability'>> => {
    try {
        const prompt = `Generate a unique and quirky character profile for a customer visiting a fantasy bakery. 
        Provide a name, a short personality description, a line of dialogue for ordering bread, and an avatar URL. 
        The avatar URL must be a valid URL from picsum.photos with a size of 100x100 pixels (e.g., https://picsum.photos/100).
        Return the response strictly as a JSON object matching the provided schema. Do not include any markdown formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: customerSchema,
            },
        });

        const customerData = JSON.parse(response.text);
        
        // Basic validation
        if (customerData.name && customerData.personality && customerData.dialogue && customerData.avatarUrl) {
            return customerData;
        } else {
            throw new Error("Generated data is missing required fields.");
        }

    } catch (error) {
        console.error("Error generating customer:", error);
        // Fallback customer
        return {
            name: "Barnaby the Baker",
            personality: "A friendly baker who forgot his own bread.",
            dialogue: "I seem to have misplaced my lunch... got a simple loaf?",
            avatarUrl: `https://picsum.photos/100?random=${Math.random()}`,
        };
    }
};