class Song {
  final String? songId;
  final String title;
  final String artist;
  final String? album;
  final String? language;
  final String? genre;
  final int? year;
  final int? duration;
  final String? coverImage;
  final String? audioUrl;
  final String? moodTags;
  final String? source; // 'jiosaavn', 'deezer', 'local'
  final List<AudioQuality>? downloadUrls;

  String get id => songId ?? '${title}_${artist}';

  Song({
    this.songId,
    required this.title,
    required this.artist,
    this.album,
    this.language,
    this.genre,
    this.year,
    this.duration,
    this.coverImage,
    this.audioUrl,
    this.moodTags,
    this.source,
    this.downloadUrls,
  });

  Song copyWith({
    String? songId,
    String? title,
    String? artist,
    String? album,
    String? language,
    String? genre,
    int? year,
    int? duration,
    String? coverImage,
    String? audioUrl,
    String? moodTags,
    String? source,
    List<AudioQuality>? downloadUrls,
  }) {
    return Song(
      songId: songId ?? this.songId,
      title: title ?? this.title,
      artist: artist ?? this.artist,
      album: album ?? this.album,
      language: language ?? this.language,
      genre: genre ?? this.genre,
      year: year ?? this.year,
      duration: duration ?? this.duration,
      coverImage: coverImage ?? this.coverImage,
      audioUrl: audioUrl ?? this.audioUrl,
      moodTags: moodTags ?? this.moodTags,
      source: source ?? this.source,
      downloadUrls: downloadUrls ?? this.downloadUrls,
    );
  }

  factory Song.fromJson(Map<String, dynamic> json) {
    List<AudioQuality>? downloads;
    if (json['audioUrl'] is List) {
      downloads = (json['audioUrl'] as List)
          .map((d) => AudioQuality.fromJson(d))
          .toList();
    }
    return Song(
      songId: json['songId'] ?? json['id']?.toString(),
      title: json['title'] ?? json['name'] ?? 'Unknown',
      artist: json['artist'] ?? json['primaryArtists'] ?? 'Unknown',
      album: json['album'],
      language: json['language'],
      genre: json['genre'],
      year: json['year'] is int ? json['year'] : int.tryParse(json['year']?.toString() ?? ''),
      duration: json['duration'] is int ? json['duration'] : int.tryParse(json['duration']?.toString() ?? ''),
      coverImage: json['coverImage'] ?? json['image'],
      audioUrl: json['audioUrl'] is String ? json['audioUrl'] : null,
      moodTags: json['moodTags'] ?? json['mood'],
      source: json['source'],
      downloadUrls: downloads,
    );
  }

  Map<String, dynamic> toJson() => {
    'songId': songId,
    'title': title,
    'artist': artist,
    'album': album,
    'language': language,
    'genre': genre,
    'year': year,
    'duration': duration,
    'coverImage': coverImage,
    'audioUrl': audioUrl,
    'moodTags': moodTags,
    'source': source,
  };

  String get bestAudioUrl {
    if (downloadUrls != null && downloadUrls!.isNotEmpty) {
      return downloadUrls!.last.url;
    }
    return audioUrl ?? '';
  }

  String get displayDuration {
    if (duration == null || duration == 0) return '--:--';
    final mins = duration! ~/ 60;
    final secs = duration! % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }
}

class AudioQuality {
  final String quality;
  final String url;

  AudioQuality({required this.quality, required this.url});

  factory AudioQuality.fromJson(Map<String, dynamic> json) {
    return AudioQuality(
      quality: json['quality'] ?? 'unknown',
      url: json['url'] ?? json['link'] ?? '',
    );
  }
}
