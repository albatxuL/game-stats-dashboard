import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatNumberComponent } from './stat-number.component';

describe('StatNumberComponent', () => {
  let fixture: ComponentFixture<StatNumberComponent>;
  let component: StatNumberComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatNumberComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render value', () => {
    fixture.componentRef.setInput('value', '47m 00s');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('47m 00s');
  });

  it('should detect positive delta', () => {
    fixture.componentRef.setInput('delta', '+5');
    expect(component.deltaPositive()).toBeTrue();
    expect(component.deltaNegative()).toBeFalse();
  });

  it('should detect negative delta', () => {
    fixture.componentRef.setInput('delta', '-3');
    expect(component.deltaNegative()).toBeTrue();
  });

  it('should apply accent class', () => {
    fixture.componentRef.setInput('accent', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.stat-number');
    expect(el.classList).toContain('stat-number--accent');
  });
});