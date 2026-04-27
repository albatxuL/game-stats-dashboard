import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementsGridComponent } from './achievements-grid.component';
import { GameDataService } from '../../../core/services/game-data.service';
import { signal } from '@angular/core';
import { Achievement } from '../../../core/models/game-data.model';

const mockAchievements: Achievement[] = [
  { id: 'a1', name: 'First Light',    description: 'Complete first case', icon: '🕯️', secret: false, unlocked: true,  unlockedAtCase: 'case_01', condition: '' },
  { id: 'a2', name: 'Hawk Eye',       description: 'Find all clues',      icon: '🔍', secret: false, unlocked: true,  unlockedAtCase: 'case_01', condition: '' },
  { id: 'a3', name: 'Full Notebook',  description: '100% notebook',       icon: '📓', secret: false, unlocked: false, unlockedAtCase: null,      condition: '' },
  { id: 'a4', name: 'Sealed Lips',    description: 'Hide everything',     icon: '🤐', secret: true,  unlocked: false, unlockedAtCase: null,      condition: '' },
  { id: 'a5', name: 'Butterfly',      description: 'Carryover effect',    icon: '🦋', secret: true,  unlocked: true,  unlockedAtCase: 'case_04', condition: '' },
];

describe('AchievementsGridComponent', () => {
  let fixture: ComponentFixture<AchievementsGridComponent>;
  let component: AchievementsGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsGridComponent],
      providers: [{
        provide: GameDataService,
        useValue: {
          achievements: signal(mockAchievements),
          achievementProgress: signal({ unlocked: 3, total: 5, percent: 60 })
        }
      }]
    }).compileComponents();
    fixture = TestBed.createComponent(AchievementsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should separate public and secret achievements', () => {
    expect(component.publicAchievements().length).toBe(3);
    expect(component.secretAchievements().length).toBe(2);
  });

  it('should default filter to all', () => {
    expect(component.filterMode()).toBe('all');
    expect(component.filtered().length).toBe(3);
  });

  it('should filter to unlocked only', () => {
    component.setFilter('unlocked');
    expect(component.filtered().length).toBe(2);
  });

  it('should filter to locked only', () => {
    component.setFilter('locked');
    expect(component.filtered().length).toBe(1);
  });

  it('should count unlocked secrets', () => {
    expect(component.unlockedSecretCount()).toBe(1);
  });

  it('should toggle secrets visibility', () => {
    expect(component.showSecrets()).toBeFalse();
    component.toggleSecrets();
    expect(component.showSecrets()).toBeTrue();
  });
});