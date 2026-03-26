import React, {useMemo, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type Screen = 'login' | 'register';

const features = [
  'Planowanie posilkow na caly tydzien',
  'Lista zakupow tworzona automatycznie',
  'Przepisy i skladniki zawsze pod reka',
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [acceptRules, setAcceptRules] = useState(false);

  const isRegister = screen === 'register';
  const isRegisterEmailValid = emailRegex.test(email.trim());
  const isRegisterPasswordValid = password.length >= 8;

  const helperText = useMemo(() => {
    if (!email || !password) {
      return 'Uzupelnij email i haslo, aby kontynuowac.';
    }

    if (isRegister && !isRegisterEmailValid) {
      return 'Podaj poprawny adres e-mail z @ i domena.';
    }

    if (isRegister && !isRegisterPasswordValid) {
      return 'Haslo musi miec co najmniej 8 znakow.';
    }

    if (isRegister && password !== confirmPassword) {
      return 'Hasla musza byc identyczne.';
    }

    if (isRegister && !acceptRules) {
      return 'Zaakceptuj regulamin, aby utworzyc konto.';
    }

    return isRegister
      ? 'Mozesz utworzyc konto i przejsc dalej.'
      : '';
  }, [
    acceptRules,
    confirmPassword,
    email,
    isRegister,
    isRegisterEmailValid,
    isRegisterPasswordValid,
    password,
  ]);

  const isPrimaryDisabled =
    !email ||
    !password ||
    (isRegister &&
      (!name ||
        !confirmPassword ||
        !isRegisterEmailValid ||
        !isRegisterPasswordValid ||
        password !== confirmPassword ||
        !acceptRules));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              ) : null}

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Adres e-mail</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="twoj@email.com"
                  placeholderTextColor="#7B8794"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Haslo</Text>
                <TextInput
                  secureTextEntry
                  placeholder="Minimum 8 znakow"
                  placeholderTextColor="#7B8794"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {isRegister ? (
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Powtorz haslo</Text>
                  <TextInput
                    secureTextEntry
                    placeholder="Wpisz haslo ponownie"
                    placeholderTextColor="#7B8794"
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
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
                onValueChange={isRegister ? setAcceptRules : setStaySignedIn}
                trackColor={{false: '#33404E', true: '#7FD1AE'}}
                thumbColor="#F7F4EC"
              />
            </View>

            <Text style={styles.helperText}>{helperText}</Text>

            <Pressable
              disabled={isPrimaryDisabled}
              style={[
                styles.primaryButton,
                isPrimaryDisabled && styles.primaryButtonDisabled,
              ]}>
              <Text style={styles.primaryButtonText}>
                {isRegister ? 'Utworz konto' : 'Zaloguj sie'}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {isRegister ? 'Masz juz konto?' : 'Nie masz jeszcze konta?'}
              </Text>
              <Pressable onPress={() => setScreen(isRegister ? 'login' : 'register')}>
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
  screenFrame: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
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
  },
  primaryButton: {
    backgroundColor: '#101418',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
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
