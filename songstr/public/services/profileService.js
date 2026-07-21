export const ProfileService = {
  async getProfile() {
    const res = await fetch('/api/profile', { credentials: 'include' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch profile');
    return result.profile;
  },

  async updateProfile(data) {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to upload avatar');
    return result;
  },

  async deleteAvatar() {
    const res = await fetch('/api/profile/avatar', {
      method: 'DELETE',
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete avatar');
    return result;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to change password');
    return result;
  },

  async deleteAccount(password) {
    const res = await fetch('/api/profile', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete account');
    return result;
  }
};
