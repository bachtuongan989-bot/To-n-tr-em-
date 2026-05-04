
export type ThemeColor = 'default' | 'ocean' | 'nature' | 'sunset' | 'lavender';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  bg: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  default: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    bg: '#F7FFF7',
  },
  ocean: {
    primary: '#0077B6',
    secondary: '#00B4D8',
    bg: '#F0F9FF',
  },
  nature: {
    primary: '#2D6A4F',
    secondary: '#52B788',
    bg: '#F0FFF4',
  },
  sunset: {
    primary: '#F72585',
    secondary: '#FF9E00',
    bg: '#FFF5F7',
  },
  lavender: {
    primary: '#7209B7',
    secondary: '#B5179E',
    bg: '#F5F3FF',
  }
};

export const AVATARS = [
  '🐶', '🐱', '🦁', '🐻', '🐰', '🦊', '🦒', '🦓', '🐼', '🐨', '🦖', '🐉', '🦄', '🐳', '🦜'
];

interface UserSettings {
  theme: ThemeColor;
  avatar: string;
}

const STORAGE_KEY = 'math_buddy_settings';

export const SettingsService = {
  getSettings(): UserSettings {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }
    return {
      theme: 'default',
      avatar: '🐶'
    };
  },

  saveSettings(settings: UserSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    this.applyTheme(settings.theme);
  },

  applyTheme(themeKey: ThemeColor) {
    const theme = THEMES[themeKey];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-bg', theme.bg);
  }
};
