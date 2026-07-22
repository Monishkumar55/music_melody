import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function MobileHeader({ title = 'Songstr', user, onAuthPress }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <Text style={styles.logoText}>🎵 {title}</Text>
        <Text style={styles.tagline}>AI Mood Player</Text>
      </View>
      <TouchableOpacity style={styles.authBtn} onPress={onAuthPress} activeOpacity={0.8}>
        <Text style={styles.authBtnText}>
          {user ? `👤 @${user.username}` : '🔑 Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  brandRow: {
    flexDirection: 'column'
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38bdf8'
  },
  tagline: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  authBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38bdf8'
  },
  authBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600'
  }
});
