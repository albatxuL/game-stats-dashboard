import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalStatsOverviewComponent } from './global-stats-overview.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { signal } from '@angular/core';

const mockAgg = {
  totalPlayers: 8,
  avgSessionDuration: 4210,
  medianSessionDuration: 3980,
  stdDevSessionDuration: 1240,
  avgNotebookCompletion: 81.4,
  medianNotebookCompletion: 84,
  avgReputation: 71.2,
  medianReputation: 73,
  hiddenDecisionRate: 0.52,
  finalDistribution: { A: 14, B: 12, C: 5, D: 1 },
  playStyleSegments: [
    { segment: 'Completionist', count: 2, description: 'High notebook' },
    { segment: 'Speedrunner',   count: 2, description: 'Short sessions' },
  ]
} as any;

const mockRepStats = { mean: 71.2, median: 73, stdDev: 12.4, min: 46, max: 88, q1: 61, q3: 82 };
const mockNbStats  = { mean: 81.4, median: 84, stdDev: 9.8,  min: 61, max: 96, q1: 72, q3: 86 };

describe('GlobalStatsOverviewComponent', () => {
  let fixture: ComponentFixture<GlobalStatsOverviewComponent>;
  let component: GlobalStatsOverviewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalStatsOverviewComponent],
      providers: [{
        provide: AnalyticsService,
        useValue: {
          aggregate:      signal(mockAgg),
          reputationStats: signal(mockRepStats),
          notebookStats:   signal(mockNbStats),
          segmentChart:    signal(mockAgg.playStyleSegments.map((s: any) => ({ ...s, pct: 25 }))),
          outliers:        signal([]),
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalStatsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should compute avg duration in minutes', () => {
    expect(component.avgDuration()).toBe('70m');
  });

  it('should compute hidden rate as percentage', () => {
    expect(component.hiddenRate()).toBe(52);
  });

  it('should identify most common final outcome', () => {
    expect(component.topFinal()).toBe('A');
  });

  it('should build final entries with percentages', () => {
    const entries = component.finalEntries();
    expect(entries.length).toBe(4);
    const total = 14 + 12 + 5 + 1;
    const aEntry = entries.find(e => e.label === 'Final A')!;
    expect(aEntry.pct).toBe(Math.round(14 / total * 100));
  });

  it('should return correct segment color', () => {
    expect(component.segmentColor('Completionist')).toBe('green');
    expect(component.segmentColor('Speedrunner')).toBe('blue');
    expect(component.segmentColor('Manipulator')).toBe('red');
    expect(component.segmentColor('Balanced')).toBe('amber');
  });

  it('should render stat cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('df-stat-card');
    expect(cards.length).toBe(6);
  });
});