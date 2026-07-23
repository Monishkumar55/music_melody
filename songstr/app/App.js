import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { MobileHeader } from './components/MobileHeader.js';
import { NavigationBar } from './components/NavigationBar.js';
import { PlayerBar } from './components/PlayerBar.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { DetectScreen } from './screens/DetectScreen.js';
import { BrowseScreen } from './screens/BrowseScreen.js';
import { FavoritesScreen } from './screens/FavoritesScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { AuthService } from '../shared/services/authService.js';
import { ProfileService } from '../shared/services/profileService.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [detectedMood, setDetectedMood] = useState('happy');
  const [user, setUser] = useState({ username: 'demo_user', fullname: 'Demo User' });
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    checkUserSession();
    fetchUserFavorites();
  }, []);

  const checkUserSession = async () => {
    try {
      const data = await AuthService.checkAuth();
      if (data.loggedIn && data.user) {
        setUser(data.user);
      }
    } catch {}
  };

  const fetchUserFavorites = async () => {
    try {
      const favs = await ProfileService.getFavorites();
      setFavorites(favs);
    } catch {
      setFavorites([]);
    }
  };

  const handlePlaySong = (song) => {
    if (currentTrack && currentTrack.title === song.title) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(song);
      setIsPlaying(true);
    }
  };

  const handleToggleFavorite = async (song) => {
    const isExisting = favorites.some(f => f.title === song.title);
    if (isExisting) {
      const updated = favorites.filter(f => f.title !== song.title);
      setFavorites(updated);
    } else {
      const updated = [...favorites, song];
      setFavorites(updated);
      try {
        await ProfileService.addFavorite(song);
      } catch {}
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            initialMood={detectedMood}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        );
      case 'detect':
        return (
          <DetectScreen
            onMoodDetected={(mood) => {
              setDetectedMood(mood);
              setActiveTab('home');
            }}
          />
        );
      case 'browse':
        return (
          <BrowseScreen
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        );
      case 'favorites':
        return (
          <FavoritesScreen
            favorites={favorites}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onLogout={() => setUser(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <MobileHeader
        title="Songstr"
        user={user}
        onAuthPress={() => setActiveTab('profile')}
      />

      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onNext={() => {}}
        onPrevious={() => {}}
      />

      <NavigationBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  screenContainer: {
    flex: 1
  }
});
