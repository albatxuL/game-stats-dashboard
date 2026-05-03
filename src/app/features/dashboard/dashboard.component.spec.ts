import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { GameDataService }  from '../../core/services/game-data.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const baseGameData = {
  isLoading:    signal(false),
  hasError:     signal(false),
  errorMessage: signal(''),
  player:       signal({ id: 'p1', name: 'Alba', rank: 'Senior Detective', rankLevel: 3, totalCasesCompleted: 4, totalPlaytimeSeconds: 18000, rankHistory: [] }),
  cases:        signal([]),
  achievements: signal([]),
  achievementProgress: signal({ unlocked: 10, total: 20, percent: 50 }),
  selectedCase:   signal(null),
  selectedCaseId: signal('case_01'),
  reputation:     signal(null),
  globalStats:    signal(null),
  load:           jasmine.createSpy('load'),
  selectCase:     jasmine.createSpy('selectCase'),
  formatDuration: (s: number) => `${Math.floor(s/60)}m`,
  getFinalColor:  () => 'var(--c-green-light)',
};

const baseAnalytics = {
  isLoading:         signal(false),
  hasError:          signal(false),
  aggregate:         signal(null),
  players:           signal([]),
  filteredPlayers:   signal([]),
  searchResult:      signal(null),
  outliers:          signal([]),
  topPlayers:        signal([]),
  correlationMatrix: signal([]),
  reputationStats:   signal(null),
  notebookStats:     signal(null),
  segmentChart:      signal([]),
  index:             signal(null),
  load:              jasmine.createSpy('analyticsLoad'),
  search:            jasmine.createSpy('search'),
  clearSearch:       jasmine.createSpy('clearSearch'),
  zScore:            () => 0,
  percentileRank:    () => 50,
};

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: GameDataService,  useValue: { ...baseGameData } },
        { provide: AnalyticsService, useValue: { ...baseAnalytics } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should call both load methods on init', () => {
    expect(baseGameData.load).toHaveBeenCalled();
    expect(baseAnalytics.load).toHaveBeenCalled();
  });

  it('should default to global view', () => {
    expect(component.activeView()).toBe('global');
  });

  it('should switch to player view when player selected', () => {
    component.onPlayerSelected({ id: 'p1', name: 'Alba' });
    expect(component.activeView()).toBe('player');
  });

  it('should return to global view when player cleared', () => {
    component.onPlayerSelected({ id: 'p1' });
    component.onPlayerSelected(null);
    expect(component.activeView()).toBe('global');
  });

  it('should allow manual view switch via setView', () => {
    component.setView('player');
    expect(component.activeView()).toBe('player');
    component.setView('global');
    expect(component.activeView()).toBe('global');
  });

  it('should render player name in sidebar', () => {
    expect(fixture.nativeElement.textContent).toContain('Alba');
  });

  it('should show loading state', () => {
    (baseGameData.isLoading as any).set(true);
    (baseGameData.player as any).set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');
  });
});