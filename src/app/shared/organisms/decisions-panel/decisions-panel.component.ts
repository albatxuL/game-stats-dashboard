import { Component, inject, computed } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { DecisionCardComponent } from '../../molecules/decision-card/decision-card.component';

@Component({
  selector: 'df-decisions-panel',
  standalone: true,
  imports: [DecisionCardComponent],
  templateUrl: './decisions-panel.component.html',
  styleUrls: ['./decisions-panel.component.scss']
})
export class DecisionsPanelComponent {
  private gameData = inject(GameDataService);
  readonly c = this.gameData.selectedCase;

  readonly decisions = computed(() => this.c()?.decisions ?? []);
  readonly carryoverEffects = computed(() => this.c()?.carryoverEffects ?? []);

  readonly hiddenCount = computed(() =>
    this.decisions().filter(d => d.choice === 'hidden').length
  );

  readonly revealedCount = computed(() =>
    this.decisions().filter(d => d.choice === 'revealed').length
  );

  readonly positiveCount = computed(() =>
    this.decisions().filter(d => d.effectValence === 'positive').length
  );

  readonly negativeCount = computed(() =>
    this.decisions().filter(d => d.effectValence === 'negative').length
  );
}