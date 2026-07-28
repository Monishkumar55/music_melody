import { supabase } from '../supabase';
import { mapEmotionToTags } from './emotionService';

/**
 * Fetches exact Cloudinary Tamil song recommendations based on detected emotion and romantic session matching.
 * @param {string} emotion - The detected emotion
 * @param {number} maxResults - Max number of songs to return
 */
export const getRecommendationsByEmotion = async (emotion, maxResults = 15) => {
  try {
    const tags = mapEmotionToTags(emotion);
    const primaryMood = tags[0] || 'romantic';

    // First try filtering by mood on Supabase songs table
    const { data: moodSongs } = await supabase
      .from('songs')
      .select('*')
      .ilike('mood', primaryMood)
      .limit(maxResults);

    if (moodSongs && moodSongs.length > 0) {
      return moodSongs;
    }

    // Fallback: Return all exact Cloudinary Tamil songs from Supabase
    const { data: allSongs } = await supabase
      .from('songs')
      .select('*')
      .limit(maxResults);

    if (allSongs && allSongs.length > 0) {
      return allSongs;
    }

    // Final fallback to REST API
    const res = await fetch(`/api/songs?mood=${encodeURIComponent(primaryMood)}`);
    if (res.ok) {
      const d = await res.json();
      return d.songs || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};
