import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ProfileService } from '../../shared/services/profileService.js';
import { AuthService } from '../../shared/services/authService.js';

export function ProfileScreen({ user, onLogout }) {
  const [fullname, setFullname] = useState(user?.fullname || 'Music Enthusiast');
  const [bio, setBio] = useState(user?.bio || 'Lover of AI mood recommendations.');
  const [favoriteGenres, setFavoriteGenres] = useState(user?.favoriteGenres || 'Pop, Classical, Ambient');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await ProfileService.updateProfile({ fullname, bio, favoriteGenres });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Notice', e.message || 'Profile saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutPress = async () => {
    try {
      await AuthService.logout();
    } catch {}
    if (onLogout) onLogout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{(user?.username || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.fullname || 'Demo User'}</Text>
        <Text style={styles.userHandle}>@{user?.username || 'demo_user'}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullname}
          onChangeText={setFullname}
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Favorite Genres</Text>
        <TextInput
          style={styles.input}
          value={favoriteGenres}
          onChangeText={setFavoriteGenres}
          placeholderTextColor="#64748b"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>Logout Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  contentContainer: {
    padding: 16
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc'
  },
  userHandle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top'
  },
  saveBtn: {
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  saveBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold'
  },
  logoutBtn: {
    backgroundColor: '#9f1239',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
