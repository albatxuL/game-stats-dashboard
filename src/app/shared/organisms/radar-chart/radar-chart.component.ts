import {
  Component, inject,
  ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { GameDataService } from '../../../core/services/game-data.service';

@Component({
  selector: 'df-radar-chart',
  standalone: true,
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.scss']
})
export class RadarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('radarCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private gameData = inject(GameDataService);
  private chart: any = null;
  private sub?: Subscription;

  private selectedCase$ = toObservable(this.gameData.selectedCase);

  private computeData(c: any): number[] | null {
    if (!c) return null;
    const chars = c.notebook.sections.characters;
    const clues = c.notebook.sections.clues;
    const cf    = c.notebook.sections.caseFile;
    return [
      Math.round((chars.pagesUnlocked / (chars.pages + 1))                  * 100),
      Math.round((clues.pagesUnlocked  / clues.pages)                       * 100),
      Math.round((cf.sectionsComplete  / cf.sectionsTotal)                  * 100),
      Math.round((c.suspects.liesDiscovered / (c.suspects.liesTotal || 1)) * 100),
      Math.round((c.roomActions.discovered  / c.roomActions.total)          * 100),
    ];
  }

  async ngAfterViewInit(): Promise<void> {
    // Import ALL required pieces — RadarController is what was missing
    const {
      Chart,
      RadarController,   // ← the missing piece
      RadialLinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip
    } = await import('chart.js');

    Chart.register(
      RadarController,   // ← register it
      RadialLinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip
    );

    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Characters', 'Clues', 'Case File', 'Lies Found', 'Rooms'],
        datasets: [{
          label: 'Coverage',
          data: this.computeData(this.gameData.selectedCase()) ?? [0, 0, 0, 0, 0],
          backgroundColor: 'rgba(200, 149, 42, 0.15)',
          borderColor:      'rgba(200, 149, 42, 0.8)',
          borderWidth: 1.5,
          pointBackgroundColor: 'rgba(232, 184, 75, 1)',
          pointBorderColor:     '#0d0c0a',
          pointHoverBackgroundColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        animation: { duration: 500, easing: 'easeInOutQuart' },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false, stepSize: 25 },
            grid:       { color: 'rgba(42, 38, 32, 0.8)', lineWidth: 1 },
            angleLines: { color: 'rgba(42, 38, 32, 0.6)' },
            pointLabels: {
              font:  { family: "'JetBrains Mono', monospace", size: 11 },
              color: 'rgba(154, 144, 128, 1)',
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1814',
            borderColor:     '#2a2620',
            borderWidth: 1,
            titleColor: '#e8e0d0',
            bodyColor:  '#9a9080',
            titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
            bodyFont:  { family: "'JetBrains Mono', monospace", size: 11 },
            callbacks: { label: (ctx: any) => ` ${ctx.raw}% coverage` }
          }
        }
      }
    });

    // Subscribe to case changes only after chart exists
    this.sub = this.selectedCase$.subscribe(c => {
      const data = this.computeData(c);
      if (data && this.chart) {
        this.chart.data.datasets[0].data = data;
        this.chart.update('active');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}