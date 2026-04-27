import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'df-stat-number',
  standalone: true,
  templateUrl: './stat-number.component.html',
  styleUrls: ['./stat-number.component.scss']
})
export class StatNumberComponent {
  readonly value = input<string | number>('—');
  readonly label = input<string>('');
  readonly sublabel = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly accent = input<boolean>(false);
  // Optional delta: "+5" or "-3"
  readonly delta = input<string>('');

  readonly deltaPositive = computed(() => this.delta().startsWith('+'));
  readonly deltaNegative = computed(() => this.delta().startsWith('-'));
}