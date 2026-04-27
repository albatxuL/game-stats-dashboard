import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { GameDataService } from '../../core/services/game-data.service';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let mockService: Partial<GameDataService>;

  beforeEach(async () => {
    mockService = {
      isLoading: signal(false),
      hasError: signal(false),
      player: signal({
        id: 'p1', name: 'Alba', totalPlaytimeSeconds: 18420,
        totalCasesCompleted: 4, rank: 'Senior Detective', rankLevel: 3, rankHistory: []
      }),
      cases: signal([]),
      achievements: signal([]),
      achievementProgress: signal({ unlocked: 0, total: 0, percent: 0 }),
      selectedCase: signal(null),
      selectedCaseId: signal('case_01'),
      reputation: signal(null),
      load: jasmine.createSpy('load'),
      selectCase: jasmine.createSpy('selectCase'),
      formatDuration: (s: number) => `${Math.floor(s / 60)}m`,
      getFinalColor: () => 'var(--c-green-light)',
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [{ provide: GameDataService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should call load on init', () => {
    expect(mockService.load).toHaveBeenCalled();
  });

  it('should show player name when data is loaded', () => {
    expect(fixture.nativeElement.textContent).toContain('Alba');
  });

  it('should show loading state', () => {
    (mockService.isLoading as any).set(true);
    (mockService.player as any).set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');
  });

  it('should show error state', () => {
    (mockService.isLoading as any).set(false);
    (mockService.hasError as any).set(true);
    (mockService.player as any).set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Failed');
  });
});