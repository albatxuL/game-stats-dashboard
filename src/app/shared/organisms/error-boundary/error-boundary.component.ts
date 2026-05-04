// ============================================================
// ErrorBoundaryComponent — Wraps any child component.
// Catches errors from chart rendering, data loading, etc.
// Shows a graceful fallback instead of breaking the whole page.
// Usage: <df-error-boundary [label]="'Radar Chart'">
//          <df-radar-chart />
//        </df-error-boundary>
// ============================================================
import {
  Component, input, signal, ErrorHandler,
  inject, ChangeDetectorRef
} from '@angular/core';

@Component({
  selector: 'df-error-boundary',
  standalone: true,
  templateUrl: './error-boundary.component.html',
  styleUrls: ['./error-boundary.component.scss']
})
export class ErrorBoundaryComponent {
  readonly label    = input<string>('Component');
  readonly hasError = signal(false);
  readonly errorMsg = signal('');

  private cdr = inject(ChangeDetectorRef);

  // Call this from child components via @Output or direct ref
  // Angular doesn't have React-style error boundaries natively,
  // so we use a manual trigger pattern.
  reportError(err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ErrorBoundary:${this.label()}]`, err);
    this.errorMsg.set(msg);
    this.hasError.set(true);
    this.cdr.markForCheck();
  }

  retry(): void {
    this.hasError.set(false);
    this.errorMsg.set('');
  }
}