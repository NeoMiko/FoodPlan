import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import Dashboard, { AddProductForm } from './src/components/Dashboard';
import {
  loginWithApi,
  registerWithApi,
  getDashboardData,
  addProduct,
  editProduct,
  deleteProduct,
  moveToShopping,
  markPurchased,
} from './src/auth/api';
import {
  clearStoredSession,
  loadStoredTheme,
  loadStoredSession,
  persistTheme,
  persistSession,
} from './src/auth/storage';
import type {
  AuthApiError,
  AuthFieldErrors,
  AuthScreen,
  AuthSession,
  Product,
  ShoppingItem,
  HistoryItem,
  DashboardStats,
} from './src/auth/types';
import {styles} from './src/styles/AppStyles';
import {getTheme} from './src/styles/themes';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
};

declare global {
  interface Window {
    __foodPlanInstallPromptEvent?: BeforeInstallPromptEvent | null;
  }
}

const features = [
  'Planowanie posiłków na cały tydzień',
  'Lista zakupów tworzona automatycznie',
  'Przepisy i składniki zawsze pod ręką',
];

function computeDaysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function processProducts(raw: Product[]): Product[] {
  return raw.map(p => ({
    ...p,
    expiryDate: p.expiry_date ?? null,
    daysLeft: computeDaysLeft(p.expiry_date ?? null),
  }));
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [acceptRules, setAcceptRules] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [_installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [_showInstallPrompt, setShowInstallPrompt] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_products: 0,
    expired_count: 0,
    expiring_soon_count: 0,
    added_this_month: 0,
  });
  const [_isLoadingData, setIsLoadingData] = useState(false);

  const isRegister = screen === 'register';
  const theme = getTheme(themeMode);
  const isDarkTheme = themeMode === 'dark';
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const authErrorColor = isDarkTheme ? '#FFB4A7' : '#A63A2E';
  const authInputStyle = (hasError?: boolean) => [
    styles.input,
    {
      backgroundColor: isDarkTheme ? theme.input : '#FFFFFF',
      borderColor: hasError ? authErrorColor : theme.border,
      color: theme.text,
    },
  ];
  const authPlaceholderColor = theme.muted;

  const loadAppData = async () => {
    if (!session?.token) return;
    setIsLoadingData(true);
    try {
      const data = await getDashboardData(session.token);
      setProducts(processProducts(data.products));
      setShoppingList(data.shoppingList);
      setHistory(data.history);
      setDashboardStats(data.stats);
    } catch (error) {
      console.error('Błąd pobierania danych:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleMoveToShopping = async (productId: string) => {
    if (!session?.token) return;
    try {
      await moveToShopping(session.token, productId);
      await loadAppData();
    } catch (error) {
      console.error('Błąd przenoszenia do listy:', error);
    }
  };

  const handleMarkPurchased = async (itemId: string) => {
    if (!session?.token) return;
    try {
      await markPurchased(session.token, itemId);
      await loadAppData();
    } catch (error) {
      console.error('Błąd oznaczania jako kupione:', error);
    }
  };

  const handleAddProduct = async (form: AddProductForm) => {
    if (!session?.token) return;
    try {
      await addProduct(session.token, {
        name: form.name,
        emoji: form.emoji,
        location: form.location,
        expiryDate: form.expiry_date,
        quantity: Number(form.quantity) || 1,
        unit: form.unit,
        notes: form.notes,
      });
      await loadAppData();
    } catch (error) {
      console.error('Błąd dodawania produktu:', error);
      throw error;
    }
  };

  const handleEditProduct = async (productId: string, form: Partial<AddProductForm>) => {
    if (!session?.token) return;
    try {
      await editProduct(session.token, productId, {
        name: form.name,
        emoji: form.emoji,
        location: form.location,
        expiryDate: form.expiry_date,
        quantity: Number(form.quantity) || 1,
        unit: form.unit,
        notes: form.notes,
      });
      await loadAppData();
    } catch (error) {
      console.error('Błąd edycji produktu:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!session?.token) return;
    try {
      await deleteProduct(session.token, productId);
      await loadAppData();
    } catch (error) {
      console.error('Błąd usuwania produktu:', error);
      throw error;
    }
  };

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const [storedSession, storedTheme] = await Promise.all([
          loadStoredSession(),
          loadStoredTheme(),
        ]);
        if (storedSession?.token) {
          setSession(storedSession);
          const data = await getDashboardData(storedSession.token);
          setProducts(processProducts(data.products));
          setShoppingList(data.shoppingList);
          setHistory(data.history);
          setDashboardStats(data.stats);
        }
        setThemeMode(storedTheme);
      } catch {
        console.log('Błąd startowy aplikacji');
      } finally {
        setIsBootstrapping(false);
      }
    }
    bootstrapSession();
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.addEventListener !== 'function' ||
      typeof window.removeEventListener !== 'function'
    ) {
      return undefined;
    }
    const syncInstallPrompt = () => {
      const deferredPrompt = window.__foodPlanInstallPromptEvent ?? null;
      setInstallPromptEvent(deferredPrompt);
      setShowInstallPrompt(Boolean(deferredPrompt));
    };
    window.addEventListener('foodplan-install-available', syncInstallPrompt);
    window.addEventListener('appinstalled', () => setShowInstallPrompt(false));
    syncInstallPrompt();
    return () => {
      window.removeEventListener('foodplan-install-available', syncInstallPrompt);
    };
  }, []);

  const clientErrors = useMemo<AuthFieldErrors>(() => {
    const errors: AuthFieldErrors = {};
    if (!trimmedEmail) errors.email = 'Adres e-mail jest wymagany.';
    else if (!emailRegex.test(trimmedEmail)) errors.email = 'Podaj poprawny adres e-mail.';
    if (!password) errors.password = 'Hasło jest wymagane.';
    else if (isRegister && password.length < 8) errors.password = 'Hasło musi mieć min. 8 znaków.';
    else if (isRegister && !/[a-z]/.test(password)) errors.password = 'Hasło musi zawierać małą literę.';
    else if (isRegister && !/[A-Z]/.test(password)) errors.password = 'Hasło musi zawierać wielką literę.';
    else if (isRegister && !/[0-9]/.test(password)) errors.password = 'Hasło musi zawierać cyfrę.';
    if (isRegister) {
      if (!trimmedName) errors.name = 'Imię i nazwisko jest wymagane.';
      if (password !== confirmPassword) errors.confirmPassword = 'Hasła muszą być identyczne.';
    }
    return errors;
  }, [confirmPassword, isRegister, password, trimmedEmail, trimmedName]);

  const helperText = useMemo(() => {
    if (authError) return authError;
    if (isRegister && !acceptRules) return 'Zaakceptuj regulamin, aby utworzyć konto.';
    return isRegister ? 'Po rejestracji sesja zostanie zapisana.' : '';
  }, [acceptRules, authError, isRegister]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.style.backgroundColor = theme.page;
    document.documentElement.style.backgroundColor = theme.page;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', theme.page);
    }
  }, [theme.page]);

  const visibleErrors = {...clientErrors, ...fieldErrors};
  const isPrimaryDisabled =
    isSubmitting || Object.keys(clientErrors).length > 0 || (isRegister && !acceptRules);

  function renderFieldError(field: keyof AuthFieldErrors) {
    if (!visibleErrors[field]) return null;
    return (
      <Text style={[styles.fieldErrorText, {color: authErrorColor}]}>
        {visibleErrors[field]}
      </Text>
    );
  }

  function clearErrors(field?: keyof AuthFieldErrors) {
    setAuthError('');
    if (!field) {
      setFieldErrors({});
      return;
    }
    setFieldErrors(current => ({...current, [field]: undefined}));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setAuthError('');
    try {
      const nextSession = isRegister
        ? await registerWithApi({name: trimmedName, email: trimmedEmail, password})
        : await loginWithApi({email: trimmedEmail, password});

      setSession(nextSession);
      if (staySignedIn || isRegister) await persistSession(nextSession);

      const data = await getDashboardData(nextSession.token);
      setProducts(processProducts(data.products));
      setShoppingList(data.shoppingList);
      setHistory(data.history);
      setDashboardStats(data.stats);

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const apiError = error as AuthApiError;
      setAuthError(apiError.message || 'Wystąpił błąd autoryzacji.');
      if (apiError.fieldErrors) setFieldErrors(apiError.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setSession(null);
    setProducts([]);
    setShoppingList([]);
    setDashboardStats({
      total_products: 0,
      expired_count: 0,
      expiring_soon_count: 0,
      added_this_month: 0,
    });
    await clearStoredSession();
  }

  if (isBootstrapping) {
    return (
      <View style={[styles.loadingState, {backgroundColor: theme.page}]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (session) {
    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.page}]}>
        <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
        <Dashboard
          products={products}
          shoppingList={shoppingList}
          history={history}
          stats={dashboardStats}
          userName={session.user.name ?? null}
          themeMode={themeMode}
          onThemeChange={async t => {
            setThemeMode(t);
            await persistTheme(t);
          }}
          onLogout={handleLogout}
          onRefresh={loadAppData}
          onMoveToShopping={handleMoveToShopping}
          onMarkPurchased={handleMarkPurchased}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.page}]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
      <ScrollView
        style={{backgroundColor: theme.page}}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.screenFrame}>
          <View
            style={[
              styles.heroPanel,
              {backgroundColor: theme.hero, borderColor: theme.border},
            ]}>
            <View
              style={[
                styles.brandBadge,
                {backgroundColor: isDarkTheme ? '#1E322B' : theme.accentSoft},
              ]}>
              <Text style={[styles.brandBadgeText, {color: theme.accent}]}>FOODPLAN</Text>
            </View>
            <Text style={[styles.heroTitle, {color: theme.heroText}]}>
              {isRegister ? 'Utwórz konto' : 'Witaj ponownie'}
            </Text>
            <View
              style={[
                styles.featureList,
                {backgroundColor: isDarkTheme ? '#0F1920' : 'rgba(255,255,255,0.08)'},
              ]}>
              {features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <View style={[styles.featureDot, {backgroundColor: theme.accent}]} />
                  <Text style={[styles.featureText, {color: isDarkTheme ? '#D7E0E8' : '#E5ECEA'}]}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.formPanel,
              {backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1},
            ]}>
            {isRegister && (
              <View style={styles.fieldBlock}>
                <TextInput
                  placeholder="Imię i nazwisko"
                  placeholderTextColor={authPlaceholderColor}
                  style={authInputStyle(!!visibleErrors.name)}
                  value={name}
                  onChangeText={t => {setName(t); clearErrors('name');}}
                />
                {renderFieldError('name')}
              </View>
            )}
            <View style={styles.fieldBlock}>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={authPlaceholderColor}
                style={authInputStyle(!!visibleErrors.email)}
                value={email}
                onChangeText={t => {setEmail(t); clearErrors('email');}}
              />
              {renderFieldError('email')}
            </View>
            <View style={styles.fieldBlock}>
              <TextInput
                secureTextEntry
                placeholder="Hasło"
                placeholderTextColor={authPlaceholderColor}
                style={authInputStyle(!!visibleErrors.password)}
                value={password}
                onChangeText={t => {setPassword(t); clearErrors('password');}}
              />
              {renderFieldError('password')}
            </View>
            {isRegister && (
              <View style={styles.fieldBlock}>
                <TextInput
                  secureTextEntry
                  placeholder="Powtórz hasło"
                  placeholderTextColor={authPlaceholderColor}
                  style={authInputStyle(!!visibleErrors.confirmPassword)}
                  value={confirmPassword}
                  onChangeText={t => {setConfirmPassword(t); clearErrors('confirmPassword');}}
                />
                {renderFieldError('confirmPassword')}
              </View>
            )}

            <View style={[styles.optionRow, {backgroundColor: theme.input}]}>
              <Text style={[styles.optionTitle, {color: theme.text}]}>
                {isRegister ? 'Akceptuję regulamin' : 'Pozostań zalogowany'}
              </Text>
              <Switch
                value={isRegister ? acceptRules : staySignedIn}
                onValueChange={v => (isRegister ? setAcceptRules(v) : setStaySignedIn(v))}
                trackColor={{false: theme.border, true: theme.accent}}
              />
            </View>

            <Text style={[styles.helperText, authError && styles.helperTextError]}>
              {helperText}
            </Text>

            <Pressable
              disabled={isPrimaryDisabled}
              onPress={handleSubmit}
              style={[
                styles.primaryButton,
                {backgroundColor: theme.navActive},
                isPrimaryDisabled && styles.primaryButtonDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={isDarkTheme ? '#F7F4EC' : '#FFFFFF'} />
              ) : (
                <Text style={[styles.primaryButtonText, {color: theme.navActiveText}]}>
                  {isRegister ? 'Zarejestruj' : 'Zaloguj'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                clearErrors();
                setScreen(isRegister ? 'login' : 'register');
              }}>
              <Text style={[styles.footerLink, {color: theme.text}]}>
                {isRegister ? 'Masz już konto? Zaloguj' : 'Nie masz konta? Załóż je'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
