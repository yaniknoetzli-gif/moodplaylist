const https = require('https');

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = 'cfa3454278f647acbdb0a0d417b5530c';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!SPOTIFY_CLIENT_SECRET) {
  console.error('❌ SPOTIFY_CLIENT_SECRET environment variable is not set!');
  console.error('Please set SPOTIFY_CLIENT_SECRET in your Vercel dashboard');
}

// Function to exchange authorization code for access token
async function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    console.log('🔄 Attempting token exchange...');
    console.log('Client ID:', SPOTIFY_CLIENT_ID);
    console.log('Client Secret length:', SPOTIFY_CLIENT_SECRET ? SPOTIFY_CLIENT_SECRET.length : 'undefined');
    console.log('Has secret:', !!SPOTIFY_CLIENT_SECRET);
    
    if (!SPOTIFY_CLIENT_SECRET) {
      reject(new Error('SPOTIFY_CLIENT_SECRET environment variable is not set'));
      return;
    }
    
    const postData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://www.moodplaylist.app/api/callback'
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
          console.log('📡 Spotify API Response Status:', res.statusCode);
          console.log('📡 Spotify API Response Data:', data);
          
          const tokenData = JSON.parse(data);
          if (tokenData.access_token) {
            console.log('✅ Token exchange successful');
            resolve(tokenData);
          } else {
            console.error('❌ Token exchange failed:', tokenData);
            if (tokenData.error === 'invalid_grant') {
              reject(new Error('Authorization code expired or already used. Please try connecting again.'));
            } else {
              reject(new Error(tokenData.error_description || tokenData.error || 'Failed to get access token'));
            }
          }
        } catch (error) {
          console.error('❌ JSON parse error:', error);
          console.error('❌ Raw response:', data);
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

  // Handle both GET (redirect from Spotify) and POST (from frontend)
  let code, error;
  
  if (req.method === 'GET') {
    // Handle redirect from Spotify
    code = req.query.code;
    error = req.query.error;
  } else if (req.method === 'POST') {
    // Handle POST request from frontend
    const body = JSON.parse(req.body || '{}');
    code = body.code;
    error = body.error;
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (error) {
    if (req.method === 'POST') {
      return res.status(400).json({ error: error });
    }
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
      if (!SPOTIFY_CLIENT_SECRET) {
        throw new Error('Spotify Client Secret not configured. Please set SPOTIFY_CLIENT_SECRET in Vercel environment variables.');
      }
      
      // Exchange code for access token
      const tokenData = await exchangeCodeForToken(code);
      
      if (req.method === 'POST') {
        // Return JSON for POST requests (from frontend)
        return res.json(tokenData);
      }
      
      // Send HTML for GET requests (redirect from Spotify)
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
      if (req.method === 'POST') {
        return res.status(500).json({ error: error.message });
      }
      res.send(`
        <html>
          <head><title>Spotify Auth Error</title></head>
          <body>
            <h2>❌ Authentication Failed</h2>
            <p>Error: ${error.message}</p>
            <p>Please check the server logs for more details.</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 5000);
            </script>
          </body>
        </html>
      `);
    }
  } else {
    if (req.method === 'POST') {
      return res.status(400).json({ error: 'No authorization code received' });
    }
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
}

module.exports = handler;