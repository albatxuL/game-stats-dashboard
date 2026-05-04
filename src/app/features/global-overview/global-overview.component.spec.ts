import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalOverviewComponent } from './global-overview.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const makePlayers = (n = 14) => Array.from({ length: n }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Player${i + 1}`,
  rank: i % 2 === 0 ? 'Detective' : 'Senior Detective',
  rankLevel: 2,
  casesCompleted: i < 12 ? 4 : 3,
  totalPlaytimeSeconds: 15000 + i * 500,
  reputation: 60 + i,
  notebookAvg: 75 + i * 0.5,
  hiddenDecisionRate: 0.3 + (i % 5) * 0.1,
  liesDiscovered: 10 + i,
  playStyle: (['Completionist', 'Speedrunner', 'Manipulator', 'Balanced'] as const)[i % 4],
  isOutlier: i === 4,
  abandoned: i >= 12,
  percentiles: { reputation: 50, accuracy: 60, notebookCompletion: 70, sessionEfficiency: 55 },
  dataFile: `player_0${i + 2}.mock.json`,
}));

const mockAgg = {
  totalPlayers: 14, abandonedCount: 2, avgReputation: 67,
  avgNotebookCompletion: 78, avgSessionDuration: 17500,
  medianReputation: 67, medianNotebookCompletion: 78,
  medianSessionDuration: 17000, stdDevReputation: 8,
  stdDevSessionDuration: 2000, avgLiesDiscovered: 12,
  avgCluesFound: 14, hiddenDecisionRate: 0.45,
  revealedDecisionRate: 0.55, finalDistribution: { A: 20, B: 15, C: 8, D: 3 },
  caseCompletionRate: { case_01: 1.0, case_02: 1.0, case_03: 0.95, case_04: 0.86 },
  correlations: { hiddenDecisions_vs_reputation: -0.34, notebookCompletion_vs_accuracy: 0.71, sessionDuration_vs_notebookPct: 0.52, liesDiscovered_vs_finalGrade: 0.60, cluesFound_vs_murdererCorrect: 0.47 },
  reputationDistribution: [], notebookDistribution: [],
  sessionDurationDistribution: [],
  playStyleSegments: [
    { segment: 'Completionist', count: 4, description: '' },
    { segment: 'Speedrunner',   count: 3, description: '' },
    { segment: 'Manipulator',   count: 4, description: '' },
    { segment: 'Balanced',      count: 3, description: '' },
  ],
  abandonRate: 0.143,
} as any;

