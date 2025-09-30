// MoodPlaylist Configuration
// This file contains all the configuration settings for the app

// Detect environment
const isProduction = typeof window !== 'undefined' ? 
  (window.location.hostname === 'moodplaylist.app' || window.location.hostname === 'www.moodplaylist.app' || window.location.hostname.includes('vercel.app')) :
  (process.env.VERCEL || process.env.NODE_ENV === 'production');

const baseURL = isProduction ? 'https://www.moodplaylist.app' : 'http://127.0.0.1:3002';

const CONFIG = {
  // Spotify API Configuration
  SPOTIFY: {
    CLIENT_ID: '1517cc34e8c34f298cb332bb9005f245',
    CLIENT_SECRET: 'your_spotify_client_secret_here', // Replace with your actual secret
    REDIRECT_URI: `${baseURL}/api/callback`,
    SCOPES: [
      'user-read-private',
      'user-read-email',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-top-read'
    ]
  },

  // API Configuration
  API: {
    BASE_URL: baseURL,
    ENDPOINTS: {
      CREATE_PLAYLIST: '/api/create-playlist',
      USER_PROFILE: '/api/user-profile',
      FEEDBACK: '/api/feedback'
    }
  },

  // Mood to Music Mapping
  // Each mood maps to specific genres and audio features
  MOOD_MAPPING: {
    'Happy': {
      genres: ['pop', 'dance', 'disco', 'funk', 'reggae'],
      target_energy: 0.8,
      target_valence: 0.9,
      description: 'Upbeat and joyful vibes'
    },
    'Sad': {
      genres: ['indie', 'folk', 'acoustic', 'blues', 'soul'],
      target_energy: 0.3,
      target_valence: 0.2,
      description: 'Melancholic and introspective'
    },
    'Calm': {
      genres: ['ambient', 'chill', 'acoustic', 'classical', 'jazz'],
      target_energy: 0.2,
      target_valence: 0.5,
      description: 'Peaceful and relaxing'
    },
    'Energetic': {
      genres: ['rock', 'electronic', 'hip-hop', 'metal', 'punk'],
      target_energy: 0.9,
      target_valence: 0.7,
      description: 'High-energy and intense'
    },
    'Romantic': {
      genres: ['pop', 'r&b', 'soul', 'jazz', 'acoustic'],
      target_energy: 0.4,
      target_valence: 0.6,
      description: 'Intimate and loving'
    },
    'Angry': {
      genres: ['metal', 'punk', 'rock', 'hip-hop', 'electronic'],
      target_energy: 0.9,
      target_valence: 0.3,
      description: 'Intense and aggressive'
    }
  }
};

// Export for Node.js (server.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Make available globally for browser (App.js)
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
