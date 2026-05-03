import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsService } from './analytics.service';
import { PlayersIndex } from '../models/analytics.model';

const mockIndex: Partial<PlayersIndex> = {
  meta: { version: '1.0', totalPlayers: 3, note: 'test' },
  aggregateStats: {
    totalPlayers: 3,
    avgReputation: 72, medianReputation: 74, stdDevSessionDuration: 1200,
    avgSessionDuration: 4000, medianSessionDuration: 3800,
    avgNotebookCompletion: 80, medianNotebookCompletion: 82,
    avgLiesDiscovered: 11, avgCluesFound: 14,
    hiddenDecisionRate: 0.5, revealedDecisionRate: 0.5,
    finalDistribution: { A: 5, B: 3, C: 2, D: 1 },
    caseCompletionRate: {},
    correlations: {
      hiddenDecisions_vs_reputation: 0.34,
      notebookCompletion_vs_accuracy: 0.71,
      sessionDuration_vs_notebookPct: 0.58,
      liesDiscovered_vs_finalGrade: 0.62,
      cluesFound_vs_murdererCorrect: 0.49
    },
    reputationDistribution: [],
    notebookDistribution: [],
    sessionDurationDistribution: [],
    playStyleSegments: [
      { segment: 'Completionist', count: 1, description: 'test' },
      { segment: 'Speedrunner',   count: 1, description: 'test' },
    ]
  } as any,
  players: [
    { id: 'p1', name: 'Alba',  reputation: 74, notebookAvg: 86, hiddenDecisionRate: 0.4, liesDiscovered: 14, playStyle: 'Completionist', isOutlier: false, casesCompleted: 4, totalPlaytimeSeconds: 18000, rank: 'Senior Detective', rankLevel: 3, percentiles: { reputation: 72, accuracy: 88, notebookCompletion: 85, sessionEfficiency: 76 }, dataFile: 'game-data.mock.json' },
    { id: 'p2', name: 'Marco', reputation: 55, notebookAvg: 68, hiddenDecisionRate: 0.9, liesDiscovered: 7,  playStyle: 'Manipulator',   isOutlier: true,  casesCompleted: 4, totalPlaytimeSeconds: 22000, rank: 'Detective', rankLevel: 2, percentiles: { reputation: 22, accuracy: 40, notebookCompletion: 28, sessionEfficiency: 30 }, dataFile: 'player_002.mock.json' },
    { id: 'p3', name: 'Yuki',  reputation: 88, notebookAvg: 72, hiddenDecisionRate: 0.1, liesDiscovered: 16, playStyle: 'Speedrunner',   isOutlier: false, casesCompleted: 4, totalPlaytimeSeconds: 12000, rank: 'Field Detective', rankLevel: 1, percentiles: { reputation: 95, accuracy: 92, notebookCompletion: 42, sessionEfficiency: 97 }, dataFile: 'player_003.mock.json' },
  ]
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsService]
    });
    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should load player index', () => {
    service.load();
    const req = httpMock.expectOne('assets/data/players-index.mock.json');
    req.flush(mockIndex);
    expect(service.players().length).toBe(3);
  });

  it('should filter players by search query', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    service.search('alba');
    expect(service.filteredPlayers().length).toBe(1);
    expect(service.filteredPlayers()[0].name).toBe('Alba');
  });

  it('should return exact search result', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    service.search('Alba');
    expect(service.searchResult()?.name).toBe('Alba');
  });

  it('should return null searchResult when no match', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    service.search('nobody');
    expect(service.searchResult()).toBeNull();
  });

  it('should detect outliers', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    expect(service.outliers().length).toBe(1);
    expect(service.outliers()[0].name).toBe('Marco');
  });

  it('should sort top players by reputation descending', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    const top = service.topPlayers();
    expect(top[0].reputation).toBeGreaterThanOrEqual(top[1].reputation);
  });

  it('should build correlation matrix with 5 entries', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    expect(service.correlationMatrix().length).toBe(5);
  });

  it('should classify correlation strength correctly', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    const strong = service.correlationMatrix().find(c => c.value === 0.71);
    expect(strong?.strength).toBe('strong');
    const moderate = service.correlationMatrix().find(c => c.value === 0.49);
    expect(moderate?.strength).toBe('moderate');
  });

  it('should compute segment chart percentages', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    const segs = service.segmentChart();
    expect(segs.length).toBe(2);
    expect(segs[0].pct).toBe(33); // 1/3 ≈ 33%
  });

  it('should compute descriptive stats for reputation', () => {
    service.load();
    httpMock.expectOne('assets/data/players-index.mock.json').flush(mockIndex);
    const stats = service.reputationStats();
    expect(stats).toBeTruthy();
    expect(stats!.min).toBe(55);
    expect(stats!.max).toBe(88);
  });

  it('should calculate z-score correctly', () => {
    expect(service.zScore(80, 70, 10)).toBe(1);
    expect(service.zScore(60, 70, 10)).toBe(-1);
  });

  it('should calculate percentile rank', () => {
    const pop = [50, 60, 70, 80, 90];
    expect(service.percentileRank(80, pop)).toBe(60); // 3 values below 80
  });

  it('should clear search', () => {
    service.search('alba');
    service.clearSearch();
    expect(service.searchQuery()).toBe('');
    expect(service.searchResult()).toBeNull();
  });
});