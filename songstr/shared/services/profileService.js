import { supabase } from './supabaseClient.js';

export const ProfileService = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    // Supabase auth doesn't require currentPassword for updateUser if session is active
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async getFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .select('id, songs(*)')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    return data.map(f => ({ ...f.songs, favorite_id: f.id }));
  },

  async addFavorite(song) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, song_id: song.id })
      .select();

    if (error) throw new Error(error.message);
    return data;
  },

  async removeFavorite(songId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId)
      .select();

    if (error) throw new Error(error.message);
    return data;
  }
};
