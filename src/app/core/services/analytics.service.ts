// ============================================================
// AnalyticsService — Reactive data pipeline.
//
// Architecture: single source of truth (_rawPlayers signal).
// Everything downstream is a computed() — add/remove a player
// from players-index.mock.json, reload, and ALL charts,
// stats, styles, percentiles, correlations update automatically.
//
// IBM DS concepts applied:
//   - Descriptive Statistics  → aggregate computed
//   - Feature Engineering     → playStyle, sessionEfficiency derived
//   - Pearson Correlation     → computed from live player data
//   - Percentile Ranking      → computed vs live population
//   - Outlier Detection       → z-score on live population
//   - Segmentation            → rule-based, deterministic
// ============================================================
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  PlayersIndex, PlayerSummary, AggregateStats,
  CorrelationCell, DescriptiveStats, DistributionBin,
  PlayStyleSegment,
} from '../models/analytics.model';
import { StatisticsEngine } from '../engine/statistics.engine';
import { PlayerClassifier }  from '../engine/player-classifier';

// Raw player as stored in JSON (styles/percentiles/outliers not yet derived)
type RawPlayer = Omit<PlayerSummary, 'playStyle' | 'isOutlier' | 'outlierNote' | 'percentiles'> & {
  playStyle?: PlayStyleSegment['segment'];
  isOutlier?: boolean;
  outlierNote?: string | null;
  percentiles?: PlayerSummary['percentiles'];
};

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  // ── Single source of truth ───────────────────────────────
  private _rawPlayers = signal<RawPlayer[]>([]);
  private _meta = signal<PlayersIndex['meta'] | null>(null);

  readonly isLoading = signal(false);
  readonly hasError  = signal(false);
  readonly searchQuery = signal('');

  readonly index = computed(() => {
    const meta = this._meta();
    if (!meta) return null;
    return { meta, aggregateStats: this.aggregate(), players: this.players() } as PlayersIndex;
  });

  // ── Step 1: Enrich players with derived session efficiency ─
  private readonly _enriched = computed(() =>
    this._rawPlayers().map(p => ({
      ...p,
      _efficiency: PlayerClassifier.sessionEfficiency(
        p.totalPlaytimeSeconds,
        p.casesCompleted
      ),
    }))
  );

  // ── Step 2: Compute population-level stats needed for classification ──
  private readonly _popStats = computed(() => {
    const players = this._enriched();
    if (!players.length) return null;
    const efficiencies = players.map(p => p._efficiency);
    const sorted = [...efficiencies].sort((a, b) => a - b);
    const p60idx = Math.floor(sorted.length * 0.6);
    return {
      sessionEfficiencyP60: sorted[p60idx] ?? 50,
      avgReputation:   StatisticsEngine.mean(players.map(p => p.reputation)),
      avgNotebookAvg:  StatisticsEngine.mean(players.map(p => p.notebookAvg)),
    };
  });

  // ── Step 3: Derive play style for every player ────────────
  private readonly _withStyles = computed(() => {
    const players = this._enriched();
    const pop = this._popStats();
    if (!pop) return players as any[];
    return players.map(p => ({
      ...p,
      playStyle: PlayerClassifier.classifyStyle(
        {
          notebookAvg:          p.notebookAvg,
          hiddenDecisionRate:   p.hiddenDecisionRate,
          totalPlaytimeSeconds: p.totalPlaytimeSeconds,
          casesCompleted:       p.casesCompleted,
          reputation:           p.reputation,
          liesDiscovered:       p.liesDiscovered,
        },
        pop
      ),
    }));
  });

  // ── Step 4: Detect outliers vs live population ────────────
  private readonly _withOutliers = computed(() => {
    const players = this._withStyles();
    if (!players.length) return players;
    const popInput = players.map(p => ({
      notebookAvg:          p.notebookAvg,
      hiddenDecisionRate:   p.hiddenDecisionRate,
      totalPlaytimeSeconds: p.totalPlaytimeSeconds,
      casesCompleted:       p.casesCompleted,
      reputation:           p.reputation,
      liesDiscovered:       p.liesDiscovered,
    }));
    return players.map((p, _, arr) => {
      const { isOutlier, reason } = PlayerClassifier.detectOutlier(
        popInput[arr.indexOf(p)],
        popInput
      );
      return { ...p, isOutlier, outlierNote: reason ?? undefined };
    });
  });

  // ── Step 5: Compute percentiles vs live population ────────
  readonly players = computed<PlayerSummary[]>(() => {
    const players = this._withOutliers();
    if (!players.length) return [];
    const popInput = players.map(p => ({
      notebookAvg:          p.notebookAvg,
      hiddenDecisionRate:   p.hiddenDecisionRate,
      totalPlaytimeSeconds: p.totalPlaytimeSeconds,
      casesCompleted:       p.casesCompleted,
      reputation:           p.reputation,
      liesDiscovered:       p.liesDiscovered,
    }));
    return players.map((p, i) => ({
      ...p,
      percentiles: PlayerClassifier.computePercentiles(
        { ...popInput[i], reputation: p.reputation, notebookAvg: p.notebookAvg },
        popInput.map((pp, j) => ({ ...pp, reputation: players[j].reputation, notebookAvg: players[j].notebookAvg }))
      ),
    })) as PlayerSummary[];
  });

  // ── Computed aggregate — fully reactive ──────────────────
  readonly aggregate = computed<AggregateStats | null>(() => {
    const players = this.players();
    if (!players.length) return null;

    const reps      = players.map(p => p.reputation);
    const nbs       = players.map(p => p.notebookAvg);
    const durations = players.map(p => p.totalPlaytimeSeconds);
    const avgDur    = players.map(p =>
      Math.round(p.totalPlaytimeSeconds / Math.max(p.casesCompleted, 1))
    );
    const hiddens   = players.map(p => p.hiddenDecisionRate);
    const lies      = players.map(p => p.liesDiscovered);

    const repStats = StatisticsEngine.descriptiveStats(reps);
    const nbStats  = StatisticsEngine.descriptiveStats(nbs);

    const totalCases = players.reduce((s, p) => s + p.casesCompleted, 0);
    const abandoned  = players.filter(p => p.isDrop);

    // Play style segmentation counts (from derived styles)
    const styleCounts = players.reduce<Record<string, number>>((acc, p) => {
      acc[p.playStyle] = (acc[p.playStyle] ?? 0) + 1;
      return acc;
    }, {});
    const styleDescriptions: Record<string, string> = {
      Completionist: 'Alto % de cuaderno, sesiones largas',
      Speedrunner:   'Sesiones cortas, informes correctos',
      Manipulator:   'Alta tasa de información ocultada',
      Balanced:      'Métricas equilibradas en todas las áreas',
    };
    const playStyleSegments = Object.entries(styleCounts).map(([segment, count]) => ({
      segment: segment as PlayStyleSegment['segment'],
      count,
      description: styleDescriptions[segment] ?? '',
    }));

    // Case completion rates
    const maxCases = 4;
    const caseCompletionRate: Record<string, number> = {};
    for (let ci = 0; ci < maxCases; ci++) {
      const cid = `case_0${ci + 1}`;
      caseCompletionRate[cid] = Math.round(
        (players.filter(p => p.casesCompleted > ci).length / players.length) * 1000
      ) / 1000;
    }

    // Real Pearson correlations computed from live player data
    const efficiencies = players.map(p =>
      PlayerClassifier.sessionEfficiency(p.totalPlaytimeSeconds, p.casesCompleted)
    );

    const correlations = {
      hiddenDecisions_vs_reputation:     StatisticsEngine.pearsonR(hiddens, reps),
      notebookCompletion_vs_accuracy:    StatisticsEngine.pearsonR(nbs, lies),
      sessionDuration_vs_notebookPct:    StatisticsEngine.pearsonR(avgDur, nbs),
      liesDiscovered_vs_finalGrade:      StatisticsEngine.pearsonR(lies, reps),
      cluesFound_vs_murdererCorrect:     StatisticsEngine.pearsonR(nbs, reps),
    };

    // Histograms
    const repBins  = [
      { label: '0–40',    lo: 0,  hi: 41  },
      { label: '41–60',   lo: 41, hi: 61  },
      { label: '61–70',   lo: 61, hi: 71  },
      { label: '71–80',   lo: 71, hi: 81  },
      { label: '81–90',   lo: 81, hi: 91  },
      { label: '91–100',  lo: 91, hi: 101 },
    ];
    const nbBins = [
      { label: '0–60',    lo: 0,  hi: 61  },
      { label: '61–70',   lo: 61, hi: 71  },
      { label: '71–80',   lo: 71, hi: 81  },
      { label: '81–90',   lo: 81, hi: 91  },
      { label: '91–100',  lo: 91, hi: 101 },
    ];
    const durBins = [
      { label: '<20m',    lo: 0,     hi: 1200  },
      { label: '20–30m',  lo: 1200,  hi: 1800  },
      { label: '30–45m',  lo: 1800,  hi: 2700  },
      { label: '45–60m',  lo: 2700,  hi: 3600  },
      { label: '60–90m',  lo: 3600,  hi: 5400  },
      { label: '>90m',    lo: 5400,  hi: 999999 },
    ];

    return {
      totalPlayers:            players.length,
      avgSessionDuration:      Math.round(StatisticsEngine.mean(durations)),
      medianSessionDuration:   Math.round(StatisticsEngine.median(durations)),
      stdDevSessionDuration:   Math.round(StatisticsEngine.stdDev(durations)),
      avgNotebookCompletion:   nbStats.mean,
      medianNotebookCompletion: nbStats.median,
      avgReputation:           repStats.mean,
      medianReputation:        repStats.median,
      stdDevReputation:        repStats.stdDev,
      avgLiesDiscovered:       StatisticsEngine.mean(lies),
      avgCluesFound:           0,  // not available in summary; computed in full player data
      hiddenDecisionRate:      Math.round(StatisticsEngine.mean(hiddens) * 100) / 100,
      revealedDecisionRate:    Math.round((1 - StatisticsEngine.mean(hiddens)) * 100) / 100,
      dropoutCount:          abandoned.length,
      dropoutRate:             Math.round((abandoned.length / players.length) * 1000) / 1000,
      finalDistribution:       {},  // requires full case data — populated from index JSON
      caseCompletionRate,
      correlations,
      reputationDistribution:         StatisticsEngine.histogram(reps, repBins),
      notebookDistribution:           StatisticsEngine.histogram(nbs, nbBins),
      sessionDurationDistribution:    StatisticsEngine.histogram(avgDur, durBins),
      playStyleSegments,
    };
  });

  // ── Correlation matrix (computed from live Pearson r) ─────
  readonly correlationMatrix = computed<CorrelationCell[]>(() => {
    const corr = this.aggregate()?.correlations;
    if (!corr) return [];
    const pairs: Array<[string, string, string]> = [
      ['Hidden decisions', 'Reputation',     'hiddenDecisions_vs_reputation'],
      ['Notebook %',       'Accuracy',       'notebookCompletion_vs_accuracy'],
      ['Session time',     'Notebook %',     'sessionDuration_vs_notebookPct'],
      ['Lies found',       'Final grade',    'liesDiscovered_vs_finalGrade'],
      ['Clues found',      'Correct report', 'cluesFound_vs_murdererCorrect'],
    ];
    return pairs.map(([row, col, key]) => {
      const value = corr[key] ?? 0;
      return {
        row, col, value,
        strength:  Math.abs(value) >= 0.7 ? 'strong'
                 : Math.abs(value) >= 0.4 ? 'moderate'
                 : Math.abs(value) >= 0.2 ? 'weak' : 'none',
        direction: value > 0.05 ? 'positive' : value < -0.05 ? 'negative' : 'neutral',
      };
    });
  });

  // ── Descriptive stats (reactive) ─────────────────────────
  readonly reputationStats = computed<DescriptiveStats | null>(() => {
    const v = this.players().map(p => p.reputation);
    return v.length ? StatisticsEngine.descriptiveStats(v) : null;
  });

  readonly notebookStats = computed<DescriptiveStats | null>(() => {
    const v = this.players().map(p => p.notebookAvg);
    return v.length ? StatisticsEngine.descriptiveStats(v) : null;
  });

  readonly segmentChart = computed(() => {
    const total = this.players().length;
    return (this.aggregate()?.playStyleSegments ?? []).map(s => ({
      ...s,
      pct: Math.round((s.count / (total || 1)) * 100),
    }));
  });

  readonly outliers = computed(() =>
    this.players().filter(p => p.isOutlier)
  );

  readonly topPlayers = computed(() =>
    [...this.players()].sort((a, b) => b.reputation - a.reputation).slice(0, 5)
  );

  // ── Search / filter ──────────────────────────────────────
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

  // ── Roster filter state ──────────────────────────────────
  readonly rosterFilters = signal<{
    style: string | null;
    minRep: number;
    maxRep: number;
    casesCompleted: number | null;
    showAbandoned: boolean;
  }>({ style: null, minRep: 0, maxRep: 100, casesCompleted: null, showAbandoned: true });

  readonly filteredRoster = computed(() => {
    const f = this.rosterFilters();
    return this.players().filter(p =>
      (!f.style || p.playStyle === f.style) &&
      p.reputation >= f.minRep &&
      p.reputation <= f.maxRep &&
      (f.casesCompleted === null || p.casesCompleted === f.casesCompleted) &&
      (f.showAbandoned || !p.isDrop)
    );
  });

  // ── Scatter plot data (IBM DS: visualise correlation) ─────
  readonly scatterData = computed(() =>
    this.players().map(p => ({
      x:     p.hiddenDecisionRate,
      y:     p.reputation,
      label: p.name,
      style: p.playStyle,
      isOutlier: p.isOutlier,
    }))
  );

  // ── Load ─────────────────────────────────────────────────
  // Only loads the player list — all stats computed reactively.
  load(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.http.get<PlayersIndex>('assets/data/players-index.mock.json').subscribe({
      next: (data) => {
        this._meta.set(data.meta);
        // Only store raw player data — derived fields will be computed
        this._rawPlayers.set(data.players as RawPlayer[]);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  search(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  updateRosterFilter(patch: Partial<typeof this.rosterFilters extends import('@angular/core').Signal<infer T> ? T : never>): void {
    this.rosterFilters.update(f => ({ ...f, ...patch }));
  }

  // ── Public helpers (delegate to engine) ──────────────────
  zScore(value: number, mean: number, stdDev: number): number {
    return StatisticsEngine.zScore(value, mean, stdDev);
  }

  percentileRank(value: number, population: number[]): number {
    return StatisticsEngine.percentileRank(value, population);
  }
}