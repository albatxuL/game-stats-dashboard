import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementsGridComponent } from './achievements-grid.component';

describe('AchievementsGridComponent', () => {
  let component: AchievementsGridComponent;
  let fixture: ComponentFixture<AchievementsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
