import { Component, inject, computed, signal } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { AchievementBadgeComponent } from '../../molecules/achievement-badge/achievement-badge.component';
import { Achievement } from '../../../core/models/game-data.model';

type FilterMode = 'all' | 'unlocked' | 'locked';

@Component({
  selector: 'df-achievements-grid',
  standalone: true,
  imports: [AchievementBadgeComponent],
  templateUrl: './achievements-grid.component.html',
  styleUrls: ['./achievements-grid.component.scss']
})
export class AchievementsGridComponent {
  private gameData = inject(GameDataService);

  readonly filterMode = signal<FilterMode>('all');
  readonly showSecrets = signal<boolean>(false);

  readonly filterOptions: FilterMode[] = ['all', 'unlocked', 'locked'];

  readonly allAchievements = this.gameData.achievements;
  readonly progress = this.gameData.achievementProgress;

  readonly publicAchievements = computed(() =>
    this.allAchievements().filter(a => !a.secret)
  );

  readonly secretAchievements = computed(() =>
    this.allAchievements().filter(a => a.secret)
  );

  readonly filtered = computed<Achievement[]>(() => {
    const mode = this.filterMode();
    const all = this.publicAchievements();
    if (mode === 'unlocked') return all.filter(a => a.unlocked);
    if (mode === 'locked')   return all.filter(a => !a.unlocked);
    return all;
  });

  readonly unlockedPublicCount = computed(() =>
    this.publicAchievements().filter(a => a.unlocked).length
  );

  readonly unlockedSecretCount = computed(() =>
    this.secretAchievements().filter(a => a.unlocked).length
  );

  setFilter(mode: FilterMode): void {
    this.filterMode.set(mode);
  }

  toggleSecrets(): void {
    this.showSecrets.update(v => !v);
  }
}