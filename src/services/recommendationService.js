import { supabase } from '../firebase';
import { mapEmotionToTags } from './emotionService';

/**
 * Fetches music recommendations based on the detected emotion via Supabase.
 * @param {string} emotion - The detected emotion
 * @param {number} maxResults - Max number of songs to return
 */
export const getRecommendationsByEmotion = async (emotion, maxResults = 10) => {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .eq('isActive', 1)
      .limit(maxResults);

    if (error || !songs || songs.length === 0) {
      const res = await fetch(`/api/songs?mood=${encodeURIComponent(emotion)}`);
      if (res.ok) {
        const d = await res.json();
        return d.songs || [];
      }
      return [];
    }

    return songs;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};
