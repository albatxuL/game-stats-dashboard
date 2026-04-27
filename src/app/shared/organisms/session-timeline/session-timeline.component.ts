import { Component, inject, computed } from '@angular/core';
import { GameDataService } from '../../../core/services/game-data.service';
import { TimelineEventComponent } from '../../molecules/timeline-event/timeline-event.component';

@Component({
  selector: 'df-session-timeline',
  standalone: true,
  imports: [TimelineEventComponent],
  templateUrl: './session-timeline.component.html',
  styleUrls: ['./session-timeline.component.scss']
})
export class SessionTimelineComponent {
  private gameData = inject(GameDataService);
  readonly c = this.gameData.selectedCase;

  readonly events = computed(() => this.c()?.timeline ?? []);

  readonly totalDuration = computed(() => {
    const s = this.c()?.sessionDurationSeconds ?? 0;
    return this.gameData.formatDuration(s);
  });

  readonly eventTypeCounts = computed(() => {
    const events = this.events();
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.type] = (counts[e.type] ?? 0) + 1; });
    return counts;
  });

  isLast(index: number): boolean {
    return index === this.events().length - 1;
  }
}