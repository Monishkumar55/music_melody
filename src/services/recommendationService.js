import { db } from '../firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { mapEmotionToTags } from './emotionService';

/**
 * Fetches music recommendations based on the detected emotion.
 * Assumes a 'songs' collection exists in Firestore with a 'tags' array field.
 * @param {string} emotion - The detected emotion
 * @param {number} maxResults - Max number of songs to return
 */
export const getRecommendationsByEmotion = async (emotion, maxResults = 10) => {
  try {
    const tags = mapEmotionToTags(emotion);
    
    // In a real scenario, you might want an 'in' or 'array-contains-any' query.
    // For this example, we'll query songs that contain at least one of the tags.
    const songsRef = collection(db, 'songs');
    const q = query(
      songsRef,
      where('tags', 'array-contains-any', tags),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    const songs = [];
    
    snapshot.forEach(doc => {
      songs.push({ id: doc.id, ...doc.data() });
    });

    // Fallback if no matching tags are found
    if (songs.length === 0) {
      console.warn(`No songs found matching tags: ${tags.join(', ')}. Fetching trending...`);
      return getFallbackSongs(maxResults);
    }

    return songs;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

/**
 * Fallback mechanism to get generic songs if emotion-based matching fails.
 */
const getFallbackSongs = async (maxResults) => {
  try {
    const songsRef = collection(db, 'songs');
    const q = query(songsRef, limit(maxResults));
    const snapshot = await getDocs(q);
    const songs = [];
    
    snapshot.forEach(doc => {
      songs.push({ id: doc.id, ...doc.data() });
    });
    
    return songs;
  } catch (error) {
    console.error('Error fetching fallback songs:', error);
    return [];
  }
};
