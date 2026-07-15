import { Injectable } from '@nestjs/common';

export interface Sm2Input {
  correct: boolean;
  durationMs: number;
  previousInterval?: number;
  previousEFactor?: number;
  previousRepetitions?: number;
}

export interface Sm2Output {
  sm2Interval: number;
  sm2EFactor: number;
  sm2Repetitions: number;
}

@Injectable()
export class Sm2Service {
  /**
   * Calculates new SM-2 spaced repetition parameters.
   * Grade q is determined from correctness and speed:
   * - If incorrect: q = 1 (or 0 if very slow)
   * - If correct and fast (< 30 seconds): q = 5
   * - If correct and moderate (30 - 120 seconds): q = 4
   * - If correct and slow (> 120 seconds): q = 3
   */
  calculate(input: Sm2Input): Sm2Output {
    let q = 1;
    if (!input.correct) {
      q = input.durationMs > 180000 ? 0 : 1;
    } else {
      if (input.durationMs < 30000) {
        q = 5;
      } else if (input.durationMs <= 120000) {
        q = 4;
      } else {
        q = 3;
      }
    }

    let repetitions = input.previousRepetitions ?? 0;
    let interval = input.previousInterval ?? 1;
    let eFactor = input.previousEFactor ?? 2.5;

    if (q >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * eFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    eFactor = eFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (eFactor < 1.3) {
      eFactor = 1.3;
    }

    return {
      sm2Interval: interval,
      sm2EFactor: Number(eFactor.toFixed(2)),
      sm2Repetitions: repetitions,
    };
  }
}
