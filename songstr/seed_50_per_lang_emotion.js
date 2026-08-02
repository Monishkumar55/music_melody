const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://amcicvpnpcllzbrrnckq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_MIRRORS = [
  'https://saavn.sumit.co',
  'https://saavn.dev',
  'https://jiosaavn-api-v2.vercel.app'
];

const LANGUAGES = ['Tamil', 'English', 'Telugu', 'Hindi'];
const EMOTIONS = [
  'happy', 'sad', 'romantic', 'energetic', 'calm', 'relax',
  'focus', 'workout', 'travel', 'sleep', 'party', 'motivation',
  'devotional', 'rain', 'angry', 'stressed', 'neutral'
];

const SEARCH_QUERIES = {
  Tamil: {
    happy: ['Tamil happy songs', 'Tamil kuthu party dance', 'Tamil upbeat hits', 'Tamil celebratory songs', 'Tamil dance hits'],
    sad: ['Tamil sad emotional songs', 'Tamil heartbreak songs', 'Tamil painful melodies', 'Tamil tearjerker songs'],
    romantic: ['Tamil romantic love songs', 'Tamil couple duet songs', 'Tamil love melodies', 'Tamil sweet romance', 'Tamil melody hits'],
    energetic: ['Tamil mass fast beats', 'Tamil workout motivational songs', 'Tamil fast dance', 'Tamil high energy hits'],
    calm: ['Tamil calm melody songs', 'Tamil soothing acoustic', 'Tamil soft melodies', 'Tamil peaceful tunes'],
    relax: ['Tamil lofi chill songs', 'Tamil relaxing acoustic', 'Tamil peaceful songs', 'Tamil acoustic relax'],
    focus: ['Tamil instrumental melody', 'Tamil soft flute soothing', 'Tamil acoustic bgm', 'Tamil deep focus'],
    workout: ['Tamil workout motivational songs', 'Tamil mass gym beats', 'Tamil fast dance', 'Tamil gym workout hits'],
    travel: ['Tamil travel roadtrip songs', 'Tamil highway melody', 'Tamil pleasant songs', 'Tamil driving tunes'],
    sleep: ['Tamil sleep relaxing music', 'Tamil lullaby soothing', 'Tamil soft piano melody', 'Tamil bedtime tunes'],
    party: ['Tamil kuthu party dance', 'Tamil DJ remix hits', 'Tamil club party beats', 'Tamil celebration dance'],
    motivation: ['Tamil motivational mass songs', 'Tamil energetic inspiration', 'Tamil sports gym bgm', 'Tamil struggle motivation'],
    devotional: ['Tamil devotional songs', 'Tamil spiritual bhakthi', 'Tamil temple chants', 'Tamil Murugan Amman songs'],
    rain: ['Tamil rain songs', 'Tamil mazhai melodies', 'Tamil monsoon songs', 'Tamil rainy romantic'],
    angry: ['Tamil mass fast beats', 'Tamil intense action bgm', 'Tamil heavy beats', 'Tamil rage songs'],
    stressed: ['Tamil relaxing soothing flute', 'Tamil peaceful melody', 'Tamil sleep relaxing', 'Tamil anti stress music'],
    neutral: ['Tamil trending hits', 'Tamil top melodies', 'Tamil evergreen songs', 'Tamil classic hits']
  },
  English: {
    happy: ['English happy pop songs', 'English feel good dance', 'English upbeat hits', 'English positive vibes', 'English pop hits'],
    sad: ['English sad acoustic ballads', 'English heartbreak songs', 'English emotional pop', 'English lonely tears'],
    romantic: ['English romantic love songs', 'English love ballads', 'English pop love', 'English romantic acoustic'],
    energetic: ['English workout motivation', 'English high energy EDM', 'English gym workout hits', 'English hype music'],
    calm: ['English chill lofi beats', 'English relaxing acoustic', 'English calm indie pop', 'English peaceful piano'],
    relax: ['English relaxing ambient', 'English soft chill beats', 'English acoustic lofi', 'English chillout acoustic'],
    focus: ['English study focus music', 'English instrumental acoustic', 'English deep focus lofi', 'English study beats'],
    workout: ['English gym workout music', 'English fitness energy beats', 'English running motivation', 'English cardio hits'],
    travel: ['English road trip songs', 'English indie travel vibes', 'English driving pop', 'English wanderlust hits'],
    sleep: ['English sleeping music', 'English deep sleep ambient', 'English soft piano lullaby', 'English sleep melodies'],
    party: ['English party dance hits', 'English club EDM party', 'English night party pop', 'English club bangers'],
    motivation: ['English motivational gym music', 'English epic workout motivation', 'English inspiring pop', 'English triumph songs'],
    devotional: ['English gospel music', 'English Christian praise', 'English spiritual songs', 'English worship songs'],
    rain: ['English rain acoustic songs', 'English rainy day lofi', 'English cozy rain pop', 'English rain acoustic'],
    angry: ['English hard rock metal', 'English workout rage beats', 'English intense rap', 'English aggressive rock'],
    stressed: ['English peaceful piano meditation', 'English acoustic calm', 'English ambient music', 'English stress relief'],
    neutral: ['English top billboard hits', 'English trending pop', 'English indie chill', 'English chartbusters']
  },
  Telugu: {
    happy: ['Telugu happy dance songs', 'Telugu party beats', 'Telugu upbeat hits', 'Telugu joyful songs'],
    sad: ['Telugu sad emotional songs', 'Telugu heartbreak melodies', 'Telugu painful songs', 'Telugu emotional hits'],
    romantic: ['Telugu romantic love songs', 'Telugu love duets', 'Telugu sweet love melodies', 'Telugu romantic hits'],
    energetic: ['Telugu workout energy beats', 'Telugu mass dance hits', 'Telugu gym motivation', 'Telugu high energy'],
    calm: ['Telugu melody songs', 'Telugu lofi relaxing', 'Telugu calm acoustic', 'Telugu soothing tunes'],
    relax: ['Telugu relaxing melodies', 'Telugu peaceful acoustic', 'Telugu soft tunes', 'Telugu chill acoustic'],
    focus: ['Telugu instrumental songs', 'Telugu soothing flute', 'Telugu acoustic melody', 'Telugu focus tunes'],
    workout: ['Telugu workout energy beats', 'Telugu mass gym dance', 'Telugu fitness motivation', 'Telugu gym hits'],
    travel: ['Telugu travel roadtrip songs', 'Telugu journey melody', 'Telugu highway hits', 'Telugu roadtrip melodies'],
    sleep: ['Telugu sleep relaxing music', 'Telugu lullaby melody', 'Telugu soft instrumental', 'Telugu sleep tunes'],
    party: ['Telugu mass party beats', 'Telugu DJ dance songs', 'Telugu party hits', 'Telugu club dance'],
    motivation: ['Telugu motivational songs', 'Telugu mass inspiring beats', 'Telugu gym motivation', 'Telugu hero motivation'],
    devotional: ['Telugu devotional songs', 'Telugu bhakthi songs', 'Telugu spiritual chants', 'Telugu Venkateswara songs'],
    rain: ['Telugu rain songs', 'Telugu monsoon melodies', 'Telugu rain love songs', 'Telugu rainy day hits'],
    angry: ['Telugu mass beat songs', 'Telugu intense action bgm', 'Telugu fast beats', 'Telugu heavy action'],
    stressed: ['Telugu soothing melody', 'Telugu peaceful music', 'Telugu relaxing flute', 'Telugu stress relief'],
    neutral: ['Telugu top hits', 'Telugu trending melodies', 'Telugu blockbusters', 'Telugu evergreen hits']
  },
  Hindi: {
    happy: ['Bollywood happy party songs', 'Hindi dance hits', 'Hindi upbeat songs', 'Bollywood happiness hits'],
    sad: ['Hindi sad emotional songs', 'Arijit Singh sad songs', 'Bollywood heartbreak melodies', 'Hindi emotional ballads'],
    romantic: ['Hindi romantic love songs', 'Bollywood love ballads', 'Arijit Singh love songs', 'Hindi sweet romantic'],
    energetic: ['Hindi workout energy songs', 'Bollywood gym motivation', 'Hindi party dance', 'Hindi high energy'],
    calm: ['Hindi lofi acoustic chill', 'Hindi calm melodies', 'Hindi peaceful songs', 'Bollywood soft melodies'],
    relax: ['Hindi relaxing acoustic', 'Hindi soft unplugged', 'Hindi chill melodies', 'Hindi acoustic relax'],
    focus: ['Hindi instrumental acoustic', 'Hindi focus lofi', 'Hindi soft piano melody', 'Hindi study focus'],
    workout: ['Hindi workout gym music', 'Bollywood fitness beats', 'Hindi high energy gym', 'Hindi gym workout'],
    travel: ['Hindi road trip songs', 'Bollywood travel journey', 'Hindi highway melodies', 'Hindi driving hits'],
    sleep: ['Hindi sleep soothing songs', 'Hindi lofi lullaby', 'Hindi peaceful acoustic', 'Hindi bedtime lullaby'],
    party: ['Bollywood party dance hits', 'Hindi DJ party mix', 'Bollywood club beats', 'Hindi dance party'],
    motivation: ['Hindi motivational songs', 'Bollywood inspiring gym', 'Hindi sports motivation', 'Hindi inspiring hits'],
    devotional: ['Hindi bhajan devotional', 'Hindi spiritual aarti', 'Hindi Krishna Ram bhajans', 'Hindi Mata Rani bhajans'],
    rain: ['Hindi rain songs', 'Bollywood monsoon melodies', 'Hindi baarish love songs', 'Hindi rain romantic'],
    angry: ['Hindi rock beats', 'Hindi fast rap beats', 'Hindi intense gym workout', 'Hindi heavy rock'],
    stressed: ['Hindi soothing unplugged', 'Hindi peaceful piano', 'Hindi relaxing melodies', 'Hindi stress relief'],
    neutral: ['Hindi top chartbusters', 'Bollywood trending hits', 'Hindi evergreen melodies', 'Bollywood classic hits']
  }
};

