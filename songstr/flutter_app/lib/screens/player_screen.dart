import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/player_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:audio_video_progress_bar/audio_video_progress_bar.dart';
import 'package:just_audio/just_audio.dart';
import '../services/song_service.dart';
import '../providers/auth_provider.dart';

class PlayerScreen extends StatefulWidget {
  const PlayerScreen({super.key});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  final _songService = SongService();
  bool _isFavorite = false;
  bool _loadingFav = false;

  @override
  void initState() {
    super.initState();
    _checkFavorite();
  }

  Future<void> _checkFavorite() async {
    final auth = context.read<AuthProvider>();
    final player = context.read<PlayerProvider>();
    final song = player.currentSong;
    if (auth.token == null || song == null) return;
    
    setState(() => _loadingFav = true);
    try {
      final favs = await _songService.getFavorites(auth.token!);
      if (mounted) {
        setState(() {
          _isFavorite = favs.any((s) => s.title == song.title);
          _loadingFav = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingFav = false);
    }
  }

  Future<void> _toggleFavorite() async {
    final auth = context.read<AuthProvider>();
    final player = context.read<PlayerProvider>();
    final song = player.currentSong;
    if (auth.token == null || song == null) return;

    setState(() => _loadingFav = true);
    try {
      if (_isFavorite) {
        await _songService.removeFavorite(auth.token!, song.title);
        if (mounted) setState(() => _isFavorite = false);
      } else {
        await _songService.addFavorite(auth.token!, song);
        if (mounted) setState(() => _isFavorite = true);
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingFav = false);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PlayerProvider>(
      builder: (context, player, _) {
        final song = player.currentSong;
        if (song == null) return const SizedBox();

        return Scaffold(
          body: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
                colors: [Color(0xFF1A0A2E), Color(0xFF0A0A1A)],
              ),
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 32),
                          onPressed: () => Navigator.pop(context),
                        ),
                        const Expanded(
                          child: Text('Now Playing', textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white54, fontSize: 14, fontWeight: FontWeight.w600)),
                        ),
                        IconButton(
                          icon: _loadingFav
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFEC4899)))
                            : Icon(_isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded, 
                                color: _isFavorite ? const Color(0xFFEC4899) : Colors.white54, size: 28),
                          onPressed: _loadingFav ? null : _toggleFavorite,
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),

                  // Cover art
                  Container(
                    width: 280, height: 280,
                    margin: const EdgeInsets.symmetric(horizontal: 40),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.3), blurRadius: 40, spreadRadius: 5),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: song.coverImage != null && song.coverImage!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: song.coverImage!,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(
                              color: const Color(0xFF16213E),
                              child: const Center(child: Text('🎵', style: TextStyle(fontSize: 64))),
                            ),
                            errorWidget: (_, __, ___) => Container(
                              color: const Color(0xFF16213E),
                              child: const Center(child: Text('🎵', style: TextStyle(fontSize: 64))),
                            ),
                          )
                        : Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFEC4899)]),
                            ),
                            child: const Center(child: Text('🎵', style: TextStyle(fontSize: 64))),
                          ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Song info
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      children: [
                        Text(song.title,
                          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
                          textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 6),
                        Text(song.artist,
                          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 15),
                          textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
                        if (song.album != null) ...[
                          const SizedBox(height: 2),
                          Text(song.album!,
                            style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13),
                            textAlign: TextAlign.center),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Progress bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: ProgressBar(
                      progress: player.position,
                      total: player.duration.inSeconds > 0 ? player.duration : const Duration(seconds: 1),
                      onSeek: player.seekTo,
                      barHeight: 4,
                      baseBarColor: Colors.white.withOpacity(0.1),
                      progressBarColor: const Color(0xFF7C3AED),
                      thumbColor: const Color(0xFF7C3AED),
                      thumbRadius: 6,
                      timeLabelTextStyle: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      IconButton(
                        icon: Icon(Icons.shuffle_rounded, 
                          color: player.isShuffle ? const Color(0xFF7C3AED) : Colors.white38, size: 26),
                        onPressed: player.toggleShuffle,
                      ),
                      IconButton(
                        icon: const Icon(Icons.skip_previous_rounded, color: Colors.white, size: 36),
                        onPressed: player.playPrevious,
                      ),
                      GestureDetector(
                        onTap: player.togglePlay,
                        child: Container(
                          width: 68, height: 68,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFEC4899)]),
                            boxShadow: [BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.4), blurRadius: 20)],
                          ),
                          child: Icon(
                            player.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                            color: Colors.white, size: 36,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 36),
                        onPressed: player.playNext,
                      ),
                      IconButton(
                        icon: Icon(
                          player.loopMode == LoopMode.one ? Icons.repeat_one_rounded : Icons.repeat_rounded,
                          color: player.loopMode != LoopMode.off ? const Color(0xFF7C3AED) : Colors.white38, 
                          size: 26,
                        ),
                        onPressed: player.toggleRepeat,
                      ),
                    ],
                  ),
                  const Spacer(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
