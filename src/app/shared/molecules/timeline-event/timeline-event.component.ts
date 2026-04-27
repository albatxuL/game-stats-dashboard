import { Component, input, computed } from '@angular/core';
import { TimelineEvent } from '../../../core/models/game-data.model';

@Component({
  selector: 'df-timeline-event',
  standalone: true,
  templateUrl: './timeline-event.component.html',
  styleUrls: ['./timeline-event.component.scss']
})
export class TimelineEventComponent {
  readonly event = input.required<TimelineEvent>();
  readonly isLast = input<boolean>(false);
  readonly index = input<number>(0);

  readonly formattedTime = computed(() => {
    const s = this.event().timeSeconds;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });

  readonly typeConfig = computed(() => {
    const configs: Record<string, { icon: string; color: string; label: string }> = {
      exploration: { icon: '🗺',  color: 'blue',   label: 'Explore' },
      clue:        { icon: '🔍', color: 'amber',  label: 'Clue'    },
      interview:   { icon: '💬', color: 'muted',  label: 'Interview' },
      lie:         { icon: '⚠',  color: 'red',    label: 'Lie found' },
      decision:    { icon: '⚖',  color: 'warning', label: 'Decision' },
      report:      { icon: '📋', color: 'green',  label: 'Report'  },
    };
    return configs[this.event().type] ?? configs['exploration'];
  });
}