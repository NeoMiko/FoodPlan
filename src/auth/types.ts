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

// --- Dashboard data types ---

export type Product = {
  id: string;
  name: string;
  emoji: string | null;
  location: string | null;
  expiry_date: string | null;
  quantity: number;
  unit: string | null;
  notes: string | null;
  created_at: string;
  // Computed on the frontend from expiry_date
  expiryDate: string | null;
  daysLeft: number | null;
};

export type ShoppingItem = {
  id: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  is_purchased: boolean;
  category: string | null;
  created_at: string;
};

export type HistoryItem = {
  id: string;
  action: string;
  description: string;
  created_at: string;
};

export type DashboardStats = {
  total_products: number;
  expired_count: number;
  expiring_soon_count: number;
  added_this_month: number;
};

export type DashboardData = {
  products: Product[];
  shoppingList: ShoppingItem[];
  history: HistoryItem[];
  stats: DashboardStats;
};

export type AddProductPayload = {
  name: string;
  emoji?: string;
  location?: string;
  expiryDate?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};
