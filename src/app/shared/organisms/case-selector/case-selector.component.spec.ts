import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseSelectorComponent } from './case-selector.component';

describe('CaseSelectorComponent', () => {
  let component: CaseSelectorComponent;
  let fixture: ComponentFixture<CaseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
