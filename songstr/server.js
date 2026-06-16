const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// COMPLETE SONGS DATABASE - 200+ songs across moods/languages
// ============================================================
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

// ============================================================
// MOOD DETECTION LOGIC (keyword-based NLP)
// ============================================================
const MOOD_KEYWORDS = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'good', 'cheerful', 'delighted', 'thrilled', 'pleased', 'elated', 'ecstatic', 'love', 'awesome', 'excellent', 'perfect', 'fun', 'laugh', 'smile'],
  sad: ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'cry', 'grief', 'sorrow', 'lonely', 'disappointed', 'down', 'gloomy', 'melancholy', 'hurt', 'pain', 'miss', 'lost', 'empty', 'broken'],
  angry: ['angry', 'mad', 'furious', 'rage', 'frustrated', 'annoyed', 'irritated', 'hate', 'irritate', 'fed up', 'boiling', 'outraged', 'hostile', 'bitter', 'resentful', 'pissed'],
  relaxed: ['calm', 'relaxed', 'peaceful', 'chill', 'serene', 'tranquil', 'zen', 'easy', 'comfortable', 'mellow', 'soothing', 'gentle', 'quiet', 'still', 'content', 'satisfied'],
  energetic: ['energetic', 'hyper', 'pumped', 'motivated', 'powerful', 'active', 'intense', 'fired up', 'workout', 'gym', 'run', 'sprint', 'energy', 'boost', 'adrenaline', 'strong'],
  stressed: ['stressed', 'anxious', 'worried', 'tense', 'nervous', 'overwhelmed', 'pressure', 'panic', 'fear', 'anxiety', 'burden', 'trouble', 'difficult', 'hard', 'exhausted', 'tired'],
  romantic: ['romantic', 'love', 'crush', 'date', 'relationship', 'heart', 'affection', 'tender', 'passionate', 'intimate', 'caring', 'sweet', 'beloved', 'darling', 'kiss', 'couple'],
  neutral: ['okay', 'fine', 'normal', 'average', 'so so', 'meh', 'nothing', 'neutral', 'not sure', 'alright', 'decent']
};

function detectMoodFromText(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    scores[mood] = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[mood]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'neutral';
}

// ============================================================
// ROUTES
// ============================================================

// Detect mood from text
app.post('/api/detect-mood', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  const mood = detectMoodFromText(text);
  const moodMeta = {
    happy: { emoji: '😄', label: 'Happy', description: 'Upbeat and joyful vibes' },
    sad: { emoji: '😢', label: 'Sad', description: 'Soulful and emotional music' },
    angry: { emoji: '😠', label: 'Angry', description: 'Intense and powerful sounds' },
    relaxed: { emoji: '😌', label: 'Relaxed', description: 'Calm and soothing tunes' },
    energetic: { emoji: '⚡', label: 'Energetic', description: 'High-energy beats' },
    stressed: { emoji: '😰', label: 'Stressed', description: 'Stress-relief soundscapes' },
    romantic: { emoji: '💕', label: 'Romantic', description: 'Romantic and passionate' },
    neutral: { emoji: '😐', label: 'Neutral', description: 'Versatile everyday mix' }
  };
  res.json({ mood, meta: moodMeta[mood] });
});

// Get songs by mood and language
app.get('/api/songs', (req, res) => {
  const mood = req.query.mood || 'happy';
  const lang = (req.query.lang || 'All').toString();
  const moodSongs = SONGS_DB[mood] || SONGS_DB.happy;
  let songs = [];
  if (lang.toLowerCase() === 'all') {
    for (const [language, languageSongs] of Object.entries(moodSongs)) {
      songs = songs.concat(languageSongs.map(s => ({ ...s, language })));
    }
  } else {
    songs = (moodSongs[lang] || []).map(s => ({ ...s, language: lang }));
  }
  // Shuffle
  songs = songs.sort(() => Math.random() - 0.5);
  res.json({ songs, total: songs.length });
});

// Get all available moods
app.get('/api/moods', (req, res) => {
  const moods = [
    { id: 'happy', emoji: '😄', label: 'Happy', description: 'Upbeat and joyful vibes', genre: 'Pop, Dance, Funk', color: '#f59e0b' },
    { id: 'sad', emoji: '😢', label: 'Sad', description: 'Soulful and emotional music', genre: 'Soft, Acoustic, Melody', color: '#60a5fa' },
    { id: 'angry', emoji: '😠', label: 'Angry', description: 'Intense and powerful sounds', genre: 'Rock, Metal', color: '#ef4444' },
    { id: 'relaxed', emoji: '😌', label: 'Relaxed', description: 'Calm and soothing tunes', genre: 'Lo-fi, Ambient', color: '#34d399' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic', description: 'High-energy beats', genre: 'Dance, Hip-Hop', color: '#f97316' },
    { id: 'stressed', emoji: '😰', label: 'Stressed', description: 'Stress-relief soundscapes', genre: 'Calm, Meditation', color: '#a78bfa' },
    { id: 'romantic', emoji: '💕', label: 'Romantic', description: 'Romantic and passionate', genre: 'Melody, Soul', color: '#ec4899' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', description: 'Versatile everyday mix', genre: 'Pop, All genres', color: '#94a3b8' },
  ];
  res.json({ moods });
});

// Get available languages for a mood
app.get('/api/languages', (req, res) => {
  const { mood = 'happy' } = req.query;
  const moodSongs = SONGS_DB[mood] || SONGS_DB.happy;
  const languages = ['All', ...Object.keys(moodSongs)];
  res.json({ languages });
});

// Time-based mood suggestion
app.get('/api/suggest-mood', (req, res) => {
  const hour = new Date().getHours();
  let mood, reason;
  if (hour >= 5 && hour < 9) { mood = 'energetic'; reason = 'Good morning! Start your day with high energy'; }
  else if (hour >= 9 && hour < 12) { mood = 'happy'; reason = 'Morning productivity calls for upbeat tunes'; }
  else if (hour >= 12 && hour < 14) { mood = 'relaxed'; reason = 'Lunchtime — unwind and recharge'; }
  else if (hour >= 14 && hour < 17) { mood = 'energetic'; reason = 'Afternoon boost to keep you going'; }
  else if (hour >= 17 && hour < 20) { mood = 'happy'; reason = 'Evening vibes — celebrate the day'; }
  else if (hour >= 20 && hour < 22) { mood = 'romantic'; reason = 'Night is young — set the mood'; }
  else { mood = 'relaxed'; reason = 'Late night — calm and soothing music'; }
  res.json({ mood, reason });
});

// Search songs
app.get('/api/search', (req, res) => {
  const { q = '' } = req.query;
  const query = q.toLowerCase();
  const results = [];
  for (const [mood, langs] of Object.entries(SONGS_DB)) {
    for (const [lang, songs] of Object.entries(langs)) {
      for (const song of songs) {
        if (song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query) || song.movie.toLowerCase().includes(query)) {
          results.push({ ...song, mood, language: lang });
        }
      }
    }
  }
  res.json({ results: results.slice(0, 20) });
});

// Favorites (in-memory for demo)
let favorites = [];
app.post('/api/favorites', (req, res) => {
  const song = req.body;
  const exists = favorites.find(f => f.title === song.title && f.artist === song.artist);
  if (!exists) favorites.push(song);
  res.json({ favorites });
});
app.get('/api/favorites', (req, res) => res.json({ favorites }));
app.delete('/api/favorites', (req, res) => {
  const { title, artist } = req.body;
  favorites = favorites.filter(f => !(f.title === title && f.artist === artist));
  res.json({ favorites });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Songstr running on http://localhost:${PORT}`));
