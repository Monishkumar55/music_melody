import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/player_provider.dart';
import '../models/mood.dart';
import '../services/song_service.dart';
import '../services/mood_service.dart';
import '../models/song.dart';
import '../widgets/song_card.dart';
import '../widgets/mini_player.dart';
import 'detect_screen.dart';
import 'results_screen.dart';
import 'favorites_screen.dart';
import 'browse_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _navIndex = 0;
  final _songService = SongService();
  final _moodService = MoodService();
  List<Song> _trendingSongs = [];
  Mood? _suggestedMood;
  bool _loadingTrending = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final suggested = await _moodService.getSuggestedMood();
      final songs = await _songService.searchJioSaavn('trending Tamil songs', limit: 10);
      if (mounted) {
        setState(() {
          _suggestedMood = suggested;
          _trendingSongs = songs;
          _loadingTrending = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingTrending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildHome(),
      const BrowseScreen(),
      const DetectScreen(),
      const FavoritesScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: screens[_navIndex],
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const MiniPlayer(),
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF0D0D1F),
              border: Border(top: BorderSide(color: Color(0xFF1A1A2E), width: 1)),
            ),
            child: BottomNavigationBar(
              currentIndex: _navIndex,
              onTap: (i) => setState(() => _navIndex = i),
              type: BottomNavigationBarType.fixed,
              backgroundColor: Colors.transparent,
              elevation: 0,
              selectedItemColor: const Color(0xFF7C3AED),
              unselectedItemColor: Colors.white38,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
                BottomNavigationBarItem(icon: Icon(Icons.search_rounded), label: 'Browse'),
                BottomNavigationBarItem(icon: Icon(Icons.auto_awesome), label: 'Detect'),
                BottomNavigationBarItem(icon: Icon(Icons.favorite_rounded), label: 'Favorites'),
                BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHome() {
    final auth = context.watch<AuthProvider>();
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF0A0A1A), Color(0xFF0D0D22)],
        ),
      ),
      child: SafeArea(
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFEC4899)]),
                      ),
                      child: const Center(child: Text('🎵', style: TextStyle(fontSize: 20))),
                    ),
                    const SizedBox(width: 12),
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
                        children: [
                          TextSpan(text: 'Song', style: TextStyle(color: Colors.white)),
                          TextSpan(text: 'str', style: TextStyle(color: Color(0xFF7C3AED))),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Text('Hi, ${auth.user?.fullname.split(' ').first ?? 'User'}! 👋',
                      style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14)),
                  ],
                ),
              ),
            ),

            // Suggested Mood Card
            if (_suggestedMood != null)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                  child: GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => ResultsScreen(mood: _suggestedMood!),
                    )),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        gradient: LinearGradient(colors: _suggestedMood!.gradient),
                        boxShadow: [BoxShadow(color: _suggestedMood!.color.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Suggested for You', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text('${_suggestedMood!.emoji} ${_suggestedMood!.label} Vibes',
                                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                                const SizedBox(height: 4),
                                Text('Tap to explore songs →', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13)),
                              ],
                            ),
                          ),
                          Text(_suggestedMood!.emoji, style: const TextStyle(fontSize: 48)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

            // Mood Grid
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                child: const Text('How are you feeling?',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.85,
                ),
                delegate: SliverChildListDelegate(
                  Mood.values.map((mood) => GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => ResultsScreen(mood: mood),
                    )),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: LinearGradient(
                          begin: Alignment.topLeft, end: Alignment.bottomRight,
                          colors: [mood.gradient[0].withOpacity(0.3), mood.gradient[1].withOpacity(0.15)],
                        ),
                        border: Border.all(color: mood.color.withOpacity(0.2)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(mood.emoji, style: const TextStyle(fontSize: 28)),
                          const SizedBox(height: 4),
                          Text(mood.label, style: TextStyle(color: mood.color, fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  )).toList(),
                ),
              ),
            ),

            // Trending Songs
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                child: const Text('🔥 Trending Now',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
              ),
            ),
            if (_loadingTrending)
              const SliverToBoxAdapter(
                child: Center(child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(color: Color(0xFF7C3AED)),
                )),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final song = _trendingSongs[index];
                    return SongCard(
                      song: song,
                      onTap: () => context.read<PlayerProvider>().play(song, playlist: _trendingSongs),
                    );
                  },
                  childCount: _trendingSongs.length,
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 120)),
          ],
        ),
      ),
    );
  }
}
