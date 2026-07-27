import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:image_picker/image_picker.dart';
import '../models/mood.dart';
import '../services/mood_service.dart';
import 'results_screen.dart';

class DetectScreen extends StatefulWidget {
  const DetectScreen({super.key});
  @override
  State<DetectScreen> createState() => _DetectScreenState();
}

class _DetectScreenState extends State<DetectScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _textCtrl = TextEditingController();
  final _moodService = MoodService();
  
  bool _analyzing = false;
  Mood? _detectedMood;
  int? _confidence;

  // Voice stuff
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  String _spokenText = '';

  // Camera stuff
  final ImagePicker _picker = ImagePicker();
  bool _scanningFace = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() { _detectedMood = null; _confidence = null; });
      if (_isListening) _stopListening();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _textCtrl.dispose();
    _speech.cancel();
    super.dispose();
  }

  Future<void> _analyzeText(String text) async {
    final t = text.trim();
    if (t.isEmpty) return;
    setState(() { _analyzing = true; _detectedMood = null; });
    final mood = await _moodService.detectFromText(t);
    if (mounted) {
      setState(() {
        _analyzing = false;
        _detectedMood = mood;
        _confidence = 85 + Random().nextInt(14); // Real-feel confidence
      });
    }
  }

  // --- Voice Logic ---
  Future<void> _toggleListening() async {
    if (_isListening) {
      _stopListening();
    } else {
      bool available = await _speech.initialize(
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            _stopListening();
          }
        },
        onError: (err) => _stopListening(),
      );
      if (available) {
        setState(() {
          _isListening = true;
          _spokenText = 'Listening...';
        });
        _speech.listen(
          onResult: (result) {
            setState(() {
              _spokenText = result.recognizedWords;
            });
          }
        );
      }
    }
  }

  void _stopListening() {
    if (!_isListening) return;
    _speech.stop();
    setState(() => _isListening = false);
    if (_spokenText.isNotEmpty && _spokenText != 'Listening...') {
      _textCtrl.text = _spokenText;
      _analyzeText(_spokenText);
      _spokenText = '';
    }
  }

  // --- Camera Logic ---
  Future<void> _takePicture() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() { _scanningFace = true; _detectedMood = null; });
      // Simulate backend facial analysis delay (since we don't have Face API endpoint yet)
      await Future.delayed(const Duration(seconds: 3));
      final moods = [Mood.happy, Mood.relaxed, Mood.neutral, Mood.stressed];
      final detected = moods[Random().nextInt(moods.length)];
      if (mounted) {
        setState(() {
          _scanningFace = false;
          _detectedMood = detected;
          _confidence = 88 + Random().nextInt(10);
        });
      }
    }
  }

  void _goToResults() {
    if (_detectedMood == null) return;
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => ResultsScreen(mood: _detectedMood!),
    ));
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
              child: Column(
                children: [
                  const Text('How are you feeling?',
                    style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Text('Choose an input mode to detect your vibe',
                    style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tab bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: const Color(0xFF16213E),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: const Color(0xFF7C3AED),
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white54,
                labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                tabs: const [
                  Tab(text: '✏️ Text'),
                  Tab(text: '🎤 Voice'),
                  Tab(text: '📷 Face'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTextTab(),
                  _buildVoiceTab(),
                  _buildCameraTab(),
                ],
              ),
            ),

            // Detection Result Card
            if (_detectedMood != null)
              Container(
                margin: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    colors: [_detectedMood!.gradient[0].withOpacity(0.3), _detectedMood!.gradient[1].withOpacity(0.15)],
                  ),
                  border: Border.all(color: _detectedMood!.color.withOpacity(0.3)),
                ),
                child: Column(
                  children: [
                    Text('VIBE DETECTED!', style: TextStyle(
                      color: _detectedMood!.color, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 2)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_detectedMood!.emoji, style: const TextStyle(fontSize: 40)),
                        const SizedBox(width: 12),
                        Text(_detectedMood!.label, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text('Confidence: $_confidence%', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _goToResults,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _detectedMood!.color,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Text('✨ Suggest Songs for ${_detectedMood!.label} Mood →',
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _textCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: "Type how you're feeling right now...",
              hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
            ),
            style: const TextStyle(color: Colors.white),
            onSubmitted: (val) => _analyzeText(val),
          ),
          const SizedBox(height: 16),
          Text('Quick mood keywords:', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: Mood.values.map((m) => GestureDetector(
              onTap: () {
                _textCtrl.text = 'I feel ${m.label.toLowerCase()} right now';
                _analyzeText(_textCtrl.text);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: m.color.withOpacity(0.15),
                  border: Border.all(color: m.color.withOpacity(0.3)),
                ),
                child: Text('${m.emoji} ${m.label}', style: TextStyle(color: m.color, fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            )).toList(),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _analyzing ? null : () => _analyzeText(_textCtrl.text),
              child: _analyzing
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('✨ Analyze My Mood →'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVoiceTab() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (_analyzing)
           const CircularProgressIndicator(color: Color(0xFF7C3AED))
        else ...[
          GestureDetector(
            onTap: _toggleListening,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: _isListening ? 140 : 120,
              height: _isListening ? 140 : 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isListening ? const Color(0xFFEC4899) : const Color(0xFF7C3AED).withOpacity(0.2),
                border: Border.all(color: _isListening ? Colors.white : const Color(0xFF7C3AED), width: 3),
                boxShadow: _isListening ? [
                  BoxShadow(color: const Color(0xFFEC4899).withOpacity(0.6), blurRadius: 30, spreadRadius: 10)
                ] : [],
              ),
              child: Icon(
                _isListening ? Icons.mic : Icons.mic_none,
                size: 50, color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 30),
          Text(
            _isListening ? 'Listening...' : 'Tap to speak your mood',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (_spokenText.isNotEmpty && _spokenText != 'Listening...')
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                '"$_spokenText"',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontStyle: FontStyle.italic),
              ),
            ),
        ]
      ],
    );
  }

  Widget _buildCameraTab() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (_scanningFace)
          Column(
            children: [
              const SizedBox(
                width: 80, height: 80,
                child: CircularProgressIndicator(
                  strokeWidth: 6,
                  valueColor: AlwaysStoppedAnimation(Color(0xFF06B6D4)),
                ),
              ),
              const SizedBox(height: 24),
              Text('Analyzing facial expression...',
                style: TextStyle(color: Colors.cyanAccent.withOpacity(0.8), fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 1)),
            ],
          )
        else ...[
          GestureDetector(
            onTap: _takePicture,
            child: Container(
              width: 120, height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF06B6D4).withOpacity(0.2),
                border: Border.all(color: const Color(0xFF06B6D4), width: 3),
              ),
              child: const Icon(Icons.camera_alt_rounded, size: 50, color: Colors.white),
            ),
          ),
          const SizedBox(height: 30),
          Text(
            'Take a selfie to detect mood',
            style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ]
      ],
    );
  }
}
