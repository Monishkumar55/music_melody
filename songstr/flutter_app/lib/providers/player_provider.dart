import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../models/song.dart';
import '../services/song_service.dart';

class PlayerProvider extends ChangeNotifier {
  final AudioPlayer _player = AudioPlayer();
  final SongService _songService = SongService();
  
  Song? _currentSong;
  bool _isPlaying = false;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  List<Song> _queue = [];
  int _queueIndex = -1;
  bool _isShuffle = false;
  LoopMode _loopMode = LoopMode.off;

  Song? get currentSong => _currentSong;
  bool get isPlaying => _isPlaying;
  Duration get position => _position;
  Duration get duration => _duration;
  AudioPlayer get player => _player;
  List<Song> get queue => _queue;
  bool get isShuffle => _isShuffle;
  LoopMode get loopMode => _loopMode;

  PlayerProvider() {
    _player.positionStream.listen((pos) {
      _position = pos;
      notifyListeners();
    });
    _player.durationStream.listen((dur) {
      if (dur != null) {
        _duration = dur;
        notifyListeners();
      }
    });
    _player.playerStateStream.listen((state) {
      _isPlaying = state.playing;
      if (state.processingState == ProcessingState.completed) {
        if (_loopMode == LoopMode.one) {
          _player.seek(Duration.zero);
          _player.play();
        } else {
          playNext();
        }
      }
      notifyListeners();
    });
  }

  Future<void> play(Song song, {List<Song>? playlist}) async {
    _currentSong = song;
    if (playlist != null && playlist.isNotEmpty) {
      _queue = List.from(playlist);
      _queueIndex = _queue.indexWhere((s) => s.id == song.id || (s.title == song.title && s.artist == song.artist));
      if (_queueIndex == -1) _queueIndex = 0;
    }
    notifyListeners();

    try {
      String url = song.bestAudioUrl;
      // Force stream routing through YouTube proxy endpoint for full playback
      if (url.isEmpty || url.startsWith('JIOSAAVN_SEARCH:') || url.contains('cloudinary') || !url.startsWith('http')) {
        url = _songService.getStreamUrl(song);
      }
      await _player.setUrl(url);
      await _player.play();
    } catch (e) {
      debugPrint('Playback error: $e');
      try {
        final streamUrl = _songService.getStreamUrl(song);
        await _player.setUrl(streamUrl);
        await _player.play();
      } catch (e2) {
        debugPrint('Fallback playback error: $e2');
      }
    }
  }

  void togglePlay() {
    if (_isPlaying) {
      _player.pause();
    } else {
      _player.play();
    }
  }

  void stop() {
    _player.stop();
    _isPlaying = false;
    _position = Duration.zero;
    notifyListeners();
  }

  void seekTo(Duration position) {
    _player.seek(position);
  }

  void toggleShuffle() {
    _isShuffle = !_isShuffle;
    _player.setShuffleModeEnabled(_isShuffle);
    notifyListeners();
  }

  void toggleRepeat() {
    if (_loopMode == LoopMode.off) {
      _loopMode = LoopMode.all;
    } else if (_loopMode == LoopMode.all) {
      _loopMode = LoopMode.one;
    } else {
      _loopMode = LoopMode.off;
    }
    _player.setLoopMode(_loopMode);
    notifyListeners();
  }

  Future<void> playNext() async {
    if (_queue.isEmpty) return;
    _queueIndex = (_queueIndex + 1) % _queue.length;
    await play(_queue[_queueIndex]);
  }

  Future<void> playPrevious() async {
    if (_queue.isEmpty) return;
    _queueIndex = (_queueIndex - 1 + _queue.length) % _queue.length;
    await play(_queue[_queueIndex]);
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }
}
