import type { Board, MergeResult, Position } from '../types';
import { getMaxLevel } from '../data/items';
import { getNeighbors } from '../utils/grid';
import { BALANCE } from '../data/balance';

export function tryMerge(
  board: Board,
  source: Position,
  target: Position,
): MergeResult {
  const sourceCell = board[source.y][source.x];
  const targetCell = board[target.y][target.x];

  // Target is empty → move
  if (!targetCell.item) {
    return { type: 'move', source, target };
  }

  // Same item + same level → merge
  if (
    sourceCell.item &&
    targetCell.item &&
    sourceCell.item.id === targetCell.item.id &&
    sourceCell.item.level === targetCell.item.level &&
    !sourceCell.item.isTrash &&
    !targetCell.item.isTrash &&
    !sourceCell.item.isProducer &&
    !targetCell.item.isProducer
  ) {
    const maxLvl = getMaxLevel(targetCell.item.id);
    if (targetCell.item.level >= maxLvl) {
      return { type: 'maxLevel', source, target };
    }
    return {
      type: 'merge',
      source,
      target,
      newLevel: targetCell.item.level + 1,
    };
  }

  // Otherwise → swap
  return { type: 'swap', source, target };
}

export function checkStormClear(
  board: Board,
  mergePos: Position,
  mergedLevel: number,
): Position[] {
  if (mergedLevel < BALANCE.storm.minLevelToTrigger) return [];

  const width = board[0].length;
  const height = board.length;
  const neighbors = getNeighbors(mergePos, width, height);

  return neighbors.filter((pos) => {
    const cell = board[pos.y][pos.x];
    return cell.item?.isTrash === true;
  });
}
