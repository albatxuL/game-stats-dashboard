import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'df-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly pill = input<boolean>(false);
}