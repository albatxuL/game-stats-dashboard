import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameDataService } from './game-data.service';
import { GameData } from '../models/game-data.model';

const mockData: Partial<GameData> = {
  player: {
    id: 'player_001', name: 'Alba', totalPlaytimeSeconds: 18420,
    totalCasesCompleted: 4, rank: 'Senior Detective', rankLevel: 3, rankHistory: []
  },
  cases: [],
  achievements: [
    { id: 'test_1', name: 'Test', description: '', icon: '🔍', secret: false, unlocked: true, unlockedAtCase: 'case_01', condition: '' },
    { id: 'test_2', name: 'Secret', description: '', icon: '🤐', secret: true, unlocked: false, unlockedAtCase: null, condition: '' }
  ],
  reputation: { general: 74, accuracy: 88, discretion: 55, relationships: 62, history: [] },
  globalStats: {
    totalLiesDiscovered: 14, totalLiesTotal: 18, totalCluesFound: 16,
    totalCluesAvailable: 18, totalSuspectsInterviewed: 34, totalDecisionsMade: 10,
    totalHidden: 4, totalRevealed: 6, positiveCarryoverEffects: 4,
    negativeCarryoverEffects: 2, notebookAverage: 85.75
  }
};

describe('GameDataService', () => {
  let service: GameDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameDataService]
    });
    service = TestBed.inject(GameDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load data and set signal', () => {
    service.load();
    const req = httpMock.expectOne('assets/data/game-data.mock.json');
    req.flush(mockData);
    expect(service.data()).toBeTruthy();
    expect(service.player()?.name).toBe('Alba');
  });

  it('should compute unlocked achievements', () => {
    service.load();
    const req = httpMock.expectOne('assets/data/game-data.mock.json');
    req.flush(mockData);
    expect(service.unlockedAchievements().length).toBe(1);
  });

  it('should compute achievement progress', () => {
    service.load();
    const req = httpMock.expectOne('assets/data/game-data.mock.json');
    req.flush(mockData);
    const progress = service.achievementProgress();
    expect(progress.unlocked).toBe(1);
    expect(progress.total).toBe(2);
    expect(progress.percent).toBe(50);
  });

  it('should select case by id', () => {
    service.selectCase('case_02');
    expect(service.selectedCaseId()).toBe('case_02');
  });

  it('should format duration correctly', () => {
    expect(service.formatDuration(2820)).toBe('47m 00s');
    expect(service.formatDuration(125)).toBe('2m 05s');
  });

  it('should return correct final color', () => {
    expect(service.getFinalColor('A')).toBe('var(--c-green-light)');
    expect(service.getFinalColor('D')).toBe('var(--c-red-light)');
  });
});