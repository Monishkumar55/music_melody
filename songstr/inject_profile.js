const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

const profileHtml = `

  <!-- ==================== SCREEN: PROFILE ==================== -->
  <div class="screen" id="screen-profile">
    <div style="max-width: 900px; margin: 40px auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 class="section-title">User Profile</h2>
        <div>
          <button class="btn-secondary" onclick="openEditProfileModal()">Edit Profile</button>
          <button class="btn-primary" onclick="openChangePasswordModal()" style="margin-left: 10px;">Security</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <!-- Left Column: Avatar & Basic Info -->
        <div class="suggested-card" style="text-align: center;">
          <div style="position: relative; width: 150px; height: 150px; margin: 0 auto 20px;">
            <img id="profile-avatar-img" src="" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid var(--accent-light);">
            <label for="profile-avatar-input" style="position: absolute; bottom: 0; right: 0; background: var(--accent); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              📷
            </label>
            <input type="file" id="profile-avatar-input" accept="image/jpeg, image/png, image/webp" style="display: none;">
          </div>
          <button id="btn-remove-avatar" style="background: transparent; border: none; color: var(--red); cursor: pointer; margin-bottom: 20px;">Remove Picture</button>
          <h3 id="prof-fullname" style="font-size: 24px; margin-bottom: 5px;"></h3>
          <p id="prof-username" style="color: var(--accent-light); margin-bottom: 15px; font-weight: 500;"></p>
          <p id="prof-bio" style="color: var(--text2); font-size: 14px; line-height: 1.5;"></p>
        </div>

        <!-- Right Column: Details & Stats -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="suggested-card">
            <h3 style="margin-bottom: 15px; border-bottom: 1px solid var(--bg-card-hover); padding-bottom: 10px;">Contact & Info</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
              <div><strong style="color:var(--text2)">Email:</strong><br><span id="prof-email"></span></div>
              <div><strong style="color:var(--text2)">Phone:</strong><br><span id="prof-phone"></span></div>
              <div><strong style="color:var(--text2)">DOB:</strong><br><span id="prof-dob"></span></div>
              <div><strong style="color:var(--text2)">Gender:</strong><br><span id="prof-gender"></span></div>
              <div><strong style="color:var(--text2)">Location:</strong><br><span id="prof-location"></span></div>
              <div><strong style="color:var(--text2)">Favorite Genres:</strong><br><span id="prof-genres"></span></div>
            </div>
          </div>
          
          <div class="suggested-card">
            <h3 style="margin-bottom: 15px; border-bottom: 1px solid var(--bg-card-hover); padding-bottom: 10px;">Account Statistics</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
              <div><strong style="color:var(--text2)">Songs Liked:</strong><br><span id="prof-songs-liked">0</span></div>
              <div><strong style="color:var(--text2)">Member Since:</strong><br><span id="prof-created-at"></span></div>
              <div><strong style="color:var(--text2)">Last Login:</strong><br><span id="prof-last-login"></span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid var(--bg-card-hover); padding-top: 20px;">
        <h3 style="color: var(--red); margin-bottom: 15px;">Danger Zone</h3>
        <button class="btn-primary" onclick="openDeleteAccountModal()" style="background: rgba(220,53,69,0.1); color: var(--red); border: 1px solid var(--red);">Delete Account Permanently</button>
      </div>
    </div>
  </div>

  <!-- Modals for Profile -->
  <div class="modal-overlay" id="modal-edit-profile" onclick="if(event.target===this)closeEditProfileModal()">
    <div class="auth-modal" style="max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto;">
      <button class="auth-close" onclick="closeEditProfileModal()">×</button>
      <div class="auth-title">Edit Profile</div>
      <form id="form-edit-profile">
        <input type="text" name="fullname" class="auth-input" placeholder="Full Name" required>
        <input type="text" name="username" class="auth-input" placeholder="Username (4-20 chars)" required>
        <input type="tel" name="phone" class="auth-input" placeholder="Phone Number">
        <input type="date" name="dob" class="auth-input" placeholder="Date of Birth">
        <select name="gender" class="auth-input" style="color: var(--text);">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        <div style="display:flex; gap:10px;">
          <input type="text" name="country" class="auth-input" placeholder="Country">
          <input type="text" name="state" class="auth-input" placeholder="State">
        </div>
        <input type="text" name="city" class="auth-input" placeholder="City">
        <textarea name="bio" class="auth-input" placeholder="Bio (Max 300 chars)" style="resize:vertical; min-height:80px;"></textarea>
        <input type="text" name="favoriteGenres" class="auth-input" placeholder="Favorite Genres (comma separated)">
        
        <div id="edit-profile-error" style="color: var(--red); font-size: 13px; margin-bottom: 10px; display: none;"></div>
        <button type="submit" class="auth-btn-submit">Save Changes</button>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="modal-change-password" onclick="if(event.target===this)closeChangePasswordModal()">
    <div class="auth-modal" style="max-width: 400px; width: 100%;">
      <button class="auth-close" onclick="closeChangePasswordModal()">×</button>
      <div class="auth-title">Change Password</div>
      <form id="form-change-password">
        <input type="password" name="currentPassword" class="auth-input" placeholder="Current Password" required>
        <input type="password" name="newPassword" class="auth-input" placeholder="New Password (min 8 chars, mixed)" required>
        <input type="password" name="confirmPassword" class="auth-input" placeholder="Confirm New Password" required>
        <div id="change-password-error" style="color: var(--red); font-size: 13px; margin-bottom: 10px; display: none;"></div>
        <button type="submit" class="auth-btn-submit">Update Password</button>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="modal-delete-account" onclick="if(event.target===this)closeDeleteAccountModal()">
    <div class="auth-modal" style="max-width: 400px; width: 100%;">
      <button class="auth-close" onclick="closeDeleteAccountModal()">×</button>
      <div class="auth-title" style="color: var(--red);">Delete Account</div>
      <p style="font-size: 14px; margin-bottom: 20px; color: var(--text2);">This action is permanent and cannot be undone. Please enter your password to confirm.</p>
      <form id="form-delete-account">
        <input type="password" name="password" class="auth-input" placeholder="Password" required>
        <div id="delete-account-error" style="color: var(--red); font-size: 13px; margin-bottom: 10px; display: none;"></div>
        <button type="submit" class="auth-btn-submit" style="background: var(--red);">Delete Account</button>
      </form>
    </div>
  </div>
`;

// Insert after register screen
const matchStr = '<!-- ========== LOADING OVERLAY ========== -->';
if (html.includes(matchStr)) {
  html = html.replace(matchStr, profileHtml + '\\n\\n  ' + matchStr);
  fs.writeFileSync(indexPath, html);
  console.log('Successfully injected Profile HTML');
} else {
  console.error('Could not find injection point');
}
