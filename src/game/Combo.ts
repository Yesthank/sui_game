import type { ComboEvent } from '../types';
import { BALANCE } from '../data/balance';

const { windowMs, feverThreshold, feverDurationMs } = BALANCE.combo;

export class ComboSystem {
  private lastMergeTime = 0;
  private comboCount = 0;

  onMerge(now: number): ComboEvent {
    if (now - this.lastMergeTime <= windowMs) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastMergeTime = now;

    if (this.comboCount >= feverThreshold) {
      this.comboCount = 0;
      return { type: 'fever', duration: feverDurationMs };
    }

    return { type: 'combo', count: this.comboCount };
  }

  getComboCount(): number {
    return this.comboCount;
  }

  reset(): void {
    this.comboCount = 0;
    this.lastMergeTime = 0;
  }
}
