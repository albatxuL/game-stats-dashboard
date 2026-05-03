import { Component, inject, computed } from '@angular/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CorrelationCell } from '../../../core/models/analytics.model';

@Component({
  selector: 'df-correlation-heatmap',
  standalone: true,
  templateUrl: './correlation-heatmap.component.html',
  styleUrls: ['./correlation-heatmap.component.scss']
})
export class CorrelationHeatmapComponent {
  private analytics = inject(AnalyticsService);

  readonly cells = this.analytics.correlationMatrix;

  // IBM DS: map correlation value to colour intensity
  getCellColor(value: number): string {
    const abs = Math.abs(value);
    const alpha = 0.15 + abs * 0.7;
    if (value > 0) return `rgba(90, 170, 106, ${alpha})`;   // green = positive
    if (value < 0) return `rgba(196, 74,  74,  ${alpha})`;  // red   = negative
    return 'rgba(90, 82, 72, 0.15)';
  }

  getTextColor(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 0.5) return 'var(--c-text-primary)';
    return 'var(--c-text-secondary)';
  }

  getStrengthLabel(cell: CorrelationCell): string {
    const sign = cell.direction === 'positive' ? '+' : cell.direction === 'negative' ? '−' : '';
    return `${sign}${cell.strength}`;
  }

  trackCell(i: number, cell: CorrelationCell): string {
    return `${cell.row}-${cell.col}`;
  }
}