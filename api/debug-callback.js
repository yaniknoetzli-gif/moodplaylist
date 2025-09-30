export default async function handler(req, res) {
  console.log('🔍 DEBUG: Callback function called');
  console.log('🔍 DEBUG: Method:', req.method);
  console.log('🔍 DEBUG: Query:', req.query);
  console.log('🔍 DEBUG: Headers:', req.headers);
  
  // Check environment variables
  console.log('🔍 DEBUG: SPOTIFY_CLIENT_SECRET exists:', !!process.env.SPOTIFY_CLIENT_SECRET);
  console.log('🔍 DEBUG: SPOTIFY_CLIENT_SECRET length:', process.env.SPOTIFY_CLIENT_SECRET ? process.env.SPOTIFY_CLIENT_SECRET.length : 'undefined');
  console.log('🔍 DEBUG: SPOTIFY_CLIENT_SECRET first 5 chars:', process.env.SPOTIFY_CLIENT_SECRET ? process.env.SPOTIFY_CLIENT_SECRET.substring(0, 5) : 'undefined');
  
  // Check all environment variables
  console.log('🔍 DEBUG: All env vars starting with SPOTIFY:', Object.keys(process.env).filter(key => key.startsWith('SPOTIFY')));
  
  const SPOTIFY_CLIENT_ID = '1517cc34e8c34f298cb332bb9005f245';
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!SPOTIFY_CLIENT_SECRET) {
    console.error('❌ SPOTIFY_CLIENT_SECRET is not set!');
    return res.status(500).json({
      error: 'SPOTIFY_CLIENT_SECRET not configured',
      hasSecret: false,
      envVars: Object.keys(process.env).filter(key => key.startsWith('SPOTIFY'))
    });
  }
  
  // Test the exact same request that would be made to Spotify
  const testData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: 'test_code',
    redirect_uri: 'https://www.moodplaylist.app/api/callback'
  }).toString();
  
  const authHeader = 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
  
  console.log('🔍 DEBUG: Auth header length:', authHeader.length);
  console.log('🔍 DEBUG: Auth header first 20 chars:', authHeader.substring(0, 20));
  console.log('🔍 DEBUG: Post data:', testData);
  
  return res.status(200).json({
    success: true,
    hasSecret: true,
    secretLength: SPOTIFY_CLIENT_SECRET.length,
    authHeaderLength: authHeader.length,
    clientId: SPOTIFY_CLIENT_ID,
    redirectUri: 'https://www.moodplaylist.app/api/callback'
  });
}
