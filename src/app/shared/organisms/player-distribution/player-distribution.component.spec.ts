import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerDistributionComponent } from './player-distribution.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { signal } from '@angular/core';

const mockAgg = {
  totalPlayers: 8,
  reputationDistribution: [
    { bin: '0-20', count: 0 }, { bin: '21-40', count: 1 },
    { bin: '41-60', count: 2 }, { bin: '61-80', count: 3 }, { bin: '81-100', count: 2 }
  ],
  notebookDistribution: [
    { bin: '0-60', count: 1 }, { bin: '61-70', count: 1 },
    { bin: '71-80', count: 2 }, { bin: '81-90', count: 3 }, { bin: '91-100', count: 1 }
  ],
  sessionDurationDistribution: [
    { bin: '<30m', count: 1 }, { bin: '30-45m', count: 2 },
    { bin: '45-60m', count: 3 }, { bin: '60-90m', count: 2 }
  ]
} as any;

describe('PlayerDistributionComponent', () => {
  let fixture: ComponentFixture<PlayerDistributionComponent>;
  let component: PlayerDistributionComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerDistributionComponent],
      providers: [{
        provide: AnalyticsService,
        useValue: { aggregate: signal(mockAgg) }
      }]
    }).compileComponents();
    fixture = TestBed.createComponent(PlayerDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should default to reputation metric', () => {
    expect(component.activeMetric).toBe('reputation');
  });

  it('should have 3 metric tabs', () => {
    expect(component.metrics.length).toBe(3);
  });

  it('should switch active metric', () => {
    component.switchMetric('notebook');
    expect(component.activeMetric).toBe('notebook');
  });

  it('should compute chart datasets for all 3 metrics', () => {
    const ds = component.chartDatasets();
    expect(ds).toBeTruthy();
    expect(ds!.reputation.data.length).toBe(5);
    expect(ds!.notebook.data.length).toBe(5);
    expect(ds!.session.data.length).toBe(4);
  });

  it('should render 3 tab buttons', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.dist-tab');
    expect(tabs.length).toBe(3);
  });
});