import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotebookProgressComponent } from './notebook-progress.component';

describe('NotebookProgressComponent', () => {
  let component: NotebookProgressComponent;
  let fixture: ComponentFixture<NotebookProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotebookProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotebookProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
