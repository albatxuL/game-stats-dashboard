import { Component, inject, computed, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { GameDataService } from '../../../core/services/game-data.service';
import { PlayerSummary } from '../../../core/models/analytics.model';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'df-player-search',
  standalone: true,
  imports: [FormsModule, BadgeComponent],
  templateUrl: './player-search.component.html',
  styleUrls: ['./player-search.component.scss']
})
export class PlayerSearchComponent {
  private analytics = inject(AnalyticsService);
  private gameData  = inject(GameDataService);

  readonly playerSelected = output<PlayerSummary | null>();

  readonly query = signal('');
  readonly isOpen = signal(false);

  readonly suggestions = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (q.length < 1) return [];
    return this.analytics.players()
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 6);
  });

  readonly activePlayer = computed(() => this.gameData.player());

  onInput(value: string): void {
    this.query.set(value);
    this.isOpen.set(value.length > 0);
  }

  selectPlayer(player: PlayerSummary): void {
    this.query.set(player.name);
    this.isOpen.set(false);
    this.gameData.load(player.dataFile);
    this.analytics.search(player.name);
    this.playerSelected.emit(player);
  }

  clearSearch(): void {
    this.query.set('');
    this.isOpen.set(false);
    this.gameData.load('game-data.mock.json');
    this.analytics.clearSearch();
    this.playerSelected.emit(null);
  }

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