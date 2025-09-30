# 🎵 MoodPlaylist - Fully Functional AI-Powered Music Discovery

A complete React Native app that creates real Spotify playlists based on your mood using AI analysis of your music taste.

## ✨ Features

- **Real Spotify Integration** - Creates actual playlists in your Spotify account
- **Mood-Based Music Discovery** - 6 different moods with intelligent song matching
- **AI-Powered Recommendations** - Uses Spotify's recommendation engine with your music history
- **Cross-Platform** - Works on web, iOS, and Android
- **Beautiful UI** - Modern, responsive design with smooth animations

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open the App
Visit: **http://localhost:3000**

## 🎯 How It Works

### 1. **Spotify Authentication**
- Click "Connect to Spotify" to authorize the app
- Grants access to your music data and playlist creation
- Uses secure OAuth 2.0 flow

### 2. **Mood Selection**
Choose from 6 moods:
- 😊 **Happy** - Upbeat, energetic, danceable music
- 😢 **Sad** - Emotional, acoustic, introspective tracks
- 😌 **Calm** - Relaxing, ambient, peaceful sounds
- ⚡ **Energetic** - High-energy, fast-paced, motivating songs
- 😍 **Romantic** - Emotional, intimate, love songs
- 😠 **Angry** - Aggressive, powerful, intense music

### 3. **AI Playlist Generation**
The app analyzes:
- **Your top tracks** from the last 6 months
- **Your favorite artists** and genres
- **Audio features** that match your selected mood
- **Spotify's recommendation engine** for personalized suggestions

### 4. **Real Playlist Creation**
- Creates a new playlist in your Spotify account
- Adds 25-30 carefully selected tracks
- Names it "MoodPlaylist - [Mood] [Date]"
- Provides direct link to open in Spotify

## 🔧 Technical Implementation

### Spotify Web API Integration
```javascript
// Get user's music data
const topTracks = await fetch('https://api.spotify.com/v1/me/top/tracks');
const topArtists = await fetch('https://api.spotify.com/v1/me/top/artists');

// Get AI recommendations
const recommendations = await fetch(`https://api.spotify.com/v1/recommendations?` +
  `seed_tracks=${userTracks}&` +
  `target_valence=${moodFeatures.valence}&` +
  `target_energy=${moodFeatures.energy}&` +
  `limit=30`);

// Create playlist
const playlist = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
  method: 'POST',
  body: JSON.stringify({ name: playlistName, public: true })
});
```

### Mood-to-Music Mapping
```javascript
const moodFeatures = {
  'Happy': { valence: 0.8, energy: 0.7, danceability: 0.8 },
  'Sad': { valence: 0.2, energy: 0.3, danceability: 0.4 },
  'Calm': { valence: 0.6, energy: 0.3, danceability: 0.5 },
  'Energetic': { valence: 0.8, energy: 0.9, danceability: 0.9 },
  'Romantic': { valence: 0.7, energy: 0.5, danceability: 0.6 },
  'Angry': { valence: 0.3, energy: 0.9, danceability: 0.7 }
};
```

## 🎵 What Makes It Special

### **Real AI Analysis**
- Analyzes your actual music listening history
- Uses Spotify's advanced recommendation algorithms
- Considers audio features like valence, energy, danceability
- Matches your personal taste with mood requirements

### **Intelligent Song Selection**
- Seeds recommendations with your top tracks
- Balances familiar favorites with new discoveries
- Ensures variety while maintaining mood consistency
- Considers genre preferences and artist diversity

### **Seamless User Experience**
- One-click Spotify authentication
- Instant mood selection with visual feedback
- Real-time playlist generation progress
- Direct link to open playlist in Spotify

## 🔐 Security & Privacy

- **Secure OAuth 2.0** - Industry-standard authentication
- **No data storage** - Your credentials are never stored
- **Spotify permissions** - Only requests necessary access
- **HTTPS encryption** - All API calls are encrypted

## 📱 Cross-Platform Support

- **Web** - Full functionality in any modern browser
- **Mobile** - Responsive design works on phones
- **Desktop** - Optimized for larger screens
- **PWA Ready** - Can be installed as a web app

## 🎯 Future Enhancements

- **Facial Recognition** - Detect mood from camera
- **Voice Analysis** - Analyze speech patterns
- **Wearable Integration** - Heart rate and activity data
- **Social Features** - Share playlists with friends
- **Advanced AI** - Machine learning for better recommendations

## 🛠️ Development

### Project Structure
```
MoodPlaylistSimple/
├── App.js              # Main React component
├── server.js           # Express backend server
├── index.html          # HTML template
├── package.json        # Dependencies
└── README.md           # This file
```

### Key Components
- **MoodSelector** - Interactive mood selection
- **SpotifyAuth** - OAuth authentication flow
- **PlaylistGenerator** - AI-powered playlist creation
- **MessageDisplay** - User feedback and status

## 🎵 Try It Now!

1. **Start the server**: `npm start`
2. **Open**: http://localhost:3000
3. **Connect Spotify** - Authorize the app
4. **Select a mood** - Choose how you're feeling
5. **Generate playlist** - Watch the AI work its magic!
6. **Open in Spotify** - Enjoy your personalized playlist!

---

**Built with ❤️ using React, Express, and Spotify Web API**

*Create the perfect soundtrack for every moment of your life!* 🎵✨






