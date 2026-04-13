import type { Board, Cell, Item, Position } from '../types';
import { BALANCE } from '../data/balance';
import { ITEM_CHAINS } from '../data/items';
import { pickRandom, shuffle } from '../utils/random';

export function createEmptyBoard(width: number, height: number): Board {
  const board: Board = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ item: null, locked: false, highlight: false });
    }
    board.push(row);
  }
  return board;
}

export function createInitialBoard(): Board {
  const { width, height, initialItems } = BALANCE.board;
  const board = createEmptyBoard(width, height);

  // Generate random positions for initial items
  const allPositions: Position[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      allPositions.push({ x, y });
    }
  }
  const positions = shuffle(allPositions).slice(0, initialItems);

  // Place items — ensure at least some pairs for merging
  const availableChains = ITEM_CHAINS.slice(0, 4); // use first 4 chains for phase 1
  for (const pos of positions) {
    const chain = pickRandom(availableChains);
    const item: Item = {
      id: chain.chainId,
      level: 1,
      isProducer: false,
      isTrash: false,
    };
    board[pos.y][pos.x].item = item;
  }

  // Add one producer
  const emptyPositions = allPositions.filter(
    (p) => board[p.y][p.x].item === null
  );
  if (emptyPositions.length > 0) {
    const prodPos = emptyPositions[0];
    board[prodPos.y][prodPos.x].item = {
      id: 'producer_veggie',
      level: 1,
      isProducer: true,
      isTrash: false,
    };
  }

  return board;
}

export function getCell(board: Board, pos: Position): Cell | null {
  if (pos.y < 0 || pos.y >= board.length) return null;
  if (pos.x < 0 || pos.x >= board[0].length) return null;
  return board[pos.y][pos.x];
}

export function setItem(board: Board, pos: Position, item: Item | null): void {
  board[pos.y][pos.x].item = item;
}

export function findEmptyCell(board: Board): Position | null {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (!board[y][x].item && !board[y][x].locked) {
        return { x, y };
      }
    }
  }
  return null;
}

export function clearHighlights(board: Board): void {
  for (const row of board) {
    for (const cell of row) {
      cell.highlight = false;
    }
  }
}
