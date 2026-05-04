import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScatterPlotComponent } from './scatter-plot.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';

const mockScatter = [
  { x: 0.40, y: 74, label: 'Alba',  style: 'Completionist', isOutlier: false },
  { x: 0.80, y: 61, label: 'Mikel', style: 'Manipulator',   isOutlier: false },
  { x: 0.92, y: 55, label: 'Leire', style: 'Manipulator',   isOutlier: true  },
];

describe('ScatterPlotComponent', () => {
  let fixture: ComponentFixture<ScatterPlotComponent>;
  let component: ScatterPlotComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterPlotComponent, RouterTestingModule],
      providers: [{
        provide: AnalyticsService,
        useValue: {
          scatterData: signal(mockScatter),
          players:     signal([
            { id: 'p1', name: 'Alba' },
            { id: 'p2', name: 'Mikel' },
            { id: 'p3', name: 'Leire' },
          ]),
          aggregate:   signal({
            correlations: { hiddenDecisions_vs_reputation: -0.34 }
          }),
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(ScatterPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should return correlation value', () => {
    expect(component.corrValue()).toBe(-0.34);
  });

  it('should render chart canvas', () => {
    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should render correlation value in template', () => {
    expect(fixture.nativeElement.textContent).toContain('-0.34');
  });

  it('should render section title', () => {
    expect(fixture.nativeElement.textContent).toContain('Hidden Decisions vs Reputation');
  });
});