// ─── Core Data Types ───

export interface Position {
  x: number; // column
  y: number; // row
}

export interface Item {
  id: string;          // e.g. 'tomato', 'bread', 'meat'
  level: number;       // merge tier (1 ~ maxLevel)
  isProducer: boolean;
  isTrash: boolean;
}

export interface Cell {
  item: Item | null;
  locked: boolean;     // inactive until board expansion
  highlight: boolean;  // drop-target highlight
}

export type Board = Cell[][];

export interface GameState {
  board: Board;
  boardWidth: number;
  boardHeight: number;
  coins: number;
  level: number;
  comboCount: number;
  comboTimer: number;
  isFever: boolean;
  activeQuests: Quest[];
}

export interface Quest {
  id: string;
  customerName: string;
  customerAvatar: string;
  requiredItems: { itemId: string; level: number; count: number }[];
  timeLimit: number;
  reward: { coins: number; xp: number };
}

export interface ProducerConfig {
  itemId: string;
  maxSpawns: number;
  cooldownMs: number;
  spawnPool: { itemId: string; level: number; weight: number }[];
  trashChance: number;
}

export interface MergeResult {
  type: 'move' | 'merge' | 'swap' | 'maxLevel';
  source: Position;
  target: Position;
  newLevel?: number;
}

export interface ComboEvent {
  type: 'combo' | 'fever';
  count?: number;
  duration?: number;
}

export interface ChainLevel {
  level: number;
  name: string;
  emoji: string;
}

export interface ItemChain {
  chainId: string;
  category: string;
  levels: ChainLevel[];
}
