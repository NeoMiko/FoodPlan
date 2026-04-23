import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { dashboardStyles as styles } from '../styles/AppStyles';
import { getTheme } from '../styles/themes';
import {
  Product,
  ShoppingItem,
  HistoryItem,
  DashboardStats,
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
  onRefresh: () => Promise<void>;
  onAddProduct: (product: AddProductForm) => Promise<void>;
}

export type AddProductForm = {
  name: string;
  emoji?: string;
  location?: string;
  expiry_date?: string;
  quantity: number;
  unit?: string;
  notes?: string;
  barcode?: string;
};

const tabItems = [
  'Dashboard',
  'Spizarnia',
  'Skaner',
  'Lista zakupow',
  'Historia',
  'Statystyki',
  'Ustawienia',
];

const MONTHS_PL = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paz','Lis','Gru'];

interface CardProps {
  theme: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ theme, title, subtitle, children }: CardProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>{subtitle}</Text>
      )}
      {children}
    </View>
  );
}

function StatCard({ theme, label, value, accent }: { theme: any; label: string; value: string | number; accent: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border, borderTopColor: accent, borderTopWidth: 3 }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const EMPTY_FORM: AddProductForm = {
  name: '',
  emoji: '',
  location: '',
  expiry_date: '',
  quantity: 1,
  unit: 'szt',
  notes: '',
  barcode: '',
};

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
  onRefresh,
  onAddProduct,
}) => {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Scanner state
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera');
  const [addForm, setAddForm] = useState<AddProductForm>(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const scannedRef = useRef(false);

  const theme = getTheme(themeMode);
  const isCompact = width < 760;

  useEffect(() => {
    if (activeTab === 'Skaner') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      })();
    } else {
      setCameraActive(false);
      scannedRef.current = false;
    }
  }, [activeTab]);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    return products.filter(p => {
      if (!p.expiry_date) return false;
      const diff = Math.ceil(
        (new Date(p.expiry_date).getTime() - today.getTime()) / (1000 * 3600 * 24),
      );
      return diff >= 0 && diff <= 3;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return query
      ? products.filter(
          p => p.name.toLowerCase().includes(query) || p.location?.toLowerCase().includes(query),
        )
      : products;
  }, [products, searchValue]);

  // --- Stats calculations ---
  const monthlyPurchases = useMemo(() => {
    const now = new Date();
    const counts: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      counts[key] = 0;
    }
    shoppingList.forEach(item => {
      if (!item.is_purchased) return;
      const d = new Date(item.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in counts) counts[key]++;
    });
    return Object.entries(counts).map(([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      return { label: MONTHS_PL[month], count };
    });
  }, [shoppingList]);

  const wasteStats = useMemo(() => {
    const now = new Date();
    const expired = products.filter(p => {
      if (!p.expiry_date) return false;
      return new Date(p.expiry_date).getTime() < now.getTime();
    });
    const byLocation: Record<string, number> = {};
    expired.forEach(p => {
      const loc = p.location || 'Nieznane';
      byLocation[loc] = (byLocation[loc] || 0) + 1;
    });
    return {
      total: expired.length,
      byLocation: Object.entries(byLocation).sort((a, b) => b[1] - a[1]),
      expiredProducts: expired.slice(0, 5),
    };
  }, [products]);

  const handleAction = async (id: string, action: (id: string) => Promise<void>) => {
    setLoadingAction(id);
    try {
      await action(id);
      await onRefresh();
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setCameraActive(false);
    setScannedBarcode(data);
    setAddForm(prev => ({ ...prev, barcode: data, name: data }));
    setScannerMode('manual');
  };

  const handleAddProduct = async () => {
    if (!addForm.name.trim()) {
      Alert.alert('Błąd', 'Nazwa produktu jest wymagana.');
      return;
    }
    setAddLoading(true);
    try {
      await onAddProduct(addForm);
      await onRefresh();
      setAddForm(EMPTY_FORM);
      setScannedBarcode('');
      scannedRef.current = false;
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się dodać produktu.');
    } finally {
      setAddLoading(false);
    }
  };

  // --- Render helpers ---

  const renderDashboard = () => (
    <>
      <View style={[styles.heroCard, { backgroundColor: theme.hero }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroEyebrow, { color: theme.accent }]}>FOODPLAN</Text>
          <Text style={[styles.heroTitle, { color: theme.heroText }]}>
            Witaj, {userName || 'Użytkowniku'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: '#B6C8C7' }]}>
            Masz {stats.expired_count} produktów po terminie.
          </Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.riskValue, { color: theme.text }]}>
            {products.length > 0 ? Math.round((stats.expired_count / products.length) * 100) : 0}%
          </Text>
          <Text style={[styles.riskLabel, { color: theme.muted }]}>ryzyka</Text>
        </View>
      </View>

      <View style={[styles.statsGrid, isCompact && styles.stackGrid]}>
        <StatCard theme={theme} label="W spizarni" value={stats.total_products} accent={theme.accent} />
        <StatCard theme={theme} label="Wygasają" value={stats.expiring_soon_count} accent="#E7A53B" />
        <StatCard theme={theme} label="Po terminie" value={stats.expired_count} accent="#D95C4E" />
      </View>

      <SectionCard theme={theme} title="Alerty terminów" subtitle="Produkty do zużycia na już.">
        {expiringSoon.length === 0 && (
          <Text style={{ color: theme.muted, paddingVertical: 8 }}>Brak pilnych produktów.</Text>
        )}
        {expiringSoon.slice(0, 3).map(p => (
          <View key={p.id} style={[styles.rowCard, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{p.name}</Text>
              <Text style={[styles.rowMeta, { color: theme.muted }]}>
                {p.location} • {p.expiry_date}
              </Text>
            </View>
            <Pressable
              onPress={() => handleAction(p.id, onMoveToShopping)}
              style={[styles.smallAction, { backgroundColor: theme.warningSoft }]}
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
        style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
      />
      {filteredProducts.length === 0 && (
        <Text style={{ color: theme.muted, paddingVertical: 8 }}>Brak produktów.</Text>
      )}
      {filteredProducts.map(p => (
        <View key={p.id} style={[styles.rowCard, { borderBottomColor: theme.border }]}>
          <View style={styles.rowPrimary}>
            <Text style={styles.rowEmoji}>{p.emoji || '📦'}</Text>
            <View>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{p.name}</Text>
              <Text style={[styles.rowMeta, { color: theme.muted }]}>
                {p.quantity} {p.unit} • {p.location}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => handleAction(p.id, onMoveToShopping)}>
            <Text style={{ color: theme.accent, fontWeight: '600' }}>Na listę</Text>
          </Pressable>
        </View>
      ))}
    </SectionCard>
  );

  const renderScanner = () => (
    <>
      <SectionCard theme={theme} title="Skaner produktów" subtitle="Zeskanuj kod lub wpisz ręcznie.">
        
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Pressable
            onPress={() => { setScannerMode('camera'); scannedRef.current = false; setCameraActive(false); }}
            style={[
              styles.smallAction,
              { backgroundColor: scannerMode === 'camera' ? theme.accent : theme.input, flex: 1, alignItems: 'center' },
            ]}
          >
            <Text style={{ color: scannerMode === 'camera' ? '#fff' : theme.text, fontWeight: '700' }}>
              📷 Kamera
            </Text>
          </Pressable>
          <Pressable
            onPress={() => { setScannerMode('manual'); setCameraActive(false); }}
            style={[
              styles.smallAction,
              { backgroundColor: scannerMode === 'manual' ? theme.accent : theme.input, flex: 1, alignItems: 'center' },
            ]}
          >
            <Text style={{ color: scannerMode === 'manual' ? '#fff' : theme.text, fontWeight: '700' }}>
              ✏️ Ręcznie
            </Text>
          </Pressable>
        </View>

        
        {scannerMode === 'camera' && (
          <View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {hasCameraPermission === null && (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <ActivityIndicator color={theme.accent} />
                <Text style={{ color: theme.muted, marginTop: 8 }}>Prośba o uprawnienia...</Text>
              </View>
            )}
            {hasCameraPermission === false && (
              <View style={{ padding: 24, backgroundColor: theme.dangerSoft, borderRadius: 16 }}>
                <Text style={{ color: '#D95C4E', fontWeight: '700', marginBottom: 4 }}>Brak dostępu do kamery</Text>
                <Text style={{ color: theme.muted, fontSize: 13 }}>
                  Zmień uprawnienia w ustawieniach urządzenia lub użyj trybu ręcznego.
                </Text>
              </View>
            )}
            {hasCameraPermission === true && !cameraActive && (
              <Pressable
                onPress={() => { scannedRef.current = false; setCameraActive(true); }}
                style={[styles.sectionButton, { backgroundColor: theme.accentSoft, marginTop: 0 }]}
              >
                <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 15 }}>
                  Uruchom skaner
                </Text>
              </Pressable>
            )}
            {hasCameraPermission === true && cameraActive && (
              <>
                <CameraView
                  style={{ height: 260, borderRadius: 16 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'code128', 'code39', 'upc_a', 'upc_e'] }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
                <Pressable
                  onPress={() => { setCameraActive(false); scannedRef.current = false; }}
                  style={[styles.smallAction, { backgroundColor: theme.dangerSoft, alignSelf: 'center', marginTop: 10 }]}
                >
                  <Text style={{ color: '#D95C4E', fontWeight: '700' }}>Zatrzymaj</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {scannedBarcode !== '' && (
          <View style={{ backgroundColor: theme.accentSoft, borderRadius: 12, padding: 10, marginBottom: 12 }}>
            <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '700' }}>
              ✓ Zeskanowano: {scannedBarcode}
            </Text>
          </View>
        )}
      </SectionCard>

      
      <SectionCard theme={theme} title="Dodaj produkt" subtitle="Uzupełnij dane i zapisz.">
        {addSuccess && (
          <View style={{ backgroundColor: theme.accentSoft, borderRadius: 12, padding: 10, marginBottom: 12 }}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>✓ Produkt dodany pomyślnie!</Text>
          </View>
        )}

     
        <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 4, color: theme.text }}>
           Nazwa *
        </Text>
        <TextInput
          value={addForm.name}
          onChangeText={v => setAddForm(f => ({ ...f, name: v }))}
          placeholder="np. Mleko"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
        />

        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Emoji</Text>
            <TextInput
              value={addForm.emoji}
              onChangeText={v => setAddForm(f => ({ ...f, emoji: v }))}
              placeholder="🥛"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Lokalizacja</Text>
            <TextInput
              value={addForm.location}
              onChangeText={v => setAddForm(f => ({ ...f, location: v }))}
              placeholder="np. Lodówka"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            />
          </View>
        </View>

        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Ilość</Text>
            <TextInput
              value={String(addForm.quantity)}
              onChangeText={v => setAddForm(f => ({ ...f, quantity: Number(v) || 1 }))}
              keyboardType="numeric"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Jednostka</Text>
            <TextInput
              value={addForm.unit}
              onChangeText={v => setAddForm(f => ({ ...f, unit: v }))}
              placeholder="szt / ml / g"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            />
          </View>
        </View>

        
        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
          Data ważności (YYYY-MM-DD)
        </Text>
        <TextInput
          value={addForm.expiry_date}
          onChangeText={v => setAddForm(f => ({ ...f, expiry_date: v }))}
          placeholder="2025-12-31"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
        />

        
        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Notatki</Text>
        <TextInput
          value={addForm.notes}
          onChangeText={v => setAddForm(f => ({ ...f, notes: v }))}
          placeholder="Opcjonalne..."
          placeholderTextColor={theme.muted}
          multiline
          numberOfLines={2}
          style={[
            styles.searchInput,
            { backgroundColor: theme.input, color: theme.text, borderColor: theme.border, minHeight: 60 },
          ]}
        />

       
        <Pressable
          onPress={handleAddProduct}
          disabled={addLoading}
          style={[
            styles.sectionButton,
            { backgroundColor: theme.accent, marginTop: 8, opacity: addLoading ? 0.6 : 1 },
          ]}
        >
          {addLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
              + Dodaj produkt
            </Text>
          )}
        </Pressable>
      </SectionCard>
    </>
  );

  const renderShopping = () => (
    <SectionCard theme={theme} title="Lista zakupów">
      {shoppingList.length === 0 && (
        <Text style={{ color: theme.muted, paddingVertical: 8 }}>Lista jest pusta.</Text>
      )}
      {shoppingList.map(item => (
        <View
          key={item.id}
          style={[styles.rowCard, { borderBottomColor: theme.border, opacity: item.is_purchased ? 0.5 : 1 }]}
        >
          <Text
            style={[styles.rowTitle, { color: theme.text, textDecorationLine: item.is_purchased ? 'line-through' : 'none' }]}
          >
            {item.item_name} ({item.quantity} {item.unit})
          </Text>
          {!item.is_purchased && (
            <Pressable
              onPress={() => handleAction(item.id, onMarkPurchased)}
              style={[styles.smallAction, { backgroundColor: theme.accentSoft }]}
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
      {history.length === 0 && (
        <Text style={{ color: theme.muted, paddingVertical: 8 }}>Brak historii.</Text>
      )}
      {history.map(item => (
        <View key={item.id} style={styles.historyRow}>
          <View style={[styles.historyDot, { backgroundColor: theme.accent }]} />
          <View>
            <Text style={[styles.historyText, { color: theme.text }]}>{item.description}</Text>
            <Text style={{ color: theme.muted, fontSize: 10 }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );

  const renderStatystyki = () => {
    const chartWidth = Math.min(width - 80, 600);
    const chartHeight = 160;
    const barAreaWidth = chartWidth - 40;
    const maxCount = Math.max(...monthlyPurchases.map(m => m.count), 1);
    const barWidth = Math.floor(barAreaWidth / monthlyPurchases.length) - 6;

    return (
      <>
        
        <SectionCard theme={theme} title="Zakupy miesięcznie" subtitle="Ostatnie 6 miesięcy.">
          {monthlyPurchases.every(m => m.count === 0) ? (
            <Text style={{ color: theme.muted, paddingVertical: 8 }}>Brak danych zakupowych.</Text>
          ) : (
            <Svg width={chartWidth} height={chartHeight + 30} style={{ alignSelf: 'center' }}>
              {monthlyPurchases.map((m, i) => {
                const barH = maxCount > 0 ? Math.max(4, Math.round((m.count / maxCount) * chartHeight)) : 4;
                const x = 20 + i * (barAreaWidth / monthlyPurchases.length);
                const y = chartHeight - barH;
                return (
                  <G key={i}>
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx={6}
                      fill={theme.accent}
                      opacity={0.85}
                    />
                    <SvgText
                      x={x + barWidth / 2}
                      y={chartHeight + 16}
                      fontSize={11}
                      fill={theme.muted}
                      textAnchor="middle"
                    >
                      {m.label}
                    </SvgText>
                    {m.count > 0 && (
                      <SvgText
                        x={x + barWidth / 2}
                        y={y - 4}
                        fontSize={11}
                        fill={theme.text}
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {m.count}
                      </SvgText>
                    )}
                  </G>
                );
              })}
            </Svg>
          )}
        </SectionCard>

        
        <SectionCard theme={theme} title="Śledzenie strat" subtitle="Produkty po terminie ważności.">
          <View style={[styles.statsGrid, isCompact && styles.stackGrid, { marginBottom: 16 }]}>
            <StatCard theme={theme} label="Przeterminowane" value={wasteStats.total} accent="#D95C4E" />
            <StatCard
              theme={theme}
              label="% spizarni"
              value={
                products.length > 0
                  ? `${Math.round((wasteStats.total / products.length) * 100)}%`
                  : '0%'
              }
              accent="#E7A53B"
            />
          </View>

          {wasteStats.byLocation.length > 0 && (
            <>
              <Text style={{ color: theme.muted, fontSize: 13, marginBottom: 8 }}>
                Straty według lokalizacji:
              </Text>
              {wasteStats.byLocation.map(([loc, count]) => {
                const pct = wasteStats.total > 0 ? Math.round((count / wasteStats.total) * 100) : 0;
                return (
                  <View key={loc} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: theme.text, fontSize: 13 }}>{loc}</Text>
                      <Text style={{ color: theme.muted, fontSize: 13 }}>{count} szt ({pct}%)</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 999 }}>
                      <View
                        style={{
                          height: 6,
                          width: `${pct}%`,
                          backgroundColor: '#D95C4E',
                          borderRadius: 999,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {wasteStats.expiredProducts.length > 0 && (
            <>
              <Text style={{ color: theme.muted, fontSize: 13, marginTop: 16, marginBottom: 8 }}>
                Przeterminowane produkty:
              </Text>
              {wasteStats.expiredProducts.map(p => (
                <View key={p.id} style={[styles.rowCard, { borderBottomColor: theme.border }]}>
                  <View>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>{p.emoji || '📦'} {p.name}</Text>
                    <Text style={[styles.rowMeta, { color: '#D95C4E' }]}>
                      Wygasło: {p.expiry_date} • {p.location}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleAction(p.id, onMoveToShopping)}
                    style={[styles.smallAction, { backgroundColor: theme.dangerSoft }]}
                  >
                    <Text style={{ color: '#D95C4E', fontSize: 12 }}>Na listę</Text>
                  </Pressable>
                </View>
              ))}
            </>
          )}

          {wasteStats.total === 0 && (
            <Text style={{ color: theme.accent, paddingVertical: 8, fontWeight: '700' }}>
              ✓ Brak przeterminowanych produktów!
            </Text>
          )}
        </SectionCard>
      </>
    );
  };

  const renderContent = () => {
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
        return renderStatystyki();
      case 'Ustawienia':
        return (
          <SectionCard theme={theme} title="Ustawienia">
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <Text style={{ color: theme.text }}>Tryb ciemny</Text>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={v => onThemeChange(v ? 'dark' : 'light')}
                trackColor={{ false: '#ccc', true: theme.accent }}
              />
            </View>
            <Pressable
              onPress={onLogout}
              style={[styles.sectionButton, { marginTop: 20, backgroundColor: theme.dangerSoft }]}
            >
              <Text style={{ color: '#D95C4E', textAlign: 'center', fontWeight: 'bold' }}>
                Wyloguj się
              </Text>
            </Pressable>
          </SectionCard>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.page }]}>
      <View style={[styles.tabsRow, { backgroundColor: theme.nav, borderColor: theme.border }]}>
        {tabItems.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && { backgroundColor: theme.navActive }]}
          >
            <Text
              style={[
                styles.tabButtonText,
                { color: activeTab === tab ? theme.navActiveText : theme.navText },
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default Dashboard;