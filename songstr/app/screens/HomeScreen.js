import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RecommendationService } from '../../shared/services/recommendationService.js';
import { SongCard } from '../components/SongCard.js';

const MOODS = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
const LANGUAGES = ['All', 'Tamil', 'Telugu', 'Malayalam', 'Hindi', 'English', 'Kannada', 'Bengali', 'Punjabi', 'Korean', 'Japanese'];

export function HomeScreen({ currentTrack, isPlaying, onPlaySong, onToggleFavorite, favorites }) {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSongs(selectedMood, selectedLanguage);
  }, [selectedMood, selectedLanguage]);

  const loadSongs = async (mood, lang) => {
    setLoading(true);
    try {
      const data = await RecommendationService.getSongs(mood, lang);
      setSongs(data);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Select Your Mood ✨</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
        {MOODS.map(mood => (
          <TouchableOpacity
            key={mood}
            style={[styles.moodChip, selectedMood === mood && styles.activeMoodChip]}
            onPress={() => setSelectedMood(mood)}
          >
            <Text style={[styles.chipText, selectedMood === mood && styles.activeChipText]}>
              {mood.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Select Language 🌐</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity
            key={lang}
            style={[styles.langChip, selectedLanguage === lang && styles.activeLangChip]}
            onPress={() => setSelectedLanguage(lang)}
          >
            <Text style={[styles.langText, selectedLanguage === lang && styles.activeLangText]}>
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recommended Tracks 🎵</Text>
        <Text style={styles.countText}>{songs.length} Tracks</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 20 }} />
      ) : songs.length === 0 ? (
        <Text style={styles.emptyText}>No recommendations found for this selection.</Text>
      ) : (
        songs.map((song, index) => {
          const isTrackPlaying = isPlaying && currentTrack && currentTrack.title === song.title;
          const isFav = favorites.some(f => f.title === song.title);
          return (
            <SongCard
              key={index}
              song={song}
              isPlaying={isTrackPlaying}
              onPlayPress={() => onPlaySong(song)}
              onFavoriteToggle={() => onToggleFavorite(song)}
              isFavorite={isFav}
            />
          );
        })
      )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginVertical: 8
  },
  chipScrollView: {
    flexDirection: 'row',
    marginBottom: 12
  },
  moodChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeMoodChip: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8'
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  activeChipText: {
    color: '#0f172a',
    fontWeight: 'bold'
  },
  langChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeLangChip: {
    backgroundColor: '#1e293b',
    borderColor: '#38bdf8'
  },
  langText: {
    color: '#64748b',
    fontSize: 12
  },
  activeLangText: {
    color: '#38bdf8',
    fontWeight: 'bold'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6
  },
  countText: {
    color: '#94a3b8',
    fontSize: 12
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 30
  }
});
