const https = require('https');

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = 'cfa3454278f647acbdb0a0d417b5530c';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!SPOTIFY_CLIENT_SECRET) {
  console.error('❌ SPOTIFY_CLIENT_SECRET environment variable is not set!');
}

// Function to get Spotify access token
async function getSpotifyAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'client_credentials'
    }).toString();

    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const tokenData = JSON.parse(data);
          if (tokenData.access_token) {
            resolve(tokenData.access_token);
          } else {
            reject(new Error('Failed to get Spotify access token'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Function to search for tracks using intelligent parameters
async function searchIntelligentTracks(accessToken, analysis, userProfile, advancedSettings) {
  return new Promise((resolve, reject) => {
    const { 
      primaryMood, 
      energyLevel, 
      valence, 
      danceability, 
      acousticness, 
      recommendedGenres,
      artistStyle 
    } = analysis;

    // Build intelligent search query
    let query = '';
    
    // Add genre recommendations
    if (recommendedGenres && recommendedGenres.length > 0) {
      query += `genre:${recommendedGenres.slice(0, 2).join(' OR genre:')}`;
    }
    
    // Add artist style preferences
    if (artistStyle) {
      if (artistStyle.toLowerCase().includes('mainstream')) {
        query += ' year:2020-2024';
      } else if (artistStyle.toLowerCase().includes('classic')) {
        query += ' year:1970-2000';
      } else if (artistStyle.toLowerCase().includes('indie')) {
        query += ' tag:indie';
      }
    }

    // Add user's top artists if available
    if (userProfile && userProfile.topArtists && userProfile.topArtists.length > 0) {
      query += ` artist:${userProfile.topArtists.slice(0, 2).join(' OR artist:')}`;
    }

    // Build audio features parameters
    const audioFeatures = {
      target_energy: energyLevel / 10,
      target_valence: valence / 10,
      target_danceability: danceability / 10,
      target_acousticness: acousticness / 10,
      limit: Math.min(advancedSettings.playlistSize || 20, 50) // Spotify API limit
    };

    // Add popularity filter if specified
    if (advancedSettings.artistPopularity && advancedSettings.artistPopularity !== 'any') {
      if (advancedSettings.artistPopularity === 'high') {
        audioFeatures.min_popularity = 70;
      } else if (advancedSettings.artistPopularity === 'medium') {
        audioFeatures.min_popularity = 30;
        audioFeatures.max_popularity = 70;
      } else if (advancedSettings.artistPopularity === 'low') {
        audioFeatures.max_popularity = 30;
      }
    }

    // Build the search URL
    const searchParams = new URLSearchParams({
      q: query || 'mood music',
      type: 'track',
      limit: audioFeatures.limit,
      ...audioFeatures
    });

    const searchUrl = `https://api.spotify.com/v1/search?${searchParams.toString()}`;

    console.log('🔍 Intelligent search query:', query);
    console.log('🔍 Audio features:', audioFeatures);

    const options = {
      hostname: 'api.spotify.com',
      path: `/v1/search?${searchParams.toString()}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const searchResults = JSON.parse(data);
          if (searchResults.tracks && searchResults.tracks.items) {
            console.log(`✅ Found ${searchResults.tracks.items.length} intelligent tracks`);
            resolve(searchResults.tracks.items);
          } else {
            console.error('❌ No tracks found in search results');
            reject(new Error('No tracks found'));
          }
        } catch (error) {
          console.error('❌ Search results parse error:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Function to create playlist with intelligent tracks
async function createIntelligentPlaylist(userAccessToken, userId, analysis, tracks, advancedSettings) {
  return new Promise((resolve, reject) => {
    const playlistName = analysis.playlistTheme || `AI-Generated ${analysis.primaryMood} Playlist`;
    const playlistDescription = `Intelligently curated playlist for your mood: ${analysis.primaryMood}. ${analysis.reasoning}`;

    // Create playlist
    const playlistData = JSON.stringify({
      name: playlistName,
      description: playlistDescription,
      public: true
    });

    const createOptions = {
      hostname: 'api.spotify.com',
      path: `/v1/users/${userId}/playlists`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(playlistData),
        'Authorization': `Bearer ${userAccessToken}`
      }
    };

    const createReq = https.request(createOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const playlist = JSON.parse(data);
          if (playlist.id) {
            // Add tracks to playlist
            const trackUris = tracks.map(track => track.uri);
            const addTracksData = JSON.stringify({
              uris: trackUris
            });

            const addOptions = {
              hostname: 'api.spotify.com',
              path: `/v1/playlists/${playlist.id}/tracks`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(addTracksData),
                'Authorization': `Bearer ${userAccessToken}`
              }
            };

            const addReq = https.request(addOptions, (addRes) => {
              let addData = '';
              addRes.on('data', (chunk) => {
                addData += chunk;
              });
              addRes.on('end', () => {
                try {
                  const addResult = JSON.parse(addData);
                  console.log('✅ Intelligent playlist created successfully');
                  resolve({
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description,
                    url: playlist.external_urls.spotify,
                    trackCount: tracks.length,
                    analysis: analysis
                  });
                } catch (error) {
                  console.error('❌ Add tracks parse error:', error);
                  reject(error);
                }
              });
            });

            addReq.on('error', (error) => {
              reject(error);
            });

            addReq.write(addTracksData);
            addReq.end();
          } else {
            reject(new Error('Failed to create playlist'));
          }
        } catch (error) {
          console.error('❌ Create playlist parse error:', error);
          reject(error);
        }
      });
    });

    createReq.on('error', (error) => {
      reject(error);
    });

    createReq.write(playlistData);
    createReq.end();
  });
}

// Vercel serverless function handler
module.exports = async function handler(req, res) {
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
    const { 
      userAccessToken, 
      userId, 
      analysis, 
      userProfile, 
      advancedSettings 
    } = JSON.parse(req.body || '{}');
    
    if (!userAccessToken || !userId || !analysis) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('🤖 Creating intelligent playlist with analysis:', analysis.primaryMood);
    
    // Get Spotify access token for search
    const spotifyToken = await getSpotifyAccessToken();
    
    // Search for intelligent tracks
    const tracks = await searchIntelligentTracks(spotifyToken, analysis, userProfile, advancedSettings);
    
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'No tracks found for the given criteria' });
    }
    
    // Create intelligent playlist
    const playlist = await createIntelligentPlaylist(userAccessToken, userId, analysis, tracks, advancedSettings);
    
    console.log('✅ Intelligent playlist created:', playlist.name);
    
    res.json({
      success: true,
      playlist: playlist
    });
    
  } catch (error) {
    console.error('Intelligent playlist creation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create intelligent playlist',
      details: 'Please check server logs for more information'
    });
  }
};
