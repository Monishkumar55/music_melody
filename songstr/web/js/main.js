import { RecommendationService } from '../../shared/services/recommendationService.js';

document.addEventListener('DOMContentLoaded', async () => {
  const moodContainer = document.getElementById('mood-chips');
  const songGrid = document.getElementById('recommended-songs-grid');

  const moods = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
  let currentMood = 'happy';

  // Render Mood Chips
  moods.forEach(mood => {
    const chip = document.createElement('button');
    chip.className = `mood-chip ${mood === currentMood ? 'active' : ''}`;
    chip.textContent = mood.toUpperCase();
    chip.addEventListener('click', () => {
      document.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentMood = mood;
      loadSongs(mood);
    });
    moodContainer.appendChild(chip);
  });

  async function loadSongs(mood) {
    try {
      const songs = await RecommendationService.getSongs(mood, 'All');
      songGrid.innerHTML = songs.map(song => `
        <div class="song-card" style="background:#1e293b; padding:12px; border-radius:12px;">
          <h4 style="color:#f8fafc;">${song.title}</h4>
          <p style="color:#94a3b8; font-size:12px;">${song.artist}</p>
        </div>
      `).join('');
    } catch {
      songGrid.innerHTML = '<p>Error loading tracks.</p>';
    }
  }

  loadSongs(currentMood);
});
