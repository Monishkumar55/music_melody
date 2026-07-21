import { AuthService } from '../services/authService.js';

class AuthContextClass {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = [];
  }

  async initialize() {
    try {
      const data = await AuthService.checkAuth();
      if (data.loggedIn) {
        this.user = data.user;
        this.isAuthenticated = true;
      }
    } catch (e) {
      this.user = null;
      this.isAuthenticated = false;
    }
    this.notify();
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
    this.notify();
  }

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.isAuthenticated, this.user);
    }
  }
}

export const AuthContext = new AuthContextClass();
