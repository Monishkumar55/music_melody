// Universal Recommendation Service for Web and React Native App
import { API_CONFIG } from '../constants/config.js';

export const RecommendationService = {
  async getSongs(mood = 'happy', language = 'All') {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONGS.RECOMMENDATIONS}?mood=${encodeURIComponent(mood)}&language=${encodeURIComponent(language)}`;
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch recommendations');
    return data.songs || [];
  },

  async getMoods() {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONGS.MOODS}`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch moods');
    return data.moods || [];
  },

  async getLanguages(mood = 'happy') {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONGS.LANGUAGES}?mood=${encodeURIComponent(mood)}`;
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch languages');
    return data.languages || ['All'];
  },

  async searchSongs(query) {
    if (!query) return [];
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONGS.SEARCH}?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Search failed');
    return data.results || [];
  }
};
