import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/song.dart';

class SupabaseSyncService {
  static final SupabaseSyncService instance = SupabaseSyncService._internal();
  SupabaseSyncService._internal();

  SupabaseClient get _client => Supabase.instance.client;

  String? get currentUserId => _client.auth.currentUser?.id;

  RealtimeChannel? _userChannel;
  final _favoritesController = StreamController<List<Song>>.broadcast();
  final _queueController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<List<Song>> get favoritesStream => _favoritesController.stream;
  Stream<Map<String, dynamic>> get queueStream => _queueController.stream;

  List<Song> _cachedFavorites = [];
  Map<String, dynamic> _cachedQueueState = {};

  /// Initialize Realtime subscriptions for authenticated user
  void initRealtimeSubscription() {
    final userId = currentUserId;
    if (userId == null) return;

    _userChannel?.unsubscribe();
    _userChannel = _client.channel('public:user_$userId')
      ..onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'favorite_songs',
        filter: PostgresChangeFilter(
          type: PostgresChangeFilterType.eq,
          column: 'user_id',
          value: userId,
        ),
        callback: (payload) async {
          debugPrint('[SUPABASE REALTIME] Favorite songs updated: ${payload.eventType}');
          await fetchFavorites();
        },
      )
      ..onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'user_queues',
        filter: PostgresChangeFilter(
          type: PostgresChangeFilterType.eq,
          column: 'user_id',
          value: userId,
        ),
        callback: (payload) async {
          debugPrint('[SUPABASE REALTIME] Queue updated: ${payload.eventType}');
          await fetchQueueState();
        },
      )
      ..subscribe();

    fetchFavorites();
    fetchQueueState();
  }

  /// Stop Realtime subscription
  void dispose() {
    _userChannel?.unsubscribe();
    _favoritesController.close();
    _queueController.close();
  }

  /// Fetch user favorites from Supabase filtered strictly by user.id
  Future<List<Song>> fetchFavorites() async {
    final userId = currentUserId;
    if (userId == null) return _cachedFavorites;

    try {
      final res = await _client
          .from('favorite_songs')
          .select('song_id, favorited_at, songs(*)')
          .eq('user_id', userId)
          .order('favorited_at', ascending: false);

      final songs = (res as List)
          .map((row) {
            if (row['songs'] != null) {
              return Song.fromJson(Map<String, dynamic>.from(row['songs']));
            }
            return null;
          })
          .whereType<Song>()
          .toList();

      _cachedFavorites = songs;
      _favoritesController.add(_cachedFavorites);

      // Save offline cache
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'offline_favorites_$userId',
        jsonEncode(songs.map((s) => s.toJson()).toList()),
      );

      return songs;
    } catch (e) {
      debugPrint('[SUPABASE] Fetch favorites failed, loading offline cache: $e');
      return getOfflineFavorites();
    }
  }

  /// Optimistically add or remove favorite with fallback sync
  Future<bool> toggleFavorite(Song song) async {
    final userId = currentUserId;
    if (userId == null) return false;

    final songId = song.songId ?? song.id ?? song.title;
    final isFav = _cachedFavorites.any((s) => (s.songId ?? s.id ?? s.title) == songId);

    // 1. Optimistic local UI update
    if (isFav) {
      _cachedFavorites.removeWhere((s) => (s.songId ?? s.id ?? s.title) == songId);
    } else {
      _cachedFavorites.insert(0, song);
    }
    _favoritesController.add(_cachedFavorites);

    // 2. Perform DB write
    try {
      if (isFav) {
        await _client
            .from('favorite_songs')
            .delete()
            .eq('user_id', userId)
            .eq('song_id', songId);
      } else {
        // Upsert song into songs table first
        try {
          await _client.from('songs').upsert({
            'song_id': songId,
            'title': song.title,
            'artist': song.artist,
            'album': song.album,
            'image': song.image,
            'file_url': song.streamUrl,
            'duration': song.duration,
            'mood': song.moodTags,
            'language': song.language,
          }, onConflict: 'song_id');
        } catch (_) {}

        await _client.from('favorite_songs').upsert({
          'user_id': userId,
          'song_id': songId,
          'favorited_at': DateTime.now().toIso8601String(),
        }, onConflict: 'user_id,song_id');
      }
      return true;
    } catch (e) {
      debugPrint('[SUPABASE] Favorite sync error, saving offline action: $e');
      await _queueOfflineAction('toggleFavorite', {'song': song.toJson(), 'isFav': isFav});
      return false;
    }
  }

  /// Sync playback queue state to Supabase
  Future<void> syncQueueState({
    required List<Song> queue,
    required int currentIndex,
    required double position,
    required bool isPlaying,
  }) async {
    final userId = currentUserId;
    if (userId == null) return;

    _cachedQueueState = {
      'queue': queue.map((s) => s.toJson()).toList(),
      'currentIndex': currentIndex,
      'playbackPosition': position,
      'isPlaying': isPlaying,
    };
    _queueController.add(_cachedQueueState);

    try {
      await _client.from('user_queues').upsert({
        'user_id': userId,
        'queue': queue.map((s) => s.toJson()).toList(),
        'current_index': currentIndex,
        'playback_position': position,
        'is_playing': isPlaying,
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'user_id');
    } catch (e) {
      debugPrint('[SUPABASE] Sync queue error: $e');
    }
  }

  /// Fetch remote queue state
  Future<Map<String, dynamic>?> fetchQueueState() async {
    final userId = currentUserId;
    if (userId == null) return null;

    try {
      final res = await _client
          .from('user_queues')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

      if (res != null) {
        _cachedQueueState = Map<String, dynamic>.from(res);
        _queueController.add(_cachedQueueState);
        return _cachedQueueState;
      }
    } catch (e) {
      debugPrint('[SUPABASE] Fetch queue error: $e');
    }
    return null;
  }

  /// Retrieve offline cached favorites
  Future<List<Song>> getOfflineFavorites() async {
    final userId = currentUserId;
    if (userId == null) return [];

    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString('offline_favorites_$userId');
    if (str != null) {
      try {
        final list = jsonDecode(str) as List;
        _cachedFavorites = list.map((item) => Song.fromJson(item)).toList();
        return _cachedFavorites;
      } catch (_) {}
    }
    return [];
  }

  /// Queue offline action for auto-sync when online
  Future<void> _queueOfflineAction(String action, Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final queueStr = prefs.getString('offline_actions_queue') ?? '[]';
    final List actions = jsonDecode(queueStr);
    actions.add({'action': action, 'data': data, 'timestamp': DateTime.now().toIso8601String()});
    await prefs.setString('offline_actions_queue', jsonEncode(actions));
  }
}
