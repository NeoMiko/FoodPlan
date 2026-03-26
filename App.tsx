import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import Dashboard from './src/components/Dashboard';
import {loginWithApi, registerWithApi} from './src/auth/api';
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
} from './src/auth/types';

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
  'Planowanie posilkow na caly tydzien',
  'Lista zakupow tworzona automatycznie',
  'Przepisy i skladniki zawsze pod reka',
];

const sampleProducts = [
  {
    id: '1',
    name: 'Mleko 3,2%',
    expiryDate: '2026-03-27',
    daysLeft: 1,
    emoji: '🥛',
    location: 'Lodowka',
  },
  {
    id: '2',
    name: 'Jajka',
    expiryDate: '2026-03-30',
    daysLeft: 4,
    emoji: '🥚',
    location: 'Lodowka',
  },
  {
    id: '3',
    name: 'Pomidory',
    expiryDate: '2026-03-26',
    daysLeft: 0,
    emoji: '🍅',
    location: 'Blat',
  },
  {
    id: '4',
    name: 'Jogurt naturalny',
    expiryDate: '2026-03-24',
    daysLeft: -2,
    emoji: '🥣',
    location: 'Lodowka',
  },
];

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

  const isRegister = screen === 'register';
  const isCompactLayout = width < 760;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const [storedSession, storedTheme] = await Promise.all([
          loadStoredSession(),
          loadStoredTheme(),
        ]);
        if (storedSession) {
          setSession(storedSession);
        }
        setThemeMode(storedTheme);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrapSession();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncInstallPrompt = () => {
      const deferredPrompt = window.__foodPlanInstallPromptEvent ?? null;
      setInstallPromptEvent(deferredPrompt);
      setShowInstallPrompt(Boolean(deferredPrompt));
    };

    const handleInstallAvailable = () => {
      syncInstallPrompt();
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setShowInstallPrompt(false);
    };

    syncInstallPrompt();

    window.addEventListener('foodplan-install-available', handleInstallAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('foodplan-install-complete', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'foodplan-install-available',
        handleInstallAvailable,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('foodplan-install-complete', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const deferredPrompt = window.__foodPlanInstallPromptEvent ?? null;
    if (deferredPrompt) {
      setInstallPromptEvent(deferredPrompt);
      setShowInstallPrompt(true);
    }
    return undefined;
  }, []);

  const clientErrors = useMemo<AuthFieldErrors>(() => {
    const errors: AuthFieldErrors = {};

    if (!trimmedEmail) {
      errors.email = 'Adres e-mail jest wymagany.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Podaj poprawny adres e-mail z @ i domena.';
    }

    if (!password) {
      errors.password = 'Haslo jest wymagane.';
    } else if (isRegister && password.length < 8) {
      errors.password = 'Haslo musi miec co najmniej 8 znakow.';
    }

    if (isRegister) {
      if (!trimmedName) {
        errors.name = 'Imie i nazwisko jest wymagane.';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Powtorz haslo.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Hasla musza byc identyczne.';
      }
    }

    return errors;
  }, [confirmPassword, isRegister, password, trimmedEmail, trimmedName]);

  const helperText = useMemo(() => {
    if (authError) {
      return authError;
    }

    if (isRegister && !acceptRules) {
      return 'Zaakceptuj regulamin, aby utworzyc konto.';
    }

    if (!trimmedEmail && !password) {
      return 'Uzupelnij formularz, aby kontynuowac.';
    }

    return isRegister
      ? 'Po rejestracji sesja zostanie zapisana lokalnie.'
      : '';
  }, [acceptRules, authError, isRegister, password, trimmedEmail]);

  const visibleErrors = {
    ...clientErrors,
    ...fieldErrors,
  };

  const isPrimaryDisabled =
    isSubmitting ||
    Object.keys(clientErrors).length > 0 ||
    (isRegister && !acceptRules);

  function clearErrors(field?: keyof AuthFieldErrors) {
    setAuthError('');
    if (!field) {
      setFieldErrors({});
      return;
    }

    setFieldErrors(current => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });
  }

  async function applySession(nextSession: AuthSession) {
    setSession(nextSession);

    if (staySignedIn || isRegister) {
      await persistSession(nextSession);
      return;
    }

    await clearStoredSession();
  }

  async function handleSubmit() {
    if (isPrimaryDisabled) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    setAuthError('');
    setFieldErrors({});

    try {
      const nextSession = isRegister
        ? await registerWithApi({
            name: trimmedName,
            email: trimmedEmail,
            password,
          })
        : await loginWithApi({
            email: trimmedEmail,
            password,
          });

      await applySession(nextSession);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const apiError = error as AuthApiError;

      setFieldErrors(apiError.fieldErrors || {});

      switch (apiError.status) {
        case 400:
          setAuthError(apiError.message || 'Popraw dane formularza i sprobuj ponownie.');
          break;
        case 401:
          setAuthError(apiError.message || 'Nieprawidlowy email lub haslo.');
          break;
        case 409:
          setAuthError(apiError.message || 'Konto z takim e-mailem juz istnieje.');
          break;
        case 500:
          setAuthError(
            apiError.message || 'Blad serwera. Sprobuj ponownie za chwile.',
          );
          break;
        default:
          setAuthError(
            apiError.message || 'Nie udalo sie zapisac sesji.',
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setSession(null);
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
    setFieldErrors({});
    await clearStoredSession();
  }

  async function handleThemeChange(nextTheme: 'light' | 'dark') {
    setThemeMode(nextTheme);
    await persistTheme(nextTheme);
  }

  async function handleInstallApp() {
    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;

    if (choice.outcome === 'accepted') {
      if (typeof window !== 'undefined') {
        window.__foodPlanInstallPromptEvent = null;
      }
      setInstallPromptEvent(null);
      setShowInstallPrompt(false);
    }
  }

  function fieldStyle(hasError?: boolean) {
    return [styles.input, hasError && styles.inputError];
  }

  function renderInstallPrompt() {
    if (!showInstallPrompt) {
      return null;
    }

    return (
      <View pointerEvents="box-none" style={styles.installOverlay}>
        <View style={[styles.installModal, styles.installCardDark]}>
          <View style={styles.installCopy}>
            <Text style={[styles.installTitle, styles.installTitleDark]}>
              Zainstaluj FoodPlan
            </Text>
            <Text style={[styles.installText, styles.installTextDark]}>
              Dodaj aplikacje do ekranu glownego i uruchamiaj ja bez wchodzenia
              w przegladarke.
            </Text>
          </View>
          <View style={styles.installActions}>
            <Pressable
              onPress={() => setShowInstallPrompt(false)}
              style={[
                styles.installSecondaryButton,
                styles.installSecondaryDark,
              ]}>
              <Text
                style={[
                  styles.installSecondaryButtonText,
                  styles.installSecondaryTextDark,
                ]}>
                Zamknij
              </Text>
            </Pressable>
            <Pressable
              onPress={handleInstallApp}
              style={styles.installPrimaryButton}>
              <Text style={styles.installPrimaryButtonText}>Zainstaluj</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (isBootstrapping) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#7FD1AE" />
          <Text style={styles.loadingText}>Ladowanie zapisanej sesji...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (session) {
    const userName = session.user.name || 'Uzytkownik';
    const isDarkTheme = themeMode === 'dark';

    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {backgroundColor: isDarkTheme ? '#0D141A' : '#ECF1EF'},
        ]}>
        <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
        <View style={styles.loggedInLayout}>
          <View
            style={[
              styles.loggedInHeader,
              isCompactLayout && styles.loggedInHeaderCompact,
            ]}>
            <View>
              <Text
                style={[
                  styles.loggedInTitle,
                  {color: isDarkTheme ? '#F7F4EC' : '#101418'},
                ]}>
                FoodPlan
              </Text>
              <Text
                style={[
                  styles.loggedInSubtitle,
                  {color: isDarkTheme ? '#B8C2CC' : '#5F6A72'},
                ]}>
                Zalogowano jako {userName}
              </Text>
            </View>

            <Pressable
              onPress={handleLogout}
              style={[
                styles.headerLogoutButton,
                isCompactLayout && styles.headerLogoutButtonCompact,
                {backgroundColor: isDarkTheme ? '#F3EDE2' : '#101418'},
              ]}>
              <Text
                style={[
                  styles.headerLogoutText,
                  {color: isDarkTheme ? '#101418' : '#F7F4EC'},
                ]}>
                Wyloguj
              </Text>
            </Pressable>
          </View>

          <View style={styles.dashboardContainer}>
            <Dashboard
              products={sampleProducts}
              userName={userName}
              themeMode={themeMode}
              onThemeChange={handleThemeChange}
              onLogout={handleLogout}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderInstallPrompt()}
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          showInstallPrompt && styles.scrollContentWithInstallPrompt,
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.screenFrame}>
          <View style={styles.heroPanel}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>FOODPLAN</Text>
            </View>
            <Text style={styles.heroTitle}>
              {isRegister
                ? 'Utworz konto i uporzadkuj swoje posilki.'
                : 'Zaloguj sie, aby wejsc do swojego planu posilkow.'}
            </Text>
            <Text style={styles.heroDescription}>
              {isRegister
                ? 'Nowe konto da Ci dostep do menu, list zakupow i historii skladnikow.'
                : 'Zaloguj sie, aby zarzadzac planem tygodnia, zakupami i przepisami.'}
            </Text>

            <View style={styles.featureList}>
              {features.map(item => (
                <View key={item} style={styles.featureRow}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formPanel}>
            <Text style={styles.eyebrow}>{isRegister ? 'REJESTRACJA' : 'LOGOWANIE'}</Text>
            <Text style={styles.formTitle}>
              {isRegister ? 'Stworz konto' : 'Witaj ponownie'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isRegister
                ? 'Uzupelnij dane, aby zalozyc nowe konto.'
                : 'Wpisz swoje dane, aby kontynuowac.'}
            </Text>

            <View style={styles.inputGroup}>
              {isRegister ? (
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Imie i nazwisko</Text>
                  <TextInput
                    placeholder="Np. Oskar Kowalski"
                    placeholderTextColor="#7B8794"
                    style={fieldStyle(!!visibleErrors.name)}
                    value={name}
                    onChangeText={text => {
                      clearErrors('name');
                      setName(text);
                    }}
                  />
                  {visibleErrors.name ? (
                    <Text style={styles.fieldErrorText}>{visibleErrors.name}</Text>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Adres e-mail</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="twoj@email.com"
                  placeholderTextColor="#7B8794"
                  style={fieldStyle(!!visibleErrors.email)}
                  value={email}
                  onChangeText={text => {
                    clearErrors('email');
                    setEmail(text);
                  }}
                />
                {visibleErrors.email ? (
                  <Text style={styles.fieldErrorText}>{visibleErrors.email}</Text>
                ) : null}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Haslo</Text>
                <TextInput
                  secureTextEntry
                  placeholder="Minimum 8 znakow"
                  placeholderTextColor="#7B8794"
                  style={fieldStyle(!!visibleErrors.password)}
                  value={password}
                  onChangeText={text => {
                    clearErrors('password');
                    setPassword(text);
                  }}
                />
                {visibleErrors.password ? (
                  <Text style={styles.fieldErrorText}>{visibleErrors.password}</Text>
                ) : null}
              </View>

              {isRegister ? (
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Powtorz haslo</Text>
                  <TextInput
                    secureTextEntry
                    placeholder="Wpisz haslo ponownie"
                    placeholderTextColor="#7B8794"
                    style={fieldStyle(!!visibleErrors.confirmPassword)}
                    value={confirmPassword}
                    onChangeText={text => {
                      clearErrors('confirmPassword');
                      setConfirmPassword(text);
                    }}
                  />
                  {visibleErrors.confirmPassword ? (
                    <Text style={styles.fieldErrorText}>
                      {visibleErrors.confirmPassword}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>
                  {isRegister ? 'Akceptuje regulamin' : 'Pozostan zalogowany'}
                </Text>
                <Text style={styles.optionDescription}>
                  {isRegister
                    ? 'Wymagane do utworzenia konta.'
                    : 'Zachowaj sesje na tym urzadzeniu.'}
                </Text>
              </View>
              <Switch
                value={isRegister ? acceptRules : staySignedIn}
                onValueChange={value => {
                  clearErrors();
                  if (isRegister) {
                    setAcceptRules(value);
                    return;
                  }

                  setStaySignedIn(value);
                }}
                trackColor={{false: '#33404E', true: '#7FD1AE'}}
                thumbColor="#F7F4EC"
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
                isPrimaryDisabled && styles.primaryButtonDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color="#F7F4EC" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isRegister ? 'Utworz konto' : 'Zaloguj sie'}
                </Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {isRegister ? 'Masz juz konto?' : 'Nie masz jeszcze konta?'}
              </Text>
              <Pressable
                onPress={() => {
                  clearErrors();
                  setScreen(isRegister ? 'login' : 'register');
                }}>
                <Text style={styles.footerLink}>
                  {isRegister ? 'Wroc do logowania' : 'Przejdz do rejestracji'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D141A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  scrollContentWithInstallPrompt: {
    paddingBottom: 220,
  },
  screenFrame: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  loggedInLayout: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
    gap: 18,
  },
  installCard: {
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    minHeight: 196,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 18,
  },
  installOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  installModal: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 16,
  },
  installCardDark: {
    backgroundColor: '#14212A',
    borderWidth: 1,
    borderColor: '#22323D',
  },
  installCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1DE',
  },
  installCopy: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  installTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  installTitleDark: {
    color: '#F7F4EC',
  },
  installTitleLight: {
    color: '#101418',
  },
  installText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 520,
  },
  installTextDark: {
    color: '#B8C2CC',
  },
  installTextLight: {
    color: '#5F6A72',
  },
  installActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  installSecondaryButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  installSecondaryDark: {
    backgroundColor: '#0F1920',
  },
  installSecondaryLight: {
    backgroundColor: '#EEF3F1',
  },
  installSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  installSecondaryTextDark: {
    color: '#F7F4EC',
  },
  installSecondaryTextLight: {
    color: '#101418',
  },
  installPrimaryButton: {
    backgroundColor: '#33A06F',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  installPrimaryButtonText: {
    color: '#F7FBF9',
    fontSize: 14,
    fontWeight: '800',
  },
  loggedInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  loggedInHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  loggedInTitle: {
    color: '#F7F4EC',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  loggedInSubtitle: {
    color: '#B8C2CC',
    fontSize: 14,
  },
  headerLogoutButton: {
    backgroundColor: '#F3EDE2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  headerLogoutButtonCompact: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  headerLogoutText: {
    color: '#101418',
    fontSize: 14,
    fontWeight: '800',
  },
  dashboardContainer: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
  },
  loadingText: {
    color: '#D7E0E8',
    fontSize: 15,
  },
  heroPanel: {
    backgroundColor: '#14212A',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#22323D',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 8,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#1E322B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
  },
  brandBadgeText: {
    color: '#7FD1AE',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#F7F4EC',
    fontSize: 33,
    lineHeight: 39,
    fontWeight: '800',
    marginBottom: 12,
  },
  heroDescription: {
    color: '#B8C2CC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },
  featureList: {
    backgroundColor: '#0F1920',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#7FD1AE',
    marginTop: 5,
  },
  featureText: {
    flex: 1,
    color: '#D7E0E8',
    fontSize: 14,
    lineHeight: 20,
  },
  formPanel: {
    backgroundColor: '#F3EDE2',
    borderRadius: 30,
    padding: 24,
  },
  eyebrow: {
    color: '#5B655D',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 8,
  },
  formTitle: {
    color: '#101418',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  formSubtitle: {
    color: '#5F6A72',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  inputGroup: {
    gap: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: '#172128',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7CCB9',
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#172128',
  },
  inputError: {
    borderColor: '#A63A2E',
  },
  fieldErrorText: {
    color: '#A63A2E',
    fontSize: 12,
    lineHeight: 16,
  },
  optionRow: {
    marginTop: 18,
    marginBottom: 14,
    backgroundColor: '#E8DFD1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    color: '#172128',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#667078',
    fontSize: 13,
    lineHeight: 18,
  },
  helperText: {
    color: '#52606A',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
    minHeight: 38,
  },
  helperTextError: {
    color: '#A63A2E',
  },
  primaryButton: {
    backgroundColor: '#101418',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    marginBottom: 18,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#F7F4EC',
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: {
    color: '#5F6A72',
    fontSize: 14,
  },
  footerLink: {
    color: '#101418',
    fontSize: 14,
    fontWeight: '800',
  },
});
