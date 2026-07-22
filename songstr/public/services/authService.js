export const AuthService = {
  async register(userData) {
    const { data, error } = await window.supabaseClient.auth.signUp({
      email: userData.email || `${userData.username}@songstr.local`,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          fullname: userData.fullname || '',
        }
      }
    });
    if (error) throw new Error(error.message);
    return { success: true, user: data.user };
  },

  async login(username, password) {
    const email = username.includes('@') ? username : `${username}@songstr.local`;
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw new Error(error.message);
    return { success: true, user: data.user };
  },

  async logout() {
    const { error } = await window.supabaseClient.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async checkAuth() {
    try {
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      if (error) throw error;
      if (session) {
        return { loggedIn: true, user: session.user };
      }
      return { loggedIn: false, user: null };
    } catch {
      return { loggedIn: false, user: null };
    }
  }
};
