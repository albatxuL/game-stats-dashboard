import { StatisticsEngine } from './statistics.engine';

describe('StatisticsEngine', () => {

  // ── descriptiveStats ──
  describe('descriptiveStats', () => {
    const values = [55, 61, 69, 74, 78, 82, 82, 88, 88, 95];

    it('should compute mean', () => {
      expect(StatisticsEngine.descriptiveStats(values).mean).toBe(77.2);
    });

    it('should compute median for even count', () => {
      // sorted: 55,61,69,74,78,82,82,88,88,95 → median = (78+82)/2 = 80
      expect(StatisticsEngine.descriptiveStats(values).median).toBe(80);
    });

    it('should compute median for odd count', () => {
      expect(StatisticsEngine.descriptiveStats([1, 2, 3]).median).toBe(2);
    });

    it('should compute stdDev', () => {
      const stats = StatisticsEngine.descriptiveStats(values);
      expect(stats.stdDev).toBeGreaterThan(0);
      expect(stats.stdDev).toBeLessThan(20);
    });

    it('should compute min and max', () => {
      const stats = StatisticsEngine.descriptiveStats(values);
      expect(stats.min).toBe(55);
      expect(stats.max).toBe(95);
    });

    it('should compute Q1 and Q3', () => {
      const stats = StatisticsEngine.descriptiveStats(values);
      expect(stats.q1).toBeLessThan(stats.median);
      expect(stats.q3).toBeGreaterThan(stats.median);
    });

    it('should throw on empty array', () => {
      expect(() => StatisticsEngine.descriptiveStats([])).toThrow();
    });

    it('should handle single value', () => {
      const stats = StatisticsEngine.descriptiveStats([42]);
      expect(stats.mean).toBe(42);
      expect(stats.stdDev).toBe(0);
    });
  });

  // ── pearsonR ──
  describe('pearsonR', () => {
    it('should return 1.0 for perfectly positive correlation', () => {
      expect(StatisticsEngine.pearsonR([1,2,3,4,5], [2,4,6,8,10])).toBe(1);
    });

    it('should return -1.0 for perfectly negative correlation', () => {
      expect(StatisticsEngine.pearsonR([1,2,3,4,5], [10,8,6,4,2])).toBe(-1);
    });

    it('should return 0 for zero correlation', () => {
      expect(StatisticsEngine.pearsonR([1,2,3,4,5], [3,3,3,3,3])).toBe(0);
    });

    it('should return value between -1 and 1', () => {
      const r = StatisticsEngine.pearsonR([1,3,2,5,4], [2,5,3,4,1]);
      expect(r).toBeGreaterThanOrEqual(-1);
      expect(r).toBeLessThanOrEqual(1);
    });

    it('should return 0 for mismatched array lengths', () => {
      expect(StatisticsEngine.pearsonR([1,2,3], [1,2])).toBe(0);
    });

    it('should return 0 for single element arrays', () => {
      expect(StatisticsEngine.pearsonR([5], [10])).toBe(0);
    });

    it('should be symmetric: pearsonR(x,y) === pearsonR(y,x)', () => {
      const xs = [74, 61, 88, 55, 82];
      const ys = [0.4, 0.8, 0.1, 0.9, 0.4];
      expect(StatisticsEngine.pearsonR(xs, ys))
        .toBeCloseTo(StatisticsEngine.pearsonR(ys, xs), 2);
    });
  });

  // ── zScore ──
  describe('zScore', () => {
    it('should return 1 for one stdDev above mean', () => {
      expect(StatisticsEngine.zScore(80, 70, 10)).toBe(1);
    });

    it('should return -1 for one stdDev below mean', () => {
      expect(StatisticsEngine.zScore(60, 70, 10)).toBe(-1);
    });

    it('should return 0 when value equals mean', () => {
      expect(StatisticsEngine.zScore(70, 70, 10)).toBe(0);
    });

    it('should return 0 when stdDev is 0', () => {
      expect(StatisticsEngine.zScore(80, 70, 0)).toBe(0);
    });

    it('should detect extreme values |z| > 2', () => {
      expect(Math.abs(StatisticsEngine.zScore(95, 70, 10))).toBeGreaterThan(2);
    });
  });

  // ── percentileRank ──
  describe('percentileRank', () => {
    const pop = [50, 60, 70, 80, 90];

    it('should return 0 for minimum value', () => {
      expect(StatisticsEngine.percentileRank(50, pop)).toBe(0);
    });

    it('should return 80 when 4 of 5 values are below', () => {
      expect(StatisticsEngine.percentileRank(90, pop)).toBe(80);
    });

    it('should return 60 for value 80 (3 of 5 below)', () => {
      expect(StatisticsEngine.percentileRank(80, pop)).toBe(60);
    });

    it('should return 0 for empty population', () => {
      expect(StatisticsEngine.percentileRank(80, [])).toBe(0);
    });

    it('should return 100 for value above all population members', () => {
      expect(StatisticsEngine.percentileRank(100, pop)).toBe(100);
    });
  });

  // ── histogram ──
  describe('histogram', () => {
    const bins = [
      { label: '0–50',  lo: 0,  hi: 51 },
      { label: '51–75', lo: 51, hi: 76 },
      { label: '76–100',lo: 76, hi: 101 },
    ];

    it('should count values in correct bins', () => {
      const result = StatisticsEngine.histogram([30, 60, 70, 80, 95], bins);
      expect(result[0].count).toBe(1); // 30
      expect(result[1].count).toBe(2); // 60, 70
      expect(result[2].count).toBe(2); // 80, 95
    });

    it('should return 0 for empty bins', () => {
      const result = StatisticsEngine.histogram([], bins);
      result.forEach(b => expect(b.count).toBe(0));
    });

    it('should preserve bin labels', () => {
      const result = StatisticsEngine.histogram([50], bins);
      expect(result[0].bin).toBe('0–50');
    });
  });

  // ── isOutlier ──
  describe('isOutlier', () => {
    const pop = [70, 72, 74, 76, 78, 80, 82];

    it('should not flag normal values as outliers', () => {
      expect(StatisticsEngine.isOutlier(75, pop)).toBeFalse();
    });

    it('should flag extreme values as outliers with default threshold 2.0', () => {
      expect(StatisticsEngine.isOutlier(10, pop)).toBeTrue();
    });

    it('should respect custom threshold', () => {
      // With threshold 1.0 even slight deviations flag
      expect(StatisticsEngine.isOutlier(83, pop, 1.0)).toBeTrue();
    });
  });

  // ── mean / median / stdDev shortcuts ──
  describe('static helpers', () => {
    it('mean should match descriptiveStats mean', () => {
      const values = [10, 20, 30, 40, 50];
      expect(StatisticsEngine.mean(values))
        .toBe(StatisticsEngine.descriptiveStats(values).mean);
    });

    it('median should match descriptiveStats median', () => {
      const values = [10, 20, 30, 40, 50];
      expect(StatisticsEngine.median(values))
        .toBe(StatisticsEngine.descriptiveStats(values).median);
    });

    it('stdDev should match descriptiveStats stdDev', () => {
      const values = [10, 20, 30, 40, 50];
      expect(StatisticsEngine.stdDev(values))
        .toBe(StatisticsEngine.descriptiveStats(values).stdDev);
    });

    it('mean of empty array should be 0', () => {
      expect(StatisticsEngine.mean([])).toBe(0);
    });
  });
});