import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorBoundaryComponent } from './error-boundary.component';

describe('ErrorBoundaryComponent', () => {
  let fixture: ComponentFixture<ErrorBoundaryComponent>;
  let component: ErrorBoundaryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorBoundaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render ng-content when no error', () => {
    expect(component.hasError()).toBeFalse();
    const boundary = fixture.nativeElement.querySelector('.error-boundary');
    expect(boundary).toBeNull();
  });

  it('should show error UI when reportError is called', () => {
    component.reportError(new Error('Chart.js failed'));
    fixture.detectChanges();
    expect(component.hasError()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.error-boundary')).toBeTruthy();
  });

  it('should display error message', () => {
    component.reportError(new Error('Network timeout'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Network timeout');
  });

  it('should display label in error state', () => {
    fixture.componentRef.setInput('label', 'Radar Chart');
    component.reportError('fail');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Radar Chart');
  });

  it('should handle string errors', () => {
    component.reportError('Something went wrong');
    fixture.detectChanges();
    expect(component.errorMsg()).toBe('Something went wrong');
  });

  it('should reset state on retry', () => {
    component.reportError(new Error('fail'));
    component.retry();
    fixture.detectChanges();
    expect(component.hasError()).toBeFalse();
    expect(component.errorMsg()).toBe('');
    expect(fixture.nativeElement.querySelector('.error-boundary')).toBeNull();
  });

  it('should show retry button in error state', () => {
    component.reportError('oops');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.error-boundary__retry');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain('Retry');
  });
});