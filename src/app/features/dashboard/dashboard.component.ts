import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { GameDataService } from '../../core/services/game-data.service';
import { AnalyticsService } from '../../core/services/analytics.service';

import { CaseSelectorComponent }     from '../../shared/organisms/case-selector/case-selector.component';
import { SummaryCardsComponent }      from '../../shared/organisms/summary-cards/summary-cards.component';
import { NotebookProgressComponent }  from '../../shared/organisms/notebook-progress/notebook-progress.component';
import { RadarChartComponent }        from '../../shared/organisms/radar-chart/radar-chart.component';
import { ReputationBarsComponent }    from '../../shared/organisms/reputation-bars/reputation-bars.component';
import { DecisionsPanelComponent }    from '../../shared/organisms/decisions-panel/decisions-panel.component';
import { SessionTimelineComponent }   from '../../shared/organisms/session-timeline/session-timeline.component';
import { AchievementsGridComponent }  from '../../shared/organisms/achievements-grid/achievements-grid.component';
import { PlayerRankingComponent }     from '../../shared/organisms/player-ranking/player-ranking.component';

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
export class DashboardComponent implements OnInit, OnDestroy {
  readonly gameData  = inject(GameDataService);
  readonly analytics = inject(AnalyticsService);
  private  route     = inject(ActivatedRoute);
  private  router    = inject(Router);

  readonly isLoading = this.gameData.isLoading;
  readonly hasError  = this.gameData.hasError;
  readonly player    = this.gameData.player;

  private players$   = toObservable(this.analytics.players);
  private sub?: Subscription;

  ngOnInit(): void {
    if (!this.analytics.index()) this.analytics.load();

    const playerId = this.route.snapshot.paramMap.get('id');

    if (!playerId) {
      this.gameData.load();
      return;
    }

    // Use RxJS combineLatest to wait for analytics to load,
    // then resolve the player file — no polling, no setInterval.
    this.sub = combineLatest([
      this.players$.pipe(
        filter(players => players.length > 0),
        take(1)
      )
    ]).subscribe(([players]) => {
      const entry = players.find(p => p.id === playerId);
      if (entry) {
        this.gameData.load(entry.dataFile);
      } else {
        console.warn(`[Dashboard] Player ${playerId} not found — loading default`);
        this.gameData.load();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}