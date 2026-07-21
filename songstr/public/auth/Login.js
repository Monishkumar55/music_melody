import { AuthService } from '../services/authService.js';
import { AuthContext } from '../context/AuthContext.js';

export function initLogin(showScreenFn, showToastFn, showLoaderFn, hideLoaderFn) {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.username.value;
    const password = form.password.value;

    errorDiv.style.display = 'none';
    showLoaderFn('Logging in...');

    try {
      const data = await AuthService.login(username, password);
      AuthContext.setUser(data.user);
      showToastFn('Login successful!');
      showScreenFn('screen-home');
      form.reset();
    } catch (err) {
      errorDiv.textContent = err.message || 'Invalid username or password.';
      errorDiv.style.display = 'block';
    } finally {
      hideLoaderFn();
    }
  });

  const togglePassword = document.getElementById('login-toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const input = form.password;
      input.type = input.type === 'password' ? 'text' : 'password';
      togglePassword.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  }
}
