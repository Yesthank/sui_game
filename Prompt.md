# 🎮 무한 머지 게임 — Claude Code 제작 스펙

> **프로젝트 코드네임:** `merge-infinity`
> **장르:** 캐주얼 머지 퍼즐 (에너지 시스템 없음, 무한 플레이)
> **플랫폼:** 모바일 웹 (HTML5) — 가로 모드(Landscape) 기본
> **레퍼런스:** 음식/요리 테마 머지 게임 (영상 참고: 7x9+ 그리드, 좌측 주문 패널, 우측 퀘스트 바, 생산 타일 + 쿨타임 기반)

-----

## 📌 0. Claude Code 플러그인 사용 가이드

이 프로젝트는 Claude Code의 플러그인 시스템을 적극 활용합니다. 아래 표를 참고하여 각 단계에서 적절한 플러그인을 호출하세요.

|플러그인               |작동 방식         |호출 방법                         |용도                          |
|-------------------|--------------|------------------------------|----------------------------|
|`security-guidance`|🟢 자동 (Hook)   |파일 편집 시 매번 자동 실행. 별도 명령 불필요   |XSS, 인젝션 등 보안 취약점 자동 검사     |
|`feature-dev`      |🔵 수동 (Command)|`/feature-dev` 입력해야 실행        |새 기능 브랜치 개발 시 사용            |
|`code-review`      |🔵 수동 (Command)|`/code-review` 입력해야 실행        |PR 전 코드 리뷰                  |
|`ralph-loop`       |🔵 수동 (Command)|`/ralph-loop "작업 설명"` 입력해야 실행 |반복 작업 자동화 (예: 아이템 50개 일괄 등록)|
|`frontend-design`  |🟡 반자동 (Skill) |UI/프론트엔드 작업 요청 시 Claude가 자동 참조|UI 컴포넌트, 레이아웃, 스타일링 가이드     |
|`codex-peer-review`|🔵 수동 (Command)|`/codex-peer-review` 입력해야 실행  |외부 관점 코드 품질 검증              |

### 권장 워크플로우

```
1. /feature-dev "보드 그리드 시스템 구현"  →  기능 개발 시작
2. (코딩 중 security-guidance 자동 실행)   →  보안 이슈 실시간 감지
3. /ralph-loop "아이템 데이터 50종 생성"   →  반복 데이터 작업
4. /code-review                            →  셀프 리뷰
5. /codex-peer-review                      →  최종 품질 검증
```

-----

## 📌 1. 기술 스택

### 선택 근거

2026년 현재 Vite 8 (Rolldown 통합)이 안정화되었고, TypeScript + Vite 조합이 프론트엔드 게임 개발의 사실상 표준입니다. Phaser 같은 전용 엔진 없이 Vanilla TS + Canvas/DOM 하이브리드로 빠르게 프로토타이핑합니다.

|레이어        |기술                         |비고                            |
|-----------|---------------------------|------------------------------|
|**빌드**     |Vite 8+ (Rolldown)         |HMR 즉시 반영, ESM 네이티브           |
|**언어**     |TypeScript 5.x+            |엄격 모드, `isolatedModules: true`|
|**렌더링**    |Canvas 2D + DOM 오버레이       |보드는 Canvas, UI(주문/퀘스트)는 DOM   |
|**상태관리**   |Zustand                    |경량, 보드 상태 + 게임 진행 상태          |
|**스타일**    |Tailwind CSS 4             |DOM UI 파트 전용                  |
|**사운드**    |Howler.js                  |합성 효과음, BGM                   |
|**애니메이션**  |GSAP 또는 Canvas 트윈          |머지 이펙트, 파티클                   |
|**배포**     |GitHub Pages (gh-pages 브랜치)|정적 호스팅                        |
|**패키지 매니저**|pnpm                       |빠른 설치, 디스크 절약                 |

### 프로젝트 초기화

```bash
pnpm create vite merge-infinity --template vanilla-ts
cd merge-infinity
pnpm add zustand howler gsap
pnpm add -D tailwindcss @tailwindcss/vite gh-pages
```

-----

## 📌 2. 디렉토리 구조

