// ============================================================
// PlayerClassifier — Rule-based play style segmentation.
// IBM DS: Feature-based classification with explicit thresholds.
// All methods are static — deterministic, testable, no state.
// ============================================================
import { PlayerSummary, PlayStyleSegment } from '../models/analytics.model';
import { StatisticsEngine } from './statistics.engine';

export interface ClassificationInput {
  notebookAvg: number;
  hiddenDecisionRate: number;
  totalPlaytimeSeconds: number;
  casesCompleted: number;
  reputation: number;
  liesDiscovered: number;
}

export interface PopulationStats {
  sessionEfficiencyP60: number;  // 60th percentile of session efficiency
  avgReputation: number;
  avgNotebookAvg: number;
}

export class PlayerClassifier {

  // ── Play style classification (IBM DS: rule-based segmentation) ──
  //
  // Hierarchical decision tree — first match wins:
  //   1. Completionist  → notebookAvg ≥ 87% AND sessionEfficiency ≤ P60
  //   2. Speedrunner    → sessionEfficiency ≥ 85 (fast completion)
  //   3. Manipulator    → hiddenDecisionRate ≥ 0.65
  //   4. Balanced       → catch-all

  static classifyStyle(
    player: ClassificationInput,
    popStats: PopulationStats
  ): PlayStyleSegment['segment'] {
    const efficiency = PlayerClassifier.sessionEfficiency(
      player.totalPlaytimeSeconds,
      player.casesCompleted
    );

    if (player.notebookAvg >= 87 && efficiency <= popStats.sessionEfficiencyP60) {
      return 'Completionist';
    }
    if (efficiency >= 85) {
      return 'Speedrunner';
    }
    if (player.hiddenDecisionRate >= 0.65) {
      return 'Manipulator';
    }
    return 'Balanced';
  }

  // ── Session efficiency (0–100, higher = faster) ──────────
  // Normalized inverse of avg session duration per case

  static sessionEfficiency(totalSeconds: number, cases: number): number {
    if (cases === 0) return 0;
    const avgPerCase = totalSeconds / cases;
    // Anchor: 3600s (60min) = efficiency 50. Scale: each 600s = ±10 pts
    const raw = Math.round(50 + (3600 - avgPerCase) / 60);
    return Math.max(5, Math.min(99, raw));
  }

  // ── Outlier detection (IBM DS: z-score based) ────────────
  // A player is an outlier if ANY key metric has |z| > 2.0

  static detectOutlier(
    player: ClassificationInput,
    population: ClassificationInput[]
  ): { isOutlier: boolean; reason: string | null } {
    const hiddens  = population.map(p => p.hiddenDecisionRate);
    const reps     = population.map(p => p.reputation);

    const zHidden  = StatisticsEngine.zScore(
      player.hiddenDecisionRate,
      StatisticsEngine.mean(hiddens),
      StatisticsEngine.stdDev(hiddens)
    );
    const zRep     = StatisticsEngine.zScore(
      player.reputation,
      StatisticsEngine.mean(reps),
      StatisticsEngine.stdDev(reps)
    );

    if (Math.abs(zHidden) > 2.0) {
      return {
        isOutlier: true,
        reason: player.hiddenDecisionRate >= 0.85
          ? 'Extremadamente alta tasa de ocultación'
          : 'Tasa de ocultación inusualmente baja'
      };
    }
    if (zRep < -2.0) {
      return { isOutlier: true, reason: 'Reputación significativamente por debajo de la media' };
    }
    return { isOutlier: false, reason: null };
  }

  // ── Percentile profile for a single player ───────────────

  static computePercentiles(
    player: ClassificationInput & { reputation: number; notebookAvg: number },
    population: Array<ClassificationInput & { reputation: number; notebookAvg: number }>
  ) {
    const reps     = population.map(p => p.reputation);
    const nbs      = population.map(p => p.notebookAvg);
    const efficiencies = population.map(p =>
      PlayerClassifier.sessionEfficiency(p.totalPlaytimeSeconds, p.casesCompleted)
    );
    const lies     = population.map(p => p.liesDiscovered);

    const efficiency = PlayerClassifier.sessionEfficiency(
      player.totalPlaytimeSeconds,
      player.casesCompleted
    );

    return {
      reputation:          StatisticsEngine.percentileRank(player.reputation, reps),
      notebookCompletion:  StatisticsEngine.percentileRank(player.notebookAvg, nbs),
      sessionEfficiency:   StatisticsEngine.percentileRank(efficiency, efficiencies),
      accuracy:            StatisticsEngine.percentileRank(player.liesDiscovered, lies),
    };
  }
}