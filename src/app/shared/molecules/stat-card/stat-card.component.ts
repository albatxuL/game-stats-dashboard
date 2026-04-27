import { Component, input } from '@angular/core';
import { StatNumberComponent } from '../../atoms/stat-number/stat-number.component';
import { BadgeComponent, BadgeVariant } from '../../atoms/badge/badge.component';

@Component({
  selector: 'df-stat-card',
  standalone: true,
  imports: [StatNumberComponent, BadgeComponent],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  readonly icon = input<string>('');
  readonly value = input<string | number>('—');
  readonly label = input<string>('');
  readonly sublabel = input<string>('');
  readonly badgeLabel = input<string>('');
  readonly badgeVariant = input<BadgeVariant>('default');
  readonly delta = input<string>('');
  readonly accent = input<boolean>(false);
  readonly animationDelay = input<number>(0);
}