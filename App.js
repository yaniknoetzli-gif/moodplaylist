// MoodPlaylist - Vanilla JavaScript Version for Fast Loading
class MoodPlaylistApp {
  constructor() {
    this.selectedMood = null;
    this.isSpotifyConnected = false;
    this.accessToken = null;
    this.userProfile = null;
    this.createdPlaylist = null;
    this.showMessage = null;
    this.isLoading = false;
    this.showTextPrompt = false;
    this.userSituation = '';
    this.showFeedbackForm = false;
    
    this.moods = [
    { name: 'Happy', emoji: '😊', color: '#FFD700' },
    { name: 'Sad', emoji: '😢', color: '#4169E1' },
    { name: 'Calm', emoji: '😌', color: '#87CEEB' },
    { name: 'Energetic', emoji: '⚡', color: '#FF6347' },
    { name: 'Romantic', emoji: '😍', color: '#FF69B4' },
      { name: 'Angry', emoji: '😠', color: '#FF4500' }
    ];
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEventListeners();
    this.attachDirectListeners();
    this.checkForAuthCode();
  }
  
  attachDirectListeners() {
    // More aggressive approach to ensure buttons work
    const attachListeners = () => {
      console.log('Attaching direct listeners...');
      
      // Connect button
      const connectBtn = document.getElementById('connectSpotify');
      if (connectBtn) {
        connectBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Connect button clicked!');
          this.connectSpotify();
        };
        console.log('✅ Connect button listener attached');
      }
      
      // Generate button
      const generateBtn = document.getElementById('generatePlaylist');
      if (generateBtn) {
        generateBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Generate button clicked!');
          this.generatePlaylist();
        };
        console.log('✅ Generate button listener attached');
      }
      
