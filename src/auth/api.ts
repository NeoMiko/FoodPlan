import type {
  AuthApiError,
  AuthSession,
  LoginPayload,
  RegisterPayload,
  StoredAuthUser,
} from './types';
import {loadStoredUsers, persistUsers} from './storage';

function createApiError(
  message: string,
  status?: number,
  fieldErrors?: AuthFieldErrors,
): AuthApiError {
  const error = new Error(message) as AuthApiError;
  error.status = status;
  error.fieldErrors = fieldErrors;
  return error;
}

function createSession(user: StoredAuthUser): AuthSession {
  return {
    token: `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

function hashPassword(password: string) {
  let hash = 7;

  for (let index = 0; index < password.length; index += 1) {
    hash = (hash * 31 + password.charCodeAt(index)) % 2147483647;
  }

  return `local-${hash.toString(16)}`;
}

export async function loginWithApi(payload: LoginPayload) {
  const users = await loadStoredUsers();
  const existingUser = users.find(
    user => user.email.toLowerCase() === payload.email.toLowerCase(),
  );

  if (!existingUser) {
    throw createApiError('Nieprawidlowy email lub haslo.', 401, {
      email: 'Nie znaleziono konta dla tego adresu e-mail.',
    });
  }

  const matchesPassword =
    hashPassword(payload.password) === existingUser.passwordHash;

  if (!matchesPassword) {
    throw createApiError('Nieprawidlowy email lub haslo.', 401, {
      password: 'Podane haslo jest niepoprawne.',
    });
  }

  return createSession(existingUser);
}

export async function registerWithApi(payload: RegisterPayload) {
  const users = await loadStoredUsers();
  const email = payload.email.toLowerCase();
  const existingUser = users.find(user => user.email.toLowerCase() === email);

  if (existingUser) {
    throw createApiError('Konto z takim adresem e-mail juz istnieje.', 409, {
      email: 'Ten adres e-mail jest juz zajety.',
    });
  }

  const passwordHash = hashPassword(payload.password);
  const nextUser: StoredAuthUser = {
    id: Date.now(),
    name: payload.name,
    email,
    passwordHash,
  };

  await persistUsers([...users, nextUser]);

  return createSession(nextUser);
}
