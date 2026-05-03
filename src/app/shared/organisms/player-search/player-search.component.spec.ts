import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerSearchComponent } from './player-search.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { GameDataService }  from '../../../core/services/game-data.service';
import { signal } from '@angular/core';

const mockPlayers = [
  { id: 'p1', name: 'Alba',  rank: 'Senior Detective', casesCompleted: 4, playStyle: 'Completionist', isOutlier: false, dataFile: 'game-data.mock.json' },
  { id: 'p2', name: 'Marco', rank: 'Detective',        casesCompleted: 4, playStyle: 'Manipulator',   isOutlier: true,  dataFile: 'player_002.mock.json' },
  { id: 'p3', name: 'Yuki',  rank: 'Field Detective',  casesCompleted: 4, playStyle: 'Speedrunner',   isOutlier: false, dataFile: 'player_003.mock.json' },
] as any[];

describe('PlayerSearchComponent', () => {
  let fixture: ComponentFixture<PlayerSearchComponent>;
  let component: PlayerSearchComponent;
  let mockAnalytics: Partial<AnalyticsService>;
  let mockGameData: Partial<GameDataService>;

  beforeEach(async () => {
    mockAnalytics = {
      players: signal(mockPlayers),
      search:  jasmine.createSpy('search'),
      clearSearch: jasmine.createSpy('clearSearch'),
    };
    mockGameData = {
      player: signal({ name: 'Alba', rank: 'Senior Detective', totalCasesCompleted: 4 } as any),
      load:   jasmine.createSpy('load'),
    };

    await TestBed.configureTestingModule({
      imports: [PlayerSearchComponent],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalytics },
        { provide: GameDataService,  useValue: mockGameData },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should show suggestions matching query', () => {
    component.onInput('al');
    expect(component.suggestions().length).toBe(1);
    expect(component.suggestions()[0].name).toBe('Alba');
  });

  it('should show no suggestions for empty query', () => {
    component.onInput('');
    expect(component.suggestions().length).toBe(0);
  });

  it('should open dropdown on input', () => {
    component.onInput('mar');
    expect(component.isOpen()).toBeTrue();
  });

  it('should close dropdown and load player on select', () => {
    component.selectPlayer(mockPlayers[0]);
    expect(component.isOpen()).toBeFalse();
    expect(mockGameData.load).toHaveBeenCalledWith('game-data.mock.json');
    expect(mockAnalytics.search).toHaveBeenCalledWith('Alba');
  });

  it('should clear search and reload default', () => {
    component.onInput('marco');
    component.clearSearch();
    expect(component.query()).toBe('');
    expect(mockGameData.load).toHaveBeenCalledWith('game-data.mock.json');
    expect(mockAnalytics.clearSearch).toHaveBeenCalled();
  });

  it('should return correct badge variant per play style', () => {
    expect(component.getPlayStyleVariant('Completionist')).toBe('success');
    expect(component.getPlayStyleVariant('Speedrunner')).toBe('info');
    expect(component.getPlayStyleVariant('Manipulator')).toBe('danger');
    expect(component.getPlayStyleVariant('Balanced')).toBe('warning');
  });

  it('should limit suggestions to 6', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      ({ ...mockPlayers[0], id: `p${i}`, name: `Alba${i}` }));
    (mockAnalytics.players as any).set(many);
    component.onInput('alba');
    expect(component.suggestions().length).toBeLessThanOrEqual(6);
  });
});