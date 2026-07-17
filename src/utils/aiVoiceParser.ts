export const parsePosVoiceCommandOffline = (
  rawText: string,
  availableProducts: { id: string, name: string }[],
  availableCustomers: { id: string, name: string, phone: string }[]
) => {
  const text = rawText.toLowerCase().trim();
  const result: { items: any[], summary: string } = {
    items: [],
    summary: `Offline matching for: "${rawText}"`
  };

  // Check for customer set
  const customerTriggers = ["customer", "কাস্টমার", "গ্রাহক", "client"];
  let isCustomerMatch = false;

  for (const trigger of customerTriggers) {
    if (text.includes(trigger)) {
      let namePart = text.replace(trigger, "").trim();
      namePart = namePart.replace(/set|select|add|করুন|যোগ|নাম/g, "").trim();
      
      if (namePart) {
        let bestMatch = availableCustomers.find(c => 
          c.name.toLowerCase().includes(namePart) || 
          namePart.includes(c.name.toLowerCase()) ||
          (c.phone && c.phone.includes(namePart))
        );

        if (!bestMatch) {
          const words = namePart.split(/\s+/).filter(w => w.length > 2);
          if (words.length > 0) {
            bestMatch = availableCustomers.find(c => 
              words.some(w => c.name.toLowerCase().includes(w))
            );
          }
        }

        if (bestMatch) {
          result.items.push({
            action: 'setCustomer',
            customerId: bestMatch.id,
            recognizedName: bestMatch.name
          });
          result.summary = `Selected customer: ${bestMatch.name}`;
          isCustomerMatch = true;
          break;
        }
      }
    }
  }

  // Parse products
  const parts = text.split(/,|and|ও|এবং|\+/);
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    const numRegex = /([0-9\u09E6-\u09EF]+)\s*(kg|kg.|piece|pcs|টি|কেজি|গ্রাম|gm|x|)?/i;
    const matchNum = part.match(numRegex);
    let quantity = 1;
    let cleanPart = part;

    if (matchNum) {
      const rawNum = matchNum[1];
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      let englishNum = '';
      for (const char of rawNum) {
        const index = bnDigits.indexOf(char);
        if (index !== -1) {
          englishNum += index.toString();
        } else {
          englishNum += char;
        }
      }
      const parsedQty = parseInt(englishNum, 10);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        quantity = parsedQty;
      }
      cleanPart = part.replace(matchNum[0], "").trim();
    }

    cleanPart = cleanPart.replace(/add|please|চাই|লাগবে|দিন|নেব|যোগ|করুন/gi, "").trim();
    if (cleanPart.length < 2) continue;

    let bestProduct = availableProducts.find(p => 
      p.name.toLowerCase() === cleanPart ||
      p.name.toLowerCase().includes(cleanPart)
    );

    if (!bestProduct) {
      bestProduct = availableProducts.find(p => 
        cleanPart.includes(p.name.toLowerCase())
      );
    }

    if (!bestProduct) {
      const words = cleanPart.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 0) {
        bestProduct = availableProducts.find(p => 
          words.every(w => p.name.toLowerCase().includes(w))
        );
      }
    }

    if (bestProduct) {
      if (!result.items.some(item => item.productId === bestProduct!.id)) {
        result.items.push({
          action: 'addProduct',
          productId: bestProduct.id,
          recognizedName: bestProduct.name,
          quantity: quantity
        });
      }
    }
  }

  // Single word product backup
  if (result.items.length === 0 && text.length >= 2 && !isCustomerMatch) {
    const bestProduct = availableProducts.find(p => 
      p.name.toLowerCase().includes(text) || text.includes(p.name.toLowerCase())
    );
    if (bestProduct) {
      result.items.push({
        action: 'addProduct',
        productId: bestProduct.id,
        recognizedName: bestProduct.name,
        quantity: 1
      });
    }
  }

  if (result.items.length > 0 && result.summary.startsWith('Offline')) {
    const summaryParts = result.items.map(item => {
      if (item.action === 'setCustomer') return `Set customer to ${item.recognizedName}`;
      return `Added ${item.quantity}x ${item.recognizedName}`;
    });
    result.summary = summaryParts.join(", ");
  }

  return result;
};

export const parsePosVoiceCommandAI = async (
  rawText: string,
  availableProducts: { id: string, name: string }[],
  availableCustomers: { id: string, name: string, phone: string }[]
) => {
  const productListStr = availableProducts.map(p => `${p.id}:::${p.name}`).join("\n");
  const customerListStr = availableCustomers.map(c => `${c.id}:::${c.name}:::${c.phone}`).join("\n");

  const prompt = `
You are an intelligent POS assistant helping extract intents from voice queries in Bengali, Arabic, and English.
The user may want to:
1. Set a customer (e.g., "customer John" or "কাস্টমার করিম")
2. Add one or multiple products at once (e.g., "flour, 2kg sugar, onion" or "ময়দা, ২ কেজি চিনি, পেঁয়াজ")

Transcript: "${rawText.replace(/"/g, "'")}"

Available Products (ID:::NAME):
${productListStr}

Available Customers (ID:::NAME:::PHONE):
${customerListStr}

Rules:
1. Output strictly valid JSON without any markdown formatting. Ensure the JSON is complete and not truncated.
2. If the transcript is in English but represents a Bengali word (transliteration, e.g., "moyda" for "ময়দা"), match it correctly.
3. Identified items should be returned in the "items" array.
4. If a word is ambiguous, favor the matching product NAME from the list above.
`;

  try {
    const response = await fetch('/api/gemini/voice-parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        config: {
          model: "gemini-3.5-flash",
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.text) {
      const cleanText = data.text.trim();
      try {
        return JSON.parse(cleanText);
      } catch (parseError) {
        console.error("JSON parse failed. Text:", cleanText);
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try {
            return JSON.parse(cleanText.slice(start, end + 1));
          } catch (e) {}
        }
      }
    }
  } catch (error: any) {
    console.error("AI parse voice command failed, trying offline fallback:", error);
  }
  return parsePosVoiceCommandOffline(rawText, availableProducts, availableCustomers);
};
