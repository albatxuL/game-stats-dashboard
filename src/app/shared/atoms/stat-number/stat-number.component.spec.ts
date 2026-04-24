import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatNumberComponent } from './stat-number.component';

describe('StatNumberComponent', () => {
  let component: StatNumberComponent;
  let fixture: ComponentFixture<StatNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
