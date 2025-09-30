// ═══════════════════════════════════════════════════════════════════════
// 🎵 MOODPLAYLIST CONFIGURATION - EASY EDITING GUIDE
// ═══════════════════════════════════════════════════════════════════════
//
// 📝 HOW TO EDIT THIS FILE (NO CODING KNOWLEDGE NEEDED!):
//
// 1. CHANGE YOUR WEBSITE URL:
//    - Find the line below that says 'https://moodplaylist-zeta.vercel.app'
//    - Replace it with your own Vercel URL (e.g., 'https://yourappname.vercel.app')
//
// 2. ADD/EDIT MOODS:
//    - Scroll down to the MOOD_MAPPING section
//    - To change a mood's music style, edit the 'genres' (e.g., ['pop', 'rock'])
//    - Available genres: pop, rock, indie, folk, acoustic, electronic, dance, 
//      hip-hop, r&b, soul, jazz, classical, metal, punk, country, blues
//    - Keep genres in quotes and separated by commas
//
// 3. ADD NEW MOODS:
//    - Copy an existing mood block (e.g., 'Happy')
//    - Paste it and change the name, emoji, genres, and description
//    - Example emojis: 😊 😢 😌 ⚡ 😍 😠 🤗 😎 🥳 😴 🤔 😱
//
// 4. AFTER EDITING:
//    - Save the file
//    - If running locally: refresh your browser
//    - If on Vercel: push to GitHub (git add . && git commit -m "Update config" && git push)
//
// ⚠️ IMPORTANT: Keep all commas, brackets, and quotes exactly as they are!
// ═══════════════════════════════════════════════════════════════════════

// Detect if running on Vercel or localhost (DON'T CHANGE THIS SECTION)
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// 🌐 EDIT YOUR WEBSITE URL HERE (change 'moodplaylist-zeta' to your Vercel app name):
const baseURL = isProduction ? 'https://moodplaylist-zeta.vercel.app' : 'http://127.0.0.1:3002';

const CONFIG = {
  SPOTIFY: {
    CLIENT_ID: 'cfa3454278f647acbdb0a0d417b5530c',
    CLIENT_SECRET: '1517cc34e8c34f298cb332bb9005f245', // ADD YOUR SECRET HERE
    REDIRECT_URI: `${baseURL}/callback`,
    SCOPES: [
      'user-read-private',
      'user-read-email',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-top-read',
      'user-read-recently-played'
    ]
  },
  
  MOOD_MAPPING: {
    'Happy': { 
      genres: ['pop', 'dance', 'disco'], 
      target_energy: 0.8, 
      target_valence: 0.9,
      description: 'Upbeat and joyful tracks to lift your spirits'
    },
    'Sad': { 
      genres: ['indie', 'folk', 'acoustic'], 
      target_energy: 0.3, 
      target_valence: 0.2,
      description: 'Melancholic and introspective songs for reflection'
    },
    'Calm': { 
      genres: ['ambient', 'chill', 'acoustic'], 
      target_energy: 0.2, 
      target_valence: 0.5,
      description: 'Peaceful and relaxing music for tranquility'
    },
    'Energetic': { 
      genres: ['rock', 'electronic', 'dance'], 
      target_energy: 0.9, 
      target_valence: 0.7,
      description: 'High-energy tracks to get you pumped up'
    },
    'Romantic': { 
      genres: ['pop', 'r&b', 'soul'], 
      target_energy: 0.4, 
      target_valence: 0.6,
      description: 'Intimate and romantic songs for special moments'
    },
    'Angry': { 
      genres: ['rock', 'metal', 'punk'], 
      target_energy: 0.9, 
      target_valence: 0.1,
      description: 'Intense and powerful music to channel emotions'
    }
  },
  
  API: {
    BASE_URL: baseURL,
    ENDPOINTS: {
      CREATE_PLAYLIST: '/api/create-playlist',
      USER_PROFILE: '/api/user-profile'
    }
  }
};

// Export for Node.js (server)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
