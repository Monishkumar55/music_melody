const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'public', 'audio');

function slugify(str) {
  // First strip MassTamilan suffixes
  let cleaned = str.replace(/-MassTamilan\.(com|io|dev|so|org|fm|net|in|mobi)/i, '');
  cleaned = cleaned.replace(/_MassTamilan\.(com|io|dev|so|org|fm|net|in|mobi)/i, '');
  cleaned = cleaned.replace(/ MassTamilan\.(com|io|dev|so|org|fm|net|in|mobi)/i, '');
  cleaned = cleaned.replace(/MassTamilan\.(com|io|dev|so|org|fm|net|in|mobi)/i, '');
  
  // Also strip the .mp3 to slugify the base name
  if (cleaned.toLowerCase().endsWith('.mp3')) {
      cleaned = cleaned.slice(0, -4);
  }
  
  // Apply the same slugify logic as index.html
  return String(cleaned).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.mp3';
}

fs.readdir(audioDir, (err, files) => {
  if (err) throw err;
  let renamed = 0;
  
  files.forEach(file => {
    if (file.endsWith('.mp3')) {
      const newName = slugify(file);
      if (file !== newName) {
        fs.renameSync(path.join(audioDir, file), path.join(audioDir, newName));
        renamed++;
        console.log(`Renamed: ${file} -> ${newName}`);
      }
    }
  });
  
  console.log(`Total files renamed: ${renamed}`);
});
