import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Voice AI fallback to standard parsing.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
};

export const parsePosVoiceCommandAI = async (
  rawText: string,
  availableProducts: { id: string, name: string }[],
  availableCustomers: { id: string, name: string, phone: string }[]
) => {
  const ai = getAI();
  if (!ai) return null;

  const productListStr = availableProducts.map(p => `${p.id}:::${p.name}`).join("\n");
  const customerListStr = availableCustomers.map(c => `${c.id}:::${c.name}:::${c.phone}`).join("\n");

  const prompt = `
You are an intelligent POS assistant helping extract intents from voice queries in Bengali, Arabic, and English.
The user may want to:
1. Set a customer (e.g., "customer John" or "কাস্টমার করিম" or "العميل محمد")
2. Add one or multiple products at once (e.g., "flour, 2kg sugar, onion" or "ময়দা, ২ কেজি চিনি, পেঁয়াজ" or "سكر ٢ كيلو")

Transcript: "${rawText}"

Available Products (ID:::NAME):
${productListStr}

Available Customers (ID:::NAME:::PHONE):
${customerListStr}

Rules:
1. NEVER output or echo the list of products or customers in the JSON response.
2. If multiple products are mentioned, IDENTIFY ALL OF THEM. You MUST return an entry for EACH product mentioned in the transcript. DO NOT OMIT ANY ITEMS.
3. If no quantity is mentioned for a product, assume 1.
4. Quantity mapping: "দেড়" = 1.5, "আড়াই" = 2.5, "হাফ" = 0.5.
5. Find the BEST matching productId from "Available Products" based on phonetics and translation.
6. Support multiple items separated by commas, "and", "এবং", "ও", or spacing.
7. Ensure the output is strictly valid JSON conforming to the schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, description: '"setCustomer", "addProduct", "newProduct" or "unknown"' },
                  customerId: { type: Type.STRING, nullable: true },
                  productId: { type: Type.STRING, nullable: true },
                  quantity: { type: Type.NUMBER },
                  recognizedName: { type: Type.STRING, description: "The name the user said for this item" }
                },
                required: ["action", "quantity"]
              }
            },
            summary: { type: Type.STRING, description: "A summary of what was understood (e.g. Added 3 items)" }
          },
          required: ["items", "summary"]
        }
      }
    });

    if (response && response.text) {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      return JSON.parse(cleanText);
    }
  } catch (error: any) {
    console.error("AI parse voice command failed:", error);
    if (error?.error?.code === 429 || error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
  }
  return null;
};
