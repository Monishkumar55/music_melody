import React, { useState, useEffect, useRef } from 'react';
import CameraFeed from './CameraFeed';
import EmotionResult from './EmotionResult';
import RecommendationList from './RecommendationList';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { getRecommendationsByEmotion } from '../services/recommendationService';
import { saveEmotionHistory } from '../services/emotionService';
import { auth } from '../firebase';

const EmotionDetector = () => {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);
  
  const { emotionData } = useEmotionDetection(videoRef, isActive);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  
  // Track the last processed emotion to avoid spamming Firestore/API
  const lastProcessedEmotion = useRef(null);

  const handleVideoPlay = (vRef) => {
    videoRef.current = vRef.current;
  };

  const toggleDetection = () => {
    setIsActive(!isActive);
    if (isActive) {
      // Reset state when stopping
      setRecommendations([]);
      lastProcessedEmotion.current = null;
    }
  };

  useEffect(() => {
    const processEmotion = async () => {
      const { emotion, confidence } = emotionData;
      
      // Only process if we have a solid detection, different from the last one, with decent confidence
      if (emotion && confidence > 60 && emotion !== lastProcessedEmotion.current) {
        lastProcessedEmotion.current = emotion;
        setLoadingSongs(true);
        
        try {
          // Fetch songs
          const songs = await getRecommendationsByEmotion(emotion, 5);
          setRecommendations(songs);
          
          // Save to history if logged in
          const user = auth.currentUser;
          if (user) {
            const songIds = songs.map(s => s.id);
            await saveEmotionHistory(user.uid, emotion, confidence, songIds);
          }
        } catch (err) {
          console.error("Error processing emotion match:", err);
        } finally {
          setLoadingSongs(false);
        }
      }
    };

    if (isActive) {
      processEmotion();
    }
  }, [emotionData, isActive]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Camera and Controls */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-6">
          <div className="bg-gray-900 rounded-3xl p-2 border border-gray-800 shadow-2xl">
            <CameraFeed onVideoPlay={handleVideoPlay} isActive={isActive} />
          </div>
          
          <button 
            onClick={toggleDetection}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1 ${
              isActive 
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
            }`}
          >
            {isActive ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span>Stop Detection</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Start Camera & Detect Mood</span>
              </>
            )}
          </button>

          {/* Tips Section */}
          <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <span className="text-indigo-400 mr-2">💡</span> Tips for best results
            </h4>
            <ul className="text-sm text-gray-400 space-y-1.5 ml-6 list-disc">
              <li>Ensure your face is well-lit</li>
              <li>Look directly at the camera</li>
              <li>Exaggerate your expression slightly</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Results and Recommendations */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-6">
          <EmotionResult emotionData={isActive ? emotionData : { emotion: null, status: 'Camera off' }} />
          <RecommendationList songs={recommendations} loading={loadingSongs} />
        </div>
        
      </div>
    </div>
  );
};

export default EmotionDetector;
