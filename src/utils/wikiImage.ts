const productMap: Record<string, string> = {
  'ডিম': 'Chicken egg',
  'চাল': 'White rice',
  'মাছ': 'Fish as food',
  'মাংস': 'Meat',
  'গরুর মাংস': 'Beef',
  'খাসির মাংস': 'Mutton',
  'মুরগি': 'Chicken meat',
  'তেল': 'Cooking oil',
  'সয়াবিন তেল': 'Soybean oil',
  'সয়াবিন': 'Soybean oil',
  'মশলা': 'Spice',
  'ফল': 'Fruit',
  'সবজি': 'Vegetables',
  'ডাল': 'Lentil',
  'আলু': 'Potato',
  'পেঁয়াজ': 'Onion',
  'পেয়াজ': 'Onion',
  'রসুন': 'Garlic',
  'আদা': 'Ginger',
  'আটা': 'Wheat flour',
  'ময়দা': 'Flour',
  'চিনি': 'Sugar',
  'লবণ': 'Salt',
  'লবন': 'Salt',
  'চা': 'Tea',
  'কফি': 'Coffee',
  'দুধ': 'Milk',
  'মাখন': 'Butter',
  'পনির': 'Cheese',
  'দই': 'Yogurt',
  'রুটি': 'Bread',
  'বিস্কুট': 'Biscuit',
  'কেক': 'Cake',
  'সাবান': 'Bar soap',
  'লাক্স সাবান': 'Bar soap',
  'শ্যাম্পু': 'Shampoo',
  'ডিটারজেন্ট': 'Laundry detergent',
  'টুথপেস্ট': 'Toothpaste',
  'ব্রাশ': 'Toothbrush',
  'মোমবাতি': 'Candle',
  'ম্যাচ': 'Matchbox',
  'টিস্যু': 'Tissue paper',
  'পানি': 'Bottled water',
  'জুস': 'Juice',
  'আইসক্রিম': 'Ice cream',
  'চকলেট': 'Chocolate',
  'নুডুলস': 'Noodles',
  'মিস্টার নুডুলস': 'Instant noodles',
  'এয়ার ফ্রেশনার': 'Air freshener',
  'রুম ফ্রেশনার': 'Air freshener',
  'কলম': 'Ballpoint pen',
  'খাতা': 'Notebook',
  'পেন্সিল': 'Pencil',
  'বই': 'Book'
};

export const getWikiImage = async (productName: string): Promise<string | null> => {
  if (!productName || productName.trim() === '') return null;
  let keyword = productName.trim().toLowerCase();
  
  // Try to find a mapped English term for better image results
  let mappedKeyword = keyword;
  for (const [bn, en] of Object.entries(productMap)) {
    if (keyword.includes(bn) || keyword === bn) {
      mappedKeyword = en;
      break;
    }
  }
  
  try {
    // Search English Wikipedia using the mapped keyword or original keyword
    const enUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(mappedKeyword)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;
    const enRes = await fetch(enUrl);
    const enData = await enRes.json();
    
    if (enData?.query?.pages) {
      const pages = Object.values(enData.query.pages) as any[];
      if (pages.length > 0 && pages[0].thumbnail?.source) {
        return pages[0].thumbnail.source;
      }
    }
  } catch (e) {
    console.error("Wiki EN fetch error", e);
  }

  // Fallback to Bengali Wikipedia if English search fails (using original keyword)
  if (mappedKeyword === keyword) {
    try {
      const bnUrl = `https://bn.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;
      const bnRes = await fetch(bnUrl);
      const bnData = await bnRes.json();
      
      if (bnData?.query?.pages) {
        const pages = Object.values(bnData.query.pages) as any[];
        if (pages.length > 0 && pages[0].thumbnail?.source) {
          return pages[0].thumbnail.source;
        }
      }
    } catch (e) {
      console.error("Wiki BN fetch error", e);
    }
  }

  return null;
};
