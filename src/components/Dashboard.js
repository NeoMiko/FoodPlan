import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const Dashboard = ({ products }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>Twoja Kuchnia 🍳</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FF6B6B' }]}>
          <Text style={styles.statNumber}>
            {products.filter(p => p.daysLeft < 0).length}
          </Text>
          <Text style={styles.statLabel}>Po terminie</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Wszystkie</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Najbliższe terminy</Text>

      <View style={styles.grid}>
        {products.map(product => (
          <TouchableOpacity key={product.id} style={styles.productCard}>
            <Text style={styles.emoji}>{product.emoji || '📦'}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.expiryDate}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 20 },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: { width: '48%', padding: 20, borderRadius: 20, elevation: 5 },
  statNumber: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: 'white', opacity: 0.9 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#636E72',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  emoji: { fontSize: 30, marginBottom: 10 },
  productName: { fontWeight: 'bold', fontSize: 16 },
  tag: {
    marginTop: 10,
    backgroundColor: '#F1F2F6',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  tagText: { fontSize: 12, color: '#747D8C' },
});

export default Dashboard;
