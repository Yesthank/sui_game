import type { Item, ProducerConfig } from '../types';
import { weightedRandom } from '../utils/random';

export class Producer {
  private spawnCount = 0;
  private cooldownEnd = 0;

  constructor(private config: ProducerConfig) {}

  tap(now: number): Item | null {
    if (now < this.cooldownEnd) return null;

    this.spawnCount++;

    if (this.spawnCount >= this.config.maxSpawns) {
      this.cooldownEnd = now + this.config.cooldownMs;
      this.spawnCount = 0;
    }

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

  resetCooldown(): void {
    this.cooldownEnd = 0;
    this.spawnCount = 0;
  }
}
