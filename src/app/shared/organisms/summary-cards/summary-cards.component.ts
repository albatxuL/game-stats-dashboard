import { Component, inject, computed } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { StatCardComponent } from '../../molecules/stat-card/stat-card.component';

@Component({
  selector: 'df-summary-cards',
  standalone: true,
  imports: [StatCardComponent],
  templateUrl: './summary-cards.component.html',
  styleUrls: ['./summary-cards.component.scss']
})
export class SummaryCardsComponent {
  private gameData = inject(GameDataService);

  readonly c = this.gameData.selectedCase;
  readonly reputation = this.gameData.reputation;

  readonly duration = computed(() => {
    const s = this.c()?.sessionDurationSeconds ?? 0;
    return this.gameData.formatDuration(s);
  });

  readonly cluesLabel = computed(() => {
    const c = this.c();
    if (!c) return '—';
    const found = c.clues.collectible.found + c.clues.interactable.found;
    const total = c.clues.collectible.total + c.clues.interactable.total;
    return `${found} / ${total}`;
  });

  readonly suspectsLabel = computed(() => {
    const c = this.c();
    if (!c) return '—';
    return `${c.suspects.interviewed} / ${c.suspects.total}`;
  });

  readonly notebookPct = computed(() => {
    const pct = this.c()?.notebook.completionPercent ?? 0;
    return `${pct}%`;
  });

  readonly reportBadge = computed(() => {
    const c = this.c();
    if (!c) return { label: '—', variant: 'muted' as const };
    const { murdererCorrect, accompliceCorrect } = c.report;
    if (murdererCorrect && accompliceCorrect) return { label: 'Perfect', variant: 'success' as const };
    if (murdererCorrect) return { label: 'Partial', variant: 'warning' as const };
    return { label: 'Incorrect', variant: 'danger' as const };
  });

  readonly finalLabel = computed(() => {
    const c = this.c();
    return c ? `Final ${c.finalId}` : '—';
  });

  readonly finalVariant = computed(() => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
      A: 'success', B: 'warning', C: 'warning', D: 'danger'
    };
    return map[this.c()?.finalId ?? ''] ?? 'muted';
  });

  readonly repGeneral = computed(() => `${this.reputation()?.general ?? 0}`);
}