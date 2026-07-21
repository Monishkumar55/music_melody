import { AuthService } from '../services/authService.js';
import { AuthContext } from '../context/AuthContext.js';

export function initRegister(showScreenFn, showToastFn, showLoaderFn, hideLoaderFn) {
  const form = document.getElementById('register-form');
  const errorDiv = document.getElementById('register-error');
  
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match';
      errorDiv.style.display = 'block';
      return;
    }

    const payload = {
      fullname: form.fullname.value,
      username: form.username.value,
      email: form.email.value,
      phone: form.phone.value || '',
      password: password
    };

    showLoaderFn('Creating account...');

    try {
      const data = await AuthService.register(payload);
      AuthContext.setUser(data.user);
      showToastFn('Registration successful! Welcome to Songstr.');
      showScreenFn('screen-home');
      form.reset();
    } catch (err) {
      errorDiv.textContent = err.message || 'Registration failed';
      errorDiv.style.display = 'block';
    } finally {
      hideLoaderFn();
    }
  });

  const togglePassword = document.getElementById('register-toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const input = form.password;
      const input2 = form.confirmPassword;
      const type = input.type === 'password' ? 'text' : 'password';
      input.type = type;
      input2.type = type;
      togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }
}
