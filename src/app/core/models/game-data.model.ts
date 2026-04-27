// ============================================================
// DETECTIVE FIREFLY — Data Models
// ============================================================

export interface Player {
  id: string;
  name: string;
  totalPlaytimeSeconds: number;
  totalCasesCompleted: number;
  rank: string;
  rankLevel: number;
  rankHistory: RankHistoryEntry[];
}

export interface RankHistoryEntry {
  rank: string;
  achievedAtCase: string | null;
}

export interface Reputation {
  general: number;
  accuracy: number;
  discretion: number;
  relationships: number;
  history: ReputationSnapshot[];
}

export interface ReputationSnapshot {
  afterCase: string;
  general: number;
  accuracy: number;
  discretion: number;
  relationships: number;
}

export interface Decision {
  id: string;
  character: string;
  info: string;
  choice: 'hidden' | 'revealed';
  futureEffect: string;
  effectDescription: string;
  effectValence: 'positive' | 'negative' | 'ambiguous';
}

export interface CarryoverEffect {
  sourceCase: string;
  decisionId: string;
  effect: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface TimelineEvent {
  timeSeconds: number;
  type: 'exploration' | 'clue' | 'interview' | 'lie' | 'decision' | 'report';
  action: string;
  detail?: string;
}

export interface NotebookCharacters {
  listPageUnlocked: boolean;
  pages: number;
  pagesUnlocked: number;
  totalUnlockEvents: number;
  unlockedBy: {
    talking: number;
    showingClue: number;
    discoveringLie: number;
  };
}

export interface NotebookClues {
  pages: number;
  pagesUnlocked: number;
}

export interface NotebookCaseFile {
  pages: number;
  pagesUnlocked: number;
  sectionsComplete: number;
  sectionsTotal: number;
}

export interface Notebook {
  completionPercent: number;
  sections: {
    characters: NotebookCharacters;
    clues: NotebookClues;
    caseFile: NotebookCaseFile;
  };
}

export interface Case {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'active' | 'locked';
  finalId: 'A' | 'B' | 'C' | 'D';
  finalLabel: string;
  finalDescription: string;
  sessionDurationSeconds: number;
  report: {
    murdererCorrect: boolean;
    accompliceCorrect: boolean;
    hiddenInfoCount: number;
    revealedInfoCount: number;
  };
  suspects: {
    total: number;
    interviewed: number;
    liesDiscovered: number;
    liesTotal: number;
  };
  clues: {
    collectible: { found: number; total: number };
    interactable: { found: number; total: number };
    shownToSuspects: number;
  };
  roomActions: {
    discovered: number;
    total: number;
  };
  notebook: Notebook;
  decisions: Decision[];
  timeline: TimelineEvent[];
  carryoverEffects?: CarryoverEffect[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  secret: boolean;
  unlocked: boolean;
  unlockedAtCase: string | null;
  condition: string;
}

export interface GlobalStats {
  totalLiesDiscovered: number;
  totalLiesTotal: number;
  totalCluesFound: number;
  totalCluesAvailable: number;
  totalSuspectsInterviewed: number;
  totalDecisionsMade: number;
  totalHidden: number;
  totalRevealed: number;
  positiveCarryoverEffects: number;
  negativeCarryoverEffects: number;
  notebookAverage: number;
}

export interface GameData {
  meta: { version: string; generatedAt: string; note: string };
  player: Player;
  reputation: Reputation;
  cases: Case[];
  achievements: Achievement[];
  globalStats: GlobalStats;
}