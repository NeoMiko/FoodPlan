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
  useWindowDimensions,
  View,
} from 'react-native';

import Dashboard from './src/components/Dashboard';
import {
  loginWithApi, 
  registerWithApi, 
  getDashboardData, 
  addProduct, 
  moveToShopping, 
  markPurchased
} from './src/auth/api';
import {
  clearStoredSession,
  loadStoredTheme,
  loadStoredSession,
  persistTheme,
  persistSession,
} from './src/auth/storage';
import type {
  AddProductPayload,
  AuthApiError,
  AuthFieldErrors,
  AuthScreen,
  AuthSession,
  DashboardData,
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


function processProducts(raw: any[]): Product[] {
  return raw.map(p => ({
    ...p,
    expiryDate: p.expiry_date ?? null,
    daysLeft: computeDaysLeft(p.expiry_date ?? null),
  }));
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const {width} = useWindowDimensions();
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
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_products: 0,
    expired_count: 0,
    expiring_soon_count: 0,
    added_this_month: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isRegister = screen === 'register';
  const isCompactLayout = width < 760;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const theme = getTheme(themeMode);
  const isDarkTheme = themeMode === 'dark';


  const loadAppData = async () => {
    setIsLoadingData(true);
    try {
      const data = await getDashboardData();
      setProducts(processProducts(data.products));
      setShoppingList(data.shoppingList);
      setHistory(data.history);
      setDashboardStats(data.stats);
    } catch (error) {
      console.error('Błąd pobierania danych z bazy:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const [storedSession, storedTheme] = await Promise.all([
          loadStoredSession(),
          loadStoredTheme(),
        ]);
        if (storedSession) {
          setSession(storedSession);
          
          const data = await getDashboardData();
          setProducts(processProducts(data.products));
          setShoppingList(data.shoppingList);
          setHistory(data.history);
          setDashboardStats(data.stats);
        }
        setThemeMode(storedTheme);
      } catch (e) {
        console.log("Błąd bootstrapowania aplikacji");
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrapSession();
  }, []);

  
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
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

  const visibleErrors = {...clientErrors, ...fieldErrors};
  const isPrimaryDisabled = isSubmitting || Object.keys(clientErrors).length > 0 || (isRegister && !acceptRules);

  function clearErrors(field?: keyof AuthFieldErrors) {
    setAuthError('');
    if (!field) { setFieldErrors({}); return; }
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
      
     
      await loadAppData();
      
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
    setDashboardStats({total_products: 0, expired_count: 0, expiring_soon_count: 0, added_this_month: 0});
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
          userName={session.user.name}
          themeMode={themeMode}
          onThemeChange={async (t) => {
            setThemeMode(t);
            await persistTheme(t);
          }}
          onLogout={handleLogout}
          onRefresh={loadAppData}
        />
      </SafeAreaView>
    );
  }

  
  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.page}]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.screenFrame}>
          <View style={styles.heroPanel}>
            <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>FOODPLAN</Text></View>
            <Text style={styles.heroTitle}>{isRegister ? 'Utwórz konto' : 'Witaj ponownie'}</Text>
            <View style={styles.featureList}>
              {features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <View style={styles.featureDot} /><Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formPanel}>
            {isRegister && (
              <TextInput
                placeholder="Imię i nazwisko"
                style={[styles.input, !!visibleErrors.name && styles.inputError]}
                value={name}
                onChangeText={t => {setName(t); clearErrors('name');}}
              />
            )}
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              style={[styles.input, !!visibleErrors.email && styles.inputError]}
              value={email}
              onChangeText={t => {setEmail(t); clearErrors('email');}}
            />
            <TextInput
              secureTextEntry
              placeholder="Hasło"
              style={[styles.input, !!visibleErrors.password && styles.inputError]}
              value={password}
              onChangeText={t => {setPassword(t); clearErrors('password');}}
            />
            {isRegister && (
              <TextInput
                secureTextEntry
                placeholder="Powtórz hasło"
                style={[styles.input, !!visibleErrors.confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={t => {setConfirmPassword(t); clearErrors('confirmPassword');}}
              />
            )}

            <View style={styles.optionRow}>
              <Text style={styles.optionTitle}>{isRegister ? 'Akceptuję regulamin' : 'Pozostań zalogowany'}</Text>
              <Switch
                value={isRegister ? acceptRules : staySignedIn}
                onValueChange={v => isRegister ? setAcceptRules(v) : setStaySignedIn(v)}
                trackColor={{false: theme.border, true: theme.accent}}
              />
            </View>

            <Text style={[styles.helperText, authError && styles.helperTextError]}>{helperText}</Text>

            <Pressable
              disabled={isPrimaryDisabled}
              onPress={handleSubmit}
              style={[styles.primaryButton, isPrimaryDisabled && styles.primaryButtonDisabled]}>
              {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>{isRegister ? 'Zarejestruj' : 'Zaloguj'}</Text>}
            </Pressable>

            <Pressable onPress={() => {clearErrors(); setScreen(isRegister ? 'login' : 'register');}}>
              <Text style={styles.footerLink}>{isRegister ? 'Masz już konto? Zaloguj' : 'Nie masz konta? Załóż je'}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}