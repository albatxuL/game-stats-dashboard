import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Case, GameData } from '../models/game-data.model';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  private http = inject(HttpClient);

  private _data = signal<GameData | null>(null);
  readonly data = this._data.asReadonly();

  readonly selectedCaseId = signal<string>('case_01');
  readonly isLoading = signal<boolean>(false);
  readonly hasError = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly activeDataFile = signal<string>('game-data.mock.json');

  // Computed selectors
  readonly player       = computed(() => this._data()?.player ?? null);
  readonly reputation   = computed(() => this._data()?.reputation ?? null);
  readonly cases        = computed(() => this._data()?.cases ?? []);
  readonly achievements = computed(() => this._data()?.achievements ?? []);
  readonly globalStats  = computed(() => this._data()?.globalStats ?? null);

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
    if (all.length === 0) return { unlocked: 0, total: 0, percent: 0 };
    return { unlocked, total: all.length, percent: Math.round((unlocked / all.length) * 100) };
  });

  // Load default player (Alba) or a specific player's file
  load(dataFile = 'game-data.mock.json'): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');
    this.activeDataFile.set(dataFile);

    this.http.get<GameData>(`assets/data/${dataFile}`).subscribe({
      next: (data) => {
        this._data.set(data);
        // Reset to first completed case on player change
        const firstCase = data.cases.find(c => c.status === 'completed');
        if (firstCase) this.selectedCaseId.set(firstCase.id);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('[GameDataService] Load error:', err.status, err.url);
        this.errorMessage.set(`HTTP ${err.status} — ${err.url}`);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  selectCase(caseId: string): void {
    this.selectedCaseId.set(caseId);
  }

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