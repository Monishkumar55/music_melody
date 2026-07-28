import { supabase } from '../supabase';

/**
 * Maps raw detected facial emotions to corresponding music mood tags (including romantic).
 */
export const mapEmotionToTags = (emotion) => {
  const mapping = {
    happy: ['romantic', 'happy', 'energetic', 'upbeat'],
    sad: ['romantic', 'sad', 'relaxed', 'soothing'],
    angry: ['energetic', 'relaxed', 'calm'],
    neutral: ['romantic', 'relaxed', 'happy', 'chill'],
    surprised: ['romantic', 'energetic', 'happy'],
    fearful: ['romantic', 'relaxed', 'calm'],
    disgusted: ['romantic', 'relaxed'],
    romantic: ['romantic', 'happy', 'relaxed']
  };

  return mapping[(emotion || '').toLowerCase()] || ['romantic', 'happy'];
};

/**
 * Stores the emotion detection result in Supabase Cloud PostgreSQL.
 * @param {string} userId - Authenticated user ID
 * @param {string} emotion - The detected emotion
 * @param {number} confidence - The confidence percentage (0-100)
 * @param {Array} recommendedSongs - Array of recommended song metadata or IDs
 */
export const saveEmotionHistory = async (userId, emotion, confidence, recommendedSongs) => {
  if (!userId) {
    console.warn('User ID is required to save emotion history.');
    return null;
  }

  try {
    const { data, error } = await supabase.from('emotionHistory').insert([{
      userId,
      emotion: (emotion || '').toLowerCase(),
      confidence,
      recommendedSongs: JSON.stringify(recommendedSongs || []),
      timestamp: new Date().toISOString()
    }]).select('id').maybeSingle();

    if (error) {
      console.warn('Supabase emotionHistory warning:', error.message);
      return 'saved_local';
    }
    return data ? data.id : 'saved';
  } catch (error) {
    console.error('Error saving emotion history:', error);
    return null;
  }
};
