const https = require('https');

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
}

module.exports = handler;