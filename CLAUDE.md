# Merge Infinity — CLAUDE.md

## 프로젝트 개요

캔버스 기반 머지 퍼즐 게임. 같은 아이템을 드래그해 합치고, 콤보를 쌓아 피버 모드를 발동하는 모바일 친화적 웹 게임.

- **배포 URL**: https://yesthank.github.io/sui_game/
- **저장소**: https://github.com/Yesthank/sui_game
- **기술 스택**: Vite 8 + TypeScript 6 + Tailwind CSS v4 + Zustand (vanilla)

---

## 디렉토리 구조

```
src/
├── main.ts              # 진입점: DOM 세팅, 캔버스 크기 조정, 게임 루프
├── style.css            # Tailwind v4 + 다크 테마 CSS 변수
├── types/
│   └── index.ts         # 공통 타입 (Board, Item, Cell, Position, Quest 등)
├── data/
│   ├── balance.ts       # 게임 밸런스 상수 (보드 크기, 콤보 타이밍 등)
│   └── items.ts         # 아이템 체인 정의 (이름, 이모지, 레벨)
├── game/
│   ├── Board.ts         # 보드 초기화, 셀 조작, 빈 칸 탐색
│   ├── MergeEngine.ts   # 머지 로직 (move/merge/swap/maxLevel)
│   ├── Combo.ts         # 콤보 카운팅, 피버 모드 트리거
│   └── Producer.ts      # 생산기 탭 → 아이템 스폰, 쿨다운
├── render/
│   ├── CanvasRenderer.ts # Canvas 2D 렌더링 (셀, 이모지, 레벨 배지, 머지 이펙트)
│   └── DragManager.ts   # 마우스/터치 드래그 & 탭 입력 처리
├── store/
│   └── gameStore.ts     # Zustand vanilla 스토어 (상태 + 액션)
└── utils/
    ├── grid.ts          # 좌표 변환, 경계 검사, 이웃 셀 탐색
    └── random.ts        # 가중치 랜덤, 셔플, pickRandom
```

---

## 게임 시스템

### 보드 (`balance.ts`)
| 항목 | 값 |
|------|----|
| 보드 크기 | 9 × 7 |
| 초기 배치 아이템 수 | 12 |

### 아이템 체인 (`items.ts`)
6가지 체인, 각 4~5레벨:
- **tomato** — 🌱 → 🟢 → 🍅 → 🍅 → ✨🍅
- **bread** — 🫓 → 🧆 → 🍞 → 🥐 → ✨🥖
- **meat** — 🥩 → 🍖 → 🥩 → 🥩 → ✨🥩
- **egg** — 🥚 → 🍳 → 🍳 → ✨🍳
- **fruit** — 🫘 → 🌿 → 🍓 → ✨🍓
- **drink** — 🥤 → 💧 → ☕ → ✨☕

### 머지 규칙 (`MergeEngine.ts`)
- 빈 칸 → **move**
- 같은 id + 같은 level → **merge** (level +1)
- 최대 레벨 → **maxLevel** (no-op)
- 그 외 → **swap**

### 콤보 & 피버 (`Combo.ts`, `balance.ts`)
| 항목 | 값 |
|------|----|
| 콤보 윈도우 | 3000ms |
| 피버 발동 콤보 수 | 5회 |
| 피버 지속 시간 | 8000ms |
| 피버 중 아이템 스폰 간격 | 500ms |

### 생산기 (`Producer.ts`)
| 항목 | 값 |
|------|----|
| 최대 탭 횟수 (쿨다운 전) | 10회 |
| 쿨다운 | 30초 |
| 쓰레기 출현 확률 | 8% |

### 스톰 클리어 (`MergeEngine.ts`)
레벨 3 이상 머지 시, 인접 8방향 쓰레기(`isTrash: true`) 자동 제거.

---

## 개발 커맨드

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 (localhost:5173)
pnpm build          # 프로덕션 빌드 → dist/
pnpm preview        # 빌드 결과 로컬 미리보기
```

---

## 배포

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 자동으로:
1. `pnpm install` → `pnpm build`
2. `dist/` 를 GitHub Pages에 배포

`vite.config.ts`의 `base: '/sui_game/'` 값은 저장소명과 반드시 일치해야 함.

---

## 밸런스 수정 방법

`src/data/balance.ts` 한 파일에서 모든 수치를 조정할 수 있음:

```ts
// 보드 크기 변경
board: { width: 9, height: 7, initialItems: 12 }

// 피버 발동 콤보 수 낮추면 더 자주 발동
combo: { feverThreshold: 5, feverDurationMs: 8000 }

// 생산기 쿨다운 줄이면 아이템 더 빨리 소환
producer: { cooldownSec: 30, trashChance: 0.08 }
```

## 아이템 추가 방법

`src/data/items.ts`의 `ITEM_CHAINS` 배열에 항목 추가:

```ts
{
  chainId: 'fish',
  category: 'seafood',
  levels: [
    { level: 1, name: '작은 물고기', emoji: '🐟' },
    { level: 2, name: '참치', emoji: '🐡' },
    { level: 3, name: '전설의 물고기', emoji: '✨🐠' },
  ],
}
```
