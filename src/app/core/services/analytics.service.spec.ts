import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import { PlayersIndex } from '../models/analytics.model';

const makePlayers = () => [
  { id: 'p1', name: 'Alba',   rank: 'Senior Detective', rankLevel: 3, casesCompleted: 4, totalPlaytimeSeconds: 18000, reputation: 74, notebookAvg: 86, hiddenDecisionRate: 0.40, liesDiscovered: 14, abandoned: false, dataFile: 'game-data.mock.json' },
  { id: 'p2', name: 'Mikel',  rank: 'Detective',        rankLevel: 2, casesCompleted: 4, totalPlaytimeSeconds: 16000, reputation: 61, notebookAvg: 74, hiddenDecisionRate: 0.80, liesDiscovered: 9,  abandoned: false, dataFile: 'player_002.mock.json' },
  { id: 'p3', name: 'Leire',  rank: 'Detective',        rankLevel: 2, casesCompleted: 4, totalPlaytimeSeconds: 15300, reputation: 55, notebookAvg: 68, hiddenDecisionRate: 0.92, liesDiscovered: 7,  abandoned: false, dataFile: 'player_005.mock.json' },
  { id: 'p4', name: 'Gorka',  rank: 'Senior Detective', rankLevel: 3, casesCompleted: 4, totalPlaytimeSeconds: 24000, reputation: 82, notebookAvg: 96, hiddenDecisionRate: 0.30, liesDiscovered: 17, abandoned: false, dataFile: 'player_004.mock.json' },
  { id: 'p5', name: 'Iker',   rank: 'Detective',        rankLevel: 2, casesCompleted: 3, totalPlaytimeSeconds: 14400, reputation: 69, notebookAvg: 80, hiddenDecisionRate: 0.50, liesDiscovered: 11, abandoned: true,  dataFile: 'player_006.mock.json' },
  { id: 'p6', name: 'Amaia',  rank: 'Senior Detective', rankLevel: 3, casesCompleted: 4, totalPlaytimeSeconds: 30000, reputation: 88, notebookAvg: 95, hiddenDecisionRate: 0.25, liesDiscovered: 16, abandoned: false, dataFile: 'player_007.mock.json' },
];

const mockIndex: Partial<PlayersIndex> = {
  meta: { version: '1.2', totalPlayers: 6, note: 'test' },
  aggregateStats: {} as any, // ignored — computed reactively
  players: makePlayers() as any,
};

