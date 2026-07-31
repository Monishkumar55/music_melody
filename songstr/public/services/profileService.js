export const ProfileService = {
  async getProfile() {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) return data.profile;
      }
    } catch (_) {}

    if (window.supabaseClient && window.supabaseClient.auth) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        const { data, error } = await window.supabaseClient
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!error && data) return data;
      }
    }
    throw new Error('Failed to load profile');
  },

  async updateProfile(profileData) {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, profile: data.profile };
      }
    } catch (_) {}

    if (window.supabaseClient && window.supabaseClient.auth) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        const { data, error } = await window.supabaseClient
          .from('users')
          .update(profileData)
          .eq('id', session.user.id)
          .select()
          .single();
        if (!error) return { success: true, profile: data };
      }
    }
    throw new Error('Failed to update profile');
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, avatar_url: data.avatarUrl };
      }
    } catch (_) {}

    if (window.supabaseClient && window.supabaseClient.auth) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
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
          .from('users')
          .update({ profile_image: publicUrl })
          .eq('id', session.user.id)
          .select()
          .single();
          
        if (updateError) throw new Error(updateError.message);
        return { success: true, avatar_url: publicUrl, profile: data };
      }
    }
    throw new Error('Failed to upload avatar');
  },

  async deleteAvatar() {
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
      if (res.ok) return { success: true };
    } catch (_) {}

    if (window.supabaseClient && window.supabaseClient.auth) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        const { data, error } = await window.supabaseClient
          .from('users')
          .update({ profile_image: null })
          .eq('id', session.user.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return { success: true, profile: data };
      }
    }
    throw new Error('Failed to delete avatar');
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) return { success: true };
      const err = await res.json();
      if (err.error) throw new Error(err.error);
    } catch (e) {
      if (e.message) throw e;
    }

    if (window.supabaseClient && window.supabaseClient.auth) {
      const { error } = await window.supabaseClient.auth.updateUser({
        password: newPassword
      });
      if (error) throw new Error(error.message);
      return { success: true };
    }
    throw new Error('Failed to change password');
  },

  async deleteAccount(password) {
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) return { success: true };
      const err = await res.json();
      if (err.error) throw new Error(err.error);
    } catch (e) {
      if (e.message) throw e;
    }
    throw new Error('Failed to delete account');
  }
};
