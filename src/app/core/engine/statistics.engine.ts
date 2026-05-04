// ============================================================
// StatisticsEngine — Pure computation, zero side effects.
// IBM DS: Descriptive statistics, correlation, distributions.
// All methods are static — no injection, no state.
// ============================================================
import { DescriptiveStats, DistributionBin } from '../models/analytics.model';

export class StatisticsEngine {

  // ── Descriptive statistics (IBM DS Module 2) ─────────────

  static descriptiveStats(values: number[]): DescriptiveStats {
    if (!values.length) throw new Error('Cannot compute stats on empty array');
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    return {
      mean:   Math.round(mean * 10) / 10,
      median: Math.round(median * 10) / 10,
      stdDev: Math.round(Math.sqrt(variance) * 10) / 10,
      min:    sorted[0],
      max:    sorted[n - 1],
      q1:     sorted[Math.floor(n * 0.25)],
      q3:     sorted[Math.floor(n * 0.75)],
    };
  }

  // ── Pearson correlation coefficient (IBM DS Module 4) ────
  // r = Σ((xi - x̄)(yi - ȳ)) / √(Σ(xi-x̄)² · Σ(yi-ȳ)²)

  static pearsonR(xs: number[], ys: number[]): number {
    const n = xs.length;
    if (n < 2 || n !== ys.length) return 0;
    const mx = xs.reduce((a, b) => a + b) / n;
    const my = ys.reduce((a, b) => a + b) / n;
    const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
    const den = Math.sqrt(
      xs.reduce((s, x) => s + (x - mx) ** 2, 0) *
      ys.reduce((s, y) => s + (y - my) ** 2, 0)
    );
    if (den === 0) return 0;
    return Math.round((num / den) * 100) / 100;
  }

  // ── Z-score (IBM DS: outlier detection) ─────────────────
  // z = (x - μ) / σ   |z| > 2 → likely outlier

  static zScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return Math.round(((value - mean) / stdDev) * 100) / 100;
  }

  // ── Percentile rank (IBM DS Module 3) ────────────────────
  // Proportion of population strictly below the value

  static percentileRank(value: number, population: number[]): number {
    if (!population.length) return 0;
    const below = population.filter(v => v < value).length;
    return Math.round((below / population.length) * 100);
  }

  // ── Histogram bins (IBM DS: distribution analysis) ───────

  static histogram(
    values: number[],
    bins: Array<{ label: string; lo: number; hi: number }>
  ): DistributionBin[] {
    return bins.map(({ label, lo, hi }) => ({
      bin:   label,
      count: values.filter(v => v >= lo && v < hi).length,
    }));
  }

  // ── Mean ─────────────────────────────────────────────────

  static mean(values: number[]): number {
    if (!values.length) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }

  // ── Median ───────────────────────────────────────────────

  static median(values: number[]): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const m = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    return Math.round(m * 10) / 10;
  }

  // ── Standard deviation ───────────────────────────────────

  static stdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const m = StatisticsEngine.mean(values);
    const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
    return Math.round(Math.sqrt(variance) * 10) / 10;
  }

  // ── Outlier detection via z-score threshold ──────────────
  // IBM DS: |z| > threshold (default 2.0) = outlier

  static isOutlier(
    value: number,
    population: number[],
    threshold = 2.0
  ): boolean {
    const m = StatisticsEngine.mean(population);
    const s = StatisticsEngine.stdDev(population);
    return Math.abs(StatisticsEngine.zScore(value, m, s)) > threshold;
  }
}