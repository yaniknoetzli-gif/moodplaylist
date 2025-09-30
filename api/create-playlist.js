import https from 'https';

// Mood mapping configuration
const MOOD_MAPPING = {
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
};

// Spotify API helper functions
async function makeSpotifyRequest(endpoint, accessToken, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.spotify.com',
      path: endpoint,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (options.data) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.data);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          console.log(`API Response - Status: ${res.statusCode}, Endpoint: ${requestOptions.path}`);
          
          // Handle empty responses
          if (!data || data.trim() === '') {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({});
            } else {
              console.error(`Empty response with status ${res.statusCode} for ${requestOptions.path}`);
              reject(new Error(`HTTP ${res.statusCode}: Empty response from ${requestOptions.path}`));
            }
            return;
          }
          
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            console.error('API Error Response:', {
              statusCode: res.statusCode,
              endpoint: requestOptions.path,
              error: jsonData.error
            });
            reject(new Error(jsonData.error?.message || `HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
          }
        } catch (error) {
          console.error('API Response Error:', {
            statusCode: res.statusCode,
            endpoint: requestOptions.path,
            data: data.substring(0, 200),
            error: error.message
          });
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.data) {
      req.write(options.data);
    }
    req.end();
  });
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, mood, userId } = req.body;

    if (!accessToken || !mood) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get user profile if userId not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const userProfile = await makeSpotifyRequest('/v1/me', accessToken);
      finalUserId = userProfile.id;
      console.log('Got user ID:', finalUserId);
    }

    // Map mood to Spotify seed parameters using config
    const moodConfig = MOOD_MAPPING[mood] || MOOD_MAPPING['Happy'];
    
    // Use search instead of recommendations for better compatibility
    // Add variety by rotating through genres and using random year ranges
    const genres = moodConfig.genres;
    const genreIndex = Math.floor(Math.random() * genres.length);
    const searchGenre = genres[genreIndex] || 'pop';
    
    // Randomize year range to get different results each time
    const currentYear = new Date().getFullYear();
    const yearRanges = [
      [currentYear-1, currentYear],      // Latest hits
      [currentYear-3, currentYear-1],    // Recent popular
      [currentYear-5, currentYear-3],    // A bit older
      [2018, 2020],                       // 2010s classics
      [2015, 2018]                        // More variety
    ];
    const randomRange = yearRanges[Math.floor(Math.random() * yearRanges.length)];
    
    console.log(`Searching for ${mood} tracks with genre: ${searchGenre}, years: ${randomRange[0]}-${randomRange[1]}`);
    const searchResults = await makeSpotifyRequest(
      `/v1/search?q=year:${randomRange[0]}-${randomRange[1]}%20genre:${searchGenre}&type=track&limit=50`,
      accessToken
    );
    
    if (!searchResults.tracks || !searchResults.tracks.items || searchResults.tracks.items.length === 0) {
      throw new Error('No tracks found for this mood. Try a different mood!');
    }
    
    // Shuffle results and take 30 random tracks for variety
    const allTracks = searchResults.tracks.items;
    const shuffled = allTracks.sort(() => Math.random() - 0.5);
    const trackList = shuffled.slice(0, 30);
    console.log('Found and shuffled tracks:', trackList.length);

    // Create playlist
    const playlistData = JSON.stringify({
      name: `MoodPlaylist - ${mood} ${new Date().toLocaleDateString()}`,
      description: `A ${mood.toLowerCase()} playlist generated by MoodPlaylist based on your music taste`,
      public: true
    });

    console.log('Creating playlist for user:', finalUserId);
    const playlist = await makeSpotifyRequest(
      `/v1/users/${finalUserId}/playlists`,
      accessToken,
      { method: 'POST', data: playlistData }
    );
    console.log('Playlist created:', playlist.id);

    // Add tracks to playlist
    const trackUris = trackList.map(track => track.uri);
    const addTracksData = JSON.stringify({ uris: trackUris });

    console.log('Adding tracks to playlist...');
    await makeSpotifyRequest(
      `/v1/playlists/${playlist.id}/tracks`,
      accessToken,
      { method: 'POST', data: addTracksData }
    );
    console.log('Tracks added successfully!');

    res.json({
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.name,
        url: playlist.external_urls.spotify,
        trackCount: trackUris.length,
        mood: mood
      }
    });

  } catch (error) {
    console.error('Playlist creation error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Failed to create playlist',
      message: error.message 
    });
  }
}

export default handler;