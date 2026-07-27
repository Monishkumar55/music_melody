import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/mood.dart';

class MoodService {
  Future<Mood> detectFromText(String text) async {
    try {
      final res = await http.post(
        Uri.parse(ApiConfig.detectMoodUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'text': text}),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return Mood.fromString(data['mood'] ?? 'happy');
      }
    } catch (_) {}
    return _localDetect(text);
  }

  Future<Mood> getSuggestedMood() async {
    try {
      final res = await http.get(Uri.parse(ApiConfig.suggestMoodUrl));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return Mood.fromString(data['mood'] ?? 'happy');
      }
    } catch (_) {}
    return Mood.happy;
  }

  Mood _localDetect(String text) {
    final t = text.toLowerCase();
    if (t.contains('sad') || t.contains('cry') || t.contains('lonely')) return Mood.sad;
    if (t.contains('angry') || t.contains('mad') || t.contains('furious')) return Mood.angry;
    if (t.contains('calm') || t.contains('relax') || t.contains('peace')) return Mood.relaxed;
    if (t.contains('energy') || t.contains('gym') || t.contains('dance')) return Mood.energetic;
    if (t.contains('stress') || t.contains('anxious')) return Mood.stressed;
    if (t.contains('love') || t.contains('romantic')) return Mood.romantic;
    if (t.contains('happy') || t.contains('joy') || t.contains('great')) return Mood.happy;
    return Mood.neutral;
  }
}
