import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorrelationHeatmapComponent } from './correlation-heatmap.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { signal } from '@angular/core';
import { CorrelationCell } from '../../../core/models/analytics.model';

const mockCells: CorrelationCell[] = [
  { row: 'Hidden decisions', col: 'Reputation',     value: 0.34, strength: 'moderate', direction: 'positive' },
  { row: 'Notebook %',       col: 'Accuracy',       value: 0.71, strength: 'strong',   direction: 'positive' },
  { row: 'Session time',     col: 'Notebook %',     value: 0.58, strength: 'moderate', direction: 'positive' },
  { row: 'Lies found',       col: 'Final grade',    value: 0.62, strength: 'moderate', direction: 'positive' },
  { row: 'Clues found',      col: 'Correct report', value: 0.49, strength: 'moderate', direction: 'positive' },
];

describe('CorrelationHeatmapComponent', () => {
  let fixture: ComponentFixture<CorrelationHeatmapComponent>;
  let component: CorrelationHeatmapComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrelationHeatmapComponent],
      providers: [{
        provide: AnalyticsService,
        useValue: { correlationMatrix: signal(mockCells) }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(CorrelationHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render 5 correlation cells', () => {
    const cells = fixture.nativeElement.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBe(5);
  });

  it('should return green color for positive correlation', () => {
    const color = component.getCellColor(0.71);
    expect(color).toContain('90, 170, 106');
  });

  it('should return red color for negative correlation', () => {
    const color = component.getCellColor(-0.6);
    expect(color).toContain('196, 74,  74');
  });

  it('should return neutral color for zero correlation', () => {
    const color = component.getCellColor(0);
    expect(color).toContain('90, 82, 72');
  });

  it('should return primary text color for strong correlation', () => {
    expect(component.getTextColor(0.8)).toBe('var(--c-text-primary)');
  });

  it('should return secondary text color for weak correlation', () => {
    expect(component.getTextColor(0.2)).toBe('var(--c-text-secondary)');
  });

  it('should format strength label with sign', () => {
    const positive = mockCells[0];
    expect(component.getStrengthLabel(positive)).toContain('+');
    const cell: CorrelationCell = { ...mockCells[0], value: -0.5, direction: 'negative', strength: 'moderate' };
    expect(component.getStrengthLabel(cell)).toContain('−');
  });
});