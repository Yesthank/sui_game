import type { Position } from '../types';

export function posToIndex(pos: Position, width: number): number {
  return pos.y * width + pos.x;
}

export function indexToPos(index: number, width: number): Position {
  return { x: index % width, y: Math.floor(index / width) };
}

export function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function getNeighbors(pos: Position, width: number, height: number): Position[] {
  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  const result: Position[] = [];
  for (const [dy, dx] of dirs) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (inBounds(nx, ny, width, height)) {
      result.push({ x: nx, y: ny });
    }
  }
  return result;
}
