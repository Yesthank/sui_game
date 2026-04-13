export const BALANCE = {
  board: {
    width: 9,
    height: 7,
    initialItems: 12,
  },

  producer: {
    maxSpawns: 10,
    cooldownSec: 30,
    trashChance: 0.08,
  },

  combo: {
    windowMs: 3000,
    feverThreshold: 5,
    feverDurationMs: 8000,
    feverSpawnIntervalMs: 500,
  },

  quest: {
    maxActive: 3,
    refreshIntervalSec: 120,
  },

  storm: {
    minLevelToTrigger: 3,
    radius: 1,
  },
} as const;
