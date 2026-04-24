import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReputationBarsComponent } from './reputation-bars.component';

describe('ReputationBarsComponent', () => {
  let component: ReputationBarsComponent;
  let fixture: ComponentFixture<ReputationBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReputationBarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReputationBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
