import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarChartComponent } from './radar-chart.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';

const mockCase = {
  notebook: {
    completionPercent: 87,
    sections: {
      characters: { pages: 7, pagesUnlocked: 7, listPageUnlocked: true, totalUnlockEvents: 12, unlockedBy: { talking: 7, showingClue: 3, discoveringLie: 2 } },
      clues: { pages: 4, pagesUnlocked: 4 },
      caseFile: { sectionsComplete: 2, sectionsTotal: 3, pages: 2, pagesUnlocked: 2 }
    }
  },
  suspects: { total: 7, interviewed: 7, liesDiscovered: 2, liesTotal: 3 },
  roomActions: { discovered: 6, total: 6 }
} as any;

describe('RadarChartComponent', () => {
  let fixture: ComponentFixture<RadarChartComponent>;
  let component: RadarChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarChartComponent],
      providers: [{ provide: GameDataService, useValue: { selectedCase: signal(mockCase) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(RadarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should compute chart data as array of 5 values', () => {
    const data = component.chartData();
    expect(data).toBeTruthy();
    expect(data!.length).toBe(5);
  });

  it('should compute 100% for fully discovered rooms', () => {
    const data = component.chartData()!;
    expect(data[4]).toBe(100);
  });

  it('should compute partial for lies', () => {
    const data = component.chartData()!;
    expect(data[3]).toBe(67); // 2/3
  });
});