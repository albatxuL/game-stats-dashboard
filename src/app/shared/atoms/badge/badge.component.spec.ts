import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  let component: BadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should apply variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.badge');
    expect(el.classList).toContain('badge--success');
  });

  it('should render label', () => {
    fixture.componentRef.setInput('label', 'TEST');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('TEST');
  });

  it('should apply pill class when pill=true', () => {
    fixture.componentRef.setInput('pill', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.badge');
    expect(el.classList).toContain('badge--pill');
  });
});