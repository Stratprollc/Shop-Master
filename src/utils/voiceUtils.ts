export const standardizeBn = (str: string) => {
  const bnToEn: Record<string, string> = { 
    '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9', '০':'0'
  };
  return str.normalize('NFC')
     .replace(/\u09AF\u09BC/g, '\u09DF')
     .replace(/\u09A1\u09BC/g, '\u09DC')
     .replace(/\u09A2\u09BC/g, '\u09DD')
     .replace(/[০-৯]/g, (m) => bnToEn[m])
     .toLowerCase();
};

export const translateNumbers = (str: string) => {
  let text = str;
  const bnToEn: Record<string, string> = { 
      '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9', '০':'0',
      '١':'1', '٢':'2', '٣':'3', '٤':'4', '٥':'5', '٦':'6', '٧':'7', '٨':'8', '٩':'9', '٠':'0'
  };
  const wordNumbers: Record<string, string> = {
      'এক':'1', 'দুই':'2', 'তিন':'3', 'চার':'4', 'পাঁচ':'5', 'ছয়':'6', 'সাত':'7', 'আট':'8', 'নয়':'9', 'দশ':'10',
      'এগারো':'11', 'বারো':'12', 'তেরো':'13', 'চোদ্দ':'14', 'পনেরো':'15', 'ষোল':'16', 'সতেরো':'17', 'আঠারো':'18', 'উনিশ':'19', 'কুড়ি':'20', 'বিশ':'20',
      'واحد':'1', 'اثنان':'2', 'ثلاثة':'3', 'أربعة':'4', 'خمسة':'5', 'ستة':'6', 'سبعة':'7', 'ثمانية':'8', 'تسعة':'9', 'عشرة':'10'
  };
  text = text.replace(/[০-৯٠-٩]/g, (m) => bnToEn[m]);
  
  // Replace word numbers when they are at the start of a word, possibly followed by typical unit suffixes
  Object.keys(wordNumbers).forEach(key => {
     // Allow standard unit suffixes directly attached to the number word
     const regex = new RegExp(`(^|\\s)${key}(টা|টি|পিস|প্যাকেট|কেজি|গ্রাম|লিটার|মিলি|kg|g|gm|ml)?(\\s|$)`, 'g');
     text = text.replace(regex, (match, prefix, suffix, postfix) => {
        return `${prefix}${wordNumbers[key]} ${suffix || ''}${postfix}`;
     });
     
     // Also try replacing it if it appears right before a suffix word without space
     const regex2 = new RegExp(`(^|\\s)${key}(প্যাকেটের|কেজির|গ্রামের|লিটারের|পিসের)?(\\s|$)`, 'g');
     text = text.replace(regex2, (match, prefix, suffix, postfix) => {
        return `${prefix}${wordNumbers[key]} ${suffix || ''}${postfix}`;
     });
  });
  
  // Clean up extra spaces
  return text.replace(/\s+/g, ' ').trim();
};

export const toPhonetic = (str: string) => {
  let s = str.toLowerCase();
  
  // Custom substitution map
  const charMap: Record<string, string> = {
    'ph':'f', 'v':'b', 'z':'j', 'sh':'s', 'ch':'c', 'ck':'k', 'c':'k', 'q':'k', 'w':'u', 'x':'ks', 'y':'i',
    'ক':'k','খ':'k','গ':'g','ঘ':'g','ঙ':'ng',
    'চ':'c','ছ':'c','জ':'j','ঝ':'j','ঞ':'n',
    'ট':'t','ঠ':'t','ড':'d','ঢ':'d','ণ':'n',
    'ত':'t','থ':'t','দ':'d','ধ':'d','ন':'n',
    'প':'p','ফ':'f','ব':'b','ভ':'b','ম':'m',
    'য':'j','র':'r','ল':'l','শ':'s','ষ':'s','স':'s','হ':'h',
    'ড়':'r','ঢ়':'r','য়':'i','ৎ':'t','ং':'ng','ঃ':'h','ঁ':'',
    'অ':'a', 'আ':'a', 'ই':'i', 'ঈ':'i', 'উ':'u', 'ঊ':'u', 
    'ঋ':'ri', 'এ':'e', 'ঐ':'oi', 'ও':'o', 'ঔ':'ou',
    'া':'a', 'ি':'i', 'ী':'i', 'ু':'u', 'ূ':'u', 'ৃ':'ri', 'ে':'e', 'ৈ':'oi', 'ো':'o', 'ৌ':'ou',
    '্':''
  };

  s = s.replace(/ph/g, 'f')
    .replace(/sh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/ck/g, 'k')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/bh/g, 'b')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g');
  
  let mapped = '';
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (charMap[char] !== undefined) mapped += charMap[char];
    else if (char >= 'a' && char <= 'z') mapped += charMap[char] || char; // fallback if already mapped above or keeps it
    else if (char >= '0' && char <= '9') mapped += char;
    else if (char === ' ') mapped += ' ';
  }
  
  // Remove vowels and common semi-vowels to make matching more fuzzy
  mapped = mapped.replace(/[aeiouhwjy]+/g, ''); 
  mapped = mapped.replace(/(.)\1+/g, '$1'); 
  return mapped.trim();
};

