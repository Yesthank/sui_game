import type { Board, Item, Position } from '../types';
import { getEmoji } from '../data/items';

const GRID_BG = '#f5e6d3';
const GRID_LINE = '#d4c4a8';
const CELL_BG = '#faf3e8';
const LOCKED_BG = '#c0b8a8';
const HIGHLIGHT_COLOR = 'rgba(100, 200, 100, 0.35)';
const PRODUCER_GLOW = 'rgba(255, 215, 0, 0.4)';
const TRASH_OVERLAY = 'rgba(128, 128, 128, 0.4)';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  public cellSize: number;
  private boardWidth: number;
  private boardHeight: number;
  private offsetX: number;
  private offsetY: number;

  constructor(
    private canvas: HTMLCanvasElement,
    boardWidth: number,
    boardHeight: number,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;

    // Calculate cell size to fit canvas
    const maxCellW = canvas.width / boardWidth;
    const maxCellH = canvas.height / boardHeight;
    this.cellSize = Math.floor(Math.min(maxCellW, maxCellH));

    // Center the board
    this.offsetX = Math.floor(
      (canvas.width - this.cellSize * boardWidth) / 2,
    );
    this.offsetY = Math.floor(
      (canvas.height - this.cellSize * boardHeight) / 2,
    );
  }

  getGridPos(clientX: number, clientY: number): Position | null {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const px = (clientX - rect.left) * scaleX - this.offsetX;
    const py = (clientY - rect.top) * scaleY - this.offsetY;
    const x = Math.floor(px / this.cellSize);
    const y = Math.floor(py / this.cellSize);

    if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
      return null;
    }
    return { x, y };
  }

  render(board: Board, dragInfo?: { item: Item; x: number; y: number }): void {
    const { ctx, cellSize, offsetX, offsetY } = this;

    // Clear
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    ctx.fillStyle = GRID_BG;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw cells
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        const px = offsetX + x * cellSize;
        const py = offsetY + y * cellSize;

        // Cell background
        ctx.fillStyle = cell.locked ? LOCKED_BG : CELL_BG;
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

        // Cell border
        ctx.strokeStyle = GRID_LINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);

        // Highlight
        if (cell.highlight) {
          ctx.fillStyle = HIGHLIGHT_COLOR;
          ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        }

        // Item
        if (cell.item) {
          this.drawItem(cell.item, px, py);
        }
      }
    }

    // Draw dragged item ghost
    if (dragInfo) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const px = dragInfo.x * scaleX - cellSize / 2;
      const py = dragInfo.y * scaleY - cellSize / 2;

      ctx.globalAlpha = 0.8;
      this.drawItemAt(dragInfo.item, px, py);
      ctx.globalAlpha = 1.0;
    }
  }

  private drawItem(item: Item, px: number, py: number): void {
    const { ctx, cellSize } = this;

    // Producer glow
    if (item.isProducer) {
      ctx.fillStyle = PRODUCER_GLOW;
      ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
    }

    // Emoji
    const emoji = item.isProducer
      ? '📦'
      : item.isTrash
        ? '🗑️'
        : getEmoji(item.id, item.level);
    const fontSize = Math.floor(cellSize * 0.55);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, px + cellSize / 2, py + cellSize / 2);

    // Level badge (bottom-right)
    if (!item.isProducer && !item.isTrash && item.level > 1) {
      const badgeSize = Math.floor(cellSize * 0.25);
      const bx = px + cellSize - badgeSize - 2;
      const by = py + cellSize - badgeSize - 2;
      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(
        bx + badgeSize / 2,
        by + badgeSize / 2,
        badgeSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.floor(badgeSize * 0.7)}px sans-serif`;
      ctx.fillText(
        `${item.level}`,
        bx + badgeSize / 2,
        by + badgeSize / 2 + 1,
      );
    }

    // Trash overlay
    if (item.isTrash) {
      ctx.fillStyle = TRASH_OVERLAY;
      ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
    }
  }

  private drawItemAt(item: Item, px: number, py: number): void {
    const { ctx, cellSize } = this;
    const emoji = item.isProducer
      ? '📦'
      : item.isTrash
        ? '🗑️'
        : getEmoji(item.id, item.level);
    const fontSize = Math.floor(cellSize * 0.55);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, px + cellSize / 2, py + cellSize / 2);
  }

  renderMergeEffect(pos: Position): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    const px = offsetX + pos.x * cellSize + cellSize / 2;
    const py = offsetY + pos.y * cellSize + cellSize / 2;

    // Simple sparkle ring
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, cellSize * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  getOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }
}
