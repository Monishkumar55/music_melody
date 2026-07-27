import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/mood.dart';
import '../models/song.dart';
import '../services/song_service.dart';
import '../providers/player_provider.dart';
import '../widgets/song_card.dart';

class ResultsScreen extends StatefulWidget {
  final Mood mood;
  const ResultsScreen({super.key, required this.mood});
  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  final _songService = SongService();
  List<Song> _songs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSongs();
  }

  Future<void> _loadSongs() async {
    try {
      // Search JioSaavn for mood-related songs
      final query = '${widget.mood.label} mood songs';
      final songs = await _songService.searchAll(query, limit: 20);
      
      // Also get from our backend DB
      final dbSongs = await _songService.fetchByMood(widget.mood.name);
      
      // Combine, preferring JioSaavn results (they have real audio)
      final combined = [...songs];
      for (final dbSong in dbSongs) {
        if (!combined.any((s) => s.title.toLowerCase() == dbSong.title.toLowerCase())) {
          combined.add(dbSong);
        }
      }
      
      if (mounted) setState(() { _songs = combined; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter, end: Alignment.bottomCenter,
            colors: [widget.mood.gradient[0].withOpacity(0.3), const Color(0xFF0A0A1A)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${widget.mood.emoji} ${widget.mood.label} Vibes',
                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                          Text('${_songs.length} songs found',
                            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                        ],
                      ),
                    ),
                    // Play all button
                    if (_songs.isNotEmpty)
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(colors: widget.mood.gradient),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 28),
                          onPressed: () => context.read<PlayerProvider>().play(_songs.first, playlist: _songs),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Song list
              Expanded(
                child: _loading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF7C3AED)))
                  : _songs.isEmpty
                    ? Center(child: Text('No songs found', style: TextStyle(color: Colors.white.withOpacity(0.4))))
                    : ListView.builder(
                        padding: const EdgeInsets.only(bottom: 100),
                        itemCount: _songs.length,
                        itemBuilder: (context, index) {
                          return SongCard(
                            song: _songs[index],
                            index: index + 1,
                            onTap: () => context.read<PlayerProvider>().play(_songs[index], playlist: _songs),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
