export default async function handler(req, res) {
  console.log('🔍 Environment Test');
  console.log('SPOTIFY_CLIENT_SECRET exists:', !!process.env.SPOTIFY_CLIENT_SECRET);
  console.log('SPOTIFY_CLIENT_SECRET length:', process.env.SPOTIFY_CLIENT_SECRET ? process.env.SPOTIFY_CLIENT_SECRET.length : 'undefined');
  
  res.json({
    hasSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
    secretLength: process.env.SPOTIFY_CLIENT_SECRET ? process.env.SPOTIFY_CLIENT_SECRET.length : 0,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SPOTIFY')),
    timestamp: new Date().toISOString()
  });
}
