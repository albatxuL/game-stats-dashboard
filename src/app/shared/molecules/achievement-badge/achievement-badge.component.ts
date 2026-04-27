import { Component, input, computed } from '@angular/core';
import { Achievement } from '../../../core/models/game-data.model';

@Component({
  selector: 'df-achievement-badge',
  standalone: true,
  templateUrl: './achievement-badge.component.html',
  styleUrls: ['./achievement-badge.component.scss']
})
export class AchievementBadgeComponent {
  readonly achievement = input.required<Achievement>();
  readonly showDescription = input<boolean>(false);

  readonly isLocked = computed(() => !this.achievement().unlocked);
  readonly isSecret = computed(() => this.achievement().secret);

  readonly displayIcon = computed(() => {
    if (this.isLocked() && this.isSecret()) return '?';
    return this.achievement().icon;
  });

  readonly displayName = computed(() => {
    if (this.isLocked() && this.isSecret()) return '???';
    return this.achievement().name;
  });
}