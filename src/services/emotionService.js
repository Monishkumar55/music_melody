import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

  return mapping[emotion.toLowerCase()] || ['trending'];
};

/**
 * Stores the emotion detection result in Firestore.
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
    const historyRef = collection(db, 'emotionHistory');
    const docRef = await addDoc(historyRef, {
      userId,
      emotion: emotion.toLowerCase(),
      confidence,
      recommendedSongs,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving emotion history to Firestore:', error);
    throw error;
  }
};
