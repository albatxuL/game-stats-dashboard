import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RosterFiltersComponent } from './roster-filters.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { signal } from '@angular/core';

describe('RosterFiltersComponent', () => {
  let fixture: ComponentFixture<RosterFiltersComponent>;
  let component: RosterFiltersComponent;
  let mockService: Partial<AnalyticsService>;

  beforeEach(async () => {
    const filtersSignal = signal({
      style: null, minRep: 0, maxRep: 100,
      casesCompleted: null, showAbandoned: true
    });

    mockService = {
      rosterFilters: filtersSignal,
      updateRosterFilter: jasmine.createSpy('updateRosterFilter').and.callFake(
        (patch: any) => filtersSignal.update(f => ({ ...f, ...patch }))
      ),
    };

    await TestBed.configureTestingModule({
      imports: [RosterFiltersComponent],
      providers: [{ provide: AnalyticsService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(RosterFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should call updateRosterFilter when style is set', () => {
    component.setStyle('Manipulator');
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({ style: 'Manipulator' });
  });

  it('should set style to null when "All" is clicked', () => {
    component.setStyle(null);
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({ style: null });
  });

  it('should parse casesCompleted as number', () => {
    component.setCases('3');
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({ casesCompleted: 3 });
  });

  it('should set casesCompleted to null for empty string', () => {
    component.setCases('');
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({ casesCompleted: null });
  });

  it('should update minRep', () => {
    component.setMinRep(40);
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({ minRep: 40 });
  });

  it('should toggle showAbandoned', () => {
    component.toggleAbandoned();
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({ showAbandoned: false });
  });

  it('isActive should return false for default filters', () => {
    expect(component.isActive()).toBeFalse();
  });

  it('isActive should return true when style is set', () => {
    component.setStyle('Speedrunner');
    fixture.detectChanges();
    expect(component.isActive()).toBeTrue();
  });

  it('reset should restore defaults', () => {
    component.reset();
    expect(mockService.updateRosterFilter).toHaveBeenCalledWith({
      style: null, minRep: 0, maxRep: 100,
      casesCompleted: null, showAbandoned: true
    });
  });

  it('should return correct badge variant per style', () => {
    expect(component.getStyleVariant('Completionist')).toBe('success');
    expect(component.getStyleVariant('Speedrunner')).toBe('info');
    expect(component.getStyleVariant('Manipulator')).toBe('danger');
    expect(component.getStyleVariant('Balanced')).toBe('warning');
  });

  it('should render 4 style chips + All', () => {
    const chips = fixture.nativeElement.querySelectorAll('.rf-chip');
    expect(chips.length).toBeGreaterThanOrEqual(5); // 4 styles + All
  });

  it('should not show reset button when filters are default', () => {
    const reset = fixture.nativeElement.querySelector('.rf-reset');
    expect(reset).toBeNull();
  });

  it('should show reset button when a filter is active', () => {
    component.setStyle('Balanced');
    fixture.detectChanges();
    const reset = fixture.nativeElement.querySelector('.rf-reset');
    expect(reset).toBeTruthy();
  });
});

// ── filterChanged output ──
describe('filterChanged output', () => {
  it('should emit filterChanged when setStyle is called', () => {
    let emitted = false;
    fixture.componentInstance.filterChanged.subscribe(() => emitted = true);
    component.setStyle('Speedrunner');
    expect(emitted).toBeTrue();
  });

  it('should emit filterChanged when reset is called', () => {
    let emitted = false;
    fixture.componentInstance.filterChanged.subscribe(() => emitted = true);
    component.reset();
    expect(emitted).toBeTrue();
  });

  it('should emit filterChanged when setCases is called', () => {
    let emitted = false;
    fixture.componentInstance.filterChanged.subscribe(() => emitted = true);
    component.setCases('3');
    expect(emitted).toBeTrue();
  });

  it('should emit filterChanged when toggleAbandoned is called', () => {
    let emitted = false;
    fixture.componentInstance.filterChanged.subscribe(() => emitted = true);
    component.toggleAbandoned();
    expect(emitted).toBeTrue();
  });

  it('should emit filterChanged when minRep changes', () => {
    let count = 0;
    fixture.componentInstance.filterChanged.subscribe(() => count++);
    component.setMinRep(40);
    component.setMaxRep(80);
    expect(count).toBe(2);
  });
});