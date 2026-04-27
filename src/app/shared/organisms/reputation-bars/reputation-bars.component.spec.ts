import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReputationBarsComponent } from './reputation-bars.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';

const mockRep = {
  general: 74, accuracy: 88, discretion: 55, relationships: 62,
  history: [
    { afterCase: 'case_01', general: 85, accuracy: 90, discretion: 50, relationships: 70 },
    { afterCase: 'case_02', general: 78, accuracy: 85, discretion: 60, relationships: 58 },
  ]
};

describe('ReputationBarsComponent', () => {
  let fixture: ComponentFixture<ReputationBarsComponent>;
  let component: ReputationBarsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReputationBarsComponent],
      providers: [{ provide: GameDataService, useValue: { reputation: signal(mockRep) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(ReputationBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should compute 4 bars', () => {
    expect(component.bars().length).toBe(4);
  });

  it('should show general rep value', () => {
    expect(fixture.nativeElement.textContent).toContain('74');
  });

  it('should return green color for high value', () => {
    expect(component.getBarColor(85)).toBe('var(--c-green-light)');
  });

  it('should return amber color for mid value', () => {
    expect(component.getBarColor(65)).toBe('var(--c-amber-light)');
  });

  it('should return red color for low value', () => {
    expect(component.getBarColor(30)).toBe('var(--c-red-light)');
  });

  it('should render history progression', () => {
    expect(component.history().length).toBe(2);
  });
});