```
merge-infinity/
├── public/
│   ├── assets/
│   │   ├── items/          # 아이템 스프라이트 (레벨별)
│   │   ├── ui/             # UI 아이콘, 배경
│   │   ├── effects/        # 파티클, 이펙트 스프라이트
│   │   └── sounds/         # SE, BGM
│   └── index.html
├── src/
│   ├── main.ts             # 엔트리포인트
│   ├── game/
│   │   ├── Board.ts        # 2D 그리드 보드 클래스
│   │   ├── Item.ts         # 아이템 엔티티
│   │   ├── MergeEngine.ts  # 합성 로직 코어
│   │   ├── Producer.ts     # 생산 타일 + 쿨타임
│   │   ├── Combo.ts        # 연쇄 콤보 / 피버타임
│   │   ├── Trash.ts        # 방해물 시스템
│   │   └── Quest.ts        # 주문(Order) 퀘스트
│   ├── render/
│   │   ├── CanvasRenderer.ts   # Canvas 2D 보드 렌더링
│   │   ├── DragManager.ts      # 터치/마우스 드래그 앤 드롭
│   │   ├── EffectManager.ts    # 합성 이펙트, 파티클
│   │   └── Camera.ts           # 뷰포트, 줌/스크롤 (큰 보드용)
│   ├── ui/
│   │   ├── OrderPanel.ts       # 좌측 주문 패널 (DOM)
│   │   ├── QuestBar.ts         # 우측 퀘스트 바 (DOM)
│   │   ├── TopBar.ts           # 상단 HUD (코인, 레벨)
│   │   └── FeverOverlay.ts     # 피버타임 오버레이
│   ├── data/
│   │   ├── items.json          # 아이템 정의 (ID, 이름, 레벨 체인)
│   │   ├── quests.json         # 퀘스트/주문 데이터
│   │   └── producers.json      # 생산 타일 데이터
│   ├── store/
│   │   ├── gameStore.ts        # Zustand 게임 상태
│   │   └── settingsStore.ts    # 설정 (사운드, 진동)
│   ├── utils/
│   │   ├── grid.ts             # 그리드 좌표 변환
│   │   ├── random.ts           # 가중치 랜덤
│   │   └── timer.ts            # 쿨타임/타이머 유틸
│   └── types/
│       └── index.ts            # 공통 타입 정의
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

-----

## 📌 3. 코어 데이터 구조

### 3.1 보드 (2D 그리드)

영상에서 관찰된 보드는 **가로 9~11 × 세로 7~9** 정도의 그리드입니다. 좌측에 주문 NPC 패널, 우측에 퀘스트 바가 위치합니다.

```typescript
// src/types/index.ts

export interface Position {
  x: number;  // 열 (column)
  y: number;  // 행 (row)
}

export interface Item {
  id: string;           // 아이템 종류 (예: 'tomato', 'bread', 'meat')
  level: number;        // 합성 단계 (1 ~ maxLevel)
  isProducer: boolean;  // 생산 타일 여부
  isTrash: boolean;     // 방해물 여부
}

export interface Cell {
  item: Item | null;
  locked: boolean;      // 잠긴 칸 (확장 전 비활성)
  highlight: boolean;   // 드롭 가능 하이라이트
}

export type Board = Cell[][];

export interface GameState {
  board: Board;
  boardWidth: number;   // 기본 9
  boardHeight: number;  // 기본 7
  coins: number;
  level: number;
  comboCount: number;
  comboTimer: number;   // ms
  isFever: boolean;
  activeQuests: Quest[];
}

export interface Quest {
  id: string;
  customerName: string;   // NPC 이름 or B급 별명
  customerAvatar: string; // 아바타 경로
  requiredItems: { itemId: string; level: number; count: number }[];
  timeLimit: number;      // 초 (0이면 무제한)
  reward: { coins: number; xp: number };
}

