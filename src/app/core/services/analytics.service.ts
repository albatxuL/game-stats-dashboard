import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PlayersIndex, PlayerSummary, AggregateStats,
  CorrelationCell, DescriptiveStats
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  private _index = signal<PlayersIndex | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly searchQuery = signal('');

  // ── Selectors ──────────────────────────────────────────
  readonly index     = this._index.asReadonly();
  readonly players   = computed(() => this._index()?.players ?? []);
  readonly aggregate = computed(() => this._index()?.aggregateStats ?? null);

  readonly filteredPlayers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.players();
    return this.players().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q) ||
      p.playStyle.toLowerCase().includes(q)
    );
  });

  readonly searchResult = computed<PlayerSummary | null>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return null;
    return this.players().find(p => p.name.toLowerCase() === q) ?? null;
  });

  readonly outliers = computed(() =>
    this.players().filter(p => p.isOutlier)
  );

  readonly topPlayers = computed(() =>
    [...this.players()].sort((a, b) => b.reputation - a.reputation).slice(0, 5)
  );

  // ── IBM DS: Correlation matrix ──────────────────────────
  readonly correlationMatrix = computed<CorrelationCell[]>(() => {
    const corr = this.aggregate()?.correlations;
    if (!corr) return [];

    const raw: Array<[string, string, number]> = [
      ['Hidden decisions', 'Reputation',     corr['hiddenDecisions_vs_reputation']],
      ['Notebook %',       'Accuracy',       corr['notebookCompletion_vs_accuracy']],
      ['Session time',     'Notebook %',     corr['sessionDuration_vs_notebookPct']],
      ['Lies found',       'Final grade',    corr['liesDiscovered_vs_finalGrade']],
      ['Clues found',      'Correct report', corr['cluesFound_vs_murdererCorrect']],
    ];

    return raw.map(([row, col, value]) => ({
      row, col, value,
      strength: Math.abs(value) >= 0.7 ? 'strong'
              : Math.abs(value) >= 0.4 ? 'moderate'
              : Math.abs(value) >= 0.2 ? 'weak' : 'none',
      direction: value > 0.05 ? 'positive' : value < -0.05 ? 'negative' : 'neutral'
    }));
  });

  // ── IBM DS: Descriptive stats for reputation ────────────
  readonly reputationStats = computed<DescriptiveStats | null>(() => {
    const players = this.players();
    if (!players.length) return null;
    const values = players.map(p => p.reputation).sort((a, b) => a - b);
    return this.computeStats(values);
  });

  readonly notebookStats = computed<DescriptiveStats | null>(() => {
    const players = this.players();
    if (!players.length) return null;
    const values = players.map(p => p.notebookAvg).sort((a, b) => a - b);
    return this.computeStats(values);
  });

  // ── IBM DS: Play style segmentation ─────────────────────
  readonly segmentChart = computed(() => {
    return this.aggregate()?.playStyleSegments.map(s => ({
      ...s,
      pct: Math.round((s.count / (this.aggregate()?.totalPlayers ?? 1)) * 100)
    })) ?? [];
  });

  // ── Load ─────────────────────────────────────────────────
  load(): void {
    this.isLoading.set(true);
    this.http.get<PlayersIndex>('assets/data/players-index.mock.json').subscribe({
      next: data => { this._index.set(data); this.isLoading.set(false); },
      error: ()  => { this.hasError.set(true); this.isLoading.set(false); }
    });
  }

  search(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // ── IBM DS: Helper — compute descriptive statistics ─────
  private computeStats(sorted: number[]): DescriptiveStats {
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2
      : sorted[Math.floor(n/2)];
    const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    return {
      mean: Math.round(mean * 10) / 10,
      median,
      stdDev: Math.round(Math.sqrt(variance) * 10) / 10,
      min: sorted[0],
      max: sorted[n - 1],
      q1,
      q3
    };
  }

  // IBM DS: Z-score for outlier detection
  zScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return Math.round(((value - mean) / stdDev) * 100) / 100;
  }

  // IBM DS: Percentile rank of a value in an array
  percentileRank(value: number, population: number[]): number {
    const below = population.filter(v => v < value).length;
    return Math.round((below / population.length) * 100);
  }
}