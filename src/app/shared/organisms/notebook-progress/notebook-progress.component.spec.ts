import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotebookProgressComponent } from './notebook-progress.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';

const mockCase = {
  notebook: {
    completionPercent: 87,
    sections: {
      characters: { pages: 7, pagesUnlocked: 7, listPageUnlocked: true, totalUnlockEvents: 12, unlockedBy: { talking: 7, showingClue: 3, discoveringLie: 2 } },
      clues: { pages: 4, pagesUnlocked: 4 },
      caseFile: { pages: 2, pagesUnlocked: 2, sectionsComplete: 2, sectionsTotal: 3 }
    }
  }
} as any;

describe('NotebookProgressComponent', () => {
  let fixture: ComponentFixture<NotebookProgressComponent>;
  let component: NotebookProgressComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotebookProgressComponent],
      providers: [{ provide: GameDataService, useValue: { selectedCase: signal(mockCase) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(NotebookProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should compute clues pct', () => {
    expect(component.cluesPct()).toBe(100);
  });

  it('should compute case file pct', () => {
    expect(component.caseFilePct()).toBe(67);
  });

  it('should compute unlock breakdown with 3 items', () => {
    expect(component.unlockBreakdown().length).toBe(3);
  });

  it('should show completion percent', () => {
    expect(fixture.nativeElement.textContent).toContain('87');
  });
});