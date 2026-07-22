// Universal API Configuration for Web and React Native App

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      CHECK: '/api/auth/check'
    },
    SONGS: {
      RECOMMENDATIONS: '/api/songs',
      MOODS: '/api/moods',
      LANGUAGES: '/api/languages',
      SEARCH: '/api/search'
    },
    EMOTION: {
      DETECT: '/api/detect-mood'
    },
    PROFILE: {
      GET: '/api/profile',
      UPDATE: '/api/profile',
      PASSWORD: '/api/profile/password',
      DELETE: '/api/profile',
      AVATAR: '/api/profile/avatar'
    },
    FAVORITES: {
      LIST: '/api/favorites',
      ADD: '/api/favorites',
      REMOVE: '/api/favorites'
    }
  }
};
