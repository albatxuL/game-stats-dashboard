import { Component, inject, computed } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { Case } from '../../../core/models/game-data.model';

@Component({
  selector: 'df-case-selector',
  standalone: true,
  imports: [BadgeComponent],
  templateUrl: './case-selector.component.html',
  styleUrls: ['./case-selector.component.scss']
})
export class CaseSelectorComponent {
  private gameData = inject(GameDataService);

  readonly cases = this.gameData.cases;
  readonly selectedCaseId = this.gameData.selectedCaseId;

  readonly finalVariant = computed(() => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
      A: 'success', B: 'warning', C: 'warning', D: 'danger'
    };
    return map;
  });

  selectCase(id: string): void {
    this.gameData.selectCase(id);
  }

  getFinalVariant(finalId: string): 'success' | 'warning' | 'danger' | 'muted' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
      A: 'success', B: 'warning', C: 'warning', D: 'danger'
    };
    return map[finalId] ?? 'muted';
  }

  getCaseNumber(id: string): string {
    return id.replace('case_0', '');
  }
}