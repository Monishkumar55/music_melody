const MOOD_KEYWORDS = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'good', 'cheerful', 'delighted', 'thrilled', 'pleased', 'elated', 'ecstatic', 'love', 'awesome', 'excellent', 'perfect', 'fun', 'laugh', 'smile'],
  sad: ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'cry', 'grief', 'sorrow', 'lonely', 'disappointed', 'down', 'gloomy', 'melancholy', 'hurt', 'pain', 'miss', 'lost', 'empty', 'broken'],
  angry: ['angry', 'mad', 'furious', 'rage', 'frustrated', 'annoyed', 'irritated', 'hate', 'irritate', 'fed up', 'boiling', 'outraged', 'hostile', 'bitter', 'resentful', 'pissed'],
  relaxed: ['calm', 'relaxed', 'peaceful', 'chill', 'serene', 'tranquil', 'zen', 'easy', 'comfortable', 'mellow', 'soothing', 'gentle', 'quiet', 'still', 'content', 'satisfied'],
  energetic: ['energetic', 'hyper', 'pumped', 'motivated', 'powerful', 'active', 'intense', 'fired up', 'workout', 'gym', 'run', 'sprint', 'energy', 'boost', 'adrenaline', 'strong'],
  stressed: ['stressed', 'anxious', 'worried', 'tense', 'nervous', 'overwhelmed', 'pressure', 'panic', 'fear', 'anxiety', 'burden', 'trouble', 'difficult', 'hard', 'exhausted', 'tired'],
  romantic: ['romantic', 'love', 'crush', 'date', 'relationship', 'heart', 'affection', 'tender', 'passionate', 'intimate', 'caring', 'sweet', 'beloved', 'darling', 'kiss', 'couple'],
  neutral: ['okay', 'fine', 'normal', 'average', 'so so', 'meh', 'nothing', 'neutral', 'not sure', 'alright', 'decent']
};

export const EmotionService = {
  async detectFromText(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }
    
    const lower = text.toLowerCase();
    const scores = {};
    for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
      scores[mood] = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) scores[mood]++;
      }
    }
    
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const detectedMood = best[1] > 0 ? best[0] : 'neutral';
    
    return { mood: detectedMood };
  }
};
