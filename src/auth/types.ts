export type AuthScreen = 'login' | 'register';

export type AuthUser = {
  id?: string | number;
  name?: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type StoredAuthUser = AuthUser & {
  passwordHash: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthField = 'name' | 'email' | 'password' | 'confirmPassword';

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type AuthApiError = Error & {
  status?: number;
  fieldErrors?: AuthFieldErrors;
};
