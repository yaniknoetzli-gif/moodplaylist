// Test environment variables
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const hasSecret = !!process.env.SPOTIFY_CLIENT_SECRET;
  const secretLength = process.env.SPOTIFY_CLIENT_SECRET ? process.env.SPOTIFY_CLIENT_SECRET.length : 0;
  
  res.json({
    hasSecret,
    secretLength,
    message: hasSecret ? 'Client Secret is configured' : 'Client Secret is missing',
    timestamp: new Date().toISOString()
  });
}
