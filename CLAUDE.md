# Merge Infinity — CLAUDE.md

> 전체 기획은 `../BLUEPRINT.md` (상위 폴더) 참조. 이 파일은 현재 구현 상태와 작업 가이드에 집중합니다.

## 프로젝트 개요

음식 테마 캐주얼 머지 퍼즐 게임. 에너지 시스템 없는 무한 플레이.

- **배포 URL**: https://yesthank.github.io/sui_game/
- **저장소**: https://github.com/Yesthank/sui_game
- **기술 스택**: Vite 8 + TypeScript 6 + Tailwind CSS v4 + Zustand (vanilla) + Howler.js + GSAP

---

## 개발 커맨드

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 (localhost:5173)
pnpm build          # 프로덕션 빌드 → dist/
pnpm preview        # 빌드 결과 로컬 미리보기
```

`main` 브랜치에 push하면 GitHub Actions가 자동 배포. `vite.config.ts`의 `base: '/sui_game/'` 유지 필수.

---

## 디렉토리 구조

```
src/
├── main.ts              # 진입점: DOM, 캔버스 크기 조정, 게임 루프
├── style.css            # Tailwind v4 + 다크 테마 CSS 변수
├── types/index.ts       # 공통 타입 (Board, Item, Cell, Position, Quest 등)
├── data/
│   ├── balance.ts       # 게임 밸런스 상수 (모든 수치 여기서 조정)
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

## 구현 현황 (Phase별)

### ✅ Phase 1 — 코어 프로토타입 (완료)
- 9×7 그리드 보드 + Canvas 렌더링
- 이모지 기반 아이템 렌더링 (스프라이트 없이)
- 드래그 앤 드롭 (마우스 + 터치)
- MergeEngine: move / merge / swap / maxLevel 판정
- 초기 아이템 6종 (tomato, bread, meat, egg, fruit, drink)

### ✅ Phase 2 — 게임플레이 루프 (완료)
- Producer: 탭으로 아이템 스폰, 쿨다운 30초/10회
- Trash(방해물): 8% 확률 스폰, 스톰 클리어로 제거
- ComboSystem: 3초 윈도우, 5콤보 → 피버 8초
- Zustand 상태 관리 통합

### ⬜ Phase 3 — 비주얼 폴리시 (미완)
- 스프라이트 에셋 교체 (현재: emoji → 목표: 실제 이미지)
- GSAP 머지 애니메이션 (스케일 바운스, 파티클) — `gsap` 설치됨, 미사용
- DOM UI: 좌측 주문 패널(`OrderPanel`), 우측 퀘스트 바(`QuestBar`)
- 피버 타임 오버레이 이펙트
- BGM + 상황별 사운드 전환 — `howler` 설치됨, 미사용

### ⬜ Phase 4 — 테마 + 배포 (부분 완료)
- ✅ GitHub Pages 배포
- ⬜ B급 감성 테마 레이어 (야근 서바이벌, 밈 대전쟁 등)
- ⬜ NPC 커스터마이징
- ⬜ 가로 모드 강제
- ⬜ PWA 설정

### ⬜ Phase 5 — 확장 (미착수)
- localStorage 세이브/로드
- 보드 확장 잠금 해제 시스템
- 일일 미션 / 도전 모드

---

## 게임 시스템

### 보드
| 항목 | 값 |
|------|----|
| 크기 | 9 × 7 |
| 초기 아이템 수 | 12 |

### 아이템 체인 6종 (`src/data/items.ts`)
| chainId | 레벨 1→최고 | 최대 레벨 |
|---------|------------|---------|
| tomato  | 🌱→🟢→🍅→🍅→✨🍅 | 5 |
| bread   | 🫓→🧆→🍞→🥐→✨🥖 | 5 |
| meat    | 🥩→🍖→🥩→🥩→✨🥩 | 5 |
| egg     | 🥚→🍳→🍳→✨🍳 | 4 |
| fruit   | 🫘→🌿→🍓→✨🍓 | 4 |
| drink   | 🥤→💧→☕→✨☕ | 4 |

### 머지 규칙
- 빈 칸 → **move**
- 같은 id + 같은 level → **merge** (level +1)
- 최대 레벨 → **maxLevel** (no-op)
- 그 외 → **swap**

### 콤보 & 피버
| 항목 | 값 |
|------|----|
| 콤보 윈도우 | 3000ms |
| 피버 발동 임계값 | 5콤보 |
| 피버 지속 | 8000ms |
| 피버 중 스폰 간격 | 500ms |

### 생산기
| 항목 | 값 |
|------|----|
| 쿨다운 전 최대 탭 | 10회 |
| 쿨다운 | 30초 |
| 쓰레기 확률 | 8% |

### 스톰 클리어
레벨 3+ 머지 시 인접 8칸의 `isTrash: true` 아이템 자동 제거.

---

## 밸런스 수정 (`src/data/balance.ts`)

모든 수치가 이 파일 하나에 모여 있음:

```ts
board:    { width: 9, height: 7, initialItems: 12 }
producer: { maxSpawns: 10, cooldownSec: 30, trashChance: 0.08 }
combo:    { windowMs: 3000, feverThreshold: 5, feverDurationMs: 8000 }
storm:    { minLevelToTrigger: 3, radius: 1 }
```

## 아이템 추가 (`src/data/items.ts`)

`ITEM_CHAINS` 배열에 항목 추가:

```ts
{
  chainId: 'fish',
  category: 'seafood',
  levels: [
    { level: 1, name: '작은 물고기', emoji: '🐟' },
    { level: 2, name: '참치',       emoji: '🐡' },
    { level: 3, name: '전설의 물고기', emoji: '✨🐠' },
  ],
}
```

---

## 목표 UI 레이아웃 (BLUEPRINT 기준, 미구현)

```
┌──────────┬────────────────────────┬──────────────────┐
│ 주문 패널  │                        │                  │
│ NPC × 아이템│    9 × 7 머지 보드     │  퀘스트 바        │
│ 타이머    │    (Canvas)            │  힌트 / 설명      │
│ 생산기    │                        │                  │
└──────────┴────────────────────────┴──────────────────┘
  ~18%            ~60%                    ~22%
```

---

## 이펙트 사운드 계획 (BLUEPRINT 기준, 미구현)

| 이벤트 | 이펙트 | 사운드 |
|--------|--------|--------|
| 머지 성공 | 파티클 스파클 + 스케일 바운스 | `merge_pop.mp3` |
| 레벨 3+ 스톰 | 방사형 물결 + 쓰레기 소멸 | `storm_whoosh.mp3` |
| 피버 진입 | 골든 글로우 + 아이템 비 | `fever_fanfare.mp3` |
| 퀘스트 완료 | NPC 리액션 + 코인 분수 | `quest_complete.mp3` |
