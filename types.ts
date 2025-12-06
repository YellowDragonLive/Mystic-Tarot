export enum Arcana {
  Major = 'Major',
  Minor = 'Minor'
}

export enum Suit {
  Wands = 'Wands',
  Cups = 'Cups',
  Swords = 'Swords',
  Pentacles = 'Pentacles',
  None = 'None' // For Major Arcana
}

export interface CardData {
  id: number;
  name: string;
  name_cn: string;
  arcana: Arcana;
  suit: Suit;
  number: number; // 0-21 for Major, 1-14 for Minor
  imgUrl: string; // Using placeholder or wikimedia logic
  keywords: string[];
  description?: string;
}

export interface DrawnCard {
  card: CardData;
  isReversed: boolean;
  isRevealed: boolean;
}

export interface SpreadPosition {
  id: number;
  name: string;
  description: string;
  x?: number; // visual grid coordinates for advanced layout
  y?: number;
}

export interface SpreadConfig {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

export enum AppPhase {
  Selection = 'SELECTION',
  Shuffling = 'SHUFFLING',
  Drawing = 'DRAWING',
  Reading = 'READING'
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ReadingHistoryItem {
  id: string;
  timestamp: number;
  spreadId: string;
  drawnCards: DrawnCard[];
  chatHistory: ChatMessage[];
}
