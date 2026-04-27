import { Component, inject, OnInit } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';

// Organisms
import { CaseSelectorComponent } from '../../../shared/organisms/case-selector/case-selector.component';
import { SummaryCardsComponent } from '../../../shared/organisms/summary-cards/summary-cards.component';
import { NotebookProgressComponent } from '../../../shared/organisms/notebook-progress/notebook-progress.component';
import { RadarChartComponent } from '../../../shared/organisms/radar-chart/radar-chart.component';
import { ReputationBarsComponent } from '../../../shared/organisms/reputation-bars/reputation-bars.component';
import { DecisionsPanelComponent } from '../../../shared/organisms/decisions-panel/decisions-panel.component';
import { SessionTimelineComponent } from '../../../shared/organisms/session-timeline/session-timeline.component';
import { AchievementsGridComponent } from '../../../shared/organisms/achievements-grid/achievements-grid.component';


@Component({
  selector: 'df-dashboard',
  standalone: true,
  imports: [
    CaseSelectorComponent,
    SummaryCardsComponent,
    NotebookProgressComponent,
    RadarChartComponent,
    ReputationBarsComponent,
    DecisionsPanelComponent,
    SessionTimelineComponent,
    AchievementsGridComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  readonly gameData = inject(GameDataService);

  readonly isLoading = this.gameData.isLoading;
  readonly hasError = this.gameData.hasError;
  readonly player = this.gameData.player;

  ngOnInit(): void {
    this.gameData.load();
  }
}