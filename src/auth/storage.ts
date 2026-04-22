import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  APP_THEME_STORAGE_KEY,
  AUTH_STORAGE_KEY,
} from './config';
import type {AuthSession} from './types';

export async function loadStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export async function persistSession(session: AuthSession) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredSession() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function loadStoredTheme(): Promise<'light' | 'dark'> {
  const raw = await AsyncStorage.getItem(APP_THEME_STORAGE_KEY);
  return raw === 'light' ? 'light' : 'dark';
}

export async function persistTheme(theme: 'light' | 'dark') {
  await AsyncStorage.setItem(APP_THEME_STORAGE_KEY, theme);
}
