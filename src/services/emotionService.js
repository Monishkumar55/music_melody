import { supabase } from '../firebase';

/**
 * Maps raw emotions to corresponding music tags/genres.
 */
export const mapEmotionToTags = (emotion) => {
  const mapping = {
    happy: ['energetic', 'dance', 'party', 'upbeat'],
    sad: ['motivational', 'uplifting', 'positive'],
    angry: ['calm', 'relaxing', 'meditation', 'lofi'],
    neutral: ['trending', 'popular', 'chill'],
    surprised: ['adventure', 'exciting', 'pop'],
    fearful: ['meditation', 'soft', 'ambient', 'instrumental'],
    disgusted: ['refreshing', 'nature', 'acoustic', 'breeze']
  };

  return mapping[(emotion || '').toLowerCase()] || ['trending'];
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