export const parseVoiceCommandQuantity = (rawText: string) => {
  let text = translateNumbers(rawText.trim());

  const fractionMap: Record<string, string> = {
    'দেড়': '1.5',
    'আড়াই': '2.5',
    'আড়াই': '2.5',
    'হাফ': '0.5',
    'সিকি': '0.25'
  };
  
  for (const [key, val] of Object.entries(fractionMap)) {
    text = text.replace(new RegExp(key, 'g'), val);
  }
  
  text = text.replace(/সোয়া\s*(\d+(\.\d+)?)/g, (match, n) => (parseFloat(n) + 0.25).toString());
  text = text.replace(/সা[ড়ড]়?ে\s*(\d+(\.\d+)?)/g, (match, n) => (parseFloat(n) + 0.5).toString());
  text = text.replace(/পৌনে\s*(\d+(\.\d+)?)/g, (match, n) => (parseFloat(n) - 0.25).toString());

  text = text.trim();

  // Try extracting from prefix
  const qtyPrefixRegex = /^(\d+(\.\d+)?)\s*(কেজি|কিলো|গ্রাম|লিটার|মিলি|পিস|টি|টা|kg|g|gm|liter|ml|pcs|piece|كجم|كيلو|جرام|لتر|مل|قطعة|حبة)?\s+/i;
  // Try extracting from suffix
  const qtySuffixRegex = /\s+(\d+(\.\d+)?)\s*(কেজি|কিলো|গ্রাম|লিটার|মিলি|পিস|টি|টা|kg|g|gm|liter|ml|pcs|piece|كجم|كيلو|جرام|لتر|مل|قطعة|حبة)?$/i;
  
  let quantity = 1;
  let searchName = text;
  let matchFound = false;

  const prefixMatch = text.match(qtyPrefixRegex);
  const suffixMatch = text.match(qtySuffixRegex);
  
  const parseMatch = (match: RegExpMatchArray) => {
    let parsedNum = parseFloat(match[1]);
    const unit = match[3]?.trim().toLowerCase() || '';
    if (['গ্রাম', 'g', 'gm', 'মিলি', 'ml', 'جرام', 'مل'].includes(unit)) {
        if (parsedNum >= 50) {
           parsedNum = parsedNum / 1000;
        }
    }
    return Math.max(0.1, parsedNum);
  };

  if (prefixMatch) {
    quantity = parseMatch(prefixMatch);
    searchName = text.substring(prefixMatch[0].length).trim();
    matchFound = true;
  } else if (suffixMatch) {
    quantity = parseMatch(suffixMatch);
    searchName = text.substring(0, text.length - suffixMatch[0].length).trim();
    matchFound = true;
  }

  // If no prefix/suffix match, we can optionally test everywhere but it might break products with numbers
  // So we just return matchFound = false and quantity = 1
  return { 
     originalText: text, // Normalized text before extraction
     searchName,         // Text after quantity extraction
     quantity, 
     matchFound 
  };
};

export const formatToBnDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Try to parse DD/MM/YYYY or YYYY-MM-DD
  let date: Date;
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr;

  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const toBnNum = (n: number | string) => {
    const nums: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return n.toString().split('').map(d => nums[d] || d).join('');
  };

  const day = toBnNum(date.getDate());
  const month = bnMonths[date.getMonth()];
  const year = toBnNum(date.getFullYear());

  return `${day} ${month} ${year}`;
};

export const formatToArDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  let date: Date;
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr;

  const arMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const toArNum = (n: number | string) => {
    const nums: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    return n.toString().split('').map(d => nums[d] || d).join('');
  };

  const day = toArNum(date.getDate());
  const month = arMonths[date.getMonth()];
  const year = toArNum(date.getFullYear());

  return `${day} ${month} ${year}`;
};

