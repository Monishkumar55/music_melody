import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SongCard } from '../components/SongCard.js';

export function FavoritesScreen({ favorites, currentTrack, isPlaying, onPlaySong, onToggleFavorite }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Your Favorite Tracks ❤️</Text>
      <Text style={styles.subtitle}>{favorites.length} Saved Songs</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyText}>No favorite tracks saved yet.</Text>
          <Text style={styles.emptySubtext}>Tap the heart icon on any song card to save it here.</Text>
        </View>
      ) : (
        favorites.map((song, index) => {
          const isTrackPlaying = isPlaying && currentTrack && currentTrack.title === song.title;
          return (
            <SongCard
              key={index}
              song={song}
              isPlaying={isTrackPlaying}
              onPlayPress={() => onPlaySong(song)}
              onFavoriteToggle={() => onToggleFavorite(song)}
              isFavorite={true}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc'
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600'
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center'
  }
});
