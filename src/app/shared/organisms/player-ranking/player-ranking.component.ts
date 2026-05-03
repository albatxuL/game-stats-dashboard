import { Component, inject, computed } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { GameDataService } from '../../../core/services/game-data.service';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'df-player-ranking',
  standalone: true,
  imports: [ProgressBarComponent, BadgeComponent],
  templateUrl: './player-ranking.component.html',
  styleUrls: ['./player-ranking.component.scss']
})
export class PlayerRankingComponent {
  private analytics = inject(AnalyticsService);
  readonly gameData  = inject(GameDataService);

  readonly currentPlayer = computed(() => {
    const name = this.gameData.player()?.name;
    return this.analytics.players().find(p => p.name === name) ?? null;
  });

  readonly topPlayers = this.analytics.topPlayers;

  readonly percentiles = computed(() => {
    const p = this.currentPlayer();
    if (!p) return null;
    return p.percentiles;
  });

  // IBM DS: Z-score for reputation vs population
  readonly reputationZScore = computed(() => {
    const p = this.currentPlayer();
    const agg = this.analytics.aggregate();
    if (!p || !agg) return null;
    return this.analytics.zScore(p.reputation, agg.avgReputation, agg.stdDevSessionDuration / 60);
  });

  readonly playStyle = computed(() => this.currentPlayer()?.playStyle ?? null);

  getPercentileLabel(pct: number): string {
    if (pct >= 90) return 'Top 10%';
    if (pct >= 75) return 'Top 25%';
    if (pct >= 50) return 'Above avg';
    if (pct >= 25) return 'Below avg';
    return 'Bottom 25%';
  }

  getPercentileVariant(pct: number): 'success' | 'warning' | 'danger' | 'muted' {
    if (pct >= 75) return 'success';
    if (pct >= 40) return 'warning';
    if (pct >= 20) return 'danger';
    return 'muted';
  }
}