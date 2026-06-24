import React from 'react';

const RecommendationList = ({ songs, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 flex items-center space-x-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-900 rounded-2xl border border-gray-800 mt-6">
        <span className="text-4xl mb-4 block opacity-50">🎧</span>
        <h3 className="text-lg font-medium text-white mb-2">No recommendations yet</h3>
        <p className="text-gray-400 text-sm">Let the AI detect your mood to get personalized music.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
        <span className="text-xs font-medium bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
          AI Curated
        </span>
      </div>
      
      <div className="space-y-3">
        {songs.map((song) => (
          <div 
            key={song.id} 
            className="group bg-gray-900 hover:bg-gray-800 rounded-xl p-3 flex items-center space-x-4 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
              {song.coverUrl ? (
                <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors">
                {song.title}
              </h4>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>
            
            {song.tags && song.tags[0] && (
              <span className="hidden sm:inline-flex text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {song.tags[0]}
              </span>
            )}
            
            <button className="text-gray-400 hover:text-white p-2 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;
