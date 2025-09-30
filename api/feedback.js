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
    const { feedback, userProfile, timestamp } = req.body;
    
    // Log feedback to console (you can later add email/database)
    console.log('\n📬 NEW FEEDBACK RECEIVED:');
    console.log('═══════════════════════════════════════');
    console.log('From:', userProfile);
    console.log('Time:', timestamp);
    console.log('Feedback:', feedback);
    console.log('═══════════════════════════════════════\n');
    
    // TODO: Send email to yaniknoezli@gmx.ch
    // For now, you'll see it in the server logs
    // You can add email sending later with nodemailer
    
    res.json({ success: true, message: 'Feedback received!' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
}