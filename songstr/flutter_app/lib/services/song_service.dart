import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/song.dart';

class SongService {
  /// Search songs from JioSaavn via our backend proxy
  Future<List<Song>> searchJioSaavn(String query, {int limit = 10}) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.jiosaavnSearchUrl}?q=${Uri.encodeComponent(query)}&limit=$limit'),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['results'] as List).map((s) => Song.fromJson(s)).toList();
    }
    return [];
  }

  /// Search songs from Deezer via our backend proxy
  Future<List<Song>> searchDeezer(String query, {int limit = 10}) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.deezerSearchUrl}?q=${Uri.encodeComponent(query)}&limit=$limit'),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['results'] as List).map((s) => Song.fromJson(s)).toList();
    }
    return [];
  }

  /// Fetch songs by mood and language from our backend DB
  Future<List<Song>> fetchByMood(String mood, {String lang = 'All'}) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.songsUrl}?mood=$mood&lang=$lang&limit=50'),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['songs'] as List).map((s) => Song.fromJson(s)).toList();
    }
    return [];
  }

  /// Search across our backend DB
  Future<List<Song>> search(String query) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.searchUrl}?q=${Uri.encodeComponent(query)}'),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['results'] as List).map((s) => Song.fromJson(s)).toList();
    }
    return [];
  }

  /// Get the streaming URL for a song
  String getStreamUrl(Song song) {
    if (song.songId != null) {
      return '${ApiConfig.streamUrl}?songId=${Uri.encodeComponent(song.songId!)}';
    }
    return '${ApiConfig.streamUrl}?title=${Uri.encodeComponent(song.title)}&artist=${Uri.encodeComponent(song.artist)}';
  }

  /// Unified search: tries JioSaavn first, falls back to Deezer
  Future<List<Song>> searchAll(String query, {int limit = 15}) async {
    try {
      final results = await searchJioSaavn(query, limit: limit);
      if (results.isNotEmpty) return results;
    } catch (_) {}

    try {
      return await searchDeezer(query, limit: limit);
    } catch (_) {}

    return [];
  }

  /// Get favorite songs
  Future<List<Song>> getFavorites(String token) async {
    final res = await http.get(
      Uri.parse(ApiConfig.favoritesUrl),
      headers: {'Cookie': 'token=$token'},
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['favorites'] as List).map((s) => Song.fromJson(s)).toList();
    }
    return [];
  }

  /// Add to favorites
  Future<bool> addFavorite(String token, Song song) async {
    final res = await http.post(
      Uri.parse(ApiConfig.favoritesUrl),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=$token',
      },
      body: jsonEncode({'song': song.toJson()}),
    );
    return res.statusCode == 200 || res.statusCode == 201;
  }

  /// Remove from favorites
  Future<bool> removeFavorite(String token, String title, String artist) async {
    final res = await http.delete(
      Uri.parse(ApiConfig.favoritesUrl),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=$token',
      },
      body: jsonEncode({'title': title, 'artist': artist}),
    );
    return res.statusCode == 200;
  }
}
