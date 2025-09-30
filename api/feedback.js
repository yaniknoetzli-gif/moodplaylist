const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://moodplaylist.app', 'https://www.moodplaylist.app', 'http://127.0.0.1:3002', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Feedback endpoint
app.post('/', async (req, res) => {
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
});

module.exports = app;
