import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { EmotionService } from '../../shared/services/emotionService.js';

export function DetectScreen({ onMoodDetected }) {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedResult, setDetectedResult] = useState(null);

  const handleTextDetect = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    try {
      const res = await EmotionService.detectFromText(textInput);
      setDetectedResult(res);
      if (onMoodDetected && res.mood) {
        onMoodDetected(res.mood);
      }
    } catch {
      setDetectedResult({ mood: 'neutral', confidence: 0.5, keywords: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCameraScan = () => {
    setLoading(true);
    setTimeout(() => {
      const moods = ['happy', 'energetic', 'romantic', 'relaxed', 'sad'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setDetectedResult({
        mood: randomMood,
        confidence: 0.94,
        keywords: ['facial_expression', 'smile', 'eyes']
      });
      setLoading(false);
      if (onMoodDetected) onMoodDetected(randomMood);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Mood Detector Scanner ✨</Text>
      <Text style={styles.subtitle}>
        Express how you feel or scan your expression to receive instant mood-tailored recommendations.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>✍️ Describe Your Current State</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Feeling excited after winning the game!"
          placeholderTextColor="#64748b"
          value={textInput}
          onChangeText={setTextInput}
          multiline
        />
        <TouchableOpacity style={styles.detectBtn} onPress={handleTextDetect} activeOpacity={0.8}>
          <Text style={styles.detectBtnText}>Analyze Mood from Text</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>📷 Camera Facial Mood Scan</Text>
        <Text style={styles.scanDesc}>Simulate real-time camera face mesh emotion detection.</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={handleSimulateCameraScan} activeOpacity={0.8}>
          <Text style={styles.scanBtnText}>Scan Facial Expression</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 20 }} />}

      {detectedResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultHeader}>Detected Mood Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Primary Mood:</Text>
            <Text style={styles.resultMood}>{(detectedResult.mood || 'happy').toUpperCase()}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence Score:</Text>
            <Text style={styles.resultVal}>{Math.round((detectedResult.confidence || 0.9) * 100)}%</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  contentContainer: {
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 10
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    color: '#f8fafc',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  detectBtn: {
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  detectBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold'
  },
  scanDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12
  },
  scanBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  scanBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  resultCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#38bdf8'
  },
  resultHeader: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  resultLabel: {
    color: '#94a3b8',
    fontSize: 13
  },
  resultMood: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: 'bold'
  },
  resultVal: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600'
  }
});
