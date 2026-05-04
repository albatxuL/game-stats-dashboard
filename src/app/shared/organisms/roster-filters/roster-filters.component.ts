import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'df-roster-filters',
  standalone: true,
  imports: [FormsModule, BadgeComponent],
  templateUrl: './roster-filters.component.html',
  styleUrls: ['./roster-filters.component.scss']
})
export class RosterFiltersComponent {
  readonly analytics = inject(AnalyticsService);

  readonly filters = this.analytics.rosterFilters;
  readonly styles  = ['Completionist', 'Speedrunner', 'Manipulator', 'Balanced'] as const;

  setStyle(style: string | null): void {
    this.analytics.updateRosterFilter({ style });
  }

  setCases(value: string): void {
    this.analytics.updateRosterFilter({ casesCompleted: value === '' ? null : parseInt(value, 10) });
  }

  setMinRep(value: number): void {
    this.analytics.updateRosterFilter({ minRep: value });
  }

  setMaxRep(value: number): void {
    this.analytics.updateRosterFilter({ maxRep: value });
  }

  toggleAbandoned(): void {
    this.analytics.updateRosterFilter({ showAbandoned: !this.filters().showAbandoned });
  }

  reset(): void {
    this.analytics.updateRosterFilter({
      style: null, minRep: 0, maxRep: 100,
      casesCompleted: null, showAbandoned: true
    });
  }

  readonly isActive = () => {
    const f = this.filters();
    return f.style !== null || f.minRep > 0 || f.maxRep < 100
        || f.casesCompleted !== null || !f.showAbandoned;
  };

  getStyleVariant(style: string): 'success' | 'info' | 'danger' | 'warning' {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warning'> = {
      Completionist: 'success', Speedrunner: 'info',
      Manipulator: 'danger', Balanced: 'warning'
    };
    return map[style] ?? 'warning';
  }
}