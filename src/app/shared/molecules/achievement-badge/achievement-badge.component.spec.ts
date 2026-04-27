import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementBadgeComponent } from './achievement-badge.component';
import { Achievement } from '../../../core/models/game-data.model';

const unlockedAchievement: Achievement = {
  id: 'hawk_eye', name: 'Ojo de halcón', description: 'Encuentra todas las pistas',
  icon: '🔍', secret: false, unlocked: true, unlockedAtCase: 'case_01', condition: ''
};

const lockedSecret: Achievement = {
  id: 'sealed_lips', name: 'Boca sellada', description: 'Oculta todo',
  icon: '🤐', secret: true, unlocked: false, unlockedAtCase: null, condition: ''
};

describe('AchievementBadgeComponent', () => {
  let fixture: ComponentFixture<AchievementBadgeComponent>;
  let component: AchievementBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AchievementBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(AchievementBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('achievement', unlockedAchievement);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show icon and name when unlocked', () => {
    fixture.componentRef.setInput('achievement', unlockedAchievement);
    fixture.detectChanges();
    expect(component.displayIcon()).toBe('🔍');
    expect(component.displayName()).toBe('Ojo de halcón');
  });

  it('should hide name and icon for locked secret', () => {
    fixture.componentRef.setInput('achievement', lockedSecret);
    fixture.detectChanges();
    expect(component.displayIcon()).toBe('?');
    expect(component.displayName()).toBe('???');
  });

  it('should apply unlocked class', () => {
    fixture.componentRef.setInput('achievement', unlockedAchievement);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.achievement');
    expect(el.classList).toContain('achievement--unlocked');
  });

  it('should apply locked class for locked achievement', () => {
    fixture.componentRef.setInput('achievement', lockedSecret);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.achievement');
    expect(el.classList).toContain('achievement--locked');
  });
});