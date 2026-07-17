export const convertSpokenMathToExpression = (text: string): string | null => {
  let cleaned = text.toLowerCase().trim();
  
  // Replace Bengali digits
  const bnDigits: { [key: string]: string } = {
    '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9', '০': '0'
  };
  for (const [key, val] of Object.entries(bnDigits)) {
    cleaned = cleaned.replace(new RegExp(key, 'g'), val);
  }

  // Common operator translations
  const operators: { [key: string]: string } = {
    'প্লাস': '+', 'যোগ': '+', 'আরও': '+', 'এন্ড': '+', 'সাথে': '+', 'এবং': '+', 'plus': '+', 'and': '+',
    'মাইনাস': '-', 'বিয়োগ': '-', 'বাদ': '-', 'minus': '-',
    'ইনটু': '*', 'গুণ': '*', 'times': '*', 'multiply': '*', 'into': '*',
    'ভাগ': '/', 'ডিভাইড': '/', 'divided': '/', 'divide': '/'
  };

  // Translate operators
  for (const [word, op] of Object.entries(operators)) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b|${word}`, 'g'), ` ${op} `);
  }

  // Word-to-number mapping
  const numMap: { [key: string]: number } = {
    'শূণ্য': 0, 'শূন্য': 0, 'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5, 'ছয়': 6, 'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'নয়': 9,
    'দশ': 10, 'এগারো': 11, 'বারো': 12, 'তেরো': 13, 'চোদ্দ': 14, 'পনেরো': 15, 'ষোল': 16, 'সতেরো': 17, 'আঠারো': 18, 'উনিশ': 19,
    'বিশ': 20, 'কুড়ি': 20, 'কুড়ি': 20, 'ত্রিশ': 30, 'চল্লিশ': 40, 'পঞ্চাশ': 50, 'ষাট': 60, 'সত্তর': 70, 'আশি': 80, 'নব্বই': 90,
    'একশ': 100, 'একশো': 100, 'দুইশ': 200, 'দুইশো': 200, 'তিনশ': 300, 'তিনশো': 300, 'চারশ': 400, 'চারশো': 400,
    'পাঁচশ': 500, 'পাঁচশো': 500, 'ছয়শ': 600, 'ছয়শ': 600, 'ছয়শো': 600, 'সাতশ': 700, 'সাতশো': 700, 'আটশ': 800, 'আটশো': 800, 'নয়শ': 900, 'নয়শো': 900,
    'হাজার': 1000, 'লাখ': 100000,
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100, 'thousand': 1000, 'lakh': 100000
  };

  // Tokenize the string by space
  const tokens = cleaned.split(/\s+/).filter(t => t.trim().length > 0);
  const exprTokens: string[] = [];

  let currentNumber = 0;
  let tempNumber = 0;

  const isOperator = (t: string) => ['+', '-', '*', '/'].includes(t);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (isOperator(token)) {
      if (tempNumber > 0 || currentNumber > 0) {
        exprTokens.push(String(currentNumber + tempNumber));
        currentNumber = 0;
        tempNumber = 0;
      }
      exprTokens.push(token);
    } else if (!isNaN(Number(token))) {
      if (tempNumber > 0 || currentNumber > 0) {
        exprTokens.push(String(currentNumber + tempNumber));
        exprTokens.push("+");
        currentNumber = 0;
        tempNumber = 0;
      }
      tempNumber = Number(token);
    } else if (numMap[token] !== undefined) {
      const val = numMap[token];
      if (val === 100) {
        if (tempNumber === 0) tempNumber = 1;
        tempNumber *= 100;
      } else if (val === 1000 || val === 100000) {
        if (tempNumber === 0) tempNumber = 1;
        currentNumber += tempNumber * val;
        tempNumber = 0;
      } else {
        if (tempNumber > 0 && val < 10) {
          tempNumber += val;
        } else {
          if (tempNumber > 0) {
            currentNumber += tempNumber;
          }
          tempNumber = val;
        }
      }
    }
  }

  if (tempNumber > 0 || currentNumber > 0) {
    exprTokens.push(String(currentNumber + tempNumber));
  }

  while (exprTokens.length > 0 && isOperator(exprTokens[exprTokens.length - 1])) {
    exprTokens.pop();
  }

  const finalTokens: string[] = [];
  for (let i = 0; i < exprTokens.length; i++) {
    const t = exprTokens[i];
    if (i > 0 && !isOperator(t) && !isOperator(finalTokens[finalTokens.length - 1])) {
      finalTokens.push("+");
    }
    finalTokens.push(t);
  }

  if (finalTokens.length === 0) return null;
  return finalTokens.join("");
};

export const parseMathVoiceCommandAI = async (rawText: string): Promise<string | null> => {
  const prompt = `
You are a high-speed mathematical expression extractor.
Input: A voice transcript in Bengali, English, or mixed.
Output: A valid JavaScript mathematical expression string (e.g., "500+302+112+70").

CONVERSION RULES (Apply strictly):
- Numbers: এক->1, দুই->2, তিন->3, চার->4, পাঁচ->5, sechs/ছয়->6, সাত->7, আট->8, নয়->9, শূন্য->0
- Tens: দশ/দশটি->10, কুড়ি->20, ত্রিশ->30, চল্লিশ->40, পঞ্চাশ->50, ৬০->60, ৭০->70, ৮০->80, ৯০->90
- Hundreds: একশো/একশ->100, দুইশ->200, তিনশো->300, চারশ->400, পাঁচশ->500, sechs/ছয়শ->600, সাতশো->700
- Multipliers: হাজার->1000, লাখ->100000
- Operators: প্লাস/যোগ/আরও/এন্ড/সাথে/মাইনাস/বিয়োগ/বাদ/ইনটু/গুণ/ভাগ/ডিভাইড -> "+", "-", "*", "/" accordingly.
- Bengali Digits: ১->1, ২->2, ৩->3, ৪->4, ৫->5, ৬->6, ৭->7, ৮->8, ৯->9, ০->0

BEHAVIOR:
1. Extract every number and operator mentioned in sequence.
2. If no operator is mentioned between numbers, assume addition (+).
3. Ignore filler words like "টাকা", "দাও", "করো", "হচ্ছে", "মোট", "হবে", "হলো", "সমান".
4. Handle long sequences (up to 40+ additions).
5. If an operator is at the end (e.g. "500 + 200 plus"), ignore the trailing operator.
6. Only output the math string. No text. 

Transcript: "${rawText}"
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
            maxOutputTokens: 64,
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.text) {
      const result = data.text.trim();
      return result === "ERROR" ? null : result;
    }
  } catch (error: any) {
    console.error("AI parse math voice command failed, trying offline fallback:", error);
    return convertSpokenMathToExpression(rawText);
  }
  return convertSpokenMathToExpression(rawText);
};
