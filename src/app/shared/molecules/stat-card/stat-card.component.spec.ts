import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  it('should render icon and value', () => {
    fixture.componentRef.setInput('icon', '🔍');
    fixture.componentRef.setInput('value', '42');
    fixture.componentRef.setInput('label', 'Clues');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('🔍');
    expect(fixture.nativeElement.textContent).toContain('42');
  });

  it('should show badge when badgeLabel provided', () => {
    fixture.componentRef.setInput('badgeLabel', 'Final A');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Final A');
  });

  it('should apply accent class', () => {
    fixture.componentRef.setInput('accent', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.stat-card');
    expect(el.classList).toContain('stat-card--accent');
  });
});