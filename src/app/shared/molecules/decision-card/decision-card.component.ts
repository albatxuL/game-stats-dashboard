import { Component, input, computed } from '@angular/core';
import { Decision } from '../../../core/models/game-data.model';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'df-decision-card',
  standalone: true,
  imports: [BadgeComponent],
  templateUrl: './decision-card.component.html',
  styleUrls: ['./decision-card.component.scss']
})
export class DecisionCardComponent {
  readonly decision = input.required<Decision>();

  readonly choiceIcon = computed(() =>
    this.decision().choice === 'hidden' ? '🤐' : '📢'
  );

  readonly choiceLabel = computed(() =>
    this.decision().choice === 'hidden' ? 'Hidden' : 'Revealed'
  );

  readonly badgeVariant = computed(() => {
    const v = this.decision().effectValence;
    if (v === 'positive') return 'success' as const;
    if (v === 'negative') return 'danger' as const;
    return 'warning' as const;
  });

  readonly valenceIcon = computed(() => {
    const v = this.decision().effectValence;
    if (v === 'positive') return '↑';
    if (v === 'negative') return '↓';
    return '~';
  });
}