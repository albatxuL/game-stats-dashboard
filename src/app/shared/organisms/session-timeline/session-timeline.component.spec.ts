import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionTimelineComponent } from './session-timeline.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';
import { TimelineEvent } from '../../../core/models/game-data.model';

const mockTimeline: TimelineEvent[] = [
  { timeSeconds: 180,  type: 'exploration', action: 'Scene inspected' },
  { timeSeconds: 660,  type: 'clue',        action: 'First clue found', detail: 'Clue #1' },
  { timeSeconds: 1140, type: 'interview',   action: 'All suspects interviewed' },
  { timeSeconds: 2280, type: 'lie',         action: 'Lie discovered' },
  { timeSeconds: 2820, type: 'report',      action: 'Report submitted' },
];

const mockCase = { timeline: mockTimeline, sessionDurationSeconds: 2820 } as any;

describe('SessionTimelineComponent', () => {
  let fixture: ComponentFixture<SessionTimelineComponent>;
  let component: SessionTimelineComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionTimelineComponent],
      providers: [{
        provide: GameDataService,
        useValue: {
          selectedCase: signal(mockCase),
          formatDuration: (s: number) => `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`
        }
      }]
    }).compileComponents();
    fixture = TestBed.createComponent(SessionTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose timeline events', () => {
    expect(component.events().length).toBe(5);
  });

  it('should format total duration', () => {
    expect(component.totalDuration()).toBe('47m 00s');
  });

  it('should count event types', () => {
    const counts = component.eventTypeCounts();
    expect(counts['clue']).toBe(1);
    expect(counts['interview']).toBe(1);
    expect(counts['lie']).toBe(1);
  });

  it('should identify last event correctly', () => {
    expect(component.isLast(4)).toBeTrue();
    expect(component.isLast(0)).toBeFalse();
  });

  it('should render correct number of timeline-event components', () => {
    const items = fixture.nativeElement.querySelectorAll('df-timeline-event');
    expect(items.length).toBe(5);
  });
});