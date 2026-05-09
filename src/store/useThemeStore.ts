import { create } from 'zustand';

export type ThemeType = 'medieval' | 'cyberpunk' | 'modern';

interface ThemeStore {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: 'modern',
  setTheme: (theme) => {
    set({ currentTheme: theme });
    document.documentElement.dataset.theme = theme;
  },
}));
