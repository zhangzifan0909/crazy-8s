
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'menu' | 'dealing' | 'playing' | 'won' | 'lost' | 'choosing_suit';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type PlayerType = 'player' | 'ai';

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  aiHand: Card[];
  discardPile: Card[];
  currentSuit: Suit;
  currentRank: Rank;
  turn: PlayerType;
  status: GameStatus;
  difficulty: Difficulty;
  winner: PlayerType | null;
  message: string;
  lastPlayBy: PlayerType | null;
}