function mapJioSaavnSong(s, language, mood) {
  if (!s) return null;
  const bestImage = s.image && s.image.length > 0 ? s.image[s.image.length - 1].url : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop';
  const bestDownload = s.downloadUrl && s.downloadUrl.length > 0 ? s.downloadUrl[s.downloadUrl.length - 1].url : '';
  const primaryArtists = s.artists && s.artists.primary ? s.artists.primary.map(a => a.name).join(', ') : (s.primaryArtists || 'Unknown Artist');
  const albumName = (s.album && s.album.name) || s.album || 'Single';
  
  return {
    song_id: String(s.id),
    title: s.name || s.title || 'Unknown',
    artist: primaryArtists,
    movie: albumName,
    language: language,
    genre: s.genre || 'Film Song',
    mood: mood,
    file_url: bestDownload,
    release_year: parseInt(s.year || s.releaseDate || s.release_year, 10) || 2024,
    updated_at: new Date().toISOString()
  };
}

async function fetchSongsForQuery(query) {
  for (const baseUrl of API_MIRRORS) {
    try {
      const url = `${baseUrl}/api/search/songs?query=${encodeURIComponent(query)}&limit=30`;
      const res = await axios.get(url, { timeout: 6000 });
      if (res.data && res.data.success && res.data.data && res.data.data.results) {
        return res.data.data.results;
      }
    } catch (err) {
      // Try next mirror
    }
  }
  return [];
}

