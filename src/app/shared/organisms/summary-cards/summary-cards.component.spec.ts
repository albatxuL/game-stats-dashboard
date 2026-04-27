import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCardsComponent } from './summary-cards.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal, computed } from '@angular/core';

const mockCase = {
  id: 'case_01', title: 'Hive & Hopper', finalId: 'A', finalLabel: 'Ascenso confirmado',
  sessionDurationSeconds: 2820,
  clues: { collectible: { found: 2, total: 2 }, interactable: { found: 2, total: 2 }, shownToSuspects: 3 },
  suspects: { total: 7, interviewed: 7, liesDiscovered: 2, liesTotal: 3 },
  notebook: { completionPercent: 87, sections: {} as any },
  report: { murdererCorrect: true, accompliceCorrect: true, hiddenInfoCount: 1, revealedInfoCount: 1 }
} as any;

describe('SummaryCardsComponent', () => {
  let fixture: ComponentFixture<SummaryCardsComponent>;
  let component: SummaryCardsComponent;

  beforeEach(async () => {
    const mockService = {
      selectedCase: signal(mockCase),
      reputation: signal({ general: 82, accuracy: 90, discretion: 50, relationships: 65, history: [] }),
      formatDuration: (s: number) => `${Math.floor(s/60)}m ${(s%60).toString().padStart(2,'0')}s`
    };

    await TestBed.configureTestingModule({
      imports: [SummaryCardsComponent],
      providers: [{ provide: GameDataService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should compute duration', () => {
    expect(component.duration()).toBe('47m 00s');
  });

  it('should compute clues label', () => {
    expect(component.cluesLabel()).toBe('4 / 4');
  });

  it('should compute notebook percent', () => {
    expect(component.notebookPct()).toBe('87%');
  });

  it('should compute perfect report badge', () => {
    expect(component.reportBadge().label).toBe('Perfect');
    expect(component.reportBadge().variant).toBe('success');
  });

  it('should compute Final A variant as success', () => {
    expect(component.finalVariant()).toBe('success');
  });
});