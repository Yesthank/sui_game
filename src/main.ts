import './style.css';
import { CanvasRenderer } from './render/CanvasRenderer';
import { DragManager } from './render/DragManager';
import { gameStore } from './store/gameStore';
import { BALANCE } from './data/balance';

// ─── DOM Setup ───
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="game-container" id="game-root">
    <div class="hud">
      <span class="hud-item" id="hud-coins">💰 0</span>
      <span class="hud-item" id="hud-level">⭐ Lv.1</span>
      <span class="hud-item" id="hud-combo" style="display:none"></span>
      <span class="hud-item" id="hud-fever" style="display:none">🔥 FEVER!</span>
    </div>
    <div class="board-wrapper">
      <canvas id="game-canvas"></canvas>
    </div>
    <div class="info-bar">
      <p>같은 아이템을 드래그해서 합치세요!</p>
      <p>📦 생산기를 탭하면 새 아이템이 나옵니다</p>
    </div>
  </div>
`;

// ─── Canvas Setup ───
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const gameRoot = document.getElementById('game-root')!;
const { width: boardW, height: boardH } = BALANCE.board;

function resizeCanvas(): void {
  const maxW = Math.min(window.innerWidth - 40, 900);
  const maxH = window.innerHeight * 0.65;

  const cellFromW = Math.floor(maxW / boardW);
  const cellFromH = Math.floor(maxH / boardH);
  const cellSize = Math.min(cellFromW, cellFromH, 80);

  canvas.width = cellSize * boardW;
  canvas.height = cellSize * boardH;
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}

resizeCanvas();

// ─── Renderer & Input ───
let renderer = new CanvasRenderer(canvas, boardW, boardH);

window.addEventListener('resize', () => {
  resizeCanvas();
  renderer = new CanvasRenderer(canvas, boardW, boardH);
  dragManager.updateRenderer(renderer);
});

const dragManager = new DragManager(
  canvas,
  renderer,
  () => gameStore.getState().board,
  (source, target) => gameStore.getState().handleDrop(source, target),
  (pos) => gameStore.getState().handleTap(pos),
);

// ─── HUD Elements ───
const hudCoins = document.getElementById('hud-coins')!;
const hudLevel = document.getElementById('hud-level')!;
const hudCombo = document.getElementById('hud-combo')!;
const hudFever = document.getElementById('hud-fever')!;

// ─── Game Loop ───
let lastFeverSpawn = 0;

function gameLoop(): void {
  const now = Date.now();
  const state = gameStore.getState();

  // Fever: throttle spawns
  if (state.isFever && now - lastFeverSpawn > BALANCE.combo.feverSpawnIntervalMs) {
    state.tick(now);
    lastFeverSpawn = now;
  } else if (!state.isFever) {
    state.tick(now);
  }

  // Render
  const currentState = gameStore.getState();
  renderer.render(currentState.board, dragManager.getDragInfo());

  if (currentState.mergeEffectPos) {
    renderer.renderMergeEffect(currentState.mergeEffectPos);
  }

  // HUD
  hudCoins.textContent = `💰 ${currentState.coins}`;
  hudLevel.textContent = `⭐ Lv.${currentState.level}`;

  if (currentState.comboCount > 1) {
    hudCombo.textContent = `🔥 ${currentState.comboCount} COMBO!`;
    hudCombo.style.display = '';
  } else {
    hudCombo.style.display = 'none';
  }

  hudFever.style.display = currentState.isFever ? '' : 'none';
  gameRoot.classList.toggle('fever', currentState.isFever);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
