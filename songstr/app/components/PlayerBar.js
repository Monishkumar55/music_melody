import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export function PlayerBar({ currentTrack, isPlaying, onTogglePlay, onNext, onPrevious }) {
  if (!currentTrack) return null;

  const coverUrl = currentTrack.cover_url || currentTrack.album_art || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';

  return (
    <View style={styles.playerContainer}>
      <Image source={{ uri: coverUrl }} style={styles.thumbArt} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlBtn} onPress={onPrevious}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseBtn} onPress={onTogglePlay}>
          <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={onNext}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#38bdf8',
    elevation: 8
  },
  thumbArt: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1e293b'
  },
  trackInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10
  },
  trackTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold'
  },
  trackArtist: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  controlBtn: {
    padding: 6
  },
  controlIcon: {
    color: '#94a3b8',
    fontSize: 18
  },
  playPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playPauseIcon: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
