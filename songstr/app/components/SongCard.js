import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export function SongCard({ song, isPlaying, onPlayPress, onFavoriteToggle, isFavorite }) {
  const coverUrl = song.cover_url || song.album_art || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';

  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: coverUrl }} style={styles.coverArt} />
      <View style={styles.infoContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artistText} numberOfLines={1}>
          {song.artist} {song.movie ? `• ${song.movie}` : ''}
        </Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{song.mood || 'happy'}</Text>
          <Text style={styles.badge}>{song.language || 'Tamil'}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => onFavoriteToggle && onFavoriteToggle(song)}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playingBtn]}
          onPress={() => onPlayPress && onPlayPress(song)}
          activeOpacity={0.8}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  coverArt: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#0f172a'
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc'
  },
  artistText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6
  },
  badge: {
    fontSize: 10,
    color: '#38bdf8',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  favoriteBtn: {
    padding: 8
  },
  favoriteIcon: {
    fontSize: 18
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playingBtn: {
    backgroundColor: '#f43f5e'
  },
  playIcon: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
