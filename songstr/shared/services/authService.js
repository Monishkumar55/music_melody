// Supabase Auth Service
import { supabase } from './supabaseClient.js';

export const AuthService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { success: true, user: data.user };
  },

  async register(userData) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          fullname: userData.fullname,
          phone: userData.phone
        }
      }
    });
    if (error) throw new Error(error.message);
    return { success: true, user: data.user };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async checkAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
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
