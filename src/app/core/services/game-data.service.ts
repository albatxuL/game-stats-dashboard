import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Case, GameData } from '../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  private http = inject(HttpClient);

  private _data = signal<GameData | null>(null);
  readonly data = this._data.asReadonly();

  readonly selectedCaseId = signal<string>('case_01');

  readonly isLoading = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);

  // Computed selectors
  readonly player = computed(() => this._data()?.player ?? null);
  readonly reputation = computed(() => this._data()?.reputation ?? null);
  readonly cases = computed(() => this._data()?.cases ?? []);
  readonly achievements = computed(() => this._data()?.achievements ?? []);
  readonly globalStats = computed(() => this._data()?.globalStats ?? null);

  readonly selectedCase = computed<Case | null>(() =>
    this._data()?.cases.find(c => c.id === this.selectedCaseId()) ?? null
  );

  readonly unlockedAchievements = computed(() =>
    this._data()?.achievements.filter(a => a.unlocked) ?? []
  );

  readonly secretAchievements = computed(() =>
    this._data()?.achievements.filter(a => a.secret) ?? []
  );

  readonly achievementProgress = computed(() => {
    const all = this._data()?.achievements ?? [];
    const unlocked = all.filter(a => a.unlocked).length;
    return { unlocked, total: all.length, percent: Math.round((unlocked / all.length) * 100) };
  });

  load(): void {
    this.isLoading.set(true);
    this.http.get<GameData>('assets/data/game-data.mock.json').subscribe({
      next: (data) => {
        this._data.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  selectCase(caseId: string): void {
    this.selectedCaseId.set(caseId);
  }

  // Utility helpers
  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  }

  getFinalColor(finalId: string): string {
    const map: Record<string, string> = {
      A: 'var(--c-green-light)',
      B: 'var(--c-amber-light)',
      C: 'var(--c-amber-dim)',
      D: 'var(--c-red-light)'
    };
    return map[finalId] ?? 'var(--c-text-muted)';
  }
}