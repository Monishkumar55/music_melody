import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/player_provider.dart';
import '../models/song.dart';
import '../services/song_service.dart';
import '../widgets/song_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final _songService = SongService();
  List<Song> _favorites = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    try {
      final favs = await _songService.getFavorites(auth.token!);
      if (mounted) {
        setState(() {
          _favorites = favs;
          _loading = false;
        });
      }
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
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: const [
                  Icon(Icons.favorite_rounded, color: Color(0xFFEC4899), size: 28),
                  SizedBox(width: 8),
                  Text('Favorites', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF7C3AED)))
                  : _favorites.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('💖', style: TextStyle(fontSize: 56)),
                              const SizedBox(height: 16),
                              Text('Your liked songs will appear here',
                                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 15)),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          color: const Color(0xFF7C3AED),
                          backgroundColor: const Color(0xFF16213E),
                          onRefresh: _loadFavorites,
                          child: ListView.builder(
                            padding: const EdgeInsets.only(bottom: 120),
                            itemCount: _favorites.length,
                            itemBuilder: (context, index) {
                              return SongCard(
                                song: _favorites[index],
                                index: index + 1,
                                onTap: () => context.read<PlayerProvider>().play(_favorites[index], playlist: _favorites),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
