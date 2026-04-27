import { Component, inject, computed } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { ProgressBarComponent } from '../../atoms/progress-bar/progress-bar.component';

interface RepBar {
  key: keyof { general: number; accuracy: number; discretion: number; relationships: number };
  label: string;
  icon: string;
  value: number;
  variant: 'amber' | 'green' | 'blue' | 'red';
  description: string;
}

@Component({
  selector: 'df-reputation-bars',
  standalone: true,
  imports: [ProgressBarComponent],
  templateUrl: './reputation-bars.component.html',
  styleUrls: ['./reputation-bars.component.scss']
})
export class ReputationBarsComponent {
  private gameData = inject(GameDataService);
  readonly reputation = this.gameData.reputation;

  readonly bars = computed<RepBar[]>(() => {
    const r = this.reputation();
    if (!r) return [];
    return [
      { key: 'general',       label: 'General',       icon: '⭐', value: r.general,       variant: 'amber', description: 'Overall standing in the department' },
      { key: 'accuracy',      label: 'Accuracy',      icon: '🎯', value: r.accuracy,      variant: 'green', description: 'Correct identifications and report precision' },
      { key: 'discretion',    label: 'Discretion',    icon: '🤫', value: r.discretion,    variant: 'blue',  description: 'Sensitive information management' },
      { key: 'relationships', label: 'Relationships', icon: '🤝', value: r.relationships, variant: 'amber', description: 'Trust level with informants and witnesses' },
    ];
  });

  readonly history = computed(() => this.reputation()?.history ?? []);

  getBarColor(value: number): string {
    if (value >= 80) return 'var(--c-green-light)';
    if (value >= 50) return 'var(--c-amber-light)';
    return 'var(--c-red-light)';
  }
}