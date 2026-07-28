import React, { useEffect, useState } from 'react';
import EmotionDetector from '../components/EmotionDetector';
import { supabase } from '../supabase';

const EmotionMusicPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await supabase
          .from('emotionHistory')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10);
        setHistory(data || []);
      } catch (err) {
        console.error('Error loading history:', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
          AI Emotion Music Player
        </h1>
        <p className="text-gray-400 mt-2">
          Detect your facial expression in real time and discover curated playlists tailored to your current mood.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <EmotionDetector />

        {history.length > 0 && (
          <section className="mt-12 bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Recent Mood Sessions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {history.map((item, idx) => (
                <div key={idx} className="bg-gray-700/50 p-3 rounded-lg text-center">
                  <p className="font-semibold capitalize text-indigo-300">{item.emotion}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.confidence}% Match</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default EmotionMusicPage;
