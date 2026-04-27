import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineEventComponent } from './timeline-event.component';
import { TimelineEvent } from '../../../core/models/game-data.model';

const mockEvent: TimelineEvent = {
  timeSeconds: 660,
  type: 'clue',
  action: 'Primera pista física encontrada',
  detail: 'Objeto físico #1'
};

describe('TimelineEventComponent', () => {
  let fixture: ComponentFixture<TimelineEventComponent>;
  let component: TimelineEventComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TimelineEventComponent] }).compileComponents();
    fixture = TestBed.createComponent(TimelineEventComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', mockEvent);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should format time correctly', () => {
    expect(component.formattedTime()).toBe('11:00');
  });

  it('should resolve clue type config', () => {
    expect(component.typeConfig().icon).toBe('🔍');
    expect(component.typeConfig().label).toBe('Clue');
  });

  it('should render action text', () => {
    expect(fixture.nativeElement.textContent).toContain('Primera pista física encontrada');
  });

  it('should render detail when provided', () => {
    expect(fixture.nativeElement.textContent).toContain('Objeto físico #1');
  });

  it('should apply last class when isLast=true', () => {
    fixture.componentRef.setInput('isLast', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.tl-event');
    expect(el.classList).toContain('tl-event--last');
  });
});