import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

const tabItems = [
  'Dashboard',
  'Spizarnia',
  'Skaner',
  'Lista zakupow',
  'Historia',
  'Statystyki',
  'Ustawienia',
];

const lightTheme = {
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

const darkTheme = {
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

const historyItems = [
  'Dodano Mleko 3,2% do lodowki',
  'Zuzyto 1 sztuke Jajek',
  'Przeniesiono Pomidory na liste zakupow',
  'Oznaczono Jogurt naturalny jako kupiony',
];

const wasteTips = [
  'Uzyj pomidorow i salaty do szybkiej salatki na kolacje.',
  'Mleko i jajka przerob na nalezniki albo tosty francuskie.',
  'Sprawdz produkty z krotkim terminem przed kolejnymi zakupami.',
];

function SectionCard({theme, title, subtitle, children}) {
  return (
    <View
      style={[
        styles.sectionCard,
        {backgroundColor: theme.card, borderColor: theme.border},
      ]}>
      <Text style={[styles.sectionTitle, {color: theme.text}]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, {color: theme.muted}]}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function StatCard({theme, label, value, accent}) {
  return (
    <View
      style={[
        styles.statCard,
        {backgroundColor: theme.card, borderColor: theme.border, borderTopColor: accent},
      ]}>
      <Text style={[styles.statValue, {color: theme.text}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: theme.muted}]}>{label}</Text>
    </View>
  );
}

function Dashboard({products, userName, themeMode, onThemeChange, onLogout}) {
  const {width} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [scannerCode, setScannerCode] = useState('');

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isCompact = width < 760;
  const isNarrow = width < 520;

  const expiredProducts = useMemo(
    () => products.filter(product => product.daysLeft < 0),
    [products],
  );
  const expiringSoonProducts = useMemo(
    () => products.filter(product => product.daysLeft >= 0 && product.daysLeft <= 3),
    [products],
  );
  const shoppingItems = useMemo(
    () => products.filter(product => product.daysLeft <= 1),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter(product =>
      `${product.name} ${product.location}`.toLowerCase().includes(query),
    );
  }, [products, searchValue]);

  const riskPercent = products.length
    ? Math.round(((expiredProducts.length + expiringSoonProducts.length) / products.length) * 100)
    : 0;

  function renderDashboard() {
    return (
      <>
        <View style={[styles.heroCard, {backgroundColor: theme.hero}]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroEyebrow, {color: theme.accent}]}>FOODPLAN</Text>
            <Text style={[styles.heroTitle, {color: theme.heroText}]}>
              Domowa spizarnia pod kontrola
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                {color: '#B6C8C7'},
                isCompact && styles.heroSubtitleCompact,
              ]}>
              {userName
                ? `Witaj, ${userName}. Monitoruj terminy, zakupy i ostatnie alerty z jednego miejsca.`
                : 'Monitoruj terminy, zakupy i ostatnie alerty z jednego miejsca.'}
            </Text>
          </View>

          <View
            style={[
              styles.riskBadge,
              isCompact && styles.riskBadgeCompact,
              {backgroundColor: theme.accentSoft},
            ]}>
            <Text style={[styles.riskValue, {color: theme.heroText === '#F7FBF9' ? theme.heroText : theme.text}]}>
              {riskPercent}%
            </Text>
            <Text style={[styles.riskLabel, {color: theme.muted}]}>wskaznik ryzyka</Text>
          </View>
        </View>

        <View style={[styles.statsGrid, isCompact && styles.stackGrid]}>
          <StatCard
            theme={theme}
            label="Wszystkie produkty"
            value={products.length}
            accent={theme.accent}
          />
          <StatCard
            theme={theme}
            label="Konczace sie terminy"
            value={expiringSoonProducts.length}
            accent="#E7A53B"
          />
          <StatCard
            theme={theme}
            label="Po terminie"
            value={expiredProducts.length}
            accent="#D95C4E"
          />
        </View>

        <View style={[styles.twoColumnGrid, isCompact && styles.stackGrid]}>
          <SectionCard
            theme={theme}
            title="Ostatnie alerty"
            subtitle="Produkty wymagajace uwagi w najblizszych dniach.">
            {[...expiredProducts, ...expiringSoonProducts].slice(0, 5).map(product => (
              <View
                key={product.id}
                style={[
                  styles.rowCard,
                  isNarrow && styles.rowCardCompact,
                  {borderBottomColor: theme.border},
                ]}>
                <View>
                  <Text style={[styles.rowTitle, {color: theme.text}]}>{product.name}</Text>
                  <Text style={[styles.rowMeta, {color: theme.muted}]}>
                    {product.location} • {product.expiryDate}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        product.daysLeft < 0 ? theme.dangerSoft : theme.warningSoft,
                    },
                  ]}>
                  <Text style={[styles.statusText, {color: theme.text}]}>
                    {product.daysLeft < 0 ? 'Po terminie' : `${product.daysLeft} dni`}
                  </Text>
                </View>
              </View>
            ))}
          </SectionCard>

          <SectionCard
            theme={theme}
            title="Szybkie akcje"
            subtitle="Najczesciej wykonywane operacje w aplikacji.">
            {['Dodaj produkt', 'Otworz liste zakupow', 'Sprawdz historie'].map(action => (
              <Pressable
                key={action}
                style={[styles.actionButton, {backgroundColor: theme.input, borderColor: theme.border}]}>
                <Text style={[styles.actionButtonText, {color: theme.text}]}>{action}</Text>
              </Pressable>
            ))}
          </SectionCard>
        </View>
      </>
    );
  }

  function renderPantry() {
    return (
      <SectionCard
        theme={theme}
        title="Spizarnia"
        subtitle="Lista wszystkich produktow z lokalizacjami i terminami.">
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Szukaj po nazwie lub lokalizacji"
          placeholderTextColor={theme.muted}
          style={[
            styles.searchInput,
            {backgroundColor: theme.input, borderColor: theme.border, color: theme.text},
          ]}
        />
        {filteredProducts.map(product => (
          <View
            key={product.id}
            style={[
              styles.rowCard,
              isNarrow && styles.rowCardCompact,
              {borderBottomColor: theme.border},
            ]}>
            <View style={[styles.rowPrimary, isNarrow && styles.rowPrimaryCompact]}>
              <Text style={styles.rowEmoji}>{product.emoji || '🍽'}</Text>
              <View>
                <Text style={[styles.rowTitle, {color: theme.text}]}>{product.name}</Text>
                <Text style={[styles.rowMeta, {color: theme.muted}]}>
                  {product.location} • wazne do {product.expiryDate}
                </Text>
              </View>
            </View>
            <Pressable
              style={[
                styles.smallAction,
                isNarrow && styles.smallActionCompact,
                {backgroundColor: theme.accentSoft},
              ]}>
              <Text style={[styles.smallActionText, {color: theme.text}]}>Do zakupow</Text>
            </Pressable>
          </View>
        ))}
      </SectionCard>
    );
  }

  function renderScanner() {
    return (
      <SectionCard
        theme={theme}
        title="Skaner / Dodawanie"
        subtitle="Dodawaj produkty po kodzie albo recznie.">
        <View style={[styles.scannerBox, {backgroundColor: theme.input, borderColor: theme.border}]}>
          <Text style={[styles.scannerTitle, {color: theme.text}]}>Pole skanera</Text>
          <Text style={[styles.scannerSubtitle, {color: theme.muted}]}>
            W tej wersji wpisujesz kod recznie albo uzupelniasz formularz produktu.
          </Text>
          <TextInput
            value={scannerCode}
            onChangeText={setScannerCode}
            placeholder="Np. 5901234123457"
            placeholderTextColor={theme.muted}
            style={[
              styles.searchInput,
              {backgroundColor: theme.card, borderColor: theme.border, color: theme.text},
            ]}
          />
          <Pressable style={[styles.sectionButton, {backgroundColor: theme.navActive}]}>
            <Text style={[styles.sectionButtonText, {color: theme.navActiveText}]}>
              Wyszukaj produkt
            </Text>
          </Pressable>
        </View>
      </SectionCard>
    );
  }

  function renderShopping() {
    return (
      <SectionCard
        theme={theme}
        title="Lista zakupow"
        subtitle="Pozycje do kupienia oraz produkty oznaczone jako kupione.">
        {shoppingItems.map(product => (
          <View
            key={product.id}
            style={[
              styles.rowCard,
              isNarrow && styles.rowCardCompact,
              {borderBottomColor: theme.border},
            ]}>
            <View>
              <Text style={[styles.rowTitle, {color: theme.text}]}>{product.name}</Text>
              <Text style={[styles.rowMeta, {color: theme.muted}]}>
                Dodaj do koszyka przy najblizszej okazji
              </Text>
            </View>
            <Pressable
              style={[
                styles.smallAction,
                isNarrow && styles.smallActionCompact,
                {backgroundColor: theme.accentSoft},
              ]}>
              <Text style={[styles.smallActionText, {color: theme.text}]}>Kupione</Text>
            </Pressable>
          </View>
        ))}
      </SectionCard>
    );
  }

  function renderHistory() {
    return (
      <SectionCard
        theme={theme}
        title="Historia dzialan"
        subtitle="Ostatnie operacje wykonane w aplikacji.">
        {historyItems.map(item => (
          <View key={item} style={styles.historyRow}>
            <View style={[styles.historyDot, {backgroundColor: theme.accent}]} />
            <Text style={[styles.historyText, {color: theme.text}]}>{item}</Text>
          </View>
        ))}
      </SectionCard>
    );
  }

  function renderStats() {
    return (
      <SectionCard
        theme={theme}
        title="Statystyki"
        subtitle="Podsumowanie wykorzystania i ryzyka marnowania produktow.">
        <View style={styles.statsGrid}>
          <StatCard theme={theme} label="Zero waste score" value="78%" accent={theme.accent} />
          <StatCard theme={theme} label="Dodane w miesiacu" value="24" accent="#5D8FE8" />
          <StatCard theme={theme} label="Zmarnowane" value="3" accent="#D95C4E" />
        </View>
        <View style={styles.tipList}>
          {wasteTips.map(tip => (
            <View key={tip} style={[styles.tipCard, {backgroundColor: theme.input}]}>
              <Text style={[styles.tipText, {color: theme.text}]}>{tip}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    );
  }

  function renderSettings() {
    return (
      <SectionCard
        theme={theme}
        title="Ustawienia"
        subtitle="Powiadomienia, motyw oraz podstawowe preferencje aplikacji.">
        <View
          style={[
            styles.settingRow,
            isNarrow && styles.settingRowCompact,
            {borderBottomColor: theme.border},
          ]}>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, {color: theme.text}]}>Motyw ciemny</Text>
            <Text style={[styles.settingText, {color: theme.muted}]}>
              Przelacz aplikacje miedzy jasnym i ciemnym wygladem.
            </Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={value => onThemeChange(value ? 'dark' : 'light')}
            trackColor={{false: '#B5C1BE', true: theme.accent}}
            thumbColor="#F7F4EC"
          />
        </View>
        <View
          style={[
            styles.settingRow,
            isNarrow && styles.settingRowCompact,
            {borderBottomColor: theme.border},
          ]}>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, {color: theme.text}]}>Prog ostrzezen</Text>
            <Text style={[styles.settingText, {color: theme.muted}]}>3 dni przed terminem</Text>
          </View>
        </View>
        <View
          style={[
            styles.settingRow,
            isNarrow && styles.settingRowCompact,
            {borderBottomColor: theme.border},
          ]}>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, {color: theme.text}]}>Lokalizacje polek</Text>
            <Text style={[styles.settingText, {color: theme.muted}]}>
              A1, A2, Lodowka, Zamrazarka
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onLogout}
          style={[styles.sectionButton, {backgroundColor: theme.navActive}]}>
          <Text style={[styles.sectionButtonText, {color: theme.navActiveText}]}>
            Wyloguj
          </Text>
        </Pressable>
      </SectionCard>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'Spizarnia':
        return renderPantry();
      case 'Skaner':
        return renderScanner();
      case 'Lista zakupow':
        return renderShopping();
      case 'Historia':
        return renderHistory();
      case 'Statystyki':
        return renderStats();
      case 'Ustawienia':
        return renderSettings();
      default:
        return renderDashboard();
    }
  }

  return (
    <View style={[styles.page, {backgroundColor: theme.page}]}>
      <ScrollView
        horizontal
        style={styles.tabsScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabsRow, {backgroundColor: theme.nav, borderColor: theme.border}]}>
        {tabItems.map(tab => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                isNarrow && styles.tabButtonCompact,
                {backgroundColor: active ? theme.navActive : 'transparent'},
              ]}>
              <Text
                style={[
                  styles.tabButtonText,
                  {color: active ? theme.navActiveText : theme.navText},
                ]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentInner,
          isNarrow && styles.contentInnerCompact,
        ]}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsRow: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    padding: 8,
    gap: 8,
    alignItems: 'stretch',
    height: 64,
  },
  tabButton: {
    width: 148,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonCompact: {
    width: 128,
    height: 44,
    paddingHorizontal: 10,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    gap: 18,
  },
  contentInnerCompact: {
    padding: 14,
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
  },
  heroSubtitleCompact: {
    maxWidth: '100%',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    minWidth: 112,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  riskBadgeCompact: {
    alignSelf: 'stretch',
    width: '100%',
  },
  riskValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  riskLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  stackGrid: {
    flexDirection: 'column',
  },
  statCard: {
    flexGrow: 1,
    minWidth: 160,
    borderRadius: 22,
    borderWidth: 1,
    borderTopWidth: 4,
    padding: 18,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionCard: {
    flexGrow: 1,
    minWidth: 0,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowCardCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  rowPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowPrimaryCompact: {
    alignItems: 'flex-start',
  },
  rowEmoji: {
    fontSize: 24,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  rowMeta: {
    fontSize: 13,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  smallAction: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallActionCompact: {
    alignSelf: 'flex-start',
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scannerBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  scannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  scannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  sectionButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipList: {
    marginTop: 16,
    gap: 10,
  },
  tipCard: {
    borderRadius: 16,
    padding: 14,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingRowCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  settingText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default Dashboard;
