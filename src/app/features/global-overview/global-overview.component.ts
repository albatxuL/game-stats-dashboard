// ============================================================
// GlobalOverviewComponent — Landing page / analytics hub.
//
// URL state: all filters and pagination are synced to query
// params so bookmarks and browser back/forward work correctly.
//
//   /?page=2&style=Manipulator&minRep=60&maxRep=90&cases=4&abandoned=false
// ============================================================
import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PlayerSummary } from '../../core/models/analytics.model';
import { BadgeComponent } from '../../shared/atoms/badge/badge.component';

import { GlobalStatsOverviewComponent }  from '../../shared/organisms/global-stats-overview/global-stats-overview.component';
import { CorrelationHeatmapComponent }   from '../../shared/organisms/correlation-heatmap/correlation-heatmap.component';
import { PlayerDistributionComponent }   from '../../shared/organisms/player-distribution/player-distribution.component';
import { PlayerRankingComponent }        from '../../shared/organisms/player-ranking/player-ranking.component';
import { RosterFiltersComponent }        from '../../shared/organisms/roster-filters/roster-filters.component';
import { ScatterPlotComponent }          from '../../shared/organisms/scatter-plot/scatter-plot.component';

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
    RosterFiltersComponent,
    ScatterPlotComponent,
  ],
  templateUrl: './global-overview.component.html',
  styleUrls: ['./global-overview.component.scss']
})
export class GlobalOverviewComponent implements OnInit, OnDestroy {
  readonly analytics = inject(AnalyticsService);
  private  router    = inject(Router);
  private  route     = inject(ActivatedRoute);

  readonly isLoading     = this.analytics.isLoading;
  readonly hasError      = this.analytics.hasError;
  readonly agg           = this.analytics.aggregate;
  readonly players       = this.analytics.players;
  readonly filteredRoster = this.analytics.filteredRoster;
  readonly searchQuery   = this.analytics.searchQuery;

  // ── Search suggestions ──
  readonly suggestions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (q.length < 1) return [];
    return this.players()
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 6);
  });

  // ── Pagination — driven by URL query param ──
  readonly pageSize = 6;
  readonly currentPage = signal(0);

  readonly paginatedPlayers = computed(() => {
    const all   = this.filteredRoster();
    const start = this.currentPage() * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredRoster().length / this.pageSize)
  );

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  // ── Compare mode ──
  readonly compareId = signal<string | null>(null);

  private sub?: Subscription;

  ngOnInit(): void {
    if (!this.analytics.index()) this.analytics.load();
    this.readQueryParams();
  }

  // ── Read URL state and restore filters + page ──
  private readQueryParams(): void {
    this.sub = this.route.queryParams.subscribe(params => {
      // Page
      const page = parseInt(params['page'] ?? '0', 10);
      this.currentPage.set(isNaN(page) || page < 0 ? 0 : page);

      // Roster filters
      this.analytics.updateRosterFilter({
        style:          params['style']    ?? null,
        minRep:         parseInt(params['minRep']  ?? '0',   10),
        maxRep:         parseInt(params['maxRep']  ?? '100', 10),
        casesCompleted: params['cases']
                          ? parseInt(params['cases'], 10)
                          : null,
        showAbandoned:  params['abandoned'] !== 'false',
      });

      // Search
      if (params['q']) this.analytics.search(params['q']);
    });
  }

  // ── Write URL state ──
  private pushQueryParams(patch: Record<string, string | null>): void {
    const current = { ...this.route.snapshot.queryParams };

    // Merge patch — null removes the param
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === 'null' || v === 'undefined') {
        delete current[k];
      } else {
        current[k] = v;
      }
    }

    // Clean up defaults to keep URL tidy
    if (current['page'] === '0')    delete current['page'];
    if (current['minRep'] === '0')  delete current['minRep'];
    if (current['maxRep'] === '100') delete current['maxRep'];
    if (current['abandoned'] === 'true') delete current['abandoned'];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: current,
      replaceUrl: true,   // don't pollute browser history for filter changes
    });
  }

  // ── Pagination ──
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.pushQueryParams({ page: page > 0 ? String(page) : null });
  }

  prevPage(): void {
    if (this.currentPage() > 0) this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  // ── Search ──
  onSearchInput(value: string): void {
    this.analytics.search(value);
    this.currentPage.set(0);
    this.pushQueryParams({ q: value || null, page: null });
  }

  // ── Filter change — sync to URL ──
  onFilterChange(): void {
    const f = this.analytics.rosterFilters();
    this.currentPage.set(0);
    this.pushQueryParams({
      style:    f.style,
      minRep:   f.minRep > 0    ? String(f.minRep)   : null,
      maxRep:   f.maxRep < 100  ? String(f.maxRep)   : null,
      cases:    f.casesCompleted !== null ? String(f.casesCompleted) : null,
      abandoned: !f.showAbandoned ? 'false' : null,
      page:     null,
    });
  }

  // ── Navigation ──
  navigateToPlayer(player: PlayerSummary): void {
    this.analytics.clearSearch();
    this.router.navigate(['/player', player.id]);
  }

  selectForCompare(playerId: string): void {
    const current = this.compareId();
    if (!current) {
      this.compareId.set(playerId);
    } else if (current === playerId) {
      this.compareId.set(null);
    } else {
      this.router.navigate(['/compare', current, playerId]);
      this.compareId.set(null);
    }
  }

  // ── Helpers ──
  minOf(a: number, b: number): number { return Math.min(a, b); }

  getPlayStyleVariant(style: string): 'success' | 'info' | 'danger' | 'warning' {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warning'> = {
      Completionist: 'success', Speedrunner: 'info',
      Manipulator: 'danger',   Balanced: 'warning'
    };
    return map[style] ?? 'warning';
  }

   readonly selectedComparePlayerName = computed(() => {
    const id = this.compareId();
    if (!id) return null;
    return this.players().find(p => p.id === id)?.name ?? null;
  });

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}