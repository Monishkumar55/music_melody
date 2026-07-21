import { AuthContext } from '../context/AuthContext.js';

// List of screens that require authentication
const protectedScreens = ['screen-home', 'screen-browse', 'screen-favorites', 'screen-detect'];

export function isScreenProtected(screenId) {
  return protectedScreens.includes(screenId);
}

export function handleProtectedRoute(screenId, showScreenFn) {
  if (isScreenProtected(screenId)) {
    if (!AuthContext.isAuthenticated) {
      // Redirect to login if unauthenticated
      showScreenFn('login');
      return false; // Access denied
    }
  }
  return true; // Access granted
}
