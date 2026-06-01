export type ThemeName = 'coral' | 'indigo' | 'rose';

interface Theme {
  '--accent': string;
  '--accent-light': string;
  '--accent-dark': string;
  '--bg-primary': string;
  '--bg-secondary': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--surface': string;
  '--surface-border': string;
  '--builder-bg': string;
}

export const themes: Record<ThemeName, Theme> = {
  indigo: {
    '--accent': 'oklch(0.55 0.22 263)',
    '--accent-light': 'oklch(0.72 0.14 263)',
    '--accent-dark': 'oklch(0.38 0.22 263)',
    '--bg-primary': 'oklch(0.98 0.005 263)',
    '--bg-secondary': 'oklch(0.94 0.01 263)',
    '--text-primary': 'oklch(0.18 0.02 263)',
    '--text-secondary': 'oklch(0.42 0.02 263)',
    '--surface': 'oklch(1 0 0)',
    '--surface-border': 'oklch(0.88 0.01 263)',
    '--builder-bg': 'oklch(0.92 0.01 263)',
  },
  coral: {
    '--accent': 'oklch(0.62 0.20 22)',
    '--accent-light': 'oklch(0.76 0.14 22)',
    '--accent-dark': 'oklch(0.44 0.20 22)',
    '--bg-primary': 'oklch(0.98 0.005 22)',
    '--bg-secondary': 'oklch(0.94 0.01 22)',
    '--text-primary': 'oklch(0.18 0.02 22)',
    '--text-secondary': 'oklch(0.42 0.02 22)',
    '--surface': 'oklch(1 0 0)',
    '--surface-border': 'oklch(0.88 0.01 22)',
    '--builder-bg': 'oklch(0.92 0.01 22)',
  },
  rose: {
    '--accent': 'oklch(0.58 0.22 350)',
    '--accent-light': 'oklch(0.74 0.14 350)',
    '--accent-dark': 'oklch(0.40 0.22 350)',
    '--bg-primary': 'oklch(0.98 0.005 350)',
    '--bg-secondary': 'oklch(0.94 0.01 350)',
    '--text-primary': 'oklch(0.18 0.02 350)',
    '--text-secondary': 'oklch(0.42 0.02 350)',
    '--surface': 'oklch(1 0 0)',
    '--surface-border': 'oklch(0.88 0.01 350)',
    '--builder-bg': 'oklch(0.92 0.01 350)',
  },
};

export function applyTheme(name: ThemeName) {
  const theme = themes[name];
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value);
  }
}
