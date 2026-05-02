
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
}

export class RewardService {
  private static readonly STARS_KEY = 'math_app_stars';
  private static readonly ACHIEVEMENTS_KEY = 'math_app_achievements';

  static getStars(): number {
    return parseInt(localStorage.getItem(this.STARS_KEY) || '0', 10);
  }

  static addStars(amount: number): number {
    const current = this.getStars();
    const next = current + amount;
    localStorage.setItem(this.STARS_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('stars-updated', { detail: next }));
    return next;
  }

  static getAchievements(): Achievement[] {
    const raw = localStorage.getItem(this.ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static unlockAchievement(id: string, title: string, description: string, icon: string): boolean {
    const achievements = this.getAchievements();
    if (achievements.find(a => a.id === id)) return false;

    const newAchieve: Achievement = {
      id,
      title,
      description,
      icon,
      unlockedAt: Date.now(),
    };

    achievements.push(newAchieve);
    localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: newAchieve }));
    return true;
  }
}
