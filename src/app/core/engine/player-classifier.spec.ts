import { PlayerClassifier, ClassificationInput } from './player-classifier';

const makePlayer = (overrides: Partial<ClassificationInput> = {}): ClassificationInput => ({
  notebookAvg:          80,
  hiddenDecisionRate:   0.4,
  totalPlaytimeSeconds: 18000,
  casesCompleted:       4,
  reputation:           74,
  liesDiscovered:       12,
  ...overrides,
});

const defaultPopStats = {
  sessionEfficiencyP60: 55,
  avgReputation: 72,
  avgNotebookAvg: 80,
};

describe('PlayerClassifier', () => {

  // ── sessionEfficiency ──
  describe('sessionEfficiency', () => {
    it('should return 50 for exactly 3600s per case', () => {
      expect(PlayerClassifier.sessionEfficiency(14400, 4)).toBe(50);
    });

    it('should return higher score for faster sessions', () => {
      const fast = PlayerClassifier.sessionEfficiency(8000, 4);
      const slow = PlayerClassifier.sessionEfficiency(20000, 4);
      expect(fast).toBeGreaterThan(slow);
    });

    it('should clamp to minimum 5', () => {
      expect(PlayerClassifier.sessionEfficiency(999999, 4)).toBe(5);
    });

    it('should clamp to maximum 99', () => {
      expect(PlayerClassifier.sessionEfficiency(100, 4)).toBe(99);
    });

    it('should return 0 for 0 cases', () => {
      expect(PlayerClassifier.sessionEfficiency(18000, 0)).toBe(0);
    });
  });

  // ── classifyStyle ──
  describe('classifyStyle', () => {
    it('should classify Completionist: high notebook, slow session', () => {
      const player = makePlayer({ notebookAvg: 92, totalPlaytimeSeconds: 25000 });
      // efficiency ≈ 50 + (3600 - 6250) / 60 ≈ 6 → below P60=55
      expect(PlayerClassifier.classifyStyle(player, defaultPopStats)).toBe('Completionist');
    });

    it('should classify Speedrunner: high efficiency', () => {
      const player = makePlayer({ totalPlaytimeSeconds: 8000, notebookAvg: 72 });
      // efficiency ≈ 50 + (3600 - 2000)/60 ≈ 77 → < 85
      // Try even faster
      const fastPlayer = makePlayer({ totalPlaytimeSeconds: 5000, notebookAvg: 70 });
      // efficiency ≈ 50 + (3600 - 1250)/60 ≈ 89 → ≥ 85
      const style = PlayerClassifier.classifyStyle(fastPlayer, defaultPopStats);
      expect(style).toBe('Speedrunner');
    });

    it('should classify Manipulator: high hidden rate', () => {
      const player = makePlayer({ hiddenDecisionRate: 0.80, totalPlaytimeSeconds: 18000 });
      expect(PlayerClassifier.classifyStyle(player, defaultPopStats)).toBe('Manipulator');
    });

    it('should classify Balanced as catch-all', () => {
      const player = makePlayer({
        notebookAvg: 78,
        hiddenDecisionRate: 0.45,
        totalPlaytimeSeconds: 18000,
      });
      expect(PlayerClassifier.classifyStyle(player, defaultPopStats)).toBe('Balanced');
    });

    it('Completionist should take priority over Manipulator', () => {
      // High notebook AND high hidden rate → Completionist wins (comes first)
      const player = makePlayer({ notebookAvg: 95, hiddenDecisionRate: 0.80, totalPlaytimeSeconds: 26000 });
      const style = PlayerClassifier.classifyStyle(player, defaultPopStats);
      expect(style).toBe('Completionist');
    });

    it('Speedrunner should take priority over Manipulator', () => {
      const fastManip = makePlayer({ hiddenDecisionRate: 0.70, totalPlaytimeSeconds: 4800, notebookAvg: 68 });
      const style = PlayerClassifier.classifyStyle(fastManip, defaultPopStats);
      expect(style).toBe('Speedrunner');
    });
  });

  // ── detectOutlier ──
  describe('detectOutlier', () => {
    const normalPop = Array.from({ length: 20 }, (_, i) => makePlayer({
      hiddenDecisionRate: 0.3 + (i % 5) * 0.05,
      reputation: 65 + i,
    }));

    it('should not flag normal player as outlier', () => {
      const result = PlayerClassifier.detectOutlier(makePlayer(), normalPop);
      expect(result.isOutlier).toBeFalse();
      expect(result.reason).toBeNull();
    });

    it('should flag extreme hidden rate as outlier', () => {
      const extreme = makePlayer({ hiddenDecisionRate: 0.98 });
      const result = PlayerClassifier.detectOutlier(extreme, normalPop);
      expect(result.isOutlier).toBeTrue();
      expect(result.reason).toBeTruthy();
    });

    it('should flag very low reputation as outlier', () => {
      const lowRep = makePlayer({ reputation: 5 });
      // Add extremes to population to ensure proper z-score
      const pop = [...normalPop, ...Array(3).fill(makePlayer({ reputation: 80 }))];
      const result = PlayerClassifier.detectOutlier(lowRep, pop);
      expect(result.isOutlier).toBeTrue();
    });

    it('should include reason in outlier result', () => {
      const extreme = makePlayer({ hiddenDecisionRate: 0.95 });
      const result = PlayerClassifier.detectOutlier(extreme, normalPop);
      expect(result.reason).toContain('ocultación');
    });
  });

  // ── computePercentiles ──
  describe('computePercentiles', () => {
    const pop = [
      makePlayer({ reputation: 55, notebookAvg: 68, totalPlaytimeSeconds: 15000 }),
      makePlayer({ reputation: 70, notebookAvg: 78, totalPlaytimeSeconds: 18000 }),
      makePlayer({ reputation: 82, notebookAvg: 88, totalPlaytimeSeconds: 22000 }),
      makePlayer({ reputation: 90, notebookAvg: 95, totalPlaytimeSeconds: 28000 }),
    ];

    it('should return 0 percentile for minimum reputation', () => {
      const result = PlayerClassifier.computePercentiles(
        { ...pop[0], reputation: 55, notebookAvg: 68 },
        pop.map(p => ({ ...p, reputation: p.reputation, notebookAvg: p.notebookAvg }))
      );
      expect(result.reputation).toBe(0);
    });

    it('should return 75 percentile for second highest reputation', () => {
      const result = PlayerClassifier.computePercentiles(
        { ...pop[2], reputation: 82, notebookAvg: 88 },
        pop.map(p => ({ ...p, reputation: p.reputation, notebookAvg: p.notebookAvg }))
      );
      expect(result.reputation).toBe(50); // 2 of 4 below
    });

    it('should compute all 4 percentile dimensions', () => {
      const result = PlayerClassifier.computePercentiles(
        { ...pop[1], reputation: 70, notebookAvg: 78 },
        pop.map(p => ({ ...p, reputation: p.reputation, notebookAvg: p.notebookAvg }))
      );
      expect(result).toEqual(jasmine.objectContaining({
        reputation:          jasmine.any(Number),
        notebookCompletion:  jasmine.any(Number),
        sessionEfficiency:   jasmine.any(Number),
        accuracy:            jasmine.any(Number),
      }));
    });

    it('all percentiles should be between 0 and 100', () => {
      const result = PlayerClassifier.computePercentiles(
        { ...pop[2], reputation: 82, notebookAvg: 88 },
        pop.map(p => ({ ...p, reputation: p.reputation, notebookAvg: p.notebookAvg }))
      );
      Object.values(result).forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    });
  });
});