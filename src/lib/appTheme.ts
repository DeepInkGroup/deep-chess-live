export type AppTheme = 'dark' | 'light';

const KEY = 'deepchess.appTheme.v1';

export function getStoredAppTheme(): AppTheme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setStoredAppTheme(theme: AppTheme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* localStorage unavailable */
  }
  document.documentElement.dataset.theme = theme;
}
