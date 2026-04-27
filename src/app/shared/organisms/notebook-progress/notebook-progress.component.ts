import { Component, inject, computed } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';

@Component({
  selector: 'df-notebook-progress',
  standalone: true,
  imports: [ProgressBarComponent],
  templateUrl: './notebook-progress.component.html',
  styleUrls: ['./notebook-progress.component.scss']
})
export class NotebookProgressComponent {
  private gameData = inject(GameDataService);
  readonly c = this.gameData.selectedCase;

  readonly notebook = computed(() => this.c()?.notebook ?? null);

  readonly charPct = computed(() => {
    const chars = this.notebook()?.sections.characters;
    if (!chars) return 0;
    return Math.round((chars.pagesUnlocked / (chars.pages + 1)) * 100); // +1 for list page
  });

  readonly cluesPct = computed(() => {
    const clues = this.notebook()?.sections.clues;
    if (!clues) return 0;
    return Math.round((clues.pagesUnlocked / clues.pages) * 100);
  });

  readonly caseFilePct = computed(() => {
    const cf = this.notebook()?.sections.caseFile;
    if (!cf) return 0;
    return Math.round((cf.sectionsComplete / cf.sectionsTotal) * 100);
  });

  readonly unlockBreakdown = computed(() => {
    const chars = this.notebook()?.sections.characters;
    if (!chars) return [];
    const { talking, showingClue, discoveringLie } = chars.unlockedBy;
    const total = talking + showingClue + discoveringLie;
    return [
      { label: 'Talking', value: talking, pct: Math.round((talking / total) * 100) },
      { label: 'Clue shown', value: showingClue, pct: Math.round((showingClue / total) * 100) },
      { label: 'Lie found', value: discoveringLie, pct: Math.round((discoveringLie / total) * 100) },
    ];
  });
}