export interface ProducerConfig {
  itemId: string;
  maxSpawns: number;      // 쿨타임 전 최대 생산 횟수 (예: 10)
  cooldownMs: number;     // 쿨타임 (예: 30000ms)
  spawnPool: { itemId: string; level: number; weight: number }[];
  trashChance: number;    // 쓰레기 등장 확률 (0.0 ~ 1.0)
}
```

### 3.2 아이템 체인 (머지 트리)

영상에서 관찰된 아이템 카테고리를 기반으로 설계합니다.

```typescript
// src/data/items.json 구조 예시
{
  "chains": [
    {
      "chainId": "tomato",
      "category": "vegetable",
      "levels": [
        { "level": 1, "name": "토마토 씨앗",    "sprite": "tomato_1.png" },
        { "level": 2, "name": "풋토마토",        "sprite": "tomato_2.png" },
        { "level": 3, "name": "빨간 토마토",     "sprite": "tomato_3.png" },
        { "level": 4, "name": "완숙 토마토",     "sprite": "tomato_4.png" },
        { "level": 5, "name": "전설의 토마토",   "sprite": "tomato_5.png" }
      ]
    },
    {
      "chainId": "bread",
      "category": "bakery",
      "levels": [
        { "level": 1, "name": "밀가루 반죽",     "sprite": "bread_1.png" },
        { "level": 2, "name": "발효 반죽",       "sprite": "bread_2.png" },
        { "level": 3, "name": "구운 빵",         "sprite": "bread_3.png" },
        { "level": 4, "name": "크루아상",        "sprite": "bread_4.png" },
        { "level": 5, "name": "전설의 바게트",   "sprite": "bread_5.png" }
      ]
    },
    {
      "chainId": "meat",
      "category": "protein",
      "levels": [
        { "level": 1, "name": "날고기 조각",     "sprite": "meat_1.png" },
        { "level": 2, "name": "양념 고기",       "sprite": "meat_2.png" },
        { "level": 3, "name": "구운 스테이크",   "sprite": "meat_3.png" },
        { "level": 4, "name": "숙성 스테이크",   "sprite": "meat_4.png" },
        { "level": 5, "name": "미쉐린 스테이크", "sprite": "meat_5.png" }
      ]
    }
  ]
}
```

**영상 기반 관찰 아이템 카테고리 (최소 8종 이상):**

|카테고리    |예시 아이템          |최대 레벨|
|--------|----------------|-----|
|🍅 채소    |토마토, 양파, 양배추, 가지|5    |
|🍞 베이커리  |빵, 크루아상, 케이크    |5    |
|🥩 육류    |생고기 → 스테이크      |5    |
|🍳 달걀/유제품|달걀 → 오믈렛        |4    |
|🍌 과일    |바나나, 딸기, 레몬     |4    |
|☕ 음료    |컵 → 커피 → 라떼     |4    |
|🧁 디저트   |재료 → 푸딩 → 케이크   |5    |
|📦 상자/생산기|탭하면 아이템 생산      |-    |

-----

## 📌 4. 핵심 로직 상세

### 4.1 머지(합성) 엔진

```typescript
// src/game/MergeEngine.ts

export class MergeEngine {
  /**
   * 드래그 앤 드롭 후 호출되는 핵심 합성 판정 함수
   */
  tryMerge(
    board: Board,
    source: Position,
    target: Position
  ): MergeResult {
    const sourceCell = board[source.y][source.x];
    const targetCell = board[target.y][target.x];

    // 1) 타겟이 비어있으면 → 이동
    if (!targetCell.item) {
      return { type: 'move', source, target };
    }

    // 2) 동일 아이템 + 동일 레벨 → 합성!
    if (
      sourceCell.item &&
      targetCell.item &&
      sourceCell.item.id === targetCell.item.id &&
      sourceCell.item.level === targetCell.item.level &&
      !sourceCell.item.isTrash &&
      !targetCell.item.isTrash
    ) {
      const maxLevel = this.getMaxLevel(targetCell.item.id);
      if (targetCell.item.level >= maxLevel) {
        return { type: 'maxLevel', source, target };
      }
      return { type: 'merge', source, target, newLevel: targetCell.item.level + 1 };
    }

    // 3) 그 외 → 스왑 또는 제자리 복귀
    return { type: 'swap', source, target };
  }

  /**
   * 3레벨 이상 합성 시 주변 방해물(Trash) 제거 판정
   * — "폭풍" 이펙트 범위: 합성 지점 기준 인접 8칸
   */
  checkStormClear(
    board: Board,
    mergePos: Position,
    mergedLevel: number
  ): Position[] {
    if (mergedLevel < 3) return [];

    const cleared: Position[] = [];
    const dirs = [
      [-1,-1], [-1,0], [-1,1],
      [0,-1],          [0,1],
      [1,-1],  [1,0],  [1,1]
    ];

    for (const [dy, dx] of dirs) {
      const ny = mergePos.y + dy;
      const nx = mergePos.x + dx;
      if (this.inBounds(board, nx, ny)) {
        const cell = board[ny][nx];
        if (cell.item?.isTrash) {
          cleared.push({ x: nx, y: ny });
        }
      }
    }
    return cleared;
  }
}
```

### 4.2 생산 타일 + 쿨타임 (에너지 대체)

에너지 시스템 없이도 보드가 무한히 채워지는 것을 방지하는 핵심 장치입니다.

```typescript
// src/game/Producer.ts

export class Producer {
  private spawnCount = 0;
  private cooldownEnd = 0;

  constructor(private config: ProducerConfig) {}

