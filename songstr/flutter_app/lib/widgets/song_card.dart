import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/song.dart';

class SongCard extends StatelessWidget {
  final Song song;
  final VoidCallback onTap;
  final int? index;

  const SongCard({super.key, required this.song, required this.onTap, this.index});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: const Color(0xFF16213E).withOpacity(0.5),
            ),
            child: Row(
              children: [
                // Index
                if (index != null)
                  SizedBox(
                    width: 28,
                    child: Text('$index',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14, fontWeight: FontWeight.w700)),
                  ),

                // Cover art
                Container(
                  width: 52, height: 52,
                  margin: EdgeInsets.only(left: index != null ? 4 : 0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: const Color(0xFF1A1A2E),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: song.coverImage != null && song.coverImage!.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: song.coverImage!,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => _placeholder(),
                          errorWidget: (_, __, ___) => _placeholder(),
                        )
                      : _placeholder(),
                  ),
                ),
                const SizedBox(width: 12),

                // Song info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(song.title,
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 2),
                      Text(song.artist,
                        style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),

                // Duration & source badge
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(song.displayDuration,
                      style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12)),
                    if (song.source != null)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(6),
                          color: song.source == 'jiosaavn'
                            ? const Color(0xFF2ECC71).withOpacity(0.15)
                            : const Color(0xFF3498DB).withOpacity(0.15),
                        ),
                        child: Text(
                          song.source == 'jiosaavn' ? 'JioSaavn' : 'Deezer',
                          style: TextStyle(
                            color: song.source == 'jiosaavn' ? const Color(0xFF2ECC71) : const Color(0xFF3498DB),
                            fontSize: 9, fontWeight: FontWeight.w700),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 4),
                Icon(Icons.play_circle_filled_rounded, color: const Color(0xFF7C3AED).withOpacity(0.6), size: 28),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFF16213E), Color(0xFF1A1A2E)]),
      ),
      child: const Center(child: Text('🎵', style: TextStyle(fontSize: 20))),
    );
  }
}
