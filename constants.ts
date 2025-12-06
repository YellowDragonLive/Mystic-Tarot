import { Arcana, CardData, SpreadConfig, Suit } from './types';

// Helper to generate full deck metadata
const generateDeck = (): CardData[] => {
  const deck: CardData[] = [];
  let idCounter = 0;

  // Major Arcana names
  const majors = [
    { en: "The Fool", cn: "愚人" }, { en: "The Magician", cn: "魔术师" }, { en: "The High Priestess", cn: "女祭司" },
    { en: "The Empress", cn: "皇后" }, { en: "The Emperor", cn: "皇帝" }, { en: "The Hierophant", cn: "教皇" },
    { en: "The Lovers", cn: "恋人" }, { en: "The Chariot", cn: "战车" }, { en: "Strength", cn: "力量" },
    { en: "The Hermit", cn: "隐士" }, { en: "Wheel of Fortune", cn: "命运之轮" }, { en: "Justice", cn: "正义" },
    { en: "The Hanged Man", cn: "倒吊人" }, { en: "Death", cn: "死神" }, { en: "Temperance", cn: "节制" },
    { en: "The Devil", cn: "恶魔" }, { en: "The Tower", cn: "高塔" }, { en: "The Star", cn: "星星" },
    { en: "The Moon", cn: "月亮" }, { en: "The Sun", cn: "太阳" }, { en: "Judgement", cn: "审判" },
    { en: "The World", cn: "世界" }
  ];

  majors.forEach((m, idx) => {
    deck.push({
      id: idCounter++,
      name: m.en,
      name_cn: m.cn,
      arcana: Arcana.Major,
      suit: Suit.None,
      number: idx,
      // Using Wikimedia high-res public domain images logic mapping
      // Note: In a real prod app, these would be local assets. 
      // Using a reliable placeholder logic for demo.
      imgUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/${getWikiPath(m.en)}/300px-${getWikiFilename(m.en)}`,
      keywords: ["Major Arcana", "Archetype"]
    });
  });

  const suits = [Suit.Wands, Suit.Cups, Suit.Swords, Suit.Pentacles];
  const suitNamesCn: Record<Suit, string> = { 
    [Suit.Wands]: "权杖", [Suit.Cups]: "圣杯", [Suit.Swords]: "宝剑", [Suit.Pentacles]: "星币", [Suit.None]: "" 
  };

  suits.forEach(suit => {
    for (let i = 1; i <= 14; i++) {
      let nameEn = `${i}`;
      let nameCn = `${i}`;
      if (i === 1) { nameEn = "Ace"; nameCn = "首牌"; }
      if (i === 11) { nameEn = "Page"; nameCn = "侍从"; }
      if (i === 12) { nameEn = "Knight"; nameCn = "骑士"; }
      if (i === 13) { nameEn = "Queen"; nameCn = "王后"; }
      if (i === 14) { nameEn = "King"; nameCn = "国王"; }

      const fullNameEn = `${nameEn} of ${suit}`;
      const fullNameCn = `${suitNamesCn[suit]} ${nameCn}`;

      deck.push({
        id: idCounter++,
        name: fullNameEn,
        name_cn: fullNameCn,
        arcana: Arcana.Minor,
        suit: suit,
        number: i,
        imgUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/${getWikiPath(fullNameEn)}/300px-${getWikiFilename(fullNameEn)}`,
        keywords: [suit, "Minor Arcana"]
      });
    }
  });

  return deck;
};

// Quick mapping helper for Wikimedia Commons RWS deck
// This is a heuristic to get working images without hosting them
function getWikiFilename(name: string): string {
    const map: Record<string, string> = {
        "The Fool": "RWS_Tarot_00_Fool.jpg",
        "The Magician": "RWS_Tarot_01_Magician.jpg",
        "The High Priestess": "RWS_Tarot_02_High_Priestess.jpg",
        "The Empress": "RWS_Tarot_03_Empress.jpg",
        "The Emperor": "RWS_Tarot_04_Emperor.jpg",
        "The Hierophant": "RWS_Tarot_05_Hierophant.jpg",
        "The Lovers": "RWS_Tarot_06_Lovers.jpg",
        "The Chariot": "RWS_Tarot_07_Chariot.jpg",
        "Strength": "RWS_Tarot_08_Strength.jpg",
        "The Hermit": "RWS_Tarot_09_Hermit.jpg",
        "Wheel of Fortune": "RWS_Tarot_10_Wheel_of_Fortune.jpg",
        "Justice": "RWS_Tarot_11_Justice.jpg",
        "The Hanged Man": "RWS_Tarot_12_Hanged_Man.jpg",
        "Death": "RWS_Tarot_13_Death.jpg",
        "Temperance": "RWS_Tarot_14_Temperance.jpg",
        "The Devil": "RWS_Tarot_15_Devil.jpg",
        "The Tower": "RWS_Tarot_16_Tower.jpg",
        "The Star": "RWS_Tarot_17_Star.jpg",
        "The Moon": "RWS_Tarot_18_Moon.jpg",
        "The Sun": "RWS_Tarot_19_Sun.jpg",
        "Judgement": "RWS_Tarot_20_Judgement.jpg",
        "The World": "RWS_Tarot_21_World.jpg"
    };
    
    // Minor Arcana logic
    if (!map[name]) {
        const parts = name.split(' of ');
        const numMap: Record<string, string> = { "Ace": "01", "Page": "11", "Knight": "12", "Queen": "13", "King": "14" };
        let numStr = parts[0];
        if (numMap[parts[0]]) numStr = numMap[parts[0]];
        else if (parseInt(parts[0]) < 10) numStr = "0" + parts[0];
        
        const suitMap: Record<string, string> = { "Wands": "Wands", "Cups": "Cups", "Swords": "Swords", "Pentacles": "Pentacles" };
        const suitShort = suitMap[parts[1]];
        
        return `RWS_Tarot_${suitShort}_${numStr}.jpg`;
    }
    return map[name];
}

