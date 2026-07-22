require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SONGS_DB = {
  happy: {
    Tamil: [
      { title: "Vaadi Pulla Vaadi", artist: "Anirudh Ravichander, Dhanush", movie: "Maari", year: 2015, genre: "Pop" },
      { title: "Oru Deivam Thantha Poove", artist: "Vidyasagar, S.P. Balasubrahmanyam", movie: "Poovellam Kettuppar", year: 1999, genre: "Pop" },
      { title: "Yaaro Ivan", artist: "S.P. Balasubrahmanyam", movie: "Vetri Vizha", year: 1989, genre: "Pop" },
      { title: "Anbae Anbae", artist: "A.R. Rahman", movie: "Kadhal Desam", year: 1996, genre: "Pop" },
      { title: "Rowdy Baby", artist: "Dhanush, Dhee", movie: "Maari 2", year: 2018, genre: "Dance" },
      { title: "Kanave Kanave", artist: "Anirudh Ravichander", movie: "3", year: 2012, genre: "Pop" },
      { title: "Why This Kolaveri Di", artist: "Dhanush", movie: "3", year: 2012, genre: "Pop" },
      { title: "Jumbulingam", artist: "Anirudh Ravichander", movie: "Anegan", year: 2015, genre: "Dance" },
      { title: "Kutti Story", artist: "Anirudh Ravichander", movie: "Master", year: 2021, genre: "Dance" },
      { title: "Aaluma Doluma", artist: "Anirudh Ravichander", movie: "Vedhalam", year: 2015, genre: "Dance" },
    ],
    Telugu: [
      { title: "Butta Bomma", artist: "Armaan Malik", movie: "Ala Vaikunthapurramuloo", year: 2020, genre: "Pop" },
      { title: "Samajavaragamana", artist: "Sid Sriram", movie: "Ala Vaikunthapurramuloo", year: 2020, genre: "Classical" },
      { title: "Jalsa Title Song", artist: "Mani Sharma", movie: "Jalsa", year: 2008, genre: "Dance" },
      { title: "Dhimmak Dhamaka", artist: "Anirudh Ravichander", movie: "Remo", year: 2016, genre: "Dance" },
      { title: "Race Gurram Title Song", artist: "Devi Sri Prasad", movie: "Race Gurram", year: 2014, genre: "Dance" },
    ],
    Malayalam: [
      { title: "Jimikki Kammal", artist: "Vineeth Sreenivasan, Manju Warrier", movie: "Velipadinte Pusthakam", year: 2017, genre: "Dance" },
      { title: "Malare", artist: "Vijay Yesudas", movie: "Premam", year: 2015, genre: "Melody" },
      { title: "Kali Thilakkam", artist: "Haricharan", movie: "Bangalore Days", year: 2014, genre: "Pop" },
    ],
    Hindi: [
      { title: "Badtameez Dil", artist: "Benny Dayal", movie: "Yeh Jawaani Hai Deewani", year: 2013, genre: "Pop" },
      { title: "London Thumakda", artist: "Labh Janjua, Sonu Kakkar", movie: "Queen", year: 2014, genre: "Folk" },
      { title: "Gallan Goodiyaan", artist: "Shankar Ehsaan Loy", movie: "Dil Dhadakne Do", year: 2015, genre: "Pop" },
      { title: "Balam Pichkari", artist: "Vishal Dadlani, Shalmali Kholgade", movie: "Yeh Jawaani Hai Deewani", year: 2013, genre: "Pop" },
      { title: "Kala Chashma", artist: "Amar Arshi, Badshah", movie: "Baar Baar Dekho", year: 2016, genre: "Dance" },
    ],
    English: [
      { title: "Happy", artist: "Pharrell Williams", movie: "Despicable Me 2 OST", year: 2013, genre: "Pop" },
      { title: "Can't Stop the Feeling", artist: "Justin Timberlake", movie: "Trolls OST", year: 2016, genre: "Pop" },
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", movie: "Uptown Special", year: 2014, genre: "Funk" },
      { title: "Shake It Off", artist: "Taylor Swift", movie: "1989", year: 2014, genre: "Pop" },
      { title: "Walking on Sunshine", artist: "Katrina and the Waves", movie: "Walking on Sunshine", year: 1985, genre: "Pop" },
    ],
    Kannada: [
      { title: "Bombe Helutaithe", artist: "Rajesh Krishnan", movie: "Mungaru Male", year: 2006, genre: "Melody" },
      { title: "Ninna Nambide", artist: "Rajesh Krishnan", movie: "Mungaru Male", year: 2006, genre: "Melody" },
    ],
    Bengali: [
      { title: "Ekla Cholo Re", artist: "Rabindranath Tagore", movie: "Traditional", year: 1905, genre: "Folk" },
      { title: "Mon Majhi Re", artist: "Anupam Roy", movie: "Boss", year: 2013, genre: "Pop" },
    ],
    Punjabi: [
      { title: "Hasdi Rehna", artist: "Jassi Gill", movie: "Single", year: 2018, genre: "Pop" },
      { title: "Chunni", artist: "Jasmine Sandlas", movie: "Single", year: 2018, genre: "Pop" },
    ],
    Korean: [
      { title: "Dynamite", artist: "BTS", movie: "Single", year: 2020, genre: "Pop" },
      { title: "Butter", artist: "BTS", movie: "Single", year: 2021, genre: "Pop" },
    ],
    Japanese: [
      { title: "Kimi no Na wa - Theme", artist: "RADWIMPS", movie: "Your Name", year: 2016, genre: "Anime OST" },
      { title: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", movie: "Evangelion", year: 1995, genre: "Anime OST" },
    ],
  },
  sad: {
    Tamil: [
      { title: "Idhazhin Oram", artist: "Vijay Prakash", movie: "Vinnaithandi Varuvaya", year: 2010, genre: "Melody" },
      { title: "Uyire", artist: "A.R. Rahman", movie: "Bombay", year: 1995, genre: "Melody" },
      { title: "Kadhal Rojave", artist: "A.R. Rahman", movie: "Roja", year: 1992, genre: "Melody" },
      { title: "Veyil Mele", artist: "Harris Jayaraj", movie: "Veyil", year: 2006, genre: "Melody" },
      { title: "Enna Solla Pogirai", artist: "Harris Jayaraj", movie: "Kandukondain Kandukondain", year: 2000, genre: "Melody" },
      { title: "Munbe Vaa", artist: "A.R. Rahman", movie: "Sillunu Oru Kaadhal", year: 2006, genre: "Melody" },
      { title: "Maruvarthai Pesadhey", artist: "Sid Sriram", movie: "Enai Noki Paayum Thota", year: 2019, genre: "Melody" },
      { title: "Kannaana Kanney", artist: "D. Imman, Sid Sriram", movie: "Viswasam", year: 2019, genre: "Melody" },
    ],
    Telugu: [
      { title: "Ye Maya Chesave", artist: "A.R. Rahman", movie: "Ye Maya Chesave", year: 2010, genre: "Melody" },
      { title: "Nuvvostanante Nenoddantana", artist: "Devi Sri Prasad", movie: "Nuvvostanante Nenoddantana", year: 2005, genre: "Melody" },
      { title: "Ninne Ninne", artist: "K.J. Yesudas", movie: "Sagara Sangamam", year: 1983, genre: "Classical" },
    ],
    Malayalam: [
      { title: "Anuraga Karikkin Vellam", artist: "Shaan Rahman", movie: "Angamaly Diaries", year: 2017, genre: "Melody" },
      { title: "Kanneer Poovinte", artist: "M.S. Viswanathan", movie: "Traditional", year: 1970, genre: "Melody" },
    ],
    Hindi: [
      { title: "Tum Hi Ho", artist: "Arijit Singh", movie: "Aashiqui 2", year: 2013, genre: "Melody" },
      { title: "Channa Mereya", artist: "Arijit Singh", movie: "Ae Dil Hai Mushkil", year: 2016, genre: "Melody" },
      { title: "Agar Tum Saath Ho", artist: "Arijit Singh, Alka Yagnik", movie: "Tamasha", year: 2015, genre: "Melody" },
      { title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", movie: "Ae Dil Hai Mushkil", year: 2016, genre: "Melody" },
      { title: "Kabhi Alvida Naa Kehna", artist: "Sonu Nigam, Alka Yagnik", movie: "Kabhi Alvida Naa Kehna", year: 2006, genre: "Melody" },
    ],
    English: [
      { title: "Someone Like You", artist: "Adele", movie: "21", year: 2011, genre: "Soul" },
      { title: "Fix You", artist: "Coldplay", movie: "X&Y", year: 2005, genre: "Alternative" },
      { title: "The Night We Met", artist: "Lord Huron", movie: "Strange Trails", year: 2015, genre: "Indie" },
      { title: "Skinny Love", artist: "Bon Iver", movie: "For Emma, Forever Ago", year: 2008, genre: "Indie" },
      { title: "Yesterday", artist: "The Beatles", movie: "Help!", year: 1965, genre: "Pop" },
    ],
    Kannada: [
      { title: "Kareyole", artist: "Rajesh Krishnan", movie: "Mungaru Male", year: 2006, genre: "Melody" },
    ],
  },
  angry: {
    Tamil: [
      { title: "Sarkar Theme", artist: "A.R. Rahman", movie: "Sarkar", year: 2018, genre: "Rock" },
      { title: "Aaluma Doluma", artist: "Anirudh Ravichander", movie: "Vedhalam", year: 2015, genre: "Rock" },
      { title: "Venmathi", artist: "Deva", movie: "Mounam Pesiyadhe", year: 2002, genre: "Rock" },
      { title: "Thalli Pogathey", artist: "A.R. Rahman", movie: "Achcham Yenbadhu Madamaiyada", year: 2016, genre: "Rock" },
    ],
    Telugu: [
      { title: "Bharat Ane Nenu Title Track", artist: "Devi Sri Prasad", movie: "Bharat Ane Nenu", year: 2018, genre: "Rock" },
      { title: "Pokiri Title Song", artist: "Mani Sharma", movie: "Pokiri", year: 2006, genre: "Rock" },
    ],
    Hindi: [
      { title: "Zinda", artist: "Siddharth Mahadevan", movie: "Bhaag Milkha Bhaag", year: 2013, genre: "Rock" },
      { title: "Sultan", artist: "Vishal Dadlani", movie: "Sultan", year: 2016, genre: "Rock" },
      { title: "Malhari", artist: "Vishal Dadlani", movie: "Bajirao Mastani", year: 2015, genre: "Dance" },
    ],
    English: [
      { title: "Numb", artist: "Linkin Park", movie: "Meteora", year: 2003, genre: "Rock" },
      { title: "In The End", artist: "Linkin Park", movie: "Hybrid Theory", year: 2000, genre: "Rock" },
      { title: "Killing in the Name", artist: "Rage Against the Machine", movie: "RATM", year: 1992, genre: "Metal" },
      { title: "Break Stuff", artist: "Limp Bizkit", movie: "Significant Other", year: 1999, genre: "Nu-Metal" },
      { title: "Bulls on Parade", artist: "Rage Against the Machine", movie: "Evil Empire", year: 1996, genre: "Metal" },
    ],
    Malayalam: [
      { title: "Oru Muri", artist: "Various", movie: "Single", year: 2020, genre: "Rock" },
    ],
  },
  relaxed: {
    Tamil: [
      { title: "Nenjukulle", artist: "A.R. Rahman", movie: "Kadal", year: 2013, genre: "Ambient" },
      { title: "Unnodu Ka", artist: "Anirudh Ravichander", movie: "Enai Noki Paayum Thota", year: 2019, genre: "Lo-fi" },
      { title: "Yaar Indha Saalai Oram", artist: "Ilaiyaraaja", movie: "Ninaithale Inikkum", year: 1979, genre: "Melody" },
      { title: "En Iniya Pon Nilave", artist: "Ilaiyaraaja", movie: "Ninaithale Inikkum", year: 1979, genre: "Melody" },
      { title: "Nee Paartha Vizhigal", artist: "Anirudh Ravichander", movie: "3", year: 2012, genre: "Lo-fi" },
    ],
    English: [
      { title: "Weightless", artist: "Marconi Union", movie: "Ambient", year: 2011, genre: "Ambient" },
      { title: "Here Comes The Sun", artist: "The Beatles", movie: "Abbey Road", year: 1969, genre: "Pop" },
      { title: "Pure Imagination", artist: "Gene Wilder", movie: "Willy Wonka", year: 1971, genre: "Pop" },
      { title: "Rivers of Babylon", artist: "Boney M", movie: "Nightflight to Venus", year: 1978, genre: "Reggae" },
      { title: "What a Wonderful World", artist: "Louis Armstrong", movie: "Single", year: 1967, genre: "Jazz" },
    ],
    Hindi: [
      { title: "Lag Ja Gale", artist: "Lata Mangeshkar", movie: "Woh Kaun Thi", year: 1964, genre: "Classical" },
      { title: "Khaabon Ke Parinday", artist: "Mohit Chauhan", movie: "Zindagi Na Milegi Dobara", year: 2011, genre: "Melody" },
    ],
    Telugu: [
      { title: "O Priya Priya", artist: "K.J. Yesudas", movie: "Geethanjali", year: 1989, genre: "Melody" },
    ],
    Malayalam: [
      { title: "Jeevamshamayi", artist: "Shankar Mahadevan", movie: "Oppam", year: 2016, genre: "Melody" },
    ],
    Korean: [
      { title: "Spring Day", artist: "BTS", movie: "You Never Walk Alone", year: 2017, genre: "Indie Pop" },
    ],
  },
  energetic: {
    Tamil: [
      { title: "1 2 3 4", artist: "Anirudh Ravichander", movie: "NOTA", year: 2018, genre: "Dance" },
      { title: "Nakka Mukka", artist: "Karunaas", movie: "Kadhalil Sodhappuvadhu Eppadimovi", year: 2012, genre: "Dance" },
      { title: "Kutti Story", artist: "Anirudh Ravichander", movie: "Master", year: 2021, genre: "Dance" },
      { title: "Jigarthanda Theme", artist: "Santhosh Narayanan", movie: "Jigarthanda", year: 2014, genre: "Dance" },
      { title: "Varalaru Mukkiyam", artist: "Yuvan Shankar Raja", movie: "Mankatha", year: 2011, genre: "Dance" },
    ],
    Telugu: [
      { title: "Race Gurram Title Song", artist: "Devi Sri Prasad", movie: "Race Gurram", year: 2014, genre: "Dance" },
      { title: "Dhimmak Dhamaka", artist: "Anirudh Ravichander", movie: "Remo", year: 2016, genre: "Dance" },
    ],
    Hindi: [
      { title: "Malhari", artist: "Vishal Dadlani", movie: "Bajirao Mastani", year: 2015, genre: "Dance" },
      { title: "Ghungroo", artist: "Arijit Singh, Shilpa Rao", movie: "War", year: 2019, genre: "Dance" },
      { title: "Kala Chashma", artist: "Amar Arshi, Badshah", movie: "Baar Baar Dekho", year: 2016, genre: "Dance" },
    ],
    English: [
      { title: "Eye of the Tiger", artist: "Survivor", movie: "Rocky III OST", year: 1982, genre: "Rock" },
      { title: "Thunderstruck", artist: "AC/DC", movie: "The Razors Edge", year: 1990, genre: "Rock" },
      { title: "Lose Yourself", artist: "Eminem", movie: "8 Mile OST", year: 2002, genre: "Hip-Hop" },
      { title: "Stronger", artist: "Kanye West", movie: "Graduation", year: 2007, genre: "Hip-Hop" },
      { title: "Blinding Lights", artist: "The Weeknd", movie: "After Hours", year: 2020, genre: "Synth-pop" },
    ],
    Korean: [
      { title: "Dynamite", artist: "BTS", movie: "Single", year: 2020, genre: "Pop" },
      { title: "Boy With Luv", artist: "BTS ft. Halsey", movie: "Map of the Soul", year: 2019, genre: "Pop" },
    ],
    Punjabi: [
      { title: "Lean On", artist: "Panjabi MC", movie: "Single", year: 2018, genre: "Dance" },
    ],
  },
  stressed: {
    Tamil: [
      { title: "Maruvarthai Pesadhey", artist: "Sid Sriram", movie: "Enai Noki Paayum Thota", year: 2019, genre: "Ambient" },
      { title: "Uyiril Thodum", artist: "A.R. Rahman", movie: "Azhagiya Tamizh Magan", year: 2007, genre: "Melody" },
      { title: "Nee Paartha Vizhigal", artist: "Anirudh Ravichander", movie: "3", year: 2012, genre: "Lo-fi" },
    ],
    English: [
      { title: "Breathe (2 AM)", artist: "Anna Nalick", movie: "Wreck of the Day", year: 2005, genre: "Indie" },
      { title: "Let It Be", artist: "The Beatles", movie: "Let It Be", year: 1970, genre: "Rock" },
      { title: "Don't Worry Be Happy", artist: "Bobby McFerrin", movie: "Simple Pleasures", year: 1988, genre: "Jazz" },
      { title: "Three Little Birds", artist: "Bob Marley", movie: "Exodus", year: 1977, genre: "Reggae" },
      { title: "Somewhere Over the Rainbow", artist: "Israel Kamakawiwoole", movie: "Facing Future", year: 1993, genre: "Folk" },
    ],
    Hindi: [
      { title: "Ik Vaari Aa", artist: "Arijit Singh", movie: "Raabta", year: 2017, genre: "Melody" },
      { title: "Khaabon Ke Parinday", artist: "Mohit Chauhan, Alyssa Mendonsa", movie: "Zindagi Na Milegi Dobara", year: 2011, genre: "Melody" },
    ],
    Malayalam: [
      { title: "Oru Murai Vanthu Paarthaaya", artist: "Haricharan", movie: "Sundara Kandam", year: 2011, genre: "Melody" },
    ],
    Telugu: [
      { title: "O Priya Priya", artist: "K.J. Yesudas", movie: "Geethanjali", year: 1989, genre: "Melody" },
    ],
  },
  romantic: {
    Tamil: [
      { title: "Ennai Thottu Azhaithal", artist: "Harris Jayaraj", movie: "Ghajini", year: 2005, genre: "Melody" },
      { title: "Oru Murai Vanthu Paarthaaya", artist: "Haricharan", movie: "Sundara Kandam", year: 2011, genre: "Melody" },
      { title: "Anbil Avan", artist: "Vijay Prakash", movie: "Maryan", year: 2013, genre: "Melody" },
      { title: "Yennai Arindhaal", artist: "Harris Jayaraj", movie: "Yennai Arindhaal", year: 2015, genre: "Melody" },
      { title: "Veyilon", artist: "Harris Jayaraj", movie: "Veyil", year: 2006, genre: "Melody" },
      { title: "Oh Manapenne", artist: "Harris Jayaraj", movie: "Minnale", year: 2001, genre: "Melody" },
      { title: "Nenjukulle", artist: "A.R. Rahman", movie: "Kadal", year: 2013, genre: "Melody" },
    ],
    Telugu: [
      { title: "Pilla Raa", artist: "Sri Krishna", movie: "RX 100", year: 2018, genre: "Pop" },
      { title: "Nuvvu Nuvvu", artist: "S.P. Balasubrahmanyam", movie: "Tholi Prema", year: 1998, genre: "Melody" },
      { title: "Vachinde", artist: "Anurag Kulkarni", movie: "Fidaa", year: 2017, genre: "Melody" },
    ],
    Malayalam: [
      { title: "Oru Adaar Love Title Track", artist: "Shaan Rahman", movie: "Oru Adaar Love", year: 2019, genre: "Pop" },
      { title: "Thumbi Thullal", artist: "Vineeth Sreenivasan", movie: "Jacobinte Swargarajyam", year: 2016, genre: "Pop" },
    ],
    Hindi: [
      { title: "Gerua", artist: "Arijit Singh", movie: "Dilwale", year: 2015, genre: "Melody" },
      { title: "Kabira", artist: "Rekha Bhardwaj, Tochi Raina", movie: "Yeh Jawaani Hai Deewani", year: 2013, genre: "Folk" },
      { title: "Main Rang Sharbaton Ka", artist: "Atif Aslam", movie: "Phata Poster Nikhla Hero", year: 2013, genre: "Pop" },
      { title: "Tere Liye", artist: "Atif Aslam, Alka Yagnik", movie: "Prince", year: 2010, genre: "Melody" },
    ],
    English: [
      { title: "Perfect", artist: "Ed Sheeran", movie: "Divide", year: 2017, genre: "Pop" },
      { title: "All of Me", artist: "John Legend", movie: "Love in the Future", year: 2013, genre: "Soul" },
      { title: "Can't Help Falling in Love", artist: "Elvis Presley", movie: "Blue Hawaii", year: 1961, genre: "Pop" },
      { title: "Make You Feel My Love", artist: "Adele", movie: "19", year: 2008, genre: "Soul" },
    ],
    Korean: [
      { title: "Love Scenario", artist: "iKON", movie: "Return", year: 2018, genre: "K-Pop" },
      { title: "Something", artist: "Girls' Generation-TTS", movie: "Something", year: 2014, genre: "K-Pop" },
    ],
  },
  neutral: {
    Tamil: [
      { title: "Poo", artist: "Yuvan Shankar Raja", movie: "Poo", year: 2008, genre: "Melody" },
      { title: "Kanave Kanave", artist: "Anirudh Ravichander", movie: "3", year: 2012, genre: "Pop" },
      { title: "Nenjukulle", artist: "A.R. Rahman", movie: "Kadal", year: 2013, genre: "Melody" },
    ],
    English: [
      { title: "Blinding Lights", artist: "The Weeknd", movie: "After Hours", year: 2020, genre: "Synth-pop" },
      { title: "Levitating", artist: "Dua Lipa", movie: "Future Nostalgia", year: 2020, genre: "Pop" },
      { title: "Shape of You", artist: "Ed Sheeran", movie: "Divide", year: 2017, genre: "Pop" },
      { title: "Memories", artist: "Maroon 5", movie: "Jordi", year: 2019, genre: "Pop" },
      { title: "Counting Stars", artist: "OneRepublic", movie: "Native", year: 2013, genre: "Pop" },
    ],
    Hindi: [
      { title: "Jai Ho", artist: "A.R. Rahman", movie: "Slumdog Millionaire", year: 2008, genre: "Pop" },
      { title: "Senorita", artist: "Shaan", movie: "Zindagi Na Milegi Dobara", year: 2011, genre: "Pop" },
    ],
    Telugu: [
      { title: "Samajavaragamana", artist: "Sid Sriram", movie: "Ala Vaikunthapurramuloo", year: 2020, genre: "Classical" },
    ],
  }
};

const cloudinaryUrls = [
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/Suthi-Suthi_u5i8ui.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Un-Vizhigalil_l3surn.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Thodu-Vaanam_fhlgn3.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834783/unakaga_bdpizo.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834782/singappenney_mashpj.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834775/Silu-Siluvena-Katru_cwjjgl.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834774/Thangame_ktqi0e.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834772/simtaangaran_dysuql.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834769/Paalam_ryfafd.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834768/selfie-pulla_hg2wbh.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834767/Roja-Roja_we5f4d.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834766/thaai-kelavi_euvxoh.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834767/Puyale-Puyale_atozzx.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834757/poi-varavaa_fuz3cp.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834758/Roja-Kadale_wntb75.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834755/saitji-saitji_oct3ij.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834754/pugazh-filming-riots-roadblock_fjbtcb.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834749/Puli-Urumudhu_czlaus.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834748/Pookkale-Satru_vxgbcu.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834745/oru-viral-puratchi_o9qz72.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834743/Osaka-Osaka_y1opok.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834736/oru-kutti-katha_o1a1eb.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834736/oliyum-oliyum_wu1quj.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834732/nenjukkul-peidhidum_jxdlqq.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834728/omg-ponnu_oxpcru.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834727/Oru-Chinna-Thamarai_rjmeqs.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834724/Open-The-Tasmac_utugog.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834723/Nijamellam-Maranthupochu_zyhqqk.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834720/Oh-Penne_meuavb.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834719/oh-oh-the-first-love-of-tamizh_sqxcqa.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834715/Neeyum-Naanum_jltx0n.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834714/nee-marlin-manore_isu7ql.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834709/minsara-kanna_diyfpz.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834708/mersal-arasan_jnajv8.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834707/mundhinam-parthene_dx61yd.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834701/never-give-up_l0jhiu.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834702/neethanae-neethane_zgjqax.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834701/Maanja_c4xdfn.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834694/nee-nenacha_a8yr5w.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834693/maduraikku_t0j4qy.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834691/Mersalayitten_yznukh.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834691/maathare_h305yc.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834690/Naan-Adicha-Thaanga_cowg0b.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834686/nalla-nanban_fapopm.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834676/maacho-ennacho_ouyjto.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834676/megham-karukatha_pk36wy.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834650/kutti-story_gfvaic.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834644/Kandangi-Kandangi-Karaoke_pgx0dw.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834643/kelamal-kaiyil_vnl4zf.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834637/Kandangi-Kandangi_hrr70l.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834635/Kadhal-Panna_wutkyq.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834632/Kannana-Kanne_dgguvp.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834631/Karikalan-Kala-Pola_nojs9a.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834630/Jingunamani_ej4dcz.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834624/Kadhal-Kan-Kattudhe_e4ak97.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834622/Irumbile-Oru-Idhaiyam_u8i43x.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834619/En-Peru-Padayappa_e3ltqq.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834616/Ennodu-Nee-Irundhal_ku1l9f.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834615/irukkana-idupu-irukkana_sfykno.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834610/heartiley-battery_ln2qqc.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834608/google-google_rgqu46.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834602/Ethir-Neechal_te3byi.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834596/ella-pugazhum_zaw71i.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834595/ezhu-velaikkara-indre_rdp6dr.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834593/Danga-Maari-Oodhari_nao9yt.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834589/asku-laska_mn4yt2.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834585/Darling-Dambakku_ankos5.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834583/Ennodu-Nee-Irundhal-Reprise_s8vbl1.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834570/Chennai-City-Gangsta_xpcpaz.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834569/Boomi-Enna-Suthudhe_plhssy.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834568/annul-maelae_v13r5k.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834567/Boom-Boom_mhtzjl.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834556/ava-enna-enna_e4pp9i.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834556/Arima-Arima_asj54s.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834550/arabic-kuthu-halamithi-habibo_dy1km3.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834547/antartica_hukl2c.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834548/adiyae-kolluthey_m6e9fa.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834547/aathadi_jcm1vc.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834546/Ambikapathy_nyygos.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834535/vaathi-coming_m35uex.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834529/vengamavan_pjsqr1.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834524/aasa-pulla_t6cmgf.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834522/Varava-Varava_nlvxyd.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834518/vaathi-raid_dgs6t4.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834512/Tamilselvi_qiz8im.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834511/single-pasanga_bolnw7.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834511/vaadi-nee-vaadi_bx7qlw.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834506/Un-Paarvayil_a8kxll.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834503/thenmozhi_e8zwvw.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834502/takkunu-takkunu_j8tojb.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834500/Senjitaley_yfbizi.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834491/quit-pannuda_mq5qs7.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834485/tak-bak-the-tak-bak-of-tamizh_equpd6.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834482/raathu-raasan_dnq2e5.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834481/polakatum-para-para_flvln7.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834481/pavazha-malli_n6iicj.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834473/oru-pere-varalaaru_zquntc.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834460/oh-shanthi-shanthi_rygmpv.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834460/paisa-note_l7v6hq.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834452/naa-ready_kylh4e.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834436/meesaya-murukku_szqkqf.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834433/naanga-naalu-peru_l860ek.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834431/Naanum-Rowdy-Dhaan_fakgx1.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834425/mutta-kalakki_f08vsa.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834416/Kakki-Sattai_yocptn.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834416/loveah-sollitalea_jxfa8p.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834410/i-m-so-cool_zqrg7o.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834403/jolly-o-gymkhana_waqekp.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834387/god-mode_i9o52p.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834385/enthiran_qqsixz.mp3",
  "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834377/en-frienda-pola_is3ppq.mp3"
];

const slugify = (str) => String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const MOOD_KEYWORDS = {
  happy: [], sad: [], angry: [], relaxed: [], energetic: [], stressed: [], romantic: [], neutral: []
};
const moods = Object.keys(MOOD_KEYWORDS);

async function migrate() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment or script.');
    return;
  }

  // Assign Cloudinary fallback
  let cIndex = 0;
  for (const mood in SONGS_DB) {
    for (const lang in SONGS_DB[mood]) {
      for (const song of SONGS_DB[mood][lang]) {
        song.file = cloudinaryUrls[cIndex % cloudinaryUrls.length];
        cIndex++;
      }
    }
  }

  const existingSlugs = new Set();
  const languages = ['Tamil', 'Telugu', 'Malayalam', 'Hindi', 'English', 'Kannada', 'Bengali', 'Punjabi', 'Korean', 'Japanese'];
  
  for (let i = cIndex; i < cloudinaryUrls.length; i++) {
    const url = cloudinaryUrls[i];
    let filename = url.split('/').pop().replace(/\.mp3$/i, '');
    const cleanTitle = filename.replace(/_[a-zA-Z0-9]+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const slug = slugify(cleanTitle);

    let hash = 0;
    for (let j = 0; j < slug.length; j++) hash = (hash << 5) - hash + slug.charCodeAt(j);
    const mood = moods[Math.abs(hash) % moods.length];
    const lang = languages[i % languages.length];
    
    SONGS_DB[mood][lang].push({
      title: cleanTitle,
      artist: "Cloudinary",
      movie: "Cloudinary",
      year: 2024,
      genre: "Pop",
      file: url
    });
    existingSlugs.add(slug);
  }

  let totalInserted = 0;

  for (const mood in SONGS_DB) {
    for (const language in SONGS_DB[mood]) {
      for (const song of SONGS_DB[mood][language]) {
        const { data, error } = await supabase.from('songs').insert({
          title: song.title,
          artist: song.artist,
          movie: song.movie,
          release_year: song.year,
          genre: song.genre,
          mood: mood,
          language: language,
          file_url: song.file
        });

        if (error) {
          console.error(`Error inserting ${song.title}:`, error.message);
        } else {
          totalInserted++;
          console.log(`Inserted: ${song.title} (${language} - ${mood})`);
        }
      }
    }
  }

  console.log(`Migration complete. Inserted ${totalInserted} songs.`);
}

migrate();
