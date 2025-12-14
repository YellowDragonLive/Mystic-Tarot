import { Arcana, CardData, SpreadConfig, Suit } from './types';

import newCardData from './src/data/card_data.json';

// Helper for Chinese Semantic Mapping
const rankCnMap: Record<string, string> = {
  "ace": "首牌",
  "two": "二",
  "three": "三",
  "four": "四",
  "five": "五",
  "six": "六",
  "seven": "七",
  "eight": "八",
  "nine": "九",
  "ten": "十",
  "page": "侍从",
  "knight": "骑士",
  "queen": "王后",
  "king": "国王"
};

const suitCnMap: Record<string, string> = {
  "wands": "权杖",
  "cups": "圣杯",
  "swords": "宝剑",
  "pentacles": "星币"
};

// Major Arcana CN names map
const majorCnMap: Record<string, string> = {
  "The Fool": "愚人",
  "The Magician": "魔术师",
  "The High Priestess": "女祭司",
  "The Empress": "皇后",
  "The Emperor": "皇帝",
  "The Hierophant": "教皇",
  "The Lovers": "恋人",
  "The Chariot": "战车",
  "Strength": "力量",
  "Fortitude": "力量", // Alternative name in some decks
  "The Hermit": "隐士",
  "Wheel Of Fortune": "命运之轮",
  "Justice": "正义",
  "The Hanged Man": "倒吊人",
  "Death": "死神",
  "Temperance": "节制",
  "The Devil": "恶魔",
  "The Tower": "高塔",
  "The Star": "星星",
  "The Moon": "月亮",
  "The Sun": "太阳",
  "The Last Judgment": "审判",
  "The World": "世界"
};

// Helper to generate full deck metadata
const generateDeck = (): CardData[] => {
  const deck: CardData[] = [];

  newCardData.cards.forEach((card: any, index: number) => {
    let name_cn = card.name;
    let arcana = Arcana.Major;
    let suit = Suit.None;

    // Determine Arcana and Suit
    if (card.type === 'major') {
      arcana = Arcana.Major;
      suit = Suit.None;
      // Map CN Name
      name_cn = majorCnMap[card.name] || card.name;
    } else {
      arcana = Arcana.Minor;
      // Map Suit
      const s = card.suit.toLowerCase();
      if (s === 'wands') suit = Suit.Wands;
      else if (s === 'cups') suit = Suit.Cups;
      else if (s === 'swords') suit = Suit.Swords;
      else if (s === 'pentacles') suit = Suit.Pentacles;

      // Map CN Name
      const rank = card.value.toLowerCase();
      const rankCn = rankCnMap[rank] || rank;
      const suitCn = suitCnMap[s] || s;
      name_cn = `${suitCn}${rankCn}`;
    }

    deck.push({
      id: index,
      name: card.name,
      name_cn: name_cn,
      arcana: arcana,
      suit: suit,
      number: card.value_int,
      imgUrl: card.image,
      description: card.desc,
      keywords: card.meaning_up.split(',').map((k: string) => k.trim())
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
