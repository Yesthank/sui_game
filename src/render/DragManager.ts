import type { Board, Item, Position } from '../types';
import { CanvasRenderer } from './CanvasRenderer';
import { clearHighlights } from '../game/Board';
import { inBounds } from '../utils/grid';

export type DropCallback = (source: Position, target: Position) => void;
export type TapCallback = (pos: Position) => void;

interface DragState {
  item: Item;
  sourcePos: Position;
  currentX: number;
  currentY: number;
}

export class DragManager {
  private dragState: DragState | null = null;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private readonly DRAG_THRESHOLD = 8; // px before we consider it a drag vs tap

  constructor(
    private canvas: HTMLCanvasElement,
    private renderer: CanvasRenderer,
    private getBoard: () => Board,
    private onDrop: DropCallback,
    private onTap: TapCallback,
  ) {
    // Touch
    canvas.addEventListener('touchstart', this.handleStart.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchmove', this.handleMove.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchend', this.handleEnd.bind(this));
    canvas.addEventListener('touchcancel', this.handleCancel.bind(this));

    // Mouse
    canvas.addEventListener('mousedown', this.handleStart.bind(this));
    canvas.addEventListener('mousemove', this.handleMove.bind(this));
    canvas.addEventListener('mouseup', this.handleEnd.bind(this));
    canvas.addEventListener('mouseleave', this.handleCancel.bind(this));
  }

  private getClientPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  }

  private handleStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    const { x, y } = this.getClientPos(e);
    const gridPos = this.renderer.getGridPos(x, y);
    if (!gridPos) return;

    const board = this.getBoard();
    const cell = board[gridPos.y]?.[gridPos.x];
    if (!cell?.item || cell.locked) return;

    this.startX = x;
    this.startY = y;
    this.isDragging = false;
    this.dragState = {
      item: { ...cell.item },
      sourcePos: gridPos,
      currentX: x - this.canvas.getBoundingClientRect().left,
      currentY: y - this.canvas.getBoundingClientRect().top,
    };
  }

  private handleMove(e: MouseEvent | TouchEvent): void {
    if (!this.dragState) return;
    e.preventDefault();

    const { x, y } = this.getClientPos(e);
    const rect = this.canvas.getBoundingClientRect();

    // Check if we've moved enough to be a drag
    const dx = x - this.startX;
    const dy = y - this.startY;
    if (!this.isDragging && Math.sqrt(dx * dx + dy * dy) > this.DRAG_THRESHOLD) {
      this.isDragging = true;
    }

    if (!this.isDragging) return;

    this.dragState.currentX = x - rect.left;
    this.dragState.currentY = y - rect.top;

    // Highlight target cell
    const board = this.getBoard();
    clearHighlights(board);
    const targetPos = this.renderer.getGridPos(x, y);
    if (
      targetPos &&
      inBounds(targetPos.x, targetPos.y, board[0].length, board.length) &&
      (targetPos.x !== this.dragState.sourcePos.x ||
        targetPos.y !== this.dragState.sourcePos.y)
    ) {
      board[targetPos.y][targetPos.x].highlight = true;
    }
  }

  private handleEnd(e: MouseEvent | TouchEvent): void {
    if (!this.dragState) return;
    e.preventDefault();

    const { x, y } = this.getClientPos(e);
    const board = this.getBoard();
    clearHighlights(board);

    if (!this.isDragging) {
      // It was a tap
      this.onTap(this.dragState.sourcePos);
      this.dragState = null;
      return;
    }

    const targetPos = this.renderer.getGridPos(x, y);
    if (
      targetPos &&
      (targetPos.x !== this.dragState.sourcePos.x ||
        targetPos.y !== this.dragState.sourcePos.y)
    ) {
      this.onDrop(this.dragState.sourcePos, targetPos);
    }

    this.dragState = null;
    this.isDragging = false;
  }

  private handleCancel(): void {
    if (this.dragState) {
      clearHighlights(this.getBoard());
    }
    this.dragState = null;
    this.isDragging = false;
  }

  updateRenderer(renderer: CanvasRenderer): void {
    this.renderer = renderer;
  }

  getDragInfo(): { item: Item; x: number; y: number } | undefined {
    if (this.dragState && this.isDragging) {
      return {
        item: this.dragState.item,
        x: this.dragState.currentX,
        y: this.dragState.currentY,
      };
    }
    return undefined;
  }
}
