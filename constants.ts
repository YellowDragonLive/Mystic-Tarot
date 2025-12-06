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
      imgUrl: `/tarot/major_${idx}.png`,
      keywords: ["Major Arcana", "Archetype"]
    });
  });

  return deck;
};

export const DECK = generateDeck();

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
