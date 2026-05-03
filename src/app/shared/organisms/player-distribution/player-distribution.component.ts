import { Component, inject, computed, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../../core/services/analytics.service';

type MetricKey = 'reputation' | 'notebook' | 'session';

@Component({
  selector: 'df-player-distribution',
  standalone: true,
  templateUrl: './player-distribution.component.html',
  styleUrls: ['./player-distribution.component.scss']
})
export class PlayerDistributionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('distCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly analytics = inject(AnalyticsService);
  private chart: any = null;
  private sub?: Subscription;

  activeMetric: MetricKey = 'reputation';

  readonly metrics: Array<{ key: MetricKey; label: string }> = [
    { key: 'reputation', label: 'Reputation' },
    { key: 'notebook',   label: 'Notebook %' },
    { key: 'session',    label: 'Session time' },
  ];

  // IBM DS: histogram data per metric
  readonly chartDatasets = computed(() => {
    const agg = this.analytics.aggregate();
    if (!agg) return null;
    return {
      reputation: {
        labels: agg.reputationDistribution.map(b => b.bin),
        data:   agg.reputationDistribution.map(b => b.count),
        color:  'rgba(200, 149, 42, 0.7)',
        border: 'rgba(200, 149, 42, 1)',
      },
      notebook: {
        labels: agg.notebookDistribution.map(b => b.bin),
        data:   agg.notebookDistribution.map(b => b.count),
        color:  'rgba(42, 95, 255, 0.7)',
        border: 'rgba(42, 95, 255, 1)',
      },
      session: {
        labels: agg.sessionDurationDistribution.map(b => b.bin),
        data:   agg.sessionDurationDistribution.map(b => b.count),
        color:  'rgba(90, 170, 106, 0.7)',
        border: 'rgba(90, 170, 106, 1)',
      }
    };
  });

  private agg$ = toObservable(this.analytics.aggregate);

  async ngAfterViewInit(): Promise<void> {
    const { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } =
      await import('chart.js');
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const initial = this.getDataset(this.activeMetric);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: initial?.labels ?? [],
        datasets: [{
          label: 'Players',
          data:  initial?.data ?? [],
          backgroundColor: initial?.color ?? 'rgba(200,149,42,0.7)',
          borderColor:     initial?.border ?? 'rgba(200,149,42,1)',
          borderWidth: 1,
          borderRadius: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeInOutQuart' },
        scales: {
          x: {
            grid:  { color: 'rgba(42,38,32,0.6)' },
            ticks: { font: { family: "'JetBrains Mono', monospace", size: 10 }, color: 'rgba(154,144,128,1)' }
          },
          y: {
            grid:  { color: 'rgba(42,38,32,0.6)' },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              color: 'rgba(154,144,128,1)',
              stepSize: 1,
              precision: 0
            },
            beginAtZero: true,
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1814',
            borderColor: '#2a2620',
            borderWidth: 1,
            titleColor: '#e8e0d0',
            bodyColor: '#9a9080',
            titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
            bodyFont:  { family: "'JetBrains Mono', monospace", size: 11 },
            callbacks: {
              label: (ctx: any) => ` ${ctx.raw} player${ctx.raw !== 1 ? 's' : ''}`
            }
          }
        }
      }
    });

    this.sub = this.agg$.subscribe(() => {
      if (this.chart) this.switchMetric(this.activeMetric);
    });
  }

  switchMetric(key: MetricKey): void {
    this.activeMetric = key;
    if (!this.chart) return;
    const dataset = this.getDataset(key);
    if (!dataset) return;
    this.chart.data.labels = dataset.labels;
    this.chart.data.datasets[0].data = dataset.data;
    this.chart.data.datasets[0].backgroundColor = dataset.color;
    this.chart.data.datasets[0].borderColor = dataset.border;
    this.chart.update('active');
  }

  private getDataset(key: MetricKey) {
    return this.chartDatasets()?.[key] ?? null;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}