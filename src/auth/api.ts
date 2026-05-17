import type {
  AddProductPayload,
  AuthApiError,
  AuthSession,
  DashboardData,
  LoginPayload,
  RegisterPayload,
} from './types';

const API_BASE_URL =
  typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:8888/.netlify/functions'
    : '/.netlify/functions';

function createApiError(
  message: string,
  status?: number,
  fieldErrors?: Record<string, string>,
): AuthApiError {
  const error = new Error(message) as AuthApiError;
  error.status = status;
  error.fieldErrors = fieldErrors;
  return error;
}

async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    const data = await response.json();

    if (!response.ok) {
      throw createApiError(
        data.error || 'Wystapil blad',
        response.status,
        data.fieldErrors,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createApiError(
      'Nie mozna polaczyc sie z serwerem. Sprawdz polaczenie internetowe.',
      0,
    );
  }
}

export async function loginWithApi(
  payload: LoginPayload,
): Promise<AuthSession> {
  const data = await fetchApi('/login', {
    method: 'POST',
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });
  return { token: data.token, user: data.user };
}

export async function registerWithApi(
  payload: RegisterPayload,
): Promise<AuthSession> {
  const data = await fetchApi('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }),
  });
  return { token: data.token, user: data.user };
}

export async function getDashboardData(token: string): Promise<DashboardData> {
  return fetchApi('/get-dashboard', { method: 'GET' }, token);
}

export async function addProduct(
  token: string,
  product: AddProductPayload,
): Promise<{ product: object }> {
  return fetchApi(
    '/add-product',
    { method: 'POST', body: JSON.stringify(product) },
    token,
  );
}

export async function editProduct(
  token: string,
  productId: string,
  product: Partial<AddProductPayload>,
): Promise<{ product: object }> {
  return fetchApi(
    '/edit-product',
    { method: 'PATCH', body: JSON.stringify({ productId, ...product }) },
    token,
  );
}

export async function deleteProduct(
  token: string,
  productId: string,
): Promise<{ success: boolean }> {
  const encodedProductId = encodeURIComponent(productId);
  return fetchApi(
    `/delete-product?productId=${encodedProductId}`,
    { method: 'DELETE', body: JSON.stringify({ productId }) },
    token,
  );
}

export async function moveToShopping(
  token: string,
  productId: string,
): Promise<{ item: object }> {
  return fetchApi(
    '/move-to-shopping',
    { method: 'POST', body: JSON.stringify({ productId }) },
    token,
  );
}

export async function markPurchased(
  token: string,
  itemId: string,
): Promise<{ item: object }> {
  return fetchApi(
    '/mark-purchased',
    { method: 'PATCH', body: JSON.stringify({ itemId }) },
    token,
  );
}
