import { Component, input, computed } from '@angular/core';

export type ProgressVariant = 'amber' | 'green' | 'red' | 'blue' | 'muted';

@Component({
  selector: 'df-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  readonly Math = Math;
  
  readonly value = input<number>(0);       // 0–100
  readonly max = input<number>(100);
  readonly variant = input<ProgressVariant>('amber');
  readonly showLabel = input<boolean>(false);
  readonly label = input<string>('');
  readonly thin = input<boolean>(false);
  readonly animated = input<boolean>(true);

  readonly percent = computed(() =>
    Math.min(100, Math.max(0, (this.value() / this.max()) * 100))
  );

  readonly displayLabel = computed(() =>
    this.label() || `${Math.round(this.percent())}%`
  );
}