import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../services/song_service.dart';
import '../providers/player_provider.dart';
import '../widgets/song_card.dart';

class BrowseScreen extends StatefulWidget {
  const BrowseScreen({super.key});
  @override
  State<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends State<BrowseScreen> {
  final _searchCtrl = TextEditingController();
  final _songService = SongService();
  List<Song> _results = [];
  bool _loading = false;
  String _selectedLang = 'All';
  final _languages = ['All', 'Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada', 'English', 'Punjabi', 'Korean', 'Japanese'];

  @override
  void initState() {
    super.initState();
    _selectedLang = 'Tamil';
    _search(language: 'Tamil');
  }

  Future<void> _search({String? language}) async {
    final targetLang = language ?? _selectedLang;
    final q = _searchCtrl.text.trim();
    final queryStr = q.isEmpty
        ? (targetLang == 'All' ? 'top songs' : 'hit $targetLang songs')
        : (targetLang == 'All' ? q : '$q $targetLang');

    setState(() => _loading = true);
    try {
      final rawResults = await _songService.searchAll(queryStr, limit: 30);
      List<Song> filtered = rawResults.map<Song>((s) {
        if (targetLang != 'All' && (s.language == null || s.language == 'Unknown' || s.language!.isEmpty)) {
          return s.copyWith(language: targetLang);
        }
        return s;
      }).toList();

      if (targetLang != 'All') {
        filtered = filtered.where((s) => s.language!.toLowerCase() == targetLang.toLowerCase()).toList();
        if (filtered.isEmpty) {
          filtered = rawResults.map<Song>((s) => s.copyWith(language: targetLang)).toList();
        }
      }
      if (mounted) setState(() { _results = filtered; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
          colors: [Color(0xFF0A0A1A), Color(0xFF0D0D22)],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: const [
                  Icon(Icons.search_rounded, color: Color(0xFF7C3AED), size: 28),
                  SizedBox(width: 8),
                  Text('Browse Music', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Search bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                controller: _searchCtrl,
                onSubmitted: (_) => _search(),
                decoration: InputDecoration(
                  hintText: 'Search songs, artists, albums...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                  prefixIcon: const Icon(Icons.search, color: Colors.white38),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.send_rounded, color: Color(0xFF7C3AED)),
                    onPressed: _search,
                  ),
                ),
                style: const TextStyle(color: Colors.white),
              ),
            ),
            const SizedBox(height: 12),

            // Language chips
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _languages.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final lang = _languages[i];
                  final sel = lang == _selectedLang;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedLang = lang);
                      _search(language: lang);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        color: sel ? const Color(0xFF7C3AED) : const Color(0xFF16213E),
                        border: Border.all(color: sel ? const Color(0xFF7C3AED) : const Color(0xFF1A1A2E)),
                      ),
                      child: Center(
                        child: Text(lang, style: TextStyle(
                          color: sel ? Colors.white : Colors.white54,
                          fontSize: 12, fontWeight: FontWeight.w600,
                        )),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Results
            Expanded(
              child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF7C3AED)))
                : _results.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('🎶', style: TextStyle(fontSize: 48)),
                          const SizedBox(height: 12),
                          Text('Search for your favorite songs', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 15)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.only(bottom: 120),
                      itemCount: _results.length,
                      itemBuilder: (context, index) {
                        final song = _results[index];
                        return SongCard(
                          song: song,
                          onTap: () {
                            final pureQueue = _selectedLang == 'All'
                                ? _results
                                : _results.where((s) => s.language?.toLowerCase() == _selectedLang.toLowerCase()).toList();
                            context.read<PlayerProvider>().play(
                              song, 
                              playlist: pureQueue.isNotEmpty ? pureQueue : _results
                            );
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