describe('AnalyticsService (reactive pipeline)', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService],
    });
    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const flush = () => {
    const req = httpMock.expectOne('assets/data/players-index.mock.json');
    req.flush(mockIndex);
  };

  // ── Load ──
  it('should be created', () => expect(service).toBeTruthy());

  it('should load players from index', () => {
    service.load(); flush();
    expect(service.players().length).toBe(6);
  });

  it('should set isLoading to false after load', () => {
    service.load(); flush();
    expect(service.isLoading()).toBeFalse();
  });

  it('should set hasError on failure', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json')
      .error(new ErrorEvent('Network error'));
    expect(service.hasError()).toBeTrue();
    expect(service.isLoading()).toBeFalse();
  });

  // ── Reactive play style derivation ──
  it('should derive playStyle from data, not read from JSON', () => {
    service.load(); flush();
    const players = service.players();
    // Gorka: notebookAvg=96, slow sessions → Completionist
    const gorka = players.find(p => p.name === 'Gorka')!;
    expect(gorka.playStyle).toBe('Completionist');
    // Leire: hiddenRate=0.92 → Manipulator
    const leire = players.find(p => p.name === 'Leire')!;
    expect(leire.playStyle).toBe('Manipulator');
    // Mikel: hiddenRate=0.80 → Manipulator
    const mikel = players.find(p => p.name === 'Mikel')!;
    expect(mikel.playStyle).toBe('Manipulator');
  });

  it('should NOT use playStyle from raw JSON if present', () => {
    // Even if JSON has a wrong style, service should recompute it
    const wrongIndex = {
      ...mockIndex,
      players: makePlayers().map(p => ({ ...p, playStyle: 'Balanced' }))
    };
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(wrongIndex);
    const gorka = service.players().find(p => p.name === 'Gorka')!;
    // Should be Completionist by computation, not Balanced from JSON
    expect(gorka.playStyle).not.toBe('Balanced');
  });

  // ── Reactive outlier detection ──
  it('should detect outliers reactively from population', () => {
    service.load(); flush();
    const outliers = service.outliers();
    // Leire has hiddenRate=0.92 — should be an outlier
    expect(outliers.some(p => p.name === 'Leire')).toBeTrue();
  });

  it('outlier detection should be based on z-score vs live population', () => {
    service.load(); flush();
    const players = service.players();
    // Alba (hiddenRate=0.40) should NOT be an outlier
    const alba = players.find(p => p.name === 'Alba')!;
    expect(alba.isOutlier).toBeFalse();
  });

  // ── Reactive percentiles ──
  it('should compute percentiles reactively', () => {
    service.load(); flush();
    const players = service.players();
    players.forEach(p => {
      expect(p.percentiles.reputation).toBeGreaterThanOrEqual(0);
      expect(p.percentiles.reputation).toBeLessThanOrEqual(100);
      expect(p.percentiles.notebookCompletion).toBeGreaterThanOrEqual(0);
      expect(p.percentiles.sessionEfficiency).toBeGreaterThanOrEqual(0);
    });
  });

  it('player with highest reputation should have highest reputation percentile', () => {
    service.load(); flush();
    const players = service.players();
    const sorted = [...players].sort((a, b) => b.reputation - a.reputation);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    expect(top.percentiles.reputation).toBeGreaterThan(bottom.percentiles.reputation);
  });

  // ── Reactive aggregate ──
  it('should compute aggregate reactively from players', () => {
    service.load(); flush();
    const agg = service.aggregate();
    expect(agg).toBeTruthy();
    expect(agg!.totalPlayers).toBe(6);
  });

  it('aggregate mean reputation should match manual calculation', () => {
    service.load(); flush();
    const reps = makePlayers().map(p => p.reputation);
    const expected = Math.round(reps.reduce((a, b) => a + b) / reps.length * 10) / 10;
    expect(service.aggregate()!.avgReputation).toBe(expected);
  });

  it('aggregate should include abandoned count', () => {
    service.load(); flush();
    expect(service.aggregate()!.abandonedCount).toBe(1);
  });

  it('aggregate should include abandon rate', () => {
    service.load(); flush();
    expect(service.aggregate()!.abandonRate).toBeCloseTo(1 / 6, 2);
  });

  it('aggregate should compute real Pearson correlations', () => {
    service.load(); flush();
    const corr = service.aggregate()!.correlations;
    // All r values should be in [-1, 1]
    Object.values(corr).forEach(r => {
      expect(r).toBeGreaterThanOrEqual(-1);
      expect(r).toBeLessThanOrEqual(1);
    });
  });

  it('aggregate should compute histograms from live data', () => {
    service.load(); flush();
    const agg = service.aggregate()!;
    // Sum of histogram bins should equal total players
    const repTotal = agg.reputationDistribution.reduce((s, b) => s + b.count, 0);
    expect(repTotal).toBe(6);
  });

  it('aggregate should compute play style segments from derived styles', () => {
    service.load(); flush();
    const segs = service.aggregate()!.playStyleSegments;
    const total = segs.reduce((s, seg) => s + seg.count, 0);
    expect(total).toBe(6);
  });

  it('aggregate should compute case completion rates', () => {
    service.load(); flush();
    const rates = service.aggregate()!.caseCompletionRate;
    // All 6 players completed case_01
    expect(rates['case_01']).toBe(1.0);
    // Only 5 of 6 completed case_04 (Iker abandoned after case_03)
    // casesCompleted: Iker=3, so case_04 = 5/6
    expect(rates['case_04']).toBeCloseTo(5 / 6, 2);
  });

  // ── Correlation matrix ──
  it('should build correlation matrix with 5 entries', () => {
    service.load(); flush();
    expect(service.correlationMatrix().length).toBe(5);
  });

  it('correlation cells should have strength and direction', () => {
    service.load(); flush();
    service.correlationMatrix().forEach(cell => {
      expect(['strong', 'moderate', 'weak', 'none']).toContain(cell.strength);
      expect(['positive', 'negative', 'neutral']).toContain(cell.direction);
    });
  });

  it('negative r should map to negative direction', () => {
    service.load(); flush();
    const cells = service.correlationMatrix();
    const negCell = cells.find(c => c.value < -0.05);
    if (negCell) expect(negCell.direction).toBe('negative');
  });

  // ── Descriptive stats ──
  it('reputationStats should be reactive', () => {
    service.load(); flush();
    const stats = service.reputationStats()!;
    expect(stats.min).toBe(55);
    expect(stats.max).toBe(88);
    expect(stats.mean).toBeGreaterThan(0);
    expect(stats.stdDev).toBeGreaterThan(0);
    expect(stats.q1).toBeLessThan(stats.median);
    expect(stats.q3).toBeGreaterThan(stats.median);
  });

  it('notebookStats should reflect live data', () => {
    service.load(); flush();
    const stats = service.notebookStats()!;
    expect(stats.min).toBe(68);
    expect(stats.max).toBe(96);
  });

  // ── Segment chart ──
  it('segmentChart should include percentages', () => {
    service.load(); flush();
    const segs = service.segmentChart();
    segs.forEach(s => {
      expect(s.pct).toBeGreaterThanOrEqual(0);
      expect(s.pct).toBeLessThanOrEqual(100);
    });
  });

  // ── Scatter data ──
  it('scatterData should map x=hiddenRate, y=reputation', () => {
    service.load(); flush();
    const scatter = service.scatterData();
    expect(scatter.length).toBe(6);
    const alba = scatter.find(p => p.label === 'Alba')!;
    expect(alba.x).toBe(0.40);
    expect(alba.y).toBe(74);
  });

  // ── Search ──
  it('should filter players by name', () => {
    service.load(); flush();
    service.search('alba');
    expect(service.filteredPlayers().length).toBe(1);
  });

  it('should filter by playStyle string', () => {
    service.load(); flush();
    service.search('manipulator');
    const results = service.filteredPlayers();
    expect(results.every(p => p.playStyle.toLowerCase() === 'manipulator')).toBeTrue();
  });

  it('should return all players when query is empty', () => {
    service.load(); flush();
    expect(service.filteredPlayers().length).toBe(6);
  });

  it('clearSearch should reset filteredPlayers to all', () => {
    service.load(); flush();
    service.search('alba');
    service.clearSearch();
    expect(service.filteredPlayers().length).toBe(6);
  });

  it('searchResult should return exact name match', () => {
    service.load(); flush();
    service.search('Gorka');
    expect(service.searchResult()?.name).toBe('Gorka');
  });

  it('searchResult should return null for partial match', () => {
    service.load(); flush();
    service.search('gor');
    expect(service.searchResult()).toBeNull();
  });

  // ── Roster filters ──
  it('filteredRoster should filter by playStyle', () => {
    service.load(); flush();
    service.updateRosterFilter({ style: 'Manipulator' });
    const results = service.filteredRoster();
    expect(results.every(p => p.playStyle === 'Manipulator')).toBeTrue();
  });

  it('filteredRoster should filter by reputation range', () => {
    service.load(); flush();
    service.updateRosterFilter({ minRep: 70, maxRep: 85 });
    const results = service.filteredRoster();
    results.forEach(p => {
      expect(p.reputation).toBeGreaterThanOrEqual(70);
      expect(p.reputation).toBeLessThanOrEqual(85);
    });
  });

  it('filteredRoster should hide abandoned players when showAbandoned=false', () => {
    service.load(); flush();
    service.updateRosterFilter({ showAbandoned: false });
    const results = service.filteredRoster();
    expect(results.every(p => !p.abandoned)).toBeTrue();
  });

  it('filteredRoster should filter by casesCompleted', () => {
    service.load(); flush();
    service.updateRosterFilter({ casesCompleted: 3 });
    const results = service.filteredRoster();
    expect(results.every(p => p.casesCompleted === 3)).toBeTrue();
  });

  it('updateRosterFilter should merge with existing filters', () => {
    service.load(); flush();
    service.updateRosterFilter({ minRep: 60 });
    service.updateRosterFilter({ maxRep: 85 });
    const f = service.rosterFilters();
    expect(f.minRep).toBe(60);
    expect(f.maxRep).toBe(85);
  });

  // ── Top players ──
  it('topPlayers should be sorted by reputation descending', () => {
    service.load(); flush();
    const top = service.topPlayers();
    for (let i = 0; i < top.length - 1; i++) {
      expect(top[i].reputation).toBeGreaterThanOrEqual(top[i + 1].reputation);
    }
  });

  it('topPlayers should return at most 5', () => {
    service.load(); flush();
    expect(service.topPlayers().length).toBeLessThanOrEqual(5);
  });

  // ── Delegates ──
  it('zScore delegate should work correctly', () => {
    expect(service.zScore(80, 70, 10)).toBe(1);
  });

  it('percentileRank delegate should work correctly', () => {
    expect(service.percentileRank(80, [50, 60, 70, 80, 90])).toBe(60);
  });
});