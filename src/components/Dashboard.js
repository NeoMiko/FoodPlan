import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { dashboardStyles as styles } from '../styles/AppStyles';
import { getTheme } from '../styles/themes';
import {
  Product,
  ShoppingItem,
  HistoryItem,
  DashboardStats,
  AddProductPayload,
} from '../auth/types';

interface DashboardProps {
  products: Product[];
  shoppingList: ShoppingItem[];
  history: HistoryItem[];
  stats: DashboardStats;
  userName: string | null;
  themeMode: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
  onMoveToShopping: (productId: string) => Promise<void>;
  onMarkPurchased: (itemId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const tabItems = [
  'Dashboard',
  'Spizarnia',
  'Skaner',
  'Lista zakupow',
  'Historia',
  'Statystyki',
  'Ustawienia',
];

const wasteTips = [
  'Uzyj produktów z krótkim terminem do przygotowania zapiekanki.',
  'Mleko i jajka przerób na naleśniki, jeśli zbliża się data ważności.',
  'Zamroź nadmiar owoców i warzyw, zanim stracą świeżość.',
];

interface CardProps {
  theme: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ theme, title, subtitle, children }: CardProps) {
  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
}

function StatCard({
  theme,
  label,
  value,
  accent,
}: {
  theme: any,
  label: string,
  value: string | number,
  accent: string,
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderTopColor: accent,
          borderTopWidth: 3,
        },
      ]}
    >
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const Dashboard: React.FC<DashboardProps> = ({
  products,
  shoppingList,
  history,
  stats,
  userName,
  themeMode,
  onThemeChange,
  onLogout,
  onMoveToShopping,
  onMarkPurchased,
  refreshData,
}) => {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [loadingAction, setLoadingAction] = (useState < string) | (null > null);

  const theme = getTheme(themeMode);
  const isCompact = width < 760;
  const isNarrow = width < 520;

  const expiringSoon = useMemo(() => {
    const today = new Date();
    return products.filter(p => {
      if (!p.expiry_date) return false;
      const diff = Math.ceil(
        (new Date(p.expiry_date).getTime() - today.getTime()) /
          (1000 * 3600 * 24),
      );
      return diff >= 0 && diff <= 3;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return query
      ? products.filter(
          p =>
            p.name.toLowerCase().includes(query) ||
            p.location?.toLowerCase().includes(query),
        )
      : products;
  }, [products, searchValue]);

  const handleAction = async (
    id: string,
    action: (id: string) => Promise<void>,
  ) => {
    setLoadingAction(id);
    try {
      await action(id);
      await refreshData();
    } finally {
      setLoadingAction(null);
    }
  };

  const renderDashboard = () => (
    <>
      <View style={[styles.heroCard, { backgroundColor: theme.hero }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroEyebrow, { color: theme.accent }]}>
            FOODPLAN
          </Text>
          <Text style={[styles.heroTitle, { color: theme.heroText }]}>
            Witaj, {userName || 'Użytkowniku'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: '#B6C8C7' }]}>
            Masz {stats.expired_count} produktów po terminie. Wymagają one
            natychmiastowej uwagi.
          </Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.riskValue, { color: theme.text }]}>
            {products.length > 0
              ? Math.round((stats.expired_count / products.length) * 100)
              : 0}
            %
          </Text>
          <Text style={[styles.riskLabel, { color: theme.muted }]}>
            ryzyka strat
          </Text>
        </View>
      </View>

      <View style={[styles.statsGrid, isCompact && styles.stackGrid]}>
        <StatCard
          theme={theme}
          label="W spizarni"
          value={stats.total_products}
          accent={theme.accent}
        />
        <StatCard
          theme={theme}
          label="Wygasają"
          value={stats.expiring_soon_count}
          accent="#E7A53B"
        />
        <StatCard
          theme={theme}
          label="Po terminie"
          value={stats.expired_count}
          accent="#D95C4E"
        />
      </View>

      <SectionCard
        theme={theme}
        title="Alerty terminów"
        subtitle="Produkty do zużycia na już."
      >
        {expiringSoon.slice(0, 3).map(p => (
          <View
            key={p.id}
            style={[styles.rowCard, { borderBottomColor: theme.border }]}
          >
            <View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>
                {p.name}
              </Text>
              <Text style={[styles.rowMeta, { color: theme.muted }]}>
                {p.location} • {p.expiry_date}
              </Text>
            </View>
            <Pressable
              onPress={() => handleAction(p.id, onMoveToShopping)}
              style={[
                styles.smallAction,
                { backgroundColor: theme.warningSoft },
              ]}
            >
              <Text style={{ color: theme.text, fontSize: 12 }}>Na listę</Text>
            </Pressable>
          </View>
        ))}
      </SectionCard>
    </>
  );

  const renderPantry = () => (
    <SectionCard theme={theme} title="Twoja Spizarnia">
      <TextInput
        value={searchValue}
        onChangeText={setSearchValue}
        placeholder="Szukaj produktu..."
        placeholderTextColor={theme.muted}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.input,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
      />
      {filteredProducts.map(p => (
        <View
          key={p.id}
          style={[styles.rowCard, { borderBottomColor: theme.border }]}
        >
          <View style={styles.rowPrimary}>
            <Text style={styles.rowEmoji}>{p.emoji || '📦'}</Text>
            <View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>
                {p.name}
              </Text>
              <Text style={[styles.rowMeta, { color: theme.muted }]}>
                {p.quantity} {p.unit} • {p.location}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => handleAction(p.id, onMoveToShopping)}>
            <Text style={{ color: theme.accent, fontWeight: '600' }}>
              Przenieś
            </Text>
          </Pressable>
        </View>
      ))}
    </SectionCard>
  );

  const renderShopping = () => (
    <SectionCard theme={theme} title="Lista zakupów">
      {shoppingList.map(item => (
        <View
          key={item.id}
          style={[
            styles.rowCard,
            {
              borderBottomColor: theme.border,
              opacity: item.is_purchased ? 0.5 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.rowTitle,
              {
                color: theme.text,
                textDecorationLine: item.is_purchased ? 'line-through' : 'none',
              },
            ]}
          >
            {item.item_name} ({item.quantity} {item.unit})
          </Text>
          {!item.is_purchased && (
            <Pressable
              onPress={() => handleAction(item.id, onMarkPurchased)}
              style={[
                styles.smallAction,
                { backgroundColor: theme.accentSoft },
              ]}
            >
              {loadingAction === item.id ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={{ color: theme.text }}>Kupione</Text>
              )}
            </Pressable>
          )}
        </View>
      ))}
    </SectionCard>
  );

  const renderHistory = () => (
    <SectionCard theme={theme} title="Ostatnia aktywność">
      {history.map(item => (
        <View key={item.id} style={styles.historyRow}>
          <View
            style={[styles.historyDot, { backgroundColor: theme.accent }]}
          />
          <View>
            <Text style={[styles.historyText, { color: theme.text }]}>
              {item.description}
            </Text>
            <Text style={{ color: theme.muted, fontSize: 10 }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );

  return (
    <View style={[styles.page, { backgroundColor: theme.page }]}>
      <ScrollView
        horizontal
        style={styles.tabsScroll}
        showsHorizontalScrollIndicator={false}
      >
        <View
          style={[
            styles.tabsRow,
            { backgroundColor: theme.nav, borderColor: theme.border },
          ]}
        >
          {tabItems.map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && { backgroundColor: theme.navActive },
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  {
                    color:
                      activeTab === tab ? theme.navActiveText : theme.navText,
                  },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
      >
        {activeTab === 'Spizarnia' && renderPantry()}
        {activeTab === 'Lista zakupow' && renderShopping()}
        {activeTab === 'Historia' && renderHistory()}
        {activeTab === 'Dashboard' && renderDashboard()}
        {activeTab === 'Ustawienia' && (
          <SectionCard theme={theme} title="Ustawienia">
            <View style={styles.settingRow}>
              <Text style={{ color: theme.text }}>Tryb ciemny</Text>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={v => onThemeChange(v ? 'dark' : 'light')}
                trackColor={{ false: '#ccc', true: theme.accent }}
              />
            </View>
            <Pressable
              onPress={onLogout}
              style={[
                styles.sectionButton,
                { marginTop: 20, backgroundColor: theme.dangerSoft },
              ]}
            >
              <Text
                style={{
                  color: '#D95C4E',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Wyloguj się
              </Text>
            </Pressable>
          </SectionCard>
        )}
      </ScrollView>
    </View>
  );
};

export default Dashboard;
