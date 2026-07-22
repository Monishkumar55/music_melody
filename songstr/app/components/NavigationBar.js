import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'detect', label: 'Mood AI', icon: '✨' },
  { id: 'browse', label: 'Search', icon: '🔍' },
  { id: 'favorites', label: 'Saved', icon: '❤️' },
  { id: 'profile', label: 'Profile', icon: '👤' }
];

export function NavigationBar({ activeTab, onTabPress }) {
  return (
    <View style={styles.tabContainer}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isActive && styles.activeTabItem]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    elevation: 10
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  activeTabItem: {
    backgroundColor: '#1e293b'
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500'
  },
  activeTabLabel: {
    color: '#38bdf8',
    fontWeight: 'bold'
  }
});