async function seed50PerLangPerEmotion() {
  console.log('🚀 Starting Seeding: 50+ songs per language & emotion for Tamil, English, Telugu, and Hindi...');
  
  let totalSeeded = 0;

  for (const lang of LANGUAGES) {
    for (const mood of EMOTIONS) {
      console.log(`\n📌 Processing [${lang}] - [${mood}]...`);
      
      const queries = SEARCH_QUERIES[lang]?.[mood] || [`${lang} ${mood} songs`];
      const collectedSongs = new Map();

      for (const query of queries) {
        if (collectedSongs.size >= 55) break;
        
        console.log(`  Searching: "${query}"...`);
        const results = await fetchSongsForQuery(query);
        
        for (const rawSong of results) {
          const mapped = mapJioSaavnSong(rawSong, lang, mood);
          if (mapped && mapped.song_id && mapped.file_url) {
            collectedSongs.set(mapped.song_id, mapped);
          }
          if (collectedSongs.size >= 55) break;
        }
        
        await new Promise(r => setTimeout(r, 150));
      }

      const songList = Array.from(collectedSongs.values());
      console.log(`  Found ${songList.length} unique songs for [${lang}] - [${mood}]. Upserting into Supabase...`);

      if (songList.length > 0) {
        for (let i = 0; i < songList.length; i += 25) {
          const batch = songList.slice(i, i + 25);
          const { error } = await supabase.from('songs').upsert(batch, { onConflict: 'song_id' });
          if (error) {
            console.warn(`    Upsert warning for ${lang}/${mood}:`, error.message);
          }
        }
        totalSeeded += songList.length;
      }
    }
  }

  console.log(`\n🎉 SEEDING COMPLETE! Successfully seeded ${totalSeeded} songs into Supabase database across Tamil, English, Telugu, and Hindi for all emotions!`);
}

seed50PerLangPerEmotion().catch(err => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});
