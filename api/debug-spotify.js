const https = require('https');

module.exports = async function handler(req, res) {
  console.log('🔍 DEBUG: Testing Spotify API directly');
  
  const SPOTIFY_CLIENT_ID = '1517cc34e8c34f298cb332bb9005f245';
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!SPOTIFY_CLIENT_SECRET) {
    return res.json({ error: 'No client secret' });
  }
  
  // Test the exact same request that would be made to Spotify
  const postData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'test_code_123',
    redirect_uri: 'https://www.moodplaylist.app/api/callback'
  }).toString();
  
  const authHeader = 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
  
  console.log('🔍 Testing with:');
  console.log('- Client ID:', SPOTIFY_CLIENT_ID);
  console.log('- Secret length:', SPOTIFY_CLIENT_SECRET.length);
  console.log('- Auth header length:', authHeader.length);
  console.log('- Redirect URI:', 'https://www.moodplaylist.app/api/callback');
  
  const options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': authHeader
    }
  };
  
  const req = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      console.log('📡 Spotify Response Status:', response.statusCode);
      console.log('📡 Spotify Response Data:', data);
      
      res.json({
        statusCode: response.statusCode,
        response: data,
        headers: response.headers,
        clientId: SPOTIFY_CLIENT_ID,
        secretLength: SPOTIFY_CLIENT_SECRET.length,
        redirectUri: 'https://www.moodplaylist.app/api/callback'
      });
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error);
    res.json({ error: error.message });
  });
  
  req.write(postData);
  req.end();
};
