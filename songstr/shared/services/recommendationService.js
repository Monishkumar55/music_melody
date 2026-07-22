import { supabase } from './supabaseClient.js';

export const RecommendationService = {
  async getSongs(mood = 'happy', language = 'All') {
    let query = supabase.from('songs').select('*').eq('mood', mood);
    if (language && language !== 'All') {
      query = query.eq('language', language);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    // Shuffle the songs manually
    const shuffled = (data || []).sort(() => 0.5 - Math.random());
    return shuffled;
  },

  async getMoods() {
    // Return hardcoded mood list consistent with the original app design
    return ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
  },

  async getLanguages(mood = 'happy') {
    const { data, error } = await supabase
      .from('songs')
      .select('language')
      .eq('mood', mood);
    
    if (error) throw new Error(error.message);
    const langs = new Set(data.map(d => d.language));
    return ['All', ...langs];
  },

  async searchSongs(searchQuery) {
    if (!searchQuery) return [];
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%,movie.ilike.%${searchQuery}%`)
      .limit(20);
      
    if (error) throw new Error(error.message);
    return data || [];
  }
};
