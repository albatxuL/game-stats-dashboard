import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionCardComponent } from './decision-card.component';
import { Decision } from '../../../core/models/game-data.model';

const mockDecision: Decision = {
  id: 'john_drugs',
  character: 'John',
  info: 'Was under influence during the crime',
  choice: 'hidden',
  futureEffect: 'john_reliable_witness',
  effectDescription: 'John becomes a reliable witness',
  effectValence: 'positive'
};

describe('DecisionCardComponent', () => {
  let fixture: ComponentFixture<DecisionCardComponent>;
  let component: DecisionCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DecisionCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(DecisionCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('decision', mockDecision);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should show character name', () => {
    expect(fixture.nativeElement.textContent).toContain('John');
  });

  it('should compute hidden choice icon', () => {
    expect(component.choiceIcon()).toBe('🤐');
  });

  it('should compute positive badge variant', () => {
    expect(component.badgeVariant()).toBe('success');
  });

  it('should compute positive valence icon', () => {
    expect(component.valenceIcon()).toBe('↑');
  });

  it('should apply positive class for positive valence', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.decision-card');
    expect(el.classList).toContain('decision-card--positive');
  });
});