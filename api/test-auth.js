const https = require('https');

module.exports = async function handler(req, res) {
  console.log('🔍 Testing Spotify authentication flow');
  
  const SPOTIFY_CLIENT_ID = 'cfa3454278f647acbdb0a0d417b5530c';
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!SPOTIFY_CLIENT_SECRET) {
    return res.json({ error: 'No client secret' });
  }
  
  // Test with a fresh authorization code
  const testCode = 'test_code_' + Date.now();
  
  const postData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: testCode,
    redirect_uri: 'https://www.moodplaylist.app/api/callback'
  }).toString();
  
  const authHeader = 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
  
  console.log('🔍 Testing with:');
  console.log('- Client ID:', SPOTIFY_CLIENT_ID);
  console.log('- Secret length:', SPOTIFY_CLIENT_SECRET.length);
  console.log('- Test code:', testCode);
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
  
  const request = https.request(options, (response) => {
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
        clientId: SPOTIFY_CLIENT_ID,
        secretLength: SPOTIFY_CLIENT_SECRET.length,
        redirectUri: 'https://www.moodplaylist.app/api/callback',
        testCode: testCode
      });
    });
  });
  
  request.on('error', (error) => {
    console.error('❌ Request error:', error);
    res.json({ error: error.message });
  });
  
  request.write(postData);
  request.end();
};
