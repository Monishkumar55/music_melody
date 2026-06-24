import React from 'react';

const EmotionResult = ({ emotionData }) => {
  const { emotion, confidence, status } = emotionData;

  const emotionDetails = {
    happy: { emoji: '😄', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    sad: { emoji: '😢', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    angry: { emoji: '😠', color: 'text-red-400', bg: 'bg-red-400/10' },
    neutral: { emoji: '😐', color: 'text-gray-300', bg: 'bg-gray-400/10' },
    surprised: { emoji: '😲', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    fearful: { emoji: '😨', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    disgusted: { emoji: '🤢', color: 'text-green-400', bg: 'bg-green-400/10' }
  };

  if (!emotion) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center shadow-lg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full mb-4"></div>
          <p className="text-gray-400 font-medium">{status}</p>
        </div>
      </div>
    );
  }

  const detail = emotionDetails[emotion] || emotionDetails.neutral;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group">
      {/* Background glow */}
      <div className={`absolute -inset-4 opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-30 ${detail.bg}`}></div>
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Current Mood</p>
          <div className="flex items-center space-x-3">
            <h2 className={`text-3xl font-bold capitalize ${detail.color}`}>
              {emotion}
            </h2>
          </div>
        </div>
        
        <div className="text-5xl filter drop-shadow-lg transform transition-transform group-hover:scale-110">
          {detail.emoji}
        </div>
      </div>

      <div className="mt-6 relative">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Confidence</span>
          <span className="text-white font-semibold">{confidence}%</span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${detail.bg.replace('/10', '')}`}
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EmotionResult;
