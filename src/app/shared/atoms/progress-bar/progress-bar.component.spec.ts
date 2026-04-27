import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let fixture: ComponentFixture<ProgressBarComponent>;
  let component: ProgressBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProgressBarComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should compute percent correctly', () => {
    fixture.componentRef.setInput('value', 75);
    fixture.componentRef.setInput('max', 100);
    expect(component.percent()).toBe(75);
  });

  it('should clamp percent to 0-100', () => {
    fixture.componentRef.setInput('value', 150);
    expect(component.percent()).toBe(100);
    fixture.componentRef.setInput('value', -10);
    expect(component.percent()).toBe(0);
  });

  it('should apply variant class', () => {
    fixture.componentRef.setInput('variant', 'green');
    fixture.detectChanges();
    const fill = fixture.nativeElement.querySelector('.progress__fill');
    expect(fill.classList).toContain('progress__fill--green');
  });

  it('should show label when showLabel=true', () => {
    fixture.componentRef.setInput('showLabel', true);
    fixture.componentRef.setInput('label', 'Completion');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Completion');
  });
});