      // Open playlist button
      const openBtn = document.getElementById('openPlaylist');
      if (openBtn) {
        openBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.createdPlaylist && this.createdPlaylist.url) {
            window.open(this.createdPlaylist.url, '_blank');
          }
        };
        console.log('✅ Open button listener attached');
      }
      
      // Mode toggle buttons - preserve Spotify connection when switching!
      const moodModeBtn = document.getElementById('moodModeBtn');
      const textModeBtn = document.getElementById('textModeBtn');
      if (moodModeBtn) {
        moodModeBtn.onclick = (e) => {
          e.preventDefault();
          this.showTextPrompt = false;
          this.render();
          this.attachDirectListeners();
        };
      }
      if (textModeBtn) {
        textModeBtn.onclick = (e) => {
          e.preventDefault();
          this.showTextPrompt = true;
          this.render();
          this.attachDirectListeners();
        };
      }
      
      // Situation input - DON'T re-render on every keystroke!
      const situationInput = document.getElementById('situationInput');
      if (situationInput) {
        situationInput.oninput = (e) => {
          this.userSituation = e.target.value;
          // Don't call render() here - it causes focus loss!
        };
      }
      
      // Analyze situation button
      const analyzeBtn = document.getElementById('analyzeSituation');
      if (analyzeBtn) {
        analyzeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.analyzeSituation();
        };
      }
      
      // Mood buttons
      const moodButtons = document.querySelectorAll('.mood-button');
      moodButtons.forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const moodName = btn.dataset.mood;
          console.log('Mood button clicked:', moodName);
          this.selectMood(moodName);
        };
      });
      console.log('✅ Mood button listeners attached:', moodButtons.length);
      
      // Feedback button
      const feedbackBtn = document.getElementById('feedbackBtn');
      if (feedbackBtn) {
        feedbackBtn.onclick = (e) => {
          e.preventDefault();
          this.showFeedbackForm = true;
          this.render();
          this.attachDirectListeners();
        };
      }
      
      // Send feedback button
      const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
      if (sendFeedbackBtn) {
        sendFeedbackBtn.onclick = (e) => {
          e.preventDefault();
          this.sendFeedback();
        };
      }
      
      // Cancel feedback button
      const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
      if (cancelFeedbackBtn) {
        cancelFeedbackBtn.onclick = (e) => {
          e.preventDefault();
          this.showFeedbackForm = false;
          this.render();
          this.attachDirectListeners();
        };
      }
    };
    
    // Try multiple times to ensure attachment
    setTimeout(attachListeners, 100);
    setTimeout(attachListeners, 500);
    setTimeout(attachListeners, 1000);
  }
  
  render() {
    document.getElementById('root').innerHTML = `
      <div class="container">
        <div class="header">
          <h1 class="title">🎵 MoodPlaylist</h1>
          <p class="subtitle">AI-Powered Music Discovery</p>
        </div>
        
        <div class="section">
          <h2 class="section-title">How are you feeling?</h2>
          
          <div class="mode-toggle">
            <button class="mode-btn ${!this.showTextPrompt ? 'active' : ''}" id="moodModeBtn">
              😊 Quick Moods
            </button>
            <button class="mode-btn ${this.showTextPrompt ? 'active' : ''}" id="textModeBtn">
              ✍️ Describe Situation
            </button>
          </div>
          
          ${!this.showTextPrompt ? `
            <div class="moods-grid">
              ${this.moods.map(mood => `
                <button class="mood-button" data-mood="${mood.name}" style="background-color: ${mood.color}">
                  <span class="mood-emoji">${mood.emoji}</span>
                  <span class="mood-name">${mood.name}</span>
                </button>
              `).join('')}
            </div>
          ` : `
            <div class="text-prompt-container">
              <p class="prompt-label">Tell us what's going on... 💭</p>
              <textarea 
                class="situation-input" 
                id="situationInput"
                placeholder="e.g., 'Just finished a great workout and feeling energized!' or 'Had a tough day at work, need to unwind...'"
                rows="4"
              >${this.userSituation}</textarea>
              <button class="analyze-btn" id="analyzeSituation" ${!this.userSituation.trim() ? 'disabled' : ''}>
                🤖 Analyze & Generate Playlist
              </button>
              <p class="prompt-hint">Our AI will understand your situation and create the perfect playlist ✨</p>
            </div>
          `}
        </div>
        
        ${this.selectedMood ? `
          <div class="selected-container">
            <p class="selected-title">Selected Mood:</p>
            <div class="selected-mood" style="background-color: ${this.selectedMood.color}">
              <span class="selected-emoji">${this.selectedMood.emoji}</span>
              <span class="selected-name">${this.selectedMood.name}</span>
            </div>
          </div>
        ` : ''}
        
        <button class="spotify-button connect-button ${this.isSpotifyConnected ? 'connected' : ''}" id="connectSpotify" ${this.isLoading ? 'disabled' : ''}>
          ${this.isLoading && !this.isSpotifyConnected ? '🔄 Connecting...' : 
            this.isSpotifyConnected ? '✅ Spotify Connected' : '🎵 Connect to Spotify'}
        </button>
        
        <button class="generate-button ${(!this.selectedMood || !this.isSpotifyConnected || this.isLoading) ? 'disabled' : ''}" 
                id="generatePlaylist" ${(!this.selectedMood || !this.isSpotifyConnected || this.isLoading) ? 'disabled' : ''}>
          ${this.isLoading ? '🔄 Generating...' :
            !this.isSpotifyConnected ? 'Connect Spotify First' : 
            !this.selectedMood ? 'Select a Mood First' : 'Generate Playlist'}
        </button>
        
        ${this.showMessage ? `
          <div class="message-container">
            <p class="message-text">${this.showMessage}</p>
          </div>
        ` : ''}
        
        ${this.createdPlaylist ? `
          <button class="open-playlist-button" id="openPlaylist">
            🎵 Open in Spotify
          </button>
        ` : ''}
        
        <button class="feedback-button" id="feedbackBtn">
          💬 Send Feedback
        </button>
        
        ${this.showFeedbackForm ? `
          <div class="feedback-modal">
            <div class="feedback-content">
              <h3>📬 Send Us Your Feedback</h3>
              <textarea 
                class="feedback-input" 
                id="feedbackText"
                placeholder="Tell us what you think! Bugs, suggestions, or just say hi! 😊"
                rows="5"
              ></textarea>
              <div class="feedback-buttons">
                <button class="feedback-send-btn" id="sendFeedbackBtn">
                  ✉️ Send
                </button>
                <button class="feedback-cancel-btn" id="cancelFeedbackBtn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ` : ''}
        
        <div class="features-container">
          <h3 class="features-title">🎯 App Features</h3>
          <div class="feature">
            <span class="feature-icon">🤖</span>
            <span class="feature-text">AI Mood Detection</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✍️</span>
            <span class="feature-text">Text-based Situation Analysis</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🎵</span>
            <span class="feature-text">Spotify Integration</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🔀</span>
            <span class="feature-text">Variety in Every Playlist</span>
          </div>
          <div class="feature">
            <span class="feature-icon">⚡</span>
            <span class="feature-text">Instant Generation</span>
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Mood selection
    document.querySelectorAll('.mood-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const moodName = e.currentTarget.dataset.mood;
        const mood = this.moods.find(m => m.name === moodName);
        this.handleMoodSelect(mood);
      });
    });
    
    // Spotify connect
    document.getElementById('connectSpotify').addEventListener('click', () => {
      this.connectSpotify();
    });
    
    // Generate playlist
    document.getElementById('generatePlaylist').addEventListener('click', () => {
      this.generatePlaylist();
    });
    
    // Open playlist
    const openPlaylistBtn = document.getElementById('openPlaylist');
    if (openPlaylistBtn) {
      openPlaylistBtn.addEventListener('click', () => {
        window.open(this.createdPlaylist.url, '_blank');
      });
    }
  }
  
  handleMoodSelect(mood) {
    this.selectedMood = mood;
    this.showMessage = `You selected: ${mood.emoji} ${mood.name}\n\nIn the full app, this would generate a personalized Spotify playlist based on your mood!`;
    this.render();
    setTimeout(() => {
      this.showMessage = null;
      this.render();
    }, 3000);
  }
  
  async connectSpotify() {
    if (this.accessToken) {
      this.showMessage = '✅ Already connected to Spotify!';
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 2000);
      return;
    }
    
    const clientId = CONFIG.SPOTIFY.CLIENT_ID;
    const redirectUri = CONFIG.SPOTIFY.REDIRECT_URI;
    const scopes = CONFIG.SPOTIFY.SCOPES.join(' ');
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true`;
    
    this.showMessage = '🎵 Opening Spotify authentication...\n\nYou will be redirected to Spotify to authorize the app.';
    this.render();
    
    // Open Spotify authentication in a new tab
    window.open(authUrl, '_blank');
  }
  
  async generatePlaylist() {
    if (!this.selectedMood) {
      this.showMessage = 'Please select a mood first!';
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 3000);
      return;
    }
    
    if (!this.isSpotifyConnected || !this.accessToken) {
      this.showMessage = 'Please connect to Spotify first!';
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 3000);
      return;
    }
    
    this.isLoading = true;
    this.showMessage = '🎵 Generating your playlist...\n\n• Analyzing your music taste\n• Finding tracks that match your mood\n• Creating personalized playlist...';
    this.render();
    
    try {
      const playlistData = await this.createRealPlaylist(this.selectedMood);
      this.createdPlaylist = playlistData;
      this.isLoading = false;
      this.showMessage = `🎵 Your ${this.selectedMood.name} playlist is ready!\n\n✅ Created: "${playlistData.name}"\n• ${playlistData.trackCount} tracks added\n• Saved to your Spotify account\n• Open Spotify to listen!`;
      this.render();
    } catch (error) {
      console.error('Playlist creation error:', error);
      this.isLoading = false;
      this.showMessage = `❌ Failed to create playlist: ${error.message}\n\nPlease try again or check your Spotify connection.`;
      this.render();
    }
    
    setTimeout(() => {
      this.showMessage = null;
      this.render();
    }, 8000);
  }
  
  async createRealPlaylist(mood) {
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.CREATE_PLAYLIST}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: this.accessToken,
          mood: mood.name,
          userId: this.userProfile?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create playlist');
      }

      const result = await response.json();
      return result.playlist;
      
    } catch (error) {
      console.error('Playlist creation error:', error);
      throw error;
    }
  }
  
  attachEventListeners() {
    console.log('Attaching event listeners...');
    
    // Use more specific event delegation to avoid conflicts
    document.addEventListener('click', (e) => {
      try {
        // Mood selection
        if (e.target.closest('.mood-button')) {
          e.preventDefault();
          e.stopPropagation();
          const moodName = e.target.closest('.mood-button').dataset.mood;
          console.log('Mood selected:', moodName);
          this.selectMood(moodName);
          return;
        }
        
        // Spotify connect button
        if (e.target.closest('.connect-button') || e.target.id === 'connectSpotify') {
          e.preventDefault();
          e.stopPropagation();
          console.log('Connect button clicked!');
          this.connectSpotify();
          return;
        }
        
        // Generate playlist button
        if (e.target.closest('.generate-button') || e.target.id === 'generatePlaylist') {
          e.preventDefault();
          e.stopPropagation();
          console.log('Generate button clicked!');
          this.generatePlaylist();
          return;
        }
        
        // Open playlist button
        if (e.target.closest('.open-playlist-button') || e.target.id === 'openPlaylist') {
          e.preventDefault();
          e.stopPropagation();
          if (this.createdPlaylist && this.createdPlaylist.url) {
            window.open(this.createdPlaylist.url, '_blank');
          }
          return;
        }
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
    
    // Listen for Spotify auth success
    window.addEventListener('message', (e) => {
      try {
        if (e.data && e.data.type === 'SPOTIFY_AUTH_SUCCESS') {
          if (e.data.tokenData) {
            this.handleSpotifyTokenData(e.data.tokenData);
          } else if (e.data.code) {
            this.handleSpotifyCallback(e.data.code);
          }
        }
      } catch (error) {
        console.error('Message handler error:', error);
      }
    });
  }
  
  selectMood(moodName) {
    this.selectedMood = this.moods.find(m => m.name === moodName);
    this.render();
  }
  
  analyzeSituation() {
    if (!this.userSituation.trim()) {
      this.showMessage = 'Please describe your situation first!';
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 3000);
      return;
    }
    
    if (!this.isSpotifyConnected) {
      this.showMessage = 'Please connect to Spotify first!';
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 3000);
      return;
    }
    
    this.isLoading = true;
    this.showMessage = '🤖 Analyzing your situation...\n\nOur AI is understanding your mood and finding the perfect tracks!';
    this.render();
    
    // Enhanced AI mood detection with better keyword matching
    const situation = this.userSituation.toLowerCase();
    let detectedMood = 'Calm'; // default to calm instead of happy
    
    // Define comprehensive keyword sets for each mood
    const moodKeywords = {
      sad: [
        'sad', 'crying', 'cry', 'depressed', 'depression', 'down', 'lonely', 'alone',
        'heartbreak', 'heartbroken', 'upset', 'miss', 'missing', 'grief', 'grieving',
        'loss', 'lost', 'died', 'death', 'passed away', 'funeral', 'mourning',
        'devastated', 'hurt', 'pain', 'painful', 'tears', 'sorrow', 'blue',
        'miserable', 'unhappy', 'awful', 'terrible', 'worst', 'broke up', 'breakup'
      ],
      angry: [
        'angry', 'mad', 'furious', 'frustrated', 'annoyed', 'pissed', 'rage',
        'hate', 'hating', 'annoying', 'irritated', 'fed up', 'sick of',
        'outraged', 'livid', 'enraged', 'aggravated', 'infuriated'
      ],
      calm: [
        'calm', 'relax', 'relaxing', 'peace', 'peaceful', 'meditate', 'meditation',
        'chill', 'chilling', 'quiet', 'tranquil', 'serene', 'unwind', 'rest',
        'gentle', 'soft', 'soothing', 'mellow', 'easy', 'cozy', 'comfortable'
      ],
      energetic: [
        'energy', 'energized', 'energetic', 'workout', 'gym', 'run', 'running',
        'exercise', 'pump', 'pumped', 'hype', 'hyped', 'party', 'partying',
        'dance', 'dancing', 'active', 'motivated', 'adrenaline', 'excited',
        'powerful', 'strong', 'intense', 'charged', 'alive', 'wild'
      ],
      romantic: [
        'love', 'loving', 'romantic', 'romance', 'date', 'dating', 'valentine',
        'crush', 'relationship', 'partner', 'kiss', 'kissing', 'boyfriend',
        'girlfriend', 'anniversary', 'intimate', 'passion', 'affection',
        'cuddle', 'together', 'special someone', 'soulmate'
      ],
      happy: [
        'happy', 'happiness', 'joy', 'joyful', 'great', 'awesome', 'amazing',
        'excited', 'exciting', 'celebrate', 'celebration', 'won', 'win',
        'success', 'successful', 'good', 'wonderful', 'fantastic', 'excellent',
        'thrilled', 'delighted', 'cheerful', 'positive', 'blessed', 'grateful'
      ]
    };
    
    // Count matches for each mood (prioritize sad/angry as they're more specific)
    const scores = {};
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      scores[mood] = 0;
      for (const keyword of keywords) {
        if (situation.includes(keyword)) {
          // Give extra weight to negative emotions
          scores[mood] += (mood === 'sad' || mood === 'angry') ? 2 : 1;
        }
      }
    }
    
    // Find the mood with highest score
    let maxScore = 0;
    let bestMood = 'Calm';
    for (const [mood, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestMood = mood;
      }
    }
    
    // Map to mood names (capitalize first letter)
    detectedMood = bestMood.charAt(0).toUpperCase() + bestMood.slice(1);
    
    this.selectedMood = this.moods.find(m => m.name === detectedMood);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showMessage = `🎯 Detected Mood: ${this.selectedMood.emoji} ${this.selectedMood.name}\n\nGenerating your personalized playlist...`;
      this.render();
      
      setTimeout(() => {
        this.generatePlaylist();
      }, 1500);
    }, 2000);
  }
  
  async connectSpotify() {
    if (this.accessToken) {
      this.showMessage = '✅ Already connected to Spotify!';
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 2000);
      return;
    }

    this.isLoading = true;
    this.render();
    
    const clientId = CONFIG.SPOTIFY.CLIENT_ID;
    const redirectUri = CONFIG.SPOTIFY.REDIRECT_URI;
    const scopes = CONFIG.SPOTIFY.SCOPES.join(' ');
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true`;
    
    this.showMessage = '🎵 Opening Spotify authentication...\n\nYou will be redirected to Spotify to authorize the app.';
    this.render();
    
    // Open Spotify authentication in a new tab
    window.open(authUrl, '_blank');
    
    // Reset loading state after a short delay
    setTimeout(() => {
      this.isLoading = false;
      this.render();
    }, 1000);
  }
  
  checkForAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !this.accessToken) {
      this.handleSpotifyCallback(code);
    }
  }
  
  async handleSpotifyCallback(code) {
    try {
      this.showMessage = '🎵 Exchanging authorization code for access token...';
      this.render();
      
      // The server has already exchanged the code for tokens
      // This method will be called with tokenData from the server
      this.showMessage = '✅ Successfully connected to Spotify!\n\nYou can now select a mood and generate your playlist.';
      this.render();
      
      // Reattach event listeners after state change
      setTimeout(() => {
        this.showMessage = null;
        this.render();
        this.attachDirectListeners(); // Reattach listeners
      }, 3000);
      
    } catch (error) {
      console.error('Auth error:', error);
      this.showMessage = `❌ Authentication failed: ${error.message}\n\nPlease try connecting again.`;
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 5000);
    }
  }

  async handleSpotifyTokenData(tokenData) {
    try {
      this.accessToken = tokenData.access_token;
      this.isSpotifyConnected = true;
      
      // Get user profile
      const profileResponse = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.USER_PROFILE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: this.accessToken })
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        this.userProfile = profileData.profile;
      }
      
      this.showMessage = '✅ Successfully connected to Spotify!\n\nYou can now select a mood and generate your playlist.';
      this.render();
      
      setTimeout(() => {
        this.showMessage = null;
        this.render();
        this.attachDirectListeners();
      }, 3000);
      
    } catch (error) {
      console.error('Token handling error:', error);
      this.showMessage = `❌ Failed to complete authentication: ${error.message}`;
      this.render();
      setTimeout(() => {
        this.showMessage = null;
        this.render();
      }, 5000);
    }
  }
  
  async sendFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    
    if (!feedbackText) {
      alert('Please enter some feedback before sending!');
      return;
    }
    
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedback: feedbackText,
          userProfile: this.userProfile?.display_name || 'Anonymous',
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        this.showMessage = '✅ Thank you for your feedback! We really appreciate it! 💙';
        this.showFeedbackForm = false;
        this.render();
        this.attachDirectListeners();
        
        setTimeout(() => {
          this.showMessage = null;
          this.render();
          this.attachDirectListeners();
        }, 3000);
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      this.showMessage = '❌ Failed to send feedback. Please try again later.';
      this.render();
      this.attachDirectListeners();
    }
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new MoodPlaylistApp();
});