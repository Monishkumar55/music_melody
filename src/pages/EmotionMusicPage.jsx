import React, { useEffect, useState } from 'react';
import EmotionDetector from '../components/EmotionDetector';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const EmotionMusicPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const historyRef = collection(db, 'emotionHistory');
        const q = query(
          historyRef,
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Safely handle timestamp which might be null immediately after creation
          timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'Just now'
        }));
        
        setHistory(historyData);
      } catch (err) {
        console.error("Error fetching emotion history:", err);
      }
    };

    // Initial fetch
    fetchHistory();
    
    // In a real app, you might want to set up an onSnapshot listener here 
    // to update the history in real-time as the user uses the camera.
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            AI Emotion Music
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Let our AI detect your mood through your camera and instantly curate the perfect soundtrack for how you're feeling right now.
          </p>
        </div>

        {/* Main Detector Component */}
        <EmotionDetector />

        {/* History Section */}
        {history.length > 0 && (
          <div className="max-w-4xl mx-auto mt-16 p-4 sm:p-6 lg:p-8">
            <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-4">Your Recent Moods</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map(entry => (
                <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="capitalize font-semibold text-lg text-indigo-400">{entry.emotion}</span>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{entry.confidence}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-4 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {entry.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default EmotionMusicPage;
