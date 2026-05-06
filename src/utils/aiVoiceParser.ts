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
2. Add one or multiple products at once (e.g., "flour, 2kg sugar, onion" or "ময়দা, ২ কেজি চিনি, পেঁয়াজ, রসুন, আদা, জুস, কলা" or "سكر ٢ كيلو")

Transcript: "${rawText}"

Available Products (ID:::NAME):
${productListStr}

Available Customers (ID:::NAME:::PHONE):
${customerListStr}

Rules:
1. NEVER output or echo the list of products or customers in the JSON response.
2. CRITICAL: IDENTIFY ALL PRODUCTS MENTIONED. If the user mentions 10 products, you MUST return an array of 10 items. Do NOT omit any product mentioned!
3. If no quantity is mentioned for a product, you MUST assume the quantity is 1.
4. Quantity & Unit Mapping (Support ALL variations):
   - Bengali: "হাফ", "আধা" (0.5), "দেড়", "দেড়" (1.5), "আড়াই", "আড়াই" (2.5), "পৌনে" (0.75), "সোয়া" (1.25).
   - Weights: "গ্রাম" (gram), "কেজি" (kg), "ছটাক", "সের", "পোয়া" (0.25 kg).
   - Packs/Pieces: "প্যাকেট" (packet), "পিস" (piece), "ডজন" (12).
   - "২৫০ গ্রাম" = 0.25 (if kg is standard) or 250.
   - "১০ প্যাকেট ৪ পিস": This is a common Bengali shop convention. It means 4 pieces of an item that is usually sold in 10-packet bundles. Adjust quantity/name to match the closest record.
5. Search Strategy (Multilingual & Cross-Language):
   - CRITICAL: The user speaks in ONE language (dictated by the transcript), but the "Available Products" list might be in ANY of the three languages (Bengali, Arabic, English).
   - Identity Mapping: "চাউল" / "চাল" (Bengali) == "Rice" (English) == "أرز" / "Uruj" / "Oruj" / "Rice" (Arabic/Mixed). They are the SAME product.
   - Script Invariant: If transcript is "এয়ার ফ্রেশ" (Bengali) and product list is "Air Fresh" (English), match them!
   - Script Invariant: If transcript is "Uruj" (Arabic rice) and product is "Rice" or "চাল", match them.
   - Dialects: Handle regional variations. "আরিজ" might also mean rice.
   - Example: If transcript is "Air Fresh" match "এয়ার ফ্রেশ". If transcript is "এয়ার ফ্রেশ" match "Air Fresh".
   - Identify if the user wants to set a customer FIRST, then process products.
   - Find the BEST matching productId from "Available Products".
   - If a product is mentioned that is definitely NOT in "Available Products", use action "newProduct".
6. Support multiple items separated by commas, "and", "এবং", "ও", "তারপর", "সাথে", "এরপর", "بعدين", "و", "ثم", or just a pause/spacing.
7. Output strictly valid JSON. Focus on high reliability for items like "আদা" (Ginger), "রসুন" (Garlic), "পেঁয়াজ" (Onion), "ময়দা" (Flour), "চিনি" (Sugar) in Bengali, "ملح" (Salt), "رز" (Rice) in Arabic, etc.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048,
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
                  recognizedName: { type: Type.STRING, description: "The name the user said for this item" },
                  unit: { type: Type.STRING, nullable: true, description: "kg, gram, piece, packet, etc." }
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
