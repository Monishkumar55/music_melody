import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    if (kDebugMode) {
      return 'http://localhost:3000';
    }
    return 'https://music-melody-phi.vercel.app';
  }

  static String get jiosaavnSearchUrl => '$baseUrl/api/search';
  static String get jiosaavnSongUrl => '$baseUrl/api/songs';
  static String get jiosaavnAlbumUrl => '$baseUrl/api/songs';
  static String get jiosaavnArtistUrl => '$baseUrl/api/songs';
  static String get jiosaavnPlaylistUrl => '$baseUrl/api/songs';
  static String get jiosaavnTrendingUrl => '$baseUrl/api/songs';
  static String get jiosaavnNewReleasesUrl => '$baseUrl/api/songs';
  static String get jiosaavnRecommendationsUrl => '$baseUrl/api/songs';
  static String get jiosaavnLyricsUrl => '$baseUrl/api/songs';
  static String get deezerSearchUrl => '$baseUrl/api/search';
  static String get deezerTrackUrl => '$baseUrl/api/songs';
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