  /**
   * 생산 타일 탭 시 호출
   * @returns 생산된 아이템 or null(쿨타임 중)
   */
  tap(now: number): Item | null {
    // 쿨타임 체크
    if (now < this.cooldownEnd) return null;

    this.spawnCount++;

    // 최대 생산 횟수 도달 → 쿨타임 진입
    if (this.spawnCount >= this.config.maxSpawns) {
      this.cooldownEnd = now + this.config.cooldownMs;
      this.spawnCount = 0;
    }

    // 가중치 랜덤으로 아이템 결정
    if (Math.random() < this.config.trashChance) {
      return { id: 'trash', level: 1, isProducer: false, isTrash: true };
    }

    const spawned = weightedRandom(this.config.spawnPool);
    return {
      id: spawned.itemId,
      level: spawned.level,
      isProducer: false,
      isTrash: false,
    };
  }

  getRemainingCooldown(now: number): number {
    return Math.max(0, this.cooldownEnd - now);
  }
}
```

### 4.3 연쇄 콤보 + 피버 타임

```typescript
// src/game/Combo.ts

const COMBO_WINDOW_MS = 3000;   // 3초 내 연속 머지
const FEVER_THRESHOLD = 5;       // 5콤보 달성 시 피버
const FEVER_DURATION_MS = 8000;  // 피버 8초 지속

export class ComboSystem {
  private lastMergeTime = 0;
  private comboCount = 0;

  onMerge(now: number): ComboEvent {
    if (now - this.lastMergeTime <= COMBO_WINDOW_MS) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastMergeTime = now;

    if (this.comboCount >= FEVER_THRESHOLD) {
      this.comboCount = 0;
      return { type: 'fever', duration: FEVER_DURATION_MS };
    }

    return { type: 'combo', count: this.comboCount };
  }
}
```

**피버 타임 동작:**

- 빈 칸에 보너스 아이템이 비 내리듯 자동 생성 (0.5초 간격)
- 생산 타일 쿨타임 즉시 초기화
- 화면 가장자리에 골든 파티클 이펙트
- 피버 BGM 전환

-----

## 📌 5. UI 레이아웃 (영상 기반)

영상에서 관찰한 실제 게임의 레이아웃을 그대로 재현합니다.

```
┌─────────────────────────────────────────────────────────┐
│  [코인: 142]  [레벨: 10]              [설정] [쓰레기통]  │  ← 상단 HUD
├──────────┬──────────────────────────┬───────────────────┤
│ 👩‍🍳 NPC1  │                          │                   │
│ 🥐×2 🍳×1 │                          │  📋 퀘스트 목록     │
│ ⏱️ 1h26m  │                          │                   │
│──────────│    9 × 7  머지 보드       │  "같은 아이템을    │
│ 👨‍🍳 NPC2  │    (Canvas 렌더링)       │   합쳐서 레벨업!" │
│ 🍅×3     │                          │                   │
│ ⏱️ 11h52m │                          │  [힌트 보기]       │
│──────────│                          │                   │
│ 📦 생산기  │                          │                   │
│ 🔋 106   │                          │                   │
│ ⏱️ 쿨타임 │                          │                   │
├──────────┴──────────────────────────┴───────────────────┤
│           [인벤토리 / 하단 퀵슬롯] (선택사항)             │
└─────────────────────────────────────────────────────────┘
```

### 비율

- **좌측 주문 패널:** 전체 폭의 ~18%
- **중앙 보드:** 전체 폭의 ~60%
- **우측 퀘스트 바:** 전체 폭의 ~22%

-----

## 📌 6. 렌더링 & 인터랙션

### 6.1 Canvas 보드 렌더링

```typescript
// src/render/CanvasRenderer.ts

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private sprites: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement, boardWidth: number, boardHeight: number) {
    this.ctx = canvas.getContext('2d')!;
    this.cellSize = Math.min(
      canvas.width / boardWidth,
      canvas.height / boardHeight
    );
  }

  render(board: Board): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // 1) 그리드 배경
    this.drawGrid(board);

    // 2) 아이템 스프라이트
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        if (cell.item) {
          this.drawItem(cell.item, x, y);
        }
        if (cell.highlight) {
          this.drawHighlight(x, y);
        }
      }
    }
  }

  private drawItem(item: Item, x: number, y: number): void {
    const sprite = this.sprites.get(`${item.id}_${item.level}`);
    if (sprite) {
      const px = x * this.cellSize;
      const py = y * this.cellSize;
      // 아이템이 칸보다 살짝 작게 (패딩 4px)
      this.ctx.drawImage(
        sprite,
        px + 4, py + 4,
        this.cellSize - 8, this.cellSize - 8
      );
    }

    // 생산기: 글로우 효과
    if (item.isProducer) {
      this.drawGlow(x, y, '#FFD700');
    }

    // 쓰레기: 반투명 회색 오버레이
    if (item.isTrash) {
      this.drawTrashOverlay(x, y);
    }
  }
}
```

### 6.2 드래그 앤 드롭 (모바일 터치 대응)

```typescript
// src/render/DragManager.ts

