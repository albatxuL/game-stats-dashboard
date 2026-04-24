import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionsPanelComponent } from './decisions-panel.component';

describe('DecisionsPanelComponent', () => {
  let component: DecisionsPanelComponent;
  let fixture: ComponentFixture<DecisionsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