export const isPhoneticMatch = (text: string | null | undefined, query: string) => {
  if (!query || query.trim() === '') return true;
  if (!text) return false;
  
  const stdQuery = query.toLowerCase().trim();
  const stdText = text.toLowerCase().trim();
  
  if (stdText.includes(stdQuery)) return true;

  const stdBnQuery = standardizeBn(query);
  const stdBnText = standardizeBn(text);
  if (stdBnText.includes(stdBnQuery)) return true;

  // If the query is just a long number (e.g. barcode), do not perform phonetic checks
  // to avoid false positives with unrelated product names or categories that have matching collapsed digits.
  if (/^\d+$/.test(stdBnQuery) && stdBnQuery.length > 3) {
    return false;
  }
  
  // Basic English to Bengali keyword mapping for common categories
  const categoryMap: Record<string, string[]> = {
    'grocery': ['মুদি', 'মুদী', 'بقالة'],
    'rice': ['চাল', 'ধান', 'চাউল', 'أرز', 'رز', 'aroz', 'aruz', 'oruj', 'uruj'],
    'fish': ['মাছ', 'মৎস্য', 'সমক', 'سمك'],
    'meat': ['মাংস', 'গোশত', 'গরু', 'খাসি', 'لحম'],
    'oil': ['তেল', 'অয়েল', 'তৈল', 'زيت'],
    'soybean oil': ['সয়াবিন তেল', 'সয়াবিন', 'সোয়াবিন', 'زيت فول الصويا'],
    'spice': ['মশলা', 'মসালা', 'মসলা', 'توابل', 'بهارات'],
    'fruit': ['ফল', 'ফস', 'فاكهة'],
    'vegetable': ['সবজি', 'শাকসবজি', 'সবজী', 'খضروات'],
    'bakery': ['বেকারি', 'বিকারি', 'বেকারী', 'مخبز'],
    'dairy': ['ডেইরি', 'দুগ্ধ', 'দুধের', 'ألبان'],
    'frozen': ['হিমায়িত', 'ফ্রিজিং', 'مجمد'],
    'snack': ['নাস্তা', 'স্ন্যাকস', 'স্ন্যাক', 'وجبة خفيفة'],
    'biscuit': ['বিস্কুট', 'বস্কুট', 'বিস্কিট', 'بسكويت'],
    'cake': ['কেক', 'কিক', 'كيك'],
    'chocolate': ['চকোলেট', 'চকলেট', 'চকো', 'شوكولاتة'],
    'drink': ['পানীয়', 'ড্রিঙ্কস', 'ড্রিঙ্ক', 'مشروب'],
    'water': ['পানি', 'জল', 'ওয়াটার', 'ماء'],
    'juice': ['জুস', 'শরবত', 'عصير'],
    'milk': ['দুধ', 'মিল্ক', 'حليب'],
    'baby': ['শিশুর', 'বেবি', 'বাচ্চাদের', 'طفল'],
    'health': ['স্বাস্থ্য', 'হেলথ', 'صحة'],
    'medicine': ['ওষুধ', 'মেডিসিন', 'ঔষধ', 'دواء'],
    'clean': ['পরিষ্কার', 'ক্লিন', 'ক্লিনার', 'نظيف'],
    'soap': ['সাবান', 'সাবুন', 'صابون'],
    'shampoo': ['শ্যাম্পু', 'শ্যাম্পূ', 'شামبو'],
    'air freshener': ['এয়ার ফ্রেশনার', 'এয়ার ফ্রেশনার', 'রুম ফ্রেশনার', 'এয়ার ফ্রেশ', 'এয়ার ফ্রেশ', 'معطر جو'],
    'noodles': ['নুডুলস', 'নুডলস', 'নুডুল', 'نودلز', 'مكرونة'],
    'mr noodles': ['মিস্টার নুডুলস', 'মিস্টার নুডলস', 'মিস্টার নুডুল'],
    'stationery': ['স্টেশনারি', 'قرطاسية'],
    'pen': ['কলম', 'قلم'],
    'pencil': ['পেন্সিল', 'قلم رصاص'],
    'paper': ['কাগজ', 'ورق'],
    'clothe': ['পোশাক', 'কাপড়', 'ملابس'],
    'toy': ['খেলনা', 'লعبة'],
    'egg': ['ডিম', 'বিডন', 'বিডুন', 'বিটন', 'বিডুন', 'বিটন', 'বিডুন', 'বিটন', 'বিডুন', 'বিটন', 'بيضة'],
    'chicken': ['মুরগি', 'মুরগী', 'دجاج'],
    'beef': ['গরুর মাংস', 'গরু', 'لحم بقر'],
    'mutton': ['খাসির মাংস', 'খাসি', 'لحم ضأن'],
    'bread': ['রুটি', 'ব্রেড', 'خبز'],
    'tea': ['চা', 'শাই', 'شاي'],
    'coffee': ['কফি', 'কফী', 'قهوة'],
    'sugar': ['চিনি', 'চিনী', 'চিনির', 'سكر'],
    'salt': ['লবণ', 'লবন', 'লবণর', 'ملح'],
    'flour': ['আটা', 'ময়দা', 'মা ময়দা', 'دقيق', 'طحين'],
    'pulse': ['ডাল', 'ডাউল', 'عدس'],
    'onion': ['পেঁয়াজ', 'পেয়াজ', 'পেয়াজ', 'পিয়াজ', 'বصل'],
    'garlic': ['রসুন', 'থুম', 'ثوم'],
    'ginger': ['আদা', 'জাঞ্জাবিল', 'زنجبيل'],
    'potato': ['আলু', 'আলুর', 'بطاطس', 'بطاطا'],
    'electronics': ['ইলেকট্রনিক্স', 'ইলেক্ট্রনিক্স', 'ইলেকট্রনিক', 'إلكترونيات'],
    'agriculture': ['কৃষি', 'কৃষক', 'জারা', 'زراعة'],
    'seed': ['বীজ', 'বিজ', 'বিছ', 'বذور'],
    'fertilizer': ['সার', 'সারর', 'سمাদ'],
    'mobile': ['মোবাইল', 'ফোন', 'জাওয়াল', 'جوال'],
    'gift': ['উপহার', 'গিফট', 'পিফট', 'هدية'],
    'cosmetics': ['প্রসাধন', 'কসমেটিকস', 'কসমেটিক', 'মস্তাহ্বারাত তাজমিল', 'مستحضرات تجميل'],
    'personal care': ['ব্যক্তিগত যত্ন', 'আনায়া শাকশিয়া', 'عناية شخصية']
  };

  // Check cross-language matching
  for (const [en, mappedList] of Object.entries(categoryMap)) {
    const isQueryEn = stdQuery.includes(en);
    const isTextEn = stdText.includes(en);
    const isQueryMapped = mappedList.some(m => stdQuery.includes(m));
    const isTextMapped = mappedList.some(m => stdText.includes(m));

    if ((isQueryEn && isTextMapped) || (isQueryMapped && isTextEn) || (isQueryMapped && isTextMapped)) {
      return true;
    }
  }
  
  const phQuery = toPhonetic(stdBnQuery);
  const phText = toPhonetic(stdBnText);
  if (phQuery.length > 1 && phText.includes(phQuery)) return true;
  
  // Word by word matching
  const queryWords = stdBnQuery.split(/\s+/).filter(w => w.length > 0);
  const textWordsPhonetic = stdBnText.split(/\s+/).map(w => toPhonetic(w)).filter(w => w.length > 0);
  
  if (queryWords.length > 0) {
    const allWordsMatch = queryWords.every(qw => {
      const phQw = toPhonetic(qw);
      // a word matches if it's substring of any target word phonetically
      return textWordsPhonetic.some(tw => tw.includes(phQw) || (phQw.length > 2 && phQw.includes(tw)));
    });
    if (allWordsMatch) return true;
  }
  
  return false;
};