export class DragManager {
  private dragging: { item: Item; startPos: Position } | null = null;
  private ghostElement: HTMLDivElement | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private cellSize: number,
    private onDrop: (source: Position, target: Position) => void
  ) {
    // 터치 이벤트 (모바일 우선)
    canvas.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.handleEnd.bind(this));

    // 마우스 이벤트 (데스크톱 폴백)
    canvas.addEventListener('mousedown', this.handleStart.bind(this));
    canvas.addEventListener('mousemove', this.handleMove.bind(this));
    canvas.addEventListener('mouseup', this.handleEnd.bind(this));
  }

  private getGridPos(clientX: number, clientY: number): Position {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor((clientX - rect.left) / this.cellSize),
      y: Math.floor((clientY - rect.top) / this.cellSize),
    };
  }
}
```

### 6.3 이펙트 시스템

|이벤트     |이펙트                   |사운드                 |
|--------|----------------------|--------------------|
|머지 성공   |파티클 스파클 + 스케일 바운스     |`merge_pop.mp3`     |
|레벨 3+ 폭풍|방사형 물결 + 쓰레기 소멸       |`storm_whoosh.mp3`  |
|피버 진입   |화면 가장자리 골든 글로우 + 아이템 비|`fever_fanfare.mp3` |
|퀘스트 완료  |NPC 리액션 + 코인 분수       |`quest_complete.mp3`|
|쓰레기 등장  |화면 흔들림 (미세) + 회색 연기   |`trash_plop.mp3`    |
|생산기 쿨다운 |프로그레스 링 애니메이션         |`tick_tock.mp3` (루프)|

-----

## 📌 7. B급 감성 테마 시스템

### 7.1 커스텀 테마 레이어

기본 요리 테마 위에 B급 감성 오버레이를 씌울 수 있는 구조입니다.

```typescript
// src/data/themes.ts

export const THEMES = {
  cooking: {
    name: '요리왕이 되자!',
    itemNames: {
      tomato_1: '토마토 씨앗',
      tomato_5: '전설의 토마토',
    },
    questPrefix: '셰프가',
    questSuffix: '을(를) 요구합니다!',
  },

  classB: {
    name: '야근 서바이벌',
    itemNames: {
      tomato_1: '편의점 컵라면',
      tomato_5: '야근 찌든 직장인의 영혼',
    },
    questPrefix: 'XX이가',
    questSuffix: '을(를) 달라고 난리입니다!',
  },

  meme: {
    name: '밈 대전쟁',
    // 커스텀 닉네임/사진을 넣는 구조
    questPrefix: '이름으로_교체',
    questSuffix: '을(를) 내놓으라고 합니다 ㅋㅋ',
  },
};
```

### 7.2 NPC(주문 손님) 커스터마이징

```typescript
export interface Customer {
  name: string;            // "홍길동" or "야근의 제왕"
  avatar: string;          // URL or emoji
  catchphrase: string;     // "빨리 만들어줘... 배고파..."
  reactionOnComplete: string; // "역시 천재 셰프!"
}
```

-----

## 📌 8. 게임 밸런스 파라미터

```typescript
// src/data/balance.ts — 밸런스 조정은 여기서 한 번에

