// ============================================================
// Analytics models — IBM Data Science concepts applied
// ============================================================

// --- Descriptive Statistics ---
export interface DescriptiveStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
}

// --- Distribution bin (for histograms) ---
export interface DistributionBin {
  bin: string;
  count: number;
}

// --- Correlation (EDA) ---
export interface CorrelationEntry {
  labelX: string;
  labelY: string;
  value: number;   // -1 to 1
}

// --- Play style segment (clustering) ---
export interface PlayStyleSegment {
  segment: 'Completionist' | 'Speedrunner' | 'Manipulator' | 'Balanced';
  count: number;
  description: string;
}

// --- Player summary (index entry) ---
export interface PlayerSummary {
  id: string;
  name: string;
  rank: string;
  rankLevel: number;
  casesCompleted: number;
  totalPlaytimeSeconds: number;
  reputation: number;
  notebookAvg: number;
  hiddenDecisionRate: number;
  liesDiscovered: number;
  playStyle: PlayStyleSegment['segment'];
  isOutlier: boolean;
  isDrop: boolean;
  outlierNote?: string;
  percentiles: PlayerPercentiles;
  dataFile: string;
}

// --- Percentile rankings (vs all players) ---
export interface PlayerPercentiles {
  reputation: number;
  accuracy: number;
  notebookCompletion: number;
  sessionEfficiency: number;
}

// --- Aggregate stats for global view ---
export interface AggregateStats {
  totalPlayers: number;
  dropoutCount: number;
  dropoutRate: number;
  avgSessionDuration: number;
  medianSessionDuration: number;
  stdDevSessionDuration: number;
  avgNotebookCompletion: number;
  medianNotebookCompletion: number;
  avgReputation: number;
  medianReputation: number;
  avgLiesDiscovered: number;
  avgCluesFound: number;
  hiddenDecisionRate: number;
  revealedDecisionRate: number;
  finalDistribution: Record<string, number>;
  caseCompletionRate: Record<string, number>;
  correlations: Record<string, number>;
  reputationDistribution: DistributionBin[];
  notebookDistribution: DistributionBin[];
  sessionDurationDistribution: DistributionBin[];
  playStyleSegments: PlayStyleSegment[];
}

// --- Full players index ---
export interface PlayersIndex {
  meta: { version: string; totalPlayers: number; note: string };
  aggregateStats: AggregateStats;
  players: PlayerSummary[];
}

// --- Computed correlation matrix entry ---
export interface CorrelationCell {
  row: string;
  col: string;
  value: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative' | 'neutral';
}