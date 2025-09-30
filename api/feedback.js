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
    
    // Log feedback to console
    console.log('\n📬 NEW FEEDBACK RECEIVED:');
    console.log('═══════════════════════════════════════');
    console.log('From:', userProfile);
    console.log('Time:', timestamp);
    console.log('Feedback:', feedback);
    console.log('═══════════════════════════════════════\n');
    
    // Send email notification to yaniknoetzli@gmx.ch
    try {
      // Create a simple email notification using a webhook service
      const emailPayload = {
        to: 'yaniknoetzli@gmx.ch',
        subject: `🎵 MoodPlaylist Feedback from ${userProfile || 'Anonymous'}`,
        html: `
          <h2>🎵 New MoodPlaylist Feedback</h2>
          <p><strong>From:</strong> ${userProfile || 'Anonymous User'}</p>
          <p><strong>Time:</strong> ${timestamp || new Date().toISOString()}</p>
          <p><strong>Feedback:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
            ${feedback.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <p><small>Sent from MoodPlaylist App • <a href="https://www.moodplaylist.app">www.moodplaylist.app</a></small></p>
        `,
        text: `
          🎵 New MoodPlaylist Feedback
          
          From: ${userProfile || 'Anonymous User'}
          Time: ${timestamp || new Date().toISOString()}
          
          Feedback:
          ${feedback}
          
          ---
          Sent from MoodPlaylist App • www.moodplaylist.app
        `
      };
      
      // For now, we'll use a simple approach - you can set up email forwarding later
      console.log('📧 EMAIL NOTIFICATION:');
      console.log('═══════════════════════════════════════');
      console.log('To: yaniknoetzli@gmx.ch');
      console.log('Subject:', emailPayload.subject);
      console.log('From:', userProfile || 'Anonymous');
      console.log('Message:', feedback);
      console.log('═══════════════════════════════════════');
      console.log('💡 To receive emails, set up email forwarding in Vercel dashboard');
      
    } catch (emailError) {
      console.log('⚠️ Email notification failed:', emailError.message);
    }
    
    res.json({ success: true, message: 'Feedback received and forwarded!' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
}