import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseSelectorComponent } from './case-selector.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';

const mockCases = [
  { id: 'case_01', title: 'Hive & Hopper', status: 'completed', finalId: 'A', finalLabel: 'Ascenso' },
  { id: 'case_02', title: 'The Velvet Room', status: 'completed', finalId: 'B', finalLabel: 'Deuda' },
];

describe('CaseSelectorComponent', () => {
  let fixture: ComponentFixture<CaseSelectorComponent>;
  let mockService: Partial<GameDataService>;

  beforeEach(async () => {
    mockService = {
      cases: signal(mockCases as any),
      selectedCaseId: signal('case_01'),
      selectCase: jasmine.createSpy('selectCase')
    };

    await TestBed.configureTestingModule({
      imports: [CaseSelectorComponent],
      providers: [{ provide: GameDataService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseSelectorComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());

  it('should render all cases', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.case-tab');
    expect(tabs.length).toBe(2);
  });

  it('should call selectCase on click', () => {
    const tab = fixture.nativeElement.querySelectorAll('.case-tab')[1];
    tab.click();
    expect(mockService.selectCase).toHaveBeenCalledWith('case_02');
  });

  it('should return correct final variant', () => {
    const comp = fixture.componentInstance;
    expect(comp.getFinalVariant('A')).toBe('success');
    expect(comp.getFinalVariant('D')).toBe('danger');
  });

  it('should extract case number from id', () => {
    expect(fixture.componentInstance.getCaseNumber('case_01')).toBe('1');
  });
});