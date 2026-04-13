import { createStore } from 'zustand/vanilla';
import type { Board, Item, Position } from '../types';
import { createInitialBoard, setItem, findEmptyCell } from '../game/Board';
import { tryMerge, checkStormClear } from '../game/MergeEngine';
import { ComboSystem } from '../game/Combo';
import { Producer } from '../game/Producer';
import { BALANCE } from '../data/balance';
import { ITEM_CHAINS } from '../data/items';
import { pickRandom } from '../utils/random';

interface GameStore {
  board: Board;
  coins: number;
  level: number;
  comboCount: number;
  isFever: boolean;
  feverEndTime: number;
  mergeEffectPos: Position | null;
  mergeEffectTime: number;

  // Actions
  handleDrop: (source: Position, target: Position) => void;
  handleTap: (pos: Position) => void;
  tick: (now: number) => void;
}

const comboSystem = new ComboSystem();

const producerInstance = new Producer({
  itemId: 'producer_veggie',
  maxSpawns: BALANCE.producer.maxSpawns,
  cooldownMs: BALANCE.producer.cooldownSec * 1000,
  spawnPool: [
    { itemId: 'tomato', level: 1, weight: 30 },
    { itemId: 'bread', level: 1, weight: 30 },
    { itemId: 'meat', level: 1, weight: 20 },
    { itemId: 'egg', level: 1, weight: 20 },
  ],
  trashChance: BALANCE.producer.trashChance,
});

export const gameStore = createStore<GameStore>((set, get) => ({
  board: createInitialBoard(),
  coins: 0,
  level: 1,
  comboCount: 0,
  isFever: false,
  feverEndTime: 0,
  mergeEffectPos: null,
  mergeEffectTime: 0,

  handleDrop(source: Position, target: Position) {
    const state = get();
    const board = state.board;
    const result = tryMerge(board, source, target);

    switch (result.type) {
      case 'move': {
        const item = board[source.y][source.x].item;
        setItem(board, target, item);
        setItem(board, source, null);
        break;
      }
      case 'merge': {
        const mergedItem: Item = {
          ...board[target.y][target.x].item!,
          level: result.newLevel!,
        };
        setItem(board, target, mergedItem);
        setItem(board, source, null);

        // Storm clear
        const cleared = checkStormClear(board, target, result.newLevel!);
        for (const pos of cleared) {
          setItem(board, pos, null);
        }

        // Combo
        const comboEvent = comboSystem.onMerge(Date.now());
        const coinReward = result.newLevel! * 5 + cleared.length * 3;

        set({
          board: [...board.map((row) => [...row])],
          coins: state.coins + coinReward,
          comboCount: comboEvent.type === 'combo' ? (comboEvent.count ?? 0) : 0,
          isFever: comboEvent.type === 'fever' ? true : state.isFever,
          feverEndTime:
            comboEvent.type === 'fever'
              ? Date.now() + (comboEvent.duration ?? 0)
              : state.feverEndTime,
          mergeEffectPos: target,
          mergeEffectTime: Date.now(),
        });
        return;
      }
      case 'swap': {
        const sourceItem = board[source.y][source.x].item;
        const targetItem = board[target.y][target.x].item;
        setItem(board, source, targetItem);
        setItem(board, target, sourceItem);
        break;
      }
      case 'maxLevel':
        // Can't merge further — no-op
        break;
    }

    set({ board: [...board.map((row) => [...row])] });
  },

  handleTap(pos: Position) {
    const state = get();
    const board = state.board;
    const cell = board[pos.y][pos.x];

    if (!cell.item?.isProducer) return;

    const spawned = producerInstance.tap(Date.now());
    if (!spawned) return; // on cooldown

    const emptyPos = findEmptyCell(board);
    if (!emptyPos) return; // board full

    setItem(board, emptyPos, spawned);
    set({ board: [...board.map((row) => [...row])] });
  },

  tick(now: number) {
    const state = get();
    let changed = false;

    // End fever
    if (state.isFever && now > state.feverEndTime) {
      set({ isFever: false });
      changed = true;
    }

    // Fever: spawn bonus items
    if (state.isFever) {
      const board = state.board;
      const emptyPos = findEmptyCell(board);
      if (emptyPos) {
        const chains = ITEM_CHAINS.slice(0, 4);
        const chain = pickRandom(chains);
        setItem(board, emptyPos, {
          id: chain.chainId,
          level: 1,
          isProducer: false,
          isTrash: false,
        });
        set({ board: [...board.map((row) => [...row])] });
        changed = true;
      }
    }

    // Clear merge effect after 300ms
    if (state.mergeEffectPos && now - state.mergeEffectTime > 300) {
      set({ mergeEffectPos: null });
      changed = true;
    }

    void changed; // suppress unused
  },
}));
