import { Component, inject, computed } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { StatCardComponent } from '../../molecules/stat-card/stat-card.component';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';

@Component({
  selector: 'df-global-stats-overview',
  standalone: true,
  imports: [StatCardComponent, ProgressBarComponent],
  templateUrl: './global-stats-overview.component.html',
  styleUrls: ['./global-stats-overview.component.scss']
})
export class GlobalStatsOverviewComponent {
  private analytics = inject(AnalyticsService);

  readonly agg = this.analytics.aggregate;
  readonly repStats  = this.analytics.reputationStats;
  readonly nbStats   = this.analytics.notebookStats;
  readonly segments  = this.analytics.segmentChart;
  readonly outliers  = this.analytics.outliers;

  // IBM DS: Format avg session duration
  readonly avgDuration = computed(() => {
    const s = this.agg()?.avgSessionDuration ?? 0;
    return `${Math.floor(s / 60)}m`;
  });

  readonly medianDuration = computed(() => {
    const s = this.agg()?.medianSessionDuration ?? 0;
    return `${Math.floor(s / 60)}m`;
  });

  // IBM DS: hidden vs revealed ratio as percentage
  readonly hiddenRate = computed(() =>
    Math.round((this.agg()?.hiddenDecisionRate ?? 0) * 100)
  );

  // IBM DS: most common final outcome
  readonly topFinal = computed(() => {
    const dist = this.agg()?.finalDistribution;
    if (!dist) return '—';
    return Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  });

  readonly finalEntries = computed(() => {
    const dist = this.agg()?.finalDistribution ?? {};
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    return Object.entries(dist).map(([k, v]) => ({
      label: `Final ${k}`,
      count: v,
      pct: Math.round((v / total) * 100)
    }));
  });

  segmentColor(segment: string): 'green' | 'blue' | 'red' | 'amber' {
    const map: Record<string, 'green' | 'blue' | 'red' | 'amber'> = {
      Completionist: 'green',
      Speedrunner:   'blue',
      Manipulator:   'red',
      Balanced:      'amber'
    };
    return map[segment] ?? 'amber';
  }
}