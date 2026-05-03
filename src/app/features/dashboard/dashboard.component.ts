import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameDataService }  from '../../core/services/game-data.service';
import { AnalyticsService } from '../../core/services/analytics.service';

import { CaseSelectorComponent }     from '../../shared/organisms/case-selector/case-selector.component';
import { SummaryCardsComponent }     from '../../shared/organisms/summary-cards/summary-cards.component';
import { NotebookProgressComponent } from '../../shared/organisms/notebook-progress/notebook-progress.component';
import { RadarChartComponent }       from '../../shared/organisms/radar-chart/radar-chart.component';
import { ReputationBarsComponent }   from '../../shared/organisms/reputation-bars/reputation-bars.component';
import { DecisionsPanelComponent }   from '../../shared/organisms/decisions-panel/decisions-panel.component';
import { SessionTimelineComponent }  from '../../shared/organisms/session-timeline/session-timeline.component';
import { AchievementsGridComponent } from '../../shared/organisms/achievements-grid/achievements-grid.component';
import { PlayerRankingComponent }    from '../../shared/organisms/player-ranking/player-ranking.component';

@Component({
  selector: 'df-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CaseSelectorComponent,
    SummaryCardsComponent,
    NotebookProgressComponent,
    RadarChartComponent,
    ReputationBarsComponent,
    DecisionsPanelComponent,
    SessionTimelineComponent,
    AchievementsGridComponent,
    PlayerRankingComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  readonly gameData  = inject(GameDataService);
  readonly analytics = inject(AnalyticsService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);

  readonly isLoading = this.gameData.isLoading;
  readonly hasError  = this.gameData.hasError;
  readonly player    = this.gameData.player;

  ngOnInit(): void {
    // Ensure analytics index is loaded for percentile ranking
    if (!this.analytics.index()) this.analytics.load();

    // Load the player file indicated by the route param
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      const playerEntry = this.analytics.players()
        .find(p => p.id === playerId);

      if (playerEntry) {
        this.gameData.load(playerEntry.dataFile);
      } else {
        // Analytics not loaded yet — wait and retry
        const sub = this.analytics.index()
          ? this.waitForIndex(playerId)
          : this.gameData.load();
      }
    } else {
      // Fallback: load default
      this.gameData.load();
    }
  }

  private waitForIndex(playerId: string): void {
    // Poll until index loads, then load player file
    const interval = setInterval(() => {
      const entry = this.analytics.players().find(p => p.id === playerId);
      if (entry) {
        clearInterval(interval);
        this.gameData.load(entry.dataFile);
      } else if (this.analytics.hasError()) {
        clearInterval(interval);
        this.gameData.load(); // fallback to default
      }
    }, 100);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}