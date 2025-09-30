const express = require('express');
const cors = require('cors');
const https = require('https');
const CONFIG = require('../config');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://moodplaylist.app', 'https://www.moodplaylist.app', 'http://127.0.0.1:3002', 'http://localhost:3002'],
  credentials: true
}));

// Detect if running on Vercel or localhost
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const baseURL = isProduction ? 'https://moodplaylist.app' : 'http://127.0.0.1:3002';

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = CONFIG.SPOTIFY.CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || CONFIG.SPOTIFY.CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = `${baseURL}/api/callback`;

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
app.get('/', async (req, res) => {
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

module.exports = app;
