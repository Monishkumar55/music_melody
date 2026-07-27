import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    }
    return 'http://192.168.1.12:3000';
  }

  static String get jiosaavnSearchUrl => '$baseUrl/api/music/search';
  static String get jiosaavnSongUrl => '$baseUrl/api/music/song';
  static String get deezerSearchUrl => '$baseUrl/api/music/deezer/search';
  static String get deezerTrackUrl => '$baseUrl/api/music/deezer/track';
  static String get songsUrl => '$baseUrl/api/songs';
  static String get searchUrl => '$baseUrl/api/search';
  static String get streamUrl => '$baseUrl/api/stream';
  static String get moodsUrl => '$baseUrl/api/moods';
  static String get detectMoodUrl => '$baseUrl/api/detect-mood';
  static String get loginUrl => '$baseUrl/api/auth/login';
  static String get registerUrl => '$baseUrl/api/auth/register';
  static String get logoutUrl => '$baseUrl/api/auth/logout';
  static String get meUrl => '$baseUrl/api/auth/me';
  static String get profileUrl => '$baseUrl/api/profile';
  static String get favoritesUrl => '$baseUrl/api/favorites';
  static String get suggestMoodUrl => '$baseUrl/api/suggest-mood';
}
