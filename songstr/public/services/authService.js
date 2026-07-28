export const AuthService = {
  async register(userData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed');
      }
      if (data.token) {
        localStorage.setItem('songstr_token', data.token);
      }
      return { success: true, user: data.user };
    } catch (err) {
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data: supaData, error: supaErr } = await window.supabaseClient.auth.signUp({
          email: userData.email || `${userData.username}@songstr.local`,
          password: userData.password,
          options: { data: { username: userData.username, fullname: userData.fullname || '' } }
        });
        if (!supaErr && supaData?.user) {
          return { success: true, user: supaData.user };
        }
      }
      throw err;
    }
  },

  async login(username, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid username or password');
      }
      if (data.token) {
        localStorage.setItem('songstr_token', data.token);
      }
      return { success: true, user: data.user };
    } catch (err) {
      if (window.supabaseClient && window.supabaseClient.auth) {
        const email = username.includes('@') ? username : `${username}@songstr.local`;
        const { data: supaData, error: supaErr } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        if (!supaErr && supaData?.user) {
          return { success: true, user: supaData.user };
        }
      }
      throw err;
    }
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('songstr_token');
    if (window.supabaseClient && window.supabaseClient.auth) {
      try { await window.supabaseClient.auth.signOut(); } catch (e) {}
    }
    return { success: true };
  },

  async checkAuth() {
    try {
      const token = localStorage.getItem('songstr_token');
      if (token) {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) return { loggedIn: true, user: data.user };
        }
      }
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) return { loggedIn: true, user: session.user };
      }
      return { loggedIn: false, user: null };
    } catch {
      return { loggedIn: false, user: null };
    }
  }
};
