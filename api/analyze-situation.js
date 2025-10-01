const https = require('https');

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set!');
  console.error('Please set OPENAI_API_KEY in your Vercel dashboard');
}

// Function to call OpenAI API for intelligent mood analysis
async function analyzeSituationWithAI(situation, userProfile = null) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) {
      reject(new Error('OpenAI API key not configured'));
      return;
    }

    const prompt = `You are an expert music psychologist and playlist curator. Analyze this user's situation and provide intelligent recommendations.

User's situation: "${situation}"

${userProfile ? `User's music profile:
- Top genres: ${userProfile.topGenres?.join(', ') || 'Not specified'}
- Top artists: ${userProfile.topArtists?.join(', ') || 'Not specified'}
- Listening habits: ${userProfile.listeningHabits || 'Not specified'}` : ''}

Please analyze this situation and provide:

1. **Primary Mood**: The dominant emotional state (Happy, Sad, Angry, Calm, Energetic, Romantic, Nostalgic, etc.)
2. **Secondary Moods**: Additional emotional layers (e.g., "Sad but hopeful", "Angry but determined")
3. **Music Characteristics**: 
   - Energy level (1-10)
   - Valence (positive/negative emotional tone, 1-10)
   - Danceability (1-10)
   - Acousticness preference (1-10)
4. **Genre Recommendations**: 3-5 specific genres that would be perfect
5. **Artist Style**: What type of artists (mainstream, indie, classic, etc.)
6. **Playlist Theme**: A creative theme name for the playlist
7. **Reasoning**: Brief explanation of why these recommendations fit the situation

Respond in JSON format:
{
  "primaryMood": "string",
  "secondaryMoods": ["string", "string"],
  "energyLevel": number,
  "valence": number,
  "danceability": number,
  "acousticness": number,
  "recommendedGenres": ["string", "string", "string"],
  "artistStyle": "string",
  "playlistTheme": "string",
  "reasoning": "string"
}`;

    const requestData = JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert music psychologist and playlist curator with deep understanding of how music affects emotions and mood. Provide intelligent, personalized recommendations based on the user's situation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData),
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          console.log('📡 OpenAI API Response Status:', res.statusCode);
          console.log('📡 OpenAI API Response Data:', data);
          
          const response = JSON.parse(data);
          if (response.choices && response.choices[0]) {
            const content = response.choices[0].message.content;
            console.log('✅ OpenAI analysis successful');
            
            // Parse the JSON response from OpenAI
            const analysis = JSON.parse(content);
            resolve(analysis);
          } else {
            console.error('❌ OpenAI API error:', response);
            reject(new Error(response.error?.message || 'OpenAI API error'));
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

    req.write(requestData);
    req.end();
  });
}

// Vercel serverless function handler
module.exports = async function handler(req, res) {
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
    const { situation, userProfile } = JSON.parse(req.body || '{}');
    
    if (!situation || !situation.trim()) {
      return res.status(400).json({ error: 'Situation description is required' });
    }

    console.log('🤖 Analyzing situation with OpenAI:', situation);
    
    const analysis = await analyzeSituationWithAI(situation, userProfile);
    
    console.log('✅ OpenAI analysis completed:', analysis.primaryMood);
    
    res.json({
      success: true,
      analysis: analysis
    });
    
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to analyze situation',
      details: 'Please check server logs for more information'
    });
  }
};
