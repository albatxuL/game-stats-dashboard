import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionCardComponent } from './decision-card.component';

describe('DecisionCardComponent', () => {
  let component: DecisionCardComponent;
  let fixture: ComponentFixture<DecisionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
