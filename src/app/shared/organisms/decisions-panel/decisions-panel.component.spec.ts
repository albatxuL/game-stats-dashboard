import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionsPanelComponent } from './decisions-panel.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';
import { Decision } from '../../../core/models/game-data.model';

const mockDecisions: Decision[] = [
  {
    id: 'john_drugs', character: 'John', info: 'Was under influence',
    choice: 'hidden', futureEffect: 'john_reliable', effectDescription: 'Reliable witness', effectValence: 'positive'
  },
  {
    id: 'kai_secret', character: 'Kai', info: 'Family secret',
    choice: 'revealed', futureEffect: 'kai_hostile', effectDescription: 'Kai hostile', effectValence: 'negative'
  }
];

const mockCase = {
  decisions: mockDecisions,
  carryoverEffects: [
    { sourceCase: 'case_01', decisionId: 'john_drugs', effect: 'John testified honestly', impact: 'positive' }
  ]
} as any;

describe('DecisionsPanelComponent', () => {
  let fixture: ComponentFixture<DecisionsPanelComponent>;
  let component: DecisionsPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionsPanelComponent],
      providers: [{ provide: GameDataService, useValue: { selectedCase: signal(mockCase) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(DecisionsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should count hidden decisions', () => {
    expect(component.hiddenCount()).toBe(1);
  });

  it('should count revealed decisions', () => {
    expect(component.revealedCount()).toBe(1);
  });

  it('should count positive effects', () => {
    expect(component.positiveCount()).toBe(1);
  });

  it('should count negative effects', () => {
    expect(component.negativeCount()).toBe(1);
  });

  it('should expose carryover effects', () => {
    expect(component.carryoverEffects().length).toBe(1);
  });

  it('should render decision cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('df-decision-card');
    expect(cards.length).toBe(2);
  });
});