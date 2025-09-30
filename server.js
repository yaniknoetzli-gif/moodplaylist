const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const CONFIG = require('./config');

const app = express();
const PORT = process.env.PORT || 3002;

// Detect if running on Vercel or localhost
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const baseURL = isProduction ? 'https://moodplaylist.app' : 'http://127.0.0.1:3002';

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = CONFIG.SPOTIFY.CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || CONFIG.SPOTIFY.CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = `${baseURL}/callback`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Function to exchange authorization code for access token
async function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI
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
            resolve(tokenData);
          } else {
            reject(new Error(tokenData.error_description || 'Failed to get access token'));
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

// Spotify OAuth callback handler
app.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`
      <html>
        <head><title>Spotify Auth Error</title></head>
        <body>
          <h2>❌ Authentication Error</h2>
          <p>Error: ${error}</p>
          <p>Please try again.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
  
  if (code) {
    try {
      // Exchange code for access token
      const tokenData = await exchangeCodeForToken(code);
      
      // Send the token data back to the main app
      res.send(`
        <html>
          <head><title>Spotify Auth Success</title></head>
          <body>
            <h2>✅ Authentication Successful!</h2>
            <p>You can close this window and return to the app.</p>
            <script>
              // Send the token data to the parent window
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'SPOTIFY_AUTH_SUCCESS', 
                  tokenData: ${JSON.stringify(tokenData)}
                }, '*');
              }
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Token exchange error:', error);
      res.send(`
        <html>
          <head><title>Spotify Auth Error</title></head>
          <body>
            <h2>❌ Authentication Failed</h2>
            <p>Error: ${error.message}</p>
            <p>Please try again.</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 3000);
            </script>
          </body>
        </html>
      `);
    }
  } else {
    res.send(`
      <html>
        <head><title>Spotify Auth</title></head>
        <body>
          <h2>No authorization code received</h2>
          <p>Please try again.</p>
        </body>
      </html>
    `);
  }
});

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

// API endpoint to create playlist
app.post('/api/create-playlist', async (req, res) => {
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
    const moodConfig = CONFIG.MOOD_MAPPING[mood] || CONFIG.MOOD_MAPPING['Happy'];
    
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
});

// API endpoint to get user profile
app.post('/api/user-profile', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const profile = await makeSpotifyRequest('/v1/me', accessToken);
    res.json({ success: true, profile });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: error.message 
    });
  }
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎵 MoodPlaylist Server running on http://localhost:${PORT}`);
  console.log('📱 Open this URL in your browser to use the app!');
  console.log('🚀 App loads instantly - no more waiting!');
  console.log('🔧 Real Spotify integration ready!');
});
