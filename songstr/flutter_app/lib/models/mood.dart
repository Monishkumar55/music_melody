import 'package:flutter/material.dart';

enum Mood {
  happy, sad, angry, relaxed, energetic, stressed, romantic, neutral;

  String get label {
    switch (this) {
      case Mood.happy: return 'Happy';
      case Mood.sad: return 'Sad';
      case Mood.angry: return 'Angry';
      case Mood.relaxed: return 'Relaxed';
      case Mood.energetic: return 'Energetic';
      case Mood.stressed: return 'Stressed';
      case Mood.romantic: return 'Romantic';
      case Mood.neutral: return 'Neutral';
    }
  }

  String get emoji {
    switch (this) {
      case Mood.happy: return '😄';
      case Mood.sad: return '😢';
      case Mood.angry: return '😡';
      case Mood.relaxed: return '😌';
      case Mood.energetic: return '⚡';
      case Mood.stressed: return '😫';
      case Mood.romantic: return '💖';
      case Mood.neutral: return '🎧';
    }
  }

  Color get color {
    switch (this) {
      case Mood.happy: return const Color(0xFFFFD700);
      case Mood.sad: return const Color(0xFF6495ED);
      case Mood.angry: return const Color(0xFFFF4444);
      case Mood.relaxed: return const Color(0xFF66CDAA);
      case Mood.energetic: return const Color(0xFFFF6B35);
      case Mood.stressed: return const Color(0xFF9370DB);
      case Mood.romantic: return const Color(0xFFFF69B4);
      case Mood.neutral: return const Color(0xFF87CEEB);
    }
  }

  List<Color> get gradient {
    switch (this) {
      case Mood.happy: return [const Color(0xFFFFD700), const Color(0xFFFF8C00)];
      case Mood.sad: return [const Color(0xFF6495ED), const Color(0xFF483D8B)];
      case Mood.angry: return [const Color(0xFFFF4444), const Color(0xFF8B0000)];
      case Mood.relaxed: return [const Color(0xFF66CDAA), const Color(0xFF2E8B57)];
      case Mood.energetic: return [const Color(0xFFFF6B35), const Color(0xFFFF1493)];
      case Mood.stressed: return [const Color(0xFF9370DB), const Color(0xFF4B0082)];
      case Mood.romantic: return [const Color(0xFFFF69B4), const Color(0xFFFF1493)];
      case Mood.neutral: return [const Color(0xFF87CEEB), const Color(0xFF4682B4)];
    }
  }

  static Mood fromString(String s) {
    return Mood.values.firstWhere(
      (m) => m.name == s.toLowerCase(),
      orElse: () => Mood.happy,
    );
  }
}