export const parseNewProductVoiceCommand = (rawText: string) => {
    let remainder = rawText;
    const newProductPattern = /(?:নতুন|new)\s*(?:প্রোডাক্ট|product|ফোডাক্ট|ইনভেন্টরি|inventory)(?:\s*(?:অ্যাড|এড|add))?(?:\s*(?:করো|করেন|কর|do))?\s*/i;

    const prefixMatch = remainder.match(newProductPattern);
    if (prefixMatch) {
        remainder = remainder.substring(prefixMatch.index! + prefixMatch[0].length);
    }

    const translated = translateNumbers(remainder);
    let name = translated;
    let price = 0;
    let stock = 0;
    let unit = 'unit';

    const priceRegexes = [
        /(?:দাম|price)\s*(\d+(\.\d+)?)\s*(?:টাকা|tk)?/i,
        /(\d+(\.\d+)?)\s*(?:টাকা|tk)/i
    ];
    for (const regex of priceRegexes) {
        const pMatch = name.match(regex);
        if (pMatch) {
            price = parseFloat(pMatch[1]);
            name = name.replace(pMatch[0], '');
            break;
        }
    }

    const stockRegexes = [
        /(?:স্টক|স্টোক|stock)\s*(\d+(\.\d+)?)\s*([a-zA-Z\u0980-\u09FF]+)?/i,
        /(?:^|\s+)(\d+(\.\d+)?)\s*(কেজি|গ্রাম|লিটার|মিলি|পিস|টি|টা|kg|g|gm|ml|pcs|piece|packet|প্যাকেট)(?:\s|$)/i,
        /(?:^|\s+)(\d+(\.\d+)?)$/i
    ];
    let extractedUnitStr = '';
    for (const regex of stockRegexes) {
        const sMatch = name.match(regex);
        if (sMatch) {
            stock = parseFloat(sMatch[1]);
            if (sMatch[3]) extractedUnitStr = sMatch[3];
            name = name.replace(sMatch[0], '');
            break;
        }
    }
    
    if (extractedUnitStr.match(/কেজি|গ্রাম|লিটার|মিলি|kg|g|gm|ml/i)) {
        unit = 'kg';
    } else {
        unit = 'unit';
    }

    name = name.trim();

    return { name, price, stock, unit };
};
