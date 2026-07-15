import { Sm2Service } from './sm2.service';

describe('Sm2Service', () => {
  let service: Sm2Service;

  beforeEach(() => {
    service = new Sm2Service();
  });

  it('should calculate correct interval and repetitions for fast correct answer (first attempt)', () => {
    const res = service.calculate({
      correct: true,
      durationMs: 15000, // fast (< 30s) -> q=5
    });

    expect(res.sm2Repetitions).toBe(1);
    expect(res.sm2Interval).toBe(1);
    expect(res.sm2EFactor).toBeGreaterThanOrEqual(2.5);
  });

  it('should calculate interval 6 for second correct answer', () => {
    const res = service.calculate({
      correct: true,
      durationMs: 45000, // moderate -> q=4
      previousRepetitions: 1,
      previousInterval: 1,
      previousEFactor: 2.5,
    });

    expect(res.sm2Repetitions).toBe(2);
    expect(res.sm2Interval).toBe(6);
  });

  it('should reset repetitions and interval to 1 when incorrect', () => {
    const res = service.calculate({
      correct: false,
      durationMs: 60000,
      previousRepetitions: 5,
      previousInterval: 30,
      previousEFactor: 2.3,
    });

    expect(res.sm2Repetitions).toBe(0);
    expect(res.sm2Interval).toBe(1);
  });

  it('should never drop eFactor below 1.3', () => {
    const res = service.calculate({
      correct: false,
      durationMs: 250000, // slow incorrect -> q=0
      previousRepetitions: 3,
      previousInterval: 15,
      previousEFactor: 1.35,
    });

    expect(res.sm2EFactor).toBe(1.3);
  });
});
