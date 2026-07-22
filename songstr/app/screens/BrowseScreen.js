import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { RecommendationService } from '../../shared/services/recommendationService.js';
import { SongCard } from '../components/SongCard.js';

export function BrowseScreen({ currentTrack, isPlaying, onPlaySong, onToggleFavorite, favorites }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await RecommendationService.searchSongs(query);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Search Music Catalog 🔍</Text>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by song, artist, movie or keyword..."
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 20 }} />
      ) : searched && results.length === 0 ? (
        <Text style={styles.emptyText}>No results found for "{query}".</Text>
      ) : (
        results.map((song, index) => {
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
    paddingVertical: 10
  },
  searchBtn: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  searchBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: 'bold'
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 30
  }
});