export const BALANCE = {
  board: {
    width: 9,
    height: 7,
    initialItems: 12,        // 게임 시작 시 배치되는 초기 아이템 수
  },

  producer: {
    maxSpawns: 10,           // 쿨타임 전 최대 탭 횟수
    cooldownSec: 30,         // 생산기 쿨타임 (초)
    trashChance: 0.08,       // 쓰레기 등장 확률 8%
  },

  combo: {
    windowMs: 3000,          // 콤보 유지 시간 (3초)
    feverThreshold: 5,       // 피버 진입 콤보 수
    feverDurationMs: 8000,   // 피버 지속 시간
    feverSpawnIntervalMs: 500, // 피버 중 아이템 비 간격
  },

  quest: {
    maxActive: 3,            // 동시 활성 퀘스트 수
    refreshIntervalSec: 120, // 새 퀘스트 등장 간격
  },

  storm: {
    minLevelToTrigger: 3,    // 폭풍 발동 최소 합성 레벨
    radius: 1,               // 폭풍 범위 (인접 칸 수)
  },
};
```

-----

## 📌 9. 개발 로드맵 (페이즈별)

### Phase 1: 코어 프로토타입 (1~2일)

> `/feature-dev "Phase 1: 코어 머지 프로토타입"`

- [ ] Vite + TS 프로젝트 셋업
- [ ] Board 클래스 — 9×7 그리드 생성 + Canvas 렌더링
- [ ] Item 엔티티 — emoji 텍스트로 임시 렌더링
- [ ] DragManager — 터치/마우스 드래그 앤 드롭
- [ ] MergeEngine — 이동 / 합성 / 스왑 판정
- [ ] 최소 2개 체인 (토마토, 빵) 동작 확인

### Phase 2: 게임플레이 루프 (2~3일)

> `/feature-dev "Phase 2: 생산/퀘스트/콤보 시스템"`

- [ ] Producer — 생산 타일 탭 + 쿨타임 프로그레스
- [ ] Trash — 방해물 생성 + 폭풍 제거
- [ ] ComboSystem — 콤보 카운트 + 피버 타임
- [ ] Quest — 좌측 주문 패널 + 완료 판정
- [ ] Zustand 상태 관리 통합
- [ ] 사운드 효과 (Howler.js)

### Phase 3: 비주얼 폴리시 (2~3일)

> `/feature-dev "Phase 3: 이펙트 + UI 폴리시"`

- [ ] 스프라이트 에셋 교체 (emoji → 실제 이미지)
- [ ] GSAP 머지 애니메이션 (스케일 바운스, 파티클)
- [ ] DOM UI 구현 (Tailwind) — 주문 패널, 퀘스트 바, HUD
- [ ] 피버 타임 오버레이 이펙트
- [ ] BGM + 상황별 사운드 전환
- [ ] `/code-review` → `/codex-peer-review`

### Phase 4: 테마 + 배포 (1~2일)

- [ ] B급 감성 테마 레이어 적용
- [ ] NPC 커스터마이징 (7반 친구들 이름/별명)
- [ ] 모바일 반응형 + 가로 모드 강제
- [ ] GitHub Pages 배포 (gh-pages 브랜치)
- [ ] PWA 설정 (오프라인 캐시)

### Phase 5: 확장 (선택)

- [ ] localStorage 세이브/로드
- [ ] 보드 확장 (잠금 해제 시스템)
- [ ] 새 아이템 체인 추가
- [ ] 일일 미션 / 도전 모드
- [ ] AI NPC 대사 생성 (Gemini API 연동 실험)

-----

## 📌 10. 빌드 & 배포

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/merge-infinity/',  // GitHub Pages 경로
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
});
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "pnpm build && gh-pages -d dist"
  }
}
```

### GitHub Pages 배포

```bash
# gh-pages 브랜치 방식
pnpm deploy
```

-----

## 📌 11. 성능 고려사항

|항목   |전략                                             |
|-----|-----------------------------------------------|
|렌더링  |requestAnimationFrame 기반, 더티 플래그로 변경된 셀만 다시 그리기|
|스프라이트|스프라이트시트 + 텍스처 아틀라스 (단일 drawImage 호출)           |
|터치   |`passive: false` 최소화, 디바운스 적용                  |
|메모리  |오브젝트 풀링 (파티클, 이펙트)                             |
|번들   |Vite 트리쉐이킹 + 코드 스플리팅 (동적 import)               |

-----

## 📌 12. 참고 자료

- **영상 레퍼런스:** `IMG_7199.mov` — 음식 테마 머지 게임 실제 플레이 영상 (9초, 1920×1080)
- **Gemini 분석 원문:** 본 문서의 초안 (에너지 없는 무한 머지 게임 제작 가이드)
- **기술 트렌드:** Vite 8 (Rolldown 통합, 2026), TypeScript + Canvas 2D 머지 게임 아키텍처
- **머지 게임 시장:** 메타레이어 하이브리드화, 장르 믹싱이 2026년 주요 트렌드

-----

*이 문서를 Claude Code에서 열고, Phase 1부터 `/feature-dev`로 시작하세요.*
*보안은 `security-guidance`가 자동으로 지켜봅니다. 걱정 마세요.*
