import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PlayerSummary } from '../../core/models/analytics.model';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';

import { GlobalStatsOverviewComponent } from '../../shared/organisms/global-stats-overview/global-stats-overview.component';
import { CorrelationHeatmapComponent }  from '../../shared/organisms/correlation-heatmap/correlation-heatmap.component';
import { PlayerDistributionComponent }  from '../../shared/organisms/player-distribution/player-distribution.component';
import { PlayerRankingComponent }       from '../../shared/organisms/player-ranking/player-ranking.component';

@Component({
  selector: 'df-global-overview',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    BadgeComponent,
    GlobalStatsOverviewComponent,
    CorrelationHeatmapComponent,
    PlayerDistributionComponent,
    PlayerRankingComponent,
  ],
  templateUrl: './global-overview.component.html',
  styleUrls: ['./global-overview.component.scss']
})
export class GlobalOverviewComponent implements OnInit {
  readonly analytics = inject(AnalyticsService);
  private  router    = inject(Router);

  readonly isLoading = this.analytics.isLoading;
  readonly hasError  = this.analytics.hasError;
  readonly agg       = this.analytics.aggregate;
  readonly players   = this.analytics.players;
  readonly searchQuery = this.analytics.searchQuery;

  // ── Search suggestions ──
  readonly suggestions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (q.length < 1) return [];
    return this.players().filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
  });

  readonly abandonedCount = computed(() => 
    this.agg()?.dropoutCount ?? 0
  );

  // ── Pagination ──
  readonly pageSize = 6;
  readonly currentPage = signal(0);

  readonly paginatedPlayers = computed(() => {
    const all = this.players();
    const start = this.currentPage() * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.players().length / this.pageSize)
  );

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  ngOnInit(): void {
    if (!this.analytics.index()) this.analytics.load();
  }

  onSearchInput(value: string): void {
    this.analytics.search(value);
    this.currentPage.set(0); // reset pagination on search
  }

  navigateToPlayer(player: PlayerSummary): void {
    this.analytics.clearSearch();
    this.router.navigate(['/player', player.id]);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  prevPage(): void {
    if (this.currentPage() > 0) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) this.currentPage.update(p => p + 1);
  }

  minOf(a: number, b: number): number { return Math.min(a, b); }

  getPlayStyleVariant(style: string): 'success' | 'info' | 'danger' | 'warning' {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warning'> = {
      Completionist: 'success',
      Speedrunner:   'info',
      Manipulator:   'danger',
      Balanced:      'warning'
    };
    return map[style] ?? 'warning';
  }
}