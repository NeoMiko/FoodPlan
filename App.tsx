import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>FOODPLAN</Text>
        <Text style={styles.title}>Planowanie posiłków</Text>
        <Text style={styles.description}>
          Ekran główny
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101418',
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#182027',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#24303A',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 6,
  },
  eyebrow: {
    color: '#7FD1AE',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: '#F7F4EC',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    marginBottom: 14,
  },
  description: {
    color: '#B8C2CC',
    fontSize: 16,
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  tag: {
    backgroundColor: '#0F1720',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#24303A',
  },
  tagText: {
    color: '#D7E0E8',
    fontSize: 13,
    fontWeight: '600',
  },
});