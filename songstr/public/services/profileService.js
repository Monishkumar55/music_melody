export const ProfileService = {
  async getProfile() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateProfile(profileData) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await window.supabaseClient
      .from('profiles')
      .update(profileData)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, profile: data };
  },

  async uploadAvatar(file) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await window.supabaseClient.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { data, error: updateError } = await window.supabaseClient
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', session.user.id)
      .select()
      .single();
      
    if (updateError) throw new Error(updateError.message);
    return { success: true, avatar_url: publicUrl, profile: data };
  },

  async deleteAvatar() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await window.supabaseClient
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, profile: data };
  },

  async changePassword(currentPassword, newPassword) {
    const { error } = await window.supabaseClient.auth.updateUser({
      password: newPassword
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async deleteAccount() {
    // Supabase JS client cannot delete the user directly without service role key or Edge Function.
    // As a workaround for client side, we might log them out or call an RPC if setup.
    // For now, throw unsupported or just clear data.
    throw new Error('Account deletion requires contacting support or a backend edge function.');
  }
};
