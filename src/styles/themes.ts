export const lightTheme = {
  page: '#ECF1EF',
  card: '#FFFFFF',
  hero: '#102022',
  heroText: '#F7FBF9',
  text: '#152123',
  muted: '#647270',
  border: '#D9E1DE',
  accent: '#33A06F',
  accentSoft: '#E2F4EC',
  warningSoft: '#FFF0D5',
  dangerSoft: '#FBE1DB',
  nav: '#FFFFFF',
  navActive: '#132022',
  navActiveText: '#F7FBF9',
  navText: '#596867',
  input: '#F6F8F7',
};

export const darkTheme = {
  page: '#0D141A',
  card: '#14212A',
  hero: '#0F1920',
  heroText: '#F7FBF9',
  text: '#E5ECEA',
  muted: '#9FB0B5',
  border: '#22323D',
  accent: '#7FD1AE',
  accentSoft: '#16312A',
  warningSoft: '#3B2B11',
  dangerSoft: '#3B1F1F',
  nav: '#14212A',
  navActive: '#F3EDE2',
  navActiveText: '#101418',
  navText: '#A9B5BA',
  input: '#0F1920',
};

export type Theme = typeof lightTheme;

export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
