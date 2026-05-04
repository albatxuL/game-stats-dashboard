// ============================================================
// ScatterPlotComponent — IBM DS: Visualise correlation.
// X axis = hiddenDecisionRate, Y axis = reputation.
// Each point = one player, coloured by play style.
// Shows the negative correlation between hiding info and rep.
// ============================================================
import {
  Component, inject, ViewChild, ElementRef,
  AfterViewInit, OnDestroy
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';

const STYLE_COLORS: Record<string, string> = {
  Completionist: 'rgba(90,  170, 106, 0.85)',
  Speedrunner:   'rgba(74,  122, 191, 0.85)',
  Manipulator:   'rgba(196,  74,  74, 0.85)',
  Balanced:      'rgba(200, 149,  42, 0.85)',
};
const STYLE_BORDER: Record<string, string> = {
  Completionist: 'rgba(90,  170, 106, 1)',
  Speedrunner:   'rgba(74,  122, 191, 1)',
  Manipulator:   'rgba(196,  74,  74, 1)',
  Balanced:      'rgba(200, 149,  42, 1)',
};

@Component({
  selector: 'df-scatter-plot',
  standalone: true,
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss']
})
export class ScatterPlotComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scatterCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private analytics = inject(AnalyticsService);
  private router    = inject(Router);
  private chart: any = null;
  private sub?: Subscription;

  private scatter$ = toObservable(this.analytics.scatterData);

  readonly corrValue = () =>
    this.analytics.aggregate()?.correlations['hiddenDecisions_vs_reputation'] ?? 0;

  async ngAfterViewInit(): Promise<void> {
    const {
      Chart, ScatterController, PointElement,
      LinearScale, Tooltip, Legend
    } = await import('chart.js');
    Chart.register(ScatterController, PointElement, LinearScale, Tooltip, Legend);

    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const initial = this.analytics.scatterData();

    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: this.buildDatasets(initial),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        onClick: (_event, elements) => {
          if (!elements.length) return;
          const el = elements[0];
          const ds = this.chart.data.datasets[el.datasetIndex];
          const pt = ds.data[el.index] as any;
          if (pt.id) this.router.navigate(['/player', pt.id]);
        },
        scales: {
          x: {
            title: {
              display: true, text: 'Hidden Decision Rate',
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: 'rgba(154,144,128,1)',
            },
            min: 0, max: 1,
            grid:  { color: 'rgba(42,38,32,0.6)' },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              color: 'rgba(154,144,128,1)',
              callback: (v: any) => `${Math.round(v * 100)}%`,
            }
          },
          y: {
            title: {
              display: true, text: 'Reputation',
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: 'rgba(154,144,128,1)',
            },
            min: 0, max: 100,
            grid:  { color: 'rgba(42,38,32,0.6)' },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              color: 'rgba(154,144,128,1)',
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              color: 'rgba(154,144,128,1)',
              boxWidth: 10, boxHeight: 10, padding: 16,
            }
          },
          tooltip: {
            backgroundColor: '#1a1814',
            borderColor: '#2a2620',
            borderWidth: 1,
            titleColor: '#e8e0d0',
            bodyColor: '#9a9080',
            titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
            bodyFont:  { family: "'JetBrains Mono', monospace", size: 11 },
            callbacks: {
              title: (items: any[]) => {
                const pt = items[0].raw as any;
                return pt.label ?? '';
              },
              label: (item: any) => {
                const pt = item.raw as any;
                return [
                  ` Hidden: ${Math.round(pt.x * 100)}%`,
                  ` Reputation: ${pt.y}`,
                  ` Style: ${pt.style}`,
                  pt.isOutlier ? ' ⚠ Outlier' : '',
                ].filter(Boolean);
              }
            }
          }
        }
      }
    });

    this.sub = this.scatter$.subscribe(data => {
      if (!this.chart) return;
      this.chart.data.datasets = this.buildDatasets(data);
      this.chart.update('active');
    });
  }

  private buildDatasets(data: ReturnType<typeof this.analytics.scatterData>) {
    const groups = new Map<string, any[]>();
    for (const p of data) {
      const style = p.style ?? 'Balanced';
      if (!groups.has(style)) groups.set(style, []);
      groups.get(style)!.push({
        x:         p.x,
        y:         p.y,
        label:     p.label,
        style:     p.style,
        isOutlier: p.isOutlier,
        id:        (this.analytics.players().find(pl => pl.name === p.label))?.id,
      });
    }
    return Array.from(groups.entries()).map(([style, points]) => ({
      label:           style,
      data:            points,
      backgroundColor: STYLE_COLORS[style]  ?? 'rgba(154,144,128,0.7)',
      borderColor:     STYLE_BORDER[style]  ?? 'rgba(154,144,128,1)',
      borderWidth:     1.5,
      pointRadius:     (ctx: any) =>
        (ctx.raw as any)?.isOutlier ? 8 : 5,
      pointHoverRadius: 8,
      pointStyle:      (ctx: any) =>
        (ctx.raw as any)?.isOutlier ? 'triangle' : 'circle',
    }));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}