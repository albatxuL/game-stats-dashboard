import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompareComponent } from './compare.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';

const mockPlayers = [
  { id: 'p1', name: 'Alba',  rank: 'Senior Detective', rankLevel: 3, casesCompleted: 4, totalPlaytimeSeconds: 18000, reputation: 74, notebookAvg: 86, hiddenDecisionRate: 0.40, liesDiscovered: 14, playStyle: 'Completionist', isOutlier: false, abandoned: false, percentiles: { reputation: 72, accuracy: 88, notebookCompletion: 85, sessionEfficiency: 76 }, dataFile: 'game-data.mock.json' },
  { id: 'p2', name: 'Mikel', rank: 'Detective',        rankLevel: 2, casesCompleted: 4, totalPlaytimeSeconds: 16000, reputation: 61, notebookAvg: 74, hiddenDecisionRate: 0.80, liesDiscovered: 9,  playStyle: 'Manipulator',   isOutlier: false, abandoned: false, percentiles: { reputation: 38, accuracy: 55, notebookCompletion: 42, sessionEfficiency: 55 }, dataFile: 'player_002.mock.json' },
];

describe('CompareComponent', () => {
  let fixture: ComponentFixture<CompareComponent>;
  let component: CompareComponent;

  const setup = (id1 = 'p1', id2 = 'p2') =>
    TestBed.configureTestingModule({
      imports: [CompareComponent, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (k: string) => k === 'id1' ? id1 : id2 } } }
        },
        {
          provide: AnalyticsService,
          useValue: {
            players:   signal(mockPlayers as any),
            index:     signal({ meta: {}, aggregateStats: {}, players: mockPlayers }),
            aggregate: signal({ correlations: {} }),
            load:      jasmine.createSpy('load'),
          }
        }
      ]
    }).compileComponents();

  beforeEach(async () => {
    await setup();
    fixture = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should resolve both players from route params', () => {
    expect(component.playerA()?.name).toBe('Alba');
    expect(component.playerB()?.name).toBe('Mikel');
  });

  it('should not be loading after init with loaded players', () => {
    expect(component.isLoading()).toBeFalse();
  });

  it('should generate 8 metric comparisons', () => {
    expect(component.metrics().length).toBe(8);
  });

  it('should compute winner correctly — reputation: Alba (74) > Mikel (61)', () => {
    const repMetric = component.metrics().find(m => m.label === 'Reputation')!;
    expect(repMetric.winner).toBe('a');
  });

  it('should compute winner for hidden rate — lower is better', () => {
    const m = component.metrics().find(m => m.label === 'Hidden rate')!;
    // Alba 40% < Mikel 80% → Alba wins (lower hidden is better)
    expect(m.winner).toBe('a');
  });

  it('should compute scoreA and scoreB', () => {
    expect(component.scoreA()).toBeGreaterThanOrEqual(0);
    expect(component.scoreB()).toBeGreaterThanOrEqual(0);
    expect(component.scoreA() + component.scoreB() + component.metrics().filter(m => m.winner === 'tie').length)
      .toBe(component.metrics().length);
  });

  it('should determine overall winner', () => {
    expect(['a', 'b', 'tie']).toContain(component.winner());
  });

  it('should compute z-distance as a number', () => {
    const z = component.zDistance();
    if (z !== null) {
      expect(typeof z).toBe('number');
      expect(z).toBeGreaterThanOrEqual(0);
    }
  });

  it('should show error when player not found', async () => {
    await TestBed.resetTestingModule();
    await setup('INVALID', 'p2');
    const f2 = TestBed.createComponent(CompareComponent);
    f2.detectChanges();
    expect(f2.componentInstance.error()).toContain('INVALID');
  });

  it('should return correct badge variant', () => {
    expect(component.getStyleVariant('Completionist')).toBe('success');
    expect(component.getStyleVariant('Manipulator')).toBe('danger');
  });

  it('should expose Math to template', () => {
    expect(component.Math).toBe(Math);
  });

  it('should render player names in template', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Alba');
    expect(text).toContain('Mikel');
  });
});