function getWikiPath(name: string): string {
    const filename = getWikiFilename(name);
    // MD5 hash structure for Wikimedia paths is complex to guess perfectly without a map.
    // Fallback: use a reliable external simple placeholder if this fails, 
    // OR use a specific github repo serving these static assets.
    // For this demo, we will use a specific GitHub Pages mirror of the RWS deck for stability.
    // Changing strategy from Wikimedia to a stable raw github pointer to avoid 404s on dynamic paths.
    return ""; // Not used in new strategy
}

// Re-implementing image URL getter to use a stable source
const getStableImageUrl = (card: CardData): string => {
    // Using a known repository for RWS tarot images
    const filename = getWikiFilename(card.name);
    return `https://upload.wikimedia.org/wikipedia/commons/d/de/${filename}`; 
    // Note: The above is still risky for hash paths. 
    // Let's use a very reliable placeholder service that supports text if image fails,
    // or better, a known public deck.
    // Actually, let's use a generic mystical placeholder for the code, 
    // BUT for the "best" result, I will map to a static list if possible.
    // Since I can't guarantee Wikimedia hash paths, I will use a reliable external Tarot API image source.
    
    // Sacred Texts archive naming convention
    const suitCode = { [Suit.Wands]: 'w', [Suit.Cups]: 'c', [Suit.Swords]: 's', [Suit.Pentacles]: 'p', [Suit.None]: '' };
    let shortName = "";
    if (card.arcana === Arcana.Major) {
       const majMap = ["ar00", "ar01", "ar02", "ar03", "ar04", "ar05", "ar06", "ar07", "ar08", "ar09", "ar10", "ar11", "ar12", "ar13", "ar14", "ar15", "ar16", "ar17", "ar18", "ar19", "ar20", "ar21"];
       shortName = majMap[card.number];
    } else {
       const s = suitCode[card.suit];
       let n = card.number.toString();
       if (card.number === 1) n = "a";
       if (card.number === 11) n = "p";
       if (card.number === 12) n = "n"; // Knight is often 'n' or 'kn'
       if (card.number === 13) n = "q";
       if (card.number === 14) n = "k";
       shortName = `${s}${n}`;
    }
    return `https://www.sacred-texts.com/tarot/pkt/${shortName}.jpg`;
}

export const DECK = generateDeck().map(c => ({...c, imgUrl: getStableImageUrl(c)}));

export const SPREADS: SpreadConfig[] = [
  {
    id: 'daily',
    name: '每日一牌 (Daily Draw)',
    description: '抽取一张牌，指引当下的能量或运势。',
    positions: [
      { id: 0, name: '核心指引', description: '今日的关键信息或能量。' }
    ]
  },
  {
    id: 'timeflow',
    name: '时间流 (Time Flow)',
    description: '三张牌解读过去、现在与未来。',
    positions: [
      { id: 0, name: '过去', description: '影响当前状况的过去事件。' },
      { id: 1, name: '现在', description: '目前的处境或挑战。' },
      { id: 2, name: '未来', description: '事情发展的趋势或结果。' }
    ]
  },
  {
    id: 'celtic',
    name: '凯尔特十字 (Celtic Cross)',
    description: '经典的深入分析牌阵，揭示问题的全貌。',
    positions: [
      { id: 0, name: '核心', description: '现在的状况。' },
      { id: 1, name: '阻碍/助力', description: '交叉的影响。' },
      { id: 2, name: '根源', description: '潜意识或过去的成因。' },
      { id: 3, name: '过去', description: '刚刚发生的事件。' },
      { id: 4, name: '目标', description: '意识到的目标或理想。' },
      { id: 5, name: '未来', description: '即将发生的。' },
      { id: 6, name: '态度', description: '当事人的态度。' },
      { id: 7, name: '环境', description: '周围环境或他人的看法。' },
      { id: 8, name: '希望/恐惧', description: '内心的希望或恐惧。' },
      { id: 9, name: '结果', description: '最终的综合结果。' }
    ]
  }
];
