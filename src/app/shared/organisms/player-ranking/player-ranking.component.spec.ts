import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerRankingComponent } from './player-ranking.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { GameDataService }  from '../../../core/services/game-data.service';
import { signal } from '@angular/core';

const mockPlayers = [
  { id: 'p1', name: 'Yuki',  reputation: 88, playStyle: 'Speedrunner',   isOutlier: false, percentiles: { reputation: 95, accuracy: 92, notebookCompletion: 42, sessionEfficiency: 97 } },
  { id: 'p2', name: 'Alba',  reputation: 74, playStyle: 'Completionist', isOutlier: false, percentiles: { reputation: 72, accuracy: 88, notebookCompletion: 85, sessionEfficiency: 76 } },
  { id: 'p3', name: 'Marco', reputation: 55, playStyle: 'Manipulator',   isOutlier: true,  percentiles: { reputation: 22, accuracy: 40, notebookCompletion: 28, sessionEfficiency: 30 } },
] as any[];

const mockAgg = { avgReputation: 72, stdDevSessionDuration: 1200 } as any;

describe('PlayerRankingComponent', () => {
  let fixture: ComponentFixture<PlayerRankingComponent>;
  let component: PlayerRankingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerRankingComponent],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            players:     signal(mockPlayers),
            aggregate:   signal(mockAgg),
            topPlayers:  signal([...mockPlayers].sort((a, b) => b.reputation - a.reputation)),
            zScore:      (v: number, m: number, s: number) => Math.round(((v - m) / s) * 100) / 100,
          }
        },
        {
          provide: GameDataService,
          useValue: { player: signal({ name: 'Alba' } as any) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should find current player by name', () => {
    expect(component.currentPlayer()?.name).toBe('Alba');
  });

  it('should return percentiles for current player', () => {
    const p = component.percentiles();
    expect(p?.reputation).toBe(72);
    expect(p?.accuracy).toBe(88);
  });

  it('should return play style for current player', () => {
    expect(component.playStyle()).toBe('Completionist');
  });

  it('should return correct percentile label', () => {
    expect(component.getPercentileLabel(95)).toBe('Top 10%');
    expect(component.getPercentileLabel(80)).toBe('Top 25%');
    expect(component.getPercentileLabel(60)).toBe('Above avg');
    expect(component.getPercentileLabel(35)).toBe('Below avg');
    expect(component.getPercentileLabel(10)).toBe('Bottom 25%');
  });

  it('should return correct badge variant per percentile', () => {
    expect(component.getPercentileVariant(80)).toBe('success');
    expect(component.getPercentileVariant(50)).toBe('warning');
    expect(component.getPercentileVariant(25)).toBe('danger');
    expect(component.getPercentileVariant(10)).toBe('muted');
  });

  it('should display top players in leaderboard', () => {
    const rows = fixture.nativeElement.querySelectorAll('.leaderboard-row');
    expect(rows.length).toBe(3);
  });

  it('should highlight active player row', () => {
    const active = fixture.nativeElement.querySelector('.leaderboard-row--active');
    expect(active).toBeTruthy();
    expect(active.textContent).toContain('Alba');
  });
});