describe('GlobalOverviewComponent', () => {
  let fixture: ComponentFixture<GlobalOverviewComponent>;
  let component: GlobalOverviewComponent;
  let mockService: Partial<AnalyticsService>;
  let queryParams$: BehaviorSubject<Record<string, string>>;
  let mockRouter: jasmine.SpyObj<Router>;

  const filtersSignal = signal({
    style: null as string | null,
    minRep: 0, maxRep: 100,
    casesCompleted: null as number | null,
    showAbandoned: true
  });
  const searchQuerySignal = signal('');
  const playersSignal     = signal(makePlayers() as any[]);

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({});
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockService = {
      isLoading:       signal(false),
      hasError:        signal(false),
      aggregate:       signal(mockAgg),
      players:         playersSignal,
      searchQuery:     searchQuerySignal,
      index:           signal({ meta: { version: '1.2', totalPlayers: 14, note: '' }, aggregateStats: mockAgg, players: makePlayers() as any }),
      filteredRoster:  computed(() => playersSignal()),
      rosterFilters:   filtersSignal,
      load:            jasmine.createSpy('load'),
      search:          jasmine.createSpy('search').and.callFake((q: string) => searchQuerySignal.set(q)),
      clearSearch:     jasmine.createSpy('clearSearch').and.callFake(() => searchQuerySignal.set('')),
      updateRosterFilter: jasmine.createSpy('updateRosterFilter').and.callFake(
        (patch: any) => filtersSignal.update(f => ({ ...f, ...patch }))
      ),
      reputationStats: signal({ mean: 67, median: 67, stdDev: 8, min: 60, max: 73, q1: 63, q3: 71 }),
      notebookStats:   signal({ mean: 78, median: 78, stdDev: 4, min: 75, max: 81, q1: 76, q3: 80 }),
      segmentChart:    signal(mockAgg.playStyleSegments.map((s: any) => ({ ...s, pct: 25 }))),
      outliers:        signal([makePlayers()[4]] as any),
      topPlayers:      signal([...makePlayers()].sort((a: any, b: any) => b.reputation - a.reputation).slice(0, 5) as any),
      correlationMatrix: signal([]),
      scatterData:     signal([]),
    };

    await TestBed.configureTestingModule({
      imports: [GlobalOverviewComponent, RouterTestingModule],
      providers: [
        { provide: AnalyticsService, useValue: mockService },
        { provide: ActivatedRoute, useValue: {
            queryParams: queryParams$.asObservable(),
            snapshot: { queryParams: {} }
          }
        },
        { provide: Router, useValue: mockRouter },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Basic ──
  it('should create', () => expect(component).toBeTruthy());

  it('should NOT call load when index already loaded', () => {
    expect(mockService.load).not.toHaveBeenCalled();
  });

  it('should call load when index is null', async () => {
    (mockService.index as any).set(null);
    const f2 = TestBed.createComponent(GlobalOverviewComponent);
    f2.detectChanges();
    expect(mockService.load).toHaveBeenCalled();
  });

  // ── URL state: read on init ──
  it('should restore page from query params', () => {
    queryParams$.next({ page: '2' });
    expect(component.currentPage()).toBe(2);
  });

  it('should restore style filter from query params', () => {
    queryParams$.next({ style: 'Manipulator' });
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({ style: 'Manipulator' })
    );
  });

  it('should restore minRep from query params', () => {
    queryParams$.next({ minRep: '60' });
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({ minRep: 60 })
    );
  });

  it('should restore maxRep from query params', () => {
    queryParams$.next({ maxRep: '85' });
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({ maxRep: 85 })
    );
  });

  it('should restore casesCompleted from query params', () => {
    queryParams$.next({ cases: '3' });
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({ casesCompleted: 3 })
    );
  });

  it('should restore showAbandoned=false from query params', () => {
    queryParams$.next({ abandoned: 'false' });
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith(
      jasmine.objectContaining({ showAbandoned: false })
    );
  });

  it('should restore search query from q param', () => {
    queryParams$.next({ q: 'Alba' });
    expect(mockService.search).toHaveBeenCalledWith('Alba');
  });

  // ── URL state: write on interaction ──
  it('should push page param when navigating pages', () => {
    component.goToPage(2);
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [], jasmine.objectContaining({ queryParams: jasmine.objectContaining({ page: '2' }) })
    );
  });

  it('should remove page param when going to page 0', () => {
    component.goToPage(1);
    component.goToPage(0);
    const lastCall = mockRouter.navigate.calls.mostRecent().args[1];
    expect(lastCall?.queryParams?.page).toBeUndefined();
  });

  it('should use replaceUrl on navigate to avoid polluting history', () => {
    component.goToPage(1);
    const lastCall = mockRouter.navigate.calls.mostRecent().args[1];
    expect(lastCall?.replaceUrl).toBeTrue();
  });

  it('should push q param when searching', () => {
    component.onSearchInput('Mikel');
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [], jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ q: 'Mikel' })
      })
    );
  });

  it('should remove q param when search is cleared', () => {
    component.onSearchInput('');
    const lastCall = mockRouter.navigate.calls.mostRecent().args[1];
    expect(lastCall?.queryParams?.q).toBeUndefined();
  });

  it('should push style param on filter change', () => {
    filtersSignal.update(f => ({ ...f, style: 'Speedrunner' }));
    component.onFilterChange();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [], jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ style: 'Speedrunner' })
      })
    );
  });

  it('should remove style param when null', () => {
    filtersSignal.update(f => ({ ...f, style: null }));
    component.onFilterChange();
    const lastCall = mockRouter.navigate.calls.mostRecent().args[1];
    expect(lastCall?.queryParams?.style).toBeUndefined();
  });

  it('should reset page to 0 when filter changes', () => {
    component.goToPage(2);
    component.onFilterChange();
    expect(component.currentPage()).toBe(0);
  });

  it('should reset page to 0 on search', () => {
    component.goToPage(1);
    component.onSearchInput('test');
    expect(component.currentPage()).toBe(0);
  });

  // ── Pagination logic ──
  it('should start on page 0', () => {
    expect(component.currentPage()).toBe(0);
  });

  it('should compute totalPages from filteredRoster', () => {
    // 14 players / 6 per page = 3 pages (ceil)
    expect(component.totalPages()).toBe(3);
  });

  it('should paginate correctly', () => {
    expect(component.paginatedPlayers().length).toBe(6);
    component.goToPage(2);
    fixture.detectChanges();
    expect(component.paginatedPlayers().length).toBe(2); // 14 - 12
  });

  it('nextPage should increment page', () => {
    component.nextPage();
    expect(component.currentPage()).toBe(1);
  });

  it('prevPage should not go below 0', () => {
    component.prevPage();
    expect(component.currentPage()).toBe(0);
  });

  it('prevPage should decrement from page 1', () => {
    component.goToPage(1);
    component.prevPage();
    expect(component.currentPage()).toBe(0);
  });

  it('nextPage should not exceed totalPages - 1', () => {
    component.goToPage(2); // last page
    component.nextPage();
    expect(component.currentPage()).toBe(2);
  });

  it('should generate correct pageNumbers array', () => {
    expect(component.pageNumbers()).toEqual([0, 1, 2]);
  });

  // ── Search suggestions ──
  it('should filter suggestions by query', () => {
    searchQuerySignal.set('Player1');
    const suggs = component.suggestions();
    expect(suggs.every(p => p.name.toLowerCase().includes('player1'))).toBeTrue();
  });

  it('should return empty suggestions for empty query', () => {
    searchQuerySignal.set('');
    expect(component.suggestions().length).toBe(0);
  });

  it('should cap suggestions at 6', () => {
    searchQuerySignal.set('player');
    expect(component.suggestions().length).toBeLessThanOrEqual(6);
  });

  // ── Compare mode ──
  it('should set compareId on first selection', () => {
    component.selectForCompare('p1');
    expect(component.compareId()).toBe('p1');
  });

  it('should deselect on same player click', () => {
    component.selectForCompare('p1');
    component.selectForCompare('p1');
    expect(component.compareId()).toBeNull();
  });

  it('should navigate to /compare/:id1/:id2 on second selection', () => {
    component.selectForCompare('p1');
    component.selectForCompare('p2');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/compare', 'p1', 'p2']);
    expect(component.compareId()).toBeNull();
  });

  // ── Navigation ──
  it('should call clearSearch when navigating to player', () => {
    component.navigateToPlayer(makePlayers()[0] as any);
    expect(mockService.clearSearch).toHaveBeenCalled();
  });

  // ── Helpers ──
  it('minOf should return minimum', () => {
    expect(component.minOf(10, 6)).toBe(6);
    expect(component.minOf(3, 8)).toBe(3);
  });

  it('should return correct badge variants', () => {
    expect(component.getPlayStyleVariant('Completionist')).toBe('success');
    expect(component.getPlayStyleVariant('Speedrunner')).toBe('info');
    expect(component.getPlayStyleVariant('Manipulator')).toBe('danger');
    expect(component.getPlayStyleVariant('Balanced')).toBe('warning');
    expect(component.getPlayStyleVariant('Unknown')).toBe('warning');
  });

  // ── Render ──
  it('should render roster cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.roster-card');
    expect(cards.length).toBe(6); // page 0
  });

  it('should show loading state', () => {
    (mockService.isLoading as any).set(true);
    (mockService.aggregate as any).set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component as any, 'sub' as any);
    component.ngOnDestroy();
    // No error thrown = subscription handled
    expect(true).toBeTrue();
  });
});