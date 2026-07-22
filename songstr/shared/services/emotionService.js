// Universal Emotion & Mood Detection Service for Web and React Native App
import { API_CONFIG } from '../constants/config.js';

export const EmotionService = {
  async detectFromText(text) {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMOTION.DETECT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Mood detection failed');
    return data;
  }
};
