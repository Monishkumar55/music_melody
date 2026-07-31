const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://amcicvpnpcllzbrrnckq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EXACT_50_TAMIL_SONGS = [
  { title: "Suthi Suthi", artist: "Anirudh Ravichander", movie: "Tamil Hits", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/Suthi-Suthi_u5i8ui.mp3", mood: "romantic" },
  { title: "Un Vizhigalil", artist: "Anirudh Ravichander", movie: "Darling", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Un-Vizhigalil_l3surn.mp3", mood: "romantic" },
  { title: "Thodu Vaanam", artist: "Harris Jayaraj", movie: "Anegan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Thodu-Vaanam_fhlgn3.mp3", mood: "romantic" },
  { title: "Unakaga", artist: "A.R. Rahman", movie: "Bigil", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834783/unakaga_bdpizo.mp3", mood: "romantic" },
  { title: "Silu Siluvena Katru", artist: "G.V. Prakash", movie: "Silu Silu", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834775/Silu-Siluvena-Katru_cwjjgl.mp3", mood: "relaxed" },
  { title: "Thangame", artist: "Anirudh Ravichander", movie: "Naanum Rowdy Dhaan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834774/Thangame_ktqi0e.mp3", mood: "romantic" },
  { title: "Simtaangaran", artist: "A.R. Rahman", movie: "Sarkar", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834772/simtaangaran_dysuql.mp3", mood: "energetic" },
  { title: "Selfie Pulla", artist: "Anirudh Ravichander & Vijay", movie: "Kaththi", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834768/selfie-pulla_hg2wbh.mp3", mood: "happy" },
  { title: "Roja Roja", artist: "A.R. Rahman", movie: "Iruvar", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834767/Roja-Roja_we5f4d.mp3", mood: "romantic" },
  { title: "Puyale Puyale", artist: "A.R. Rahman", movie: "Vettaiyaadu Vilaiyaadu", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834767/Puyale-Puyale_atozzx.mp3", mood: "romantic" },
  { title: "Roja Kadale", artist: "Harris Jayaraj", movie: "Anegan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834758/Roja-Kadale_wntb75.mp3", mood: "romantic" },
  { title: "Saitji Saitji", artist: "Hip Hop Tamizha", movie: "Meesaya Murukku", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834755/saitji-saitji_oct3ij.mp3", mood: "energetic" },
  { title: "Osaka Osaka", artist: "Anirudh Ravichander", movie: "Vanakkam Chennai", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834743/Osaka-Osaka_y1opok.mp3", mood: "happy" },
  { title: "Nenjukkul Peidhidum", artist: "Harris Jayaraj / Hariharan", movie: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834732/nenjukkul-peidhidum_jxdlqq.mp3", mood: "romantic" },
  { title: "OMG Ponnu", artist: "A.R. Rahman", movie: "Sarkar", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834728/omg-ponnu_oxpcru.mp3", mood: "happy" },
  { title: "Nijamellam Maranthupochu", artist: "Dhanush / Anirudh", movie: "Ethir Neechal", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834723/Nijamellam-Maranthupochu_zyhqqk.mp3", mood: "sad" },
  { title: "Oh Penne", artist: "Anirudh Ravichander", movie: "Vanakkam Chennai", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834720/Oh-Penne_meuavb.mp3", mood: "romantic" },
  { title: "Oh Oh First Love Of Tamizh", artist: "Anirudh Ravichander", movie: "VIP", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834719/oh-oh-the-first-love-of-tamizh_sqxcqa.mp3", mood: "romantic" },
  { title: "Neeyum Naanum", artist: "Anirudh Ravichander", movie: "Naanum Rowdy Dhaan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834715/Neeyum-Naanum_jltx0n.mp3", mood: "romantic" },
  { title: "Mundhinam Parthene", artist: "Harris Jayaraj", movie: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834707/mundhinam-parthene_dx61yd.mp3", mood: "romantic" },
  { title: "Nee Nenacha", artist: "Dhibu Ninan Thomas", movie: "Kanaa", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834694/nee-nenacha_a8yr5w.mp3", mood: "romantic" },
  { title: "Maduraikku", artist: "Vidyasagar", movie: "Ghilli", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834693/maduraikku_t0j4qy.mp3", mood: "energetic" },
  { title: "Megham Karukatha", artist: "Dhanush / Anirudh", movie: "Thiruchitrambalam", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834676/megham-karukatha_pk36wy.mp3", mood: "happy" },
  { title: "Kandangi Kandangi Karaoke", artist: "D. Imman", movie: "Jilla", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834644/Kandangi-Kandangi-Karaoke_pgx0dw.mp3", mood: "relaxed" },
  { title: "Kandangi Kandangi", artist: "D. Imman & Vijay", movie: "Jilla", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834637/Kandangi-Kandangi_hrr70l.mp3", mood: "romantic" },
  { title: "Kadhal Panna", artist: "G.V. Prakash", movie: "VIP", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834635/Kadhal-Panna_wutkyq.mp3", mood: "romantic" },
  { title: "Ennodu Nee Irundhal", artist: "A.R. Rahman & Sid Sriram", movie: "I", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834616/Ennodu-Nee-Irundhal_ku1l9f.mp3", mood: "romantic" },
  { title: "Ethir Neechal", artist: "Anirudh Ravichander", movie: "Ethir Neechal", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834602/Ethir-Neechal_te3byi.mp3", mood: "energetic" },
  { title: "Darling Dambakku", artist: "G.V. Prakash", movie: "Maan Karate", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834585/Darling-Dambakku_ankos5.mp3", mood: "energetic" },
  { title: "Ennodu Nee Irundhal Reprise", artist: "A.R. Rahman", movie: "I", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834583/Ennodu-Nee-Irundhal-Reprise_s8vbl1.mp3", mood: "romantic" },
  { title: "Boomi Enna Suthudhe", artist: "Anirudh Ravichander", movie: "Ethir Neechal", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834569/Boomi-Enna-Suthudhe_plhssy.mp3", mood: "happy" },
  { title: "Arabic Kuthu Halamithi Habibo", artist: "Anirudh Ravichander", movie: "Beast", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834550/arabic-kuthu-halamithi-habibo_dy1km3.mp3", mood: "energetic" },
  { title: "Adiyae Kolluthey", artist: "Harris Jayaraj", movie: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834548/adiyae-kolluthey_m6e9fa.mp3", mood: "romantic" },
  { title: "Antartica", artist: "Harris Jayaraj", movie: "Thuppakki", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834547/antartica_hukl2c.mp3", mood: "happy" },
  { title: "Aathadi", artist: "Dhanush / Anirudh", movie: "Anegan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834547/aathadi_jcm1vc.mp3", mood: "romantic" },
  { title: "Ambikapathy", artist: "A.R. Rahman", movie: "Ambikapathy", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834546/Ambikapathy_nyygos.mp3", mood: "romantic" },
  { title: "Aasa Pulla", artist: "Ghibran", movie: "Amara Kaaviyam", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834524/aasa-pulla_t6cmgf.mp3", mood: "romantic" },
  { title: "Vaseegara", artist: "Harris Jayaraj", movie: "Minnale", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834512/vasigaran-s-lab_wm63fv.mp3", mood: "romantic" },
  { title: "Sirikkadhey", artist: "Anirudh Ravichander", movie: "Remo", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834507/Sirikkadhey_suipu4.mp3", mood: "romantic" },
  { title: "Un Paarvayil", artist: "Anirudh Ravichander", movie: "Amman", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834506/Un-Paarvayil_a8kxll.mp3", mood: "romantic" },
  { title: "Senjitaley", artist: "Anirudh Ravichander", movie: "Remo", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834500/Senjitaley_yfbizi.mp3", mood: "romantic" },
  { title: "Remo Nee Kadhalan", artist: "Anirudh Ravichander", movie: "Remo", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834496/Remo-Nee-Kadhalan_qbcw9p.mp3", mood: "romantic" },
  { title: "Tak Bak", artist: "Anirudh Ravichander", movie: "Thangamagan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834485/tak-bak-the-tak-bak-of-tamizh_equpd6.mp3", mood: "happy" },
  { title: "Pavazha Malli", artist: "Harris Jayaraj", movie: "Cobra", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834481/pavazha-malli_n6iicj.mp3", mood: "romantic" },
  { title: "Oh Shanthi Shanthi", artist: "Harris Jayaraj", movie: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834460/oh-shanthi-shanthi_rygmpv.mp3", mood: "romantic" },
  { title: "Paisa Note", artist: "Hip Hop Tamizha", movie: "Comali", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834460/paisa-note_l7v6hq.mp3", mood: "energetic" },
  { title: "Loveah Sollitalea", artist: "Hiphop Tamizha", movie: "Tik Tik Tik", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834416/loveah-sollitalea_jxfa8p.mp3", mood: "romantic" },
  { title: "Adiye Sakkarakatti", artist: "G.V. Prakash", movie: "Rajinimurugan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834346/adiye-sakkarakatti_ye4yhe.mp3", mood: "romantic" },
  { title: "Padaiyappa Love Success", artist: "A.R. Rahman", movie: "Padaiyappa", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834322/padaiyappa-s-love-success_jbyku8.mp3", mood: "happy" }
];

async function syncExactSongs() {
  console.log('Clearing old records...');
  const { data: existing } = await supabase.from('songs').select('id');
  if (existing && existing.length > 0) {
    const ids = existing.map(x => x.id);
    await supabase.from('songs').delete().in('id', ids);
  }

  const supaRows = EXACT_50_TAMIL_SONGS.map(s => ({
    title: s.title,
    artist: s.artist,
    movie: s.movie,
    language: 'Tamil',
    genre: 'Film Song',
    mood: s.mood,
    file_url: s.url,
    release_year: 2024
  }));

  const { error } = await supabase.from('songs').insert(supaRows);
  if (error) {
    console.error('Error syncing exact Tamil songs:', error.message);
  } else {
    console.log(`Successfully synced EXACT ${supaRows.length} Cloudinary Tamil songs with Romantic Mood Session into Supabase Cloud PostgreSQL!`);
  }
}

syncExactSongs();
