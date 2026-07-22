import { ProfileService } from '../services/profileService.js';
import { AuthContext } from '../context/AuthContext.js';

export async function initProfile(showScreenFn, showToastFn, showLoaderFn, hideLoaderFn) {
  // Elements
  const avatarImg = document.getElementById('profile-avatar-img');
  const avatarInput = document.getElementById('profile-avatar-input');

  // Modals
  const editModal = document.getElementById('modal-edit-profile');
  const passwordModal = document.getElementById('modal-change-password');
  const deleteModal = document.getElementById('modal-delete-account');

  // Forms
  const editForm = document.getElementById('form-edit-profile');
  const passwordForm = document.getElementById('form-change-password');
  const deleteForm = document.getElementById('form-delete-account');

  // Utility to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const loadProfile = async () => {
    try {
      showLoaderFn('Loading profile...');
      const profile = await ProfileService.getProfile();
      
      // Update UI
      document.getElementById('prof-fullname').textContent = profile.fullname || 'N/A';
      document.getElementById('prof-username').textContent = '@' + profile.username;
      document.getElementById('prof-email').textContent = profile.email;
      document.getElementById('prof-phone').textContent = profile.phone || 'N/A';
      document.getElementById('prof-dob').textContent = profile.dob || 'N/A';
      document.getElementById('prof-gender').textContent = profile.gender || 'N/A';
      document.getElementById('prof-location').textContent = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'N/A';
      document.getElementById('prof-bio').textContent = profile.bio || 'No bio provided.';
      document.getElementById('prof-genres').textContent = profile.favoriteGenres || 'N/A';
      
      // Stats & Security
      document.getElementById('prof-songs-liked').textContent = profile.songsLiked || 0;
      document.getElementById('prof-created-at').textContent = formatDate(profile.createdAt);
      document.getElementById('prof-last-login').textContent = formatDate(profile.lastLogin);
      
      if (profile.avatar) {
        avatarImg.src = profile.avatar + '?t=' + new Date().getTime(); // cache bust
      } else {
        avatarImg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullname || profile.username) + '&background=random';
      }

      // Populate edit form
      editForm.fullname.value = profile.fullname || '';
      editForm.username.value = profile.username || '';
      editForm.phone.value = profile.phone || '';
      editForm.dob.value = profile.dob || '';
      editForm.gender.value = profile.gender || '';
      editForm.country.value = profile.country || '';
      editForm.state.value = profile.state || '';
      editForm.city.value = profile.city || '';
      editForm.bio.value = profile.bio || '';
      editForm.favoriteGenres.value = profile.favoriteGenres || '';

    } catch (e) {
      showToastFn(e.message || 'Error loading profile');
    } finally {
      hideLoaderFn();
    }
  };

  // Avatar Upload Logic (Compression via Canvas)
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToastFn('Invalid image format. Use JPG, PNG or WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToastFn('Image too large (Max 5MB).');
        return;
      }

      showLoaderFn('Uploading avatar...');
      try {
        const compressedFile = await compressImage(file);
        await ProfileService.uploadAvatar(compressedFile);
        showToastFn('Avatar updated!');
        await loadProfile();
      } catch (err) {
        showToastFn(err.message || 'Avatar upload failed');
      } finally {
        hideLoaderFn();
        avatarInput.value = '';
      }
    });
  }

  // Remove Avatar
  const btnRemoveAvatar = document.getElementById('btn-remove-avatar');
  if (btnRemoveAvatar) {
    btnRemoveAvatar.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to remove your profile picture?')) return;
      showLoaderFn('Removing avatar...');
      try {
        await ProfileService.deleteAvatar();
        showToastFn('Avatar removed');
        await loadProfile();
      } catch (err) {
        showToastFn(err.message || 'Failed to remove avatar');
      } finally {
        hideLoaderFn();
      }
    });
  }

  // Edit Profile Form Submission
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('edit-profile-error');
      errorDiv.style.display = 'none';

      const username = editForm.username.value;
      if (username.length < 4 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username must be 4-20 chars and contain only letters, numbers, and underscores.';
        errorDiv.style.display = 'block';
        return;
      }

      const bio = editForm.bio.value;
      if (bio.length > 300) {
        errorDiv.textContent = 'Bio must be under 300 characters.';
        errorDiv.style.display = 'block';
        return;
      }

      const dob = editForm.dob.value;
      if (dob && new Date(dob) > new Date()) {
        errorDiv.textContent = 'DOB cannot be in the future.';
        errorDiv.style.display = 'block';
        return;
      }

      const payload = {
        fullname: editForm.fullname.value,
        username: editForm.username.value,
        phone: editForm.phone.value,
        dob: editForm.dob.value,
        gender: editForm.gender.value,
        country: editForm.country.value,
        state: editForm.state.value,
        city: editForm.city.value,
        bio: editForm.bio.value,
        favoriteGenres: editForm.favoriteGenres.value
      };

      showLoaderFn('Saving profile...');
      try {
        await ProfileService.updateProfile(payload);
        showToastFn('Profile updated successfully.');
        editModal.style.display = 'none';
        await loadProfile();
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
      } finally {
        hideLoaderFn();
      }
    });
  }

  // Change Password Form
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('change-password-error');
      errorDiv.style.display = 'none';

      const currentPassword = passwordForm.currentPassword.value;
      const newPassword = passwordForm.newPassword.value;
      const confirmPassword = passwordForm.confirmPassword.value;

      if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        return;
      }

      showLoaderFn('Changing password...');
      try {
        await ProfileService.changePassword(currentPassword, newPassword);
        showToastFn('Password changed. Please log in again.');
        passwordModal.style.display = 'none';
        AuthContext.logout();
        showScreenFn('login');
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
      } finally {
        hideLoaderFn();
      }
    });
  }

  // Delete Account Form
  if (deleteForm) {
    deleteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('delete-account-error');
      errorDiv.style.display = 'none';
      const password = deleteForm.password.value;

      if (!confirm('FINAL WARNING: This action is permanent and cannot be undone. All your data will be wiped. Proceed?')) {
        return;
      }

      showLoaderFn('Deleting account...');
      try {
        await ProfileService.deleteAccount(password);
        showToastFn('Account deleted permanently.');
        deleteModal.style.display = 'none';
        AuthContext.logout();
        showScreenFn('login');
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
      } finally {
        hideLoaderFn();
      }
    });
  }

  // Expose global functions to open/close modals
  window.openEditProfileModal = () => { if (editModal) editModal.style.display = 'flex'; };
  window.closeEditProfileModal = () => { if (editModal) editModal.style.display = 'none'; };
  
  window.openChangePasswordModal = () => { 
    if (passwordModal) {
      passwordForm.reset();
      passwordModal.style.display = 'flex'; 
    }
  };
  window.closeChangePasswordModal = () => { if (passwordModal) passwordModal.style.display = 'none'; };
  
  window.openDeleteAccountModal = () => { 
    if (deleteModal) {
      deleteForm.reset();
      deleteModal.style.display = 'flex'; 
    }
  };
  window.closeDeleteAccountModal = () => { if (deleteModal) deleteModal.style.display = 'none'; };

  // Setup hooks to refresh profile data when navigating to profile screen
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.id === 'screen-profile' && mutation.target.classList.contains('active')) {
        loadProfile();
      }
    });
  });
  
  const profileScreen = document.getElementById('screen-profile');
  if (profileScreen) {
    observer.observe(profileScreen, { attributes: true, attributeFilter: ['class'] });
  }

  // Utility: Image Compression via Canvas
  function compressImage(file, maxSize = 800) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // Crop to square
          const size = Math.min(width, height);
          const startX = (width - size) / 2;
          const startY = (height - size) / 2;

          const canvas = document.createElement('canvas');
          canvas.width = Math.min(size, maxSize);
          canvas.height = Math.min(size, maxSize);
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, startX, startY, size, size, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas is empty'));
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(newFile);
          }, file.type, 0.8); // 0.8 quality
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  }
}
