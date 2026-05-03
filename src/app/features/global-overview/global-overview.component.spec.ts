import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalOverviewComponent } from './global-overview.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { signal } from '@angular/core';

const mockAgg = {
  totalPlayers: 8,
  avgReputation: 71.2,
  avgNotebookCompletion: 81.4,
  avgSessionDuration: 4210,
  medianSessionDuration: 3980,
  medianNotebookCompletion: 84,
  medianReputation: 73,
  avgLiesDiscovered: 11.3,
  avgCluesFound: 14.1,
  hiddenDecisionRate: 0.52,
  revealedDecisionRate: 0.48,
  stdDevSessionDuration: 1240,
  finalDistribution: { A: 14, B: 12, C: 5, D: 1 },
  caseCompletionRate: {},
  correlations: {},
  reputationDistribution: [],
  notebookDistribution: [],
  sessionDurationDistribution: [],
  playStyleSegments: []
};

describe('GlobalOverviewComponent', () => {
  let fixture: ComponentFixture<GlobalOverviewComponent>;
  let component: GlobalOverviewComponent;
  let mockService: Partial<AnalyticsService>;

  beforeEach(async () => {
    mockService = {
      isLoading: signal(false),
      hasError:  signal(false),
      aggregate: signal(mockAgg as any),
      index:     signal({ meta: { version: '1.0', totalPlayers: 8, note: '' }, aggregateStats: mockAgg as any, players: [] }),
      load:      jasmine.createSpy('load'),
      reputationStats: signal(null),
      notebookStats:   signal(null),
      segmentChart:    signal([]),
      outliers:        signal([]),
      topPlayers:      signal([]),
      players:         signal([]),
      correlationMatrix: signal([]),
    };

    await TestBed.configureTestingModule({
      imports: [GlobalOverviewComponent],
      providers: [{ provide: AnalyticsService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should NOT call load when index already has data', () => {
    expect(mockService.load).not.toHaveBeenCalled();
  });

  it('should call load when index is null', async () => {
    (mockService.index as any).set(null);
    const fresh = TestBed.createComponent(GlobalOverviewComponent);
    fresh.detectChanges();
    expect(mockService.load).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    (mockService.isLoading as any).set(true);
    (mockService.agg as any) = signal(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');
  });
});