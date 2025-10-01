const https = require('https');

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set!');
  console.error('Please set OPENAI_API_KEY in your Vercel dashboard');
}

// Fallback analysis when OpenAI is not available
function getFallbackAnalysis(situation) {
  const situationLower = situation.toLowerCase();
  
  // Basic mood detection
  let primaryMood = 'Calm';
  let energyLevel = 5;
  let valence = 5;
  let danceability = 5;
  let acousticness = 5;
  let recommendedGenres = ['pop', 'indie'];
  let artistStyle = 'mainstream';
  let playlistTheme = 'Personalized Playlist';
  let reasoning = 'Basic mood analysis based on your description.';
  
  // Detect mood based on keywords
  if (situationLower.includes('sad') || situationLower.includes('depressed') || situationLower.includes('down')) {
    primaryMood = 'Sad';
    energyLevel = 3;
    valence = 2;
    danceability = 3;
    acousticness = 7;
    recommendedGenres = ['indie', 'alternative', 'folk'];
    artistStyle = 'indie';
    playlistTheme = 'Healing & Comfort';
    reasoning = 'Detected sadness in your situation. This playlist will provide comfort and emotional support.';
  } else if (situationLower.includes('angry') || situationLower.includes('mad') || situationLower.includes('frustrated')) {
    primaryMood = 'Angry';
    energyLevel = 8;
    valence = 3;
    danceability = 6;
    acousticness = 3;
    recommendedGenres = ['rock', 'metal', 'alternative'];
    artistStyle = 'alternative';
    playlistTheme = 'Release & Power';
    reasoning = 'Detected anger or frustration. This playlist will help channel that energy positively.';
  } else if (situationLower.includes('happy') || situationLower.includes('joy') || situationLower.includes('excited')) {
    primaryMood = 'Happy';
    energyLevel = 8;
    valence = 9;
    danceability = 9;
    acousticness = 4;
    recommendedGenres = ['pop', 'dance', 'electronic'];
    artistStyle = 'mainstream';
    playlistTheme = 'Joy & Celebration';
    reasoning = 'Detected happiness and excitement. This playlist will amplify your positive energy.';
  } else if (situationLower.includes('workout') || situationLower.includes('gym') || situationLower.includes('exercise')) {
    primaryMood = 'Energetic';
    energyLevel = 9;
    valence = 8;
    danceability = 8;
    acousticness = 2;
    recommendedGenres = ['electronic', 'hip-hop', 'pop'];
    artistStyle = 'mainstream';
    playlistTheme = 'Power & Energy';
    reasoning = 'Detected workout or exercise context. This playlist will fuel your energy and motivation.';
  } else if (situationLower.includes('love') || situationLower.includes('romantic') || situationLower.includes('date')) {
    primaryMood = 'Romantic';
    energyLevel = 6;
    valence = 8;
    danceability = 6;
    acousticness = 6;
    recommendedGenres = ['pop', 'r&b', 'indie'];
    artistStyle = 'mainstream';
    playlistTheme = 'Love & Romance';
    reasoning = 'Detected romantic context. This playlist will set the perfect mood for love.';
  }
  
  return {
    primaryMood,
    secondaryMoods: [],
    energyLevel,
    valence,
    danceability,
    acousticness,
    recommendedGenres,
    artistStyle,
    playlistTheme,
    reasoning
  };
}

// Function to call OpenAI API for intelligent mood analysis
async function analyzeSituationWithAI(situation, userProfile = null) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API key not configured, using fallback analysis');
      resolve(getFallbackAnalysis(situation));
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
            
            // Handle quota exceeded or other errors with fallback
            if (response.error?.code === 'insufficient_quota' || response.error?.code === 'model_not_found') {
              console.log('⚠️ OpenAI API unavailable, using fallback analysis');
              resolve(getFallbackAnalysis(situation));
            } else {
              reject(new Error(response.error?.message || 'OpenAI API error'));
            }
          }
        } catch (error) {
          console.error('❌ JSON parse error:', error);
          console.error('❌ Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ OpenAI request error:', error);
      console.log('⚠️ Using fallback analysis due to request error');
      resolve(getFallbackAnalysis(situation));
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
