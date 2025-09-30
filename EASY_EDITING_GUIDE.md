# 🎨 Easy Editing Guide for MoodPlaylist
## No Coding Knowledge Required!

This guide will show you how to customize your MoodPlaylist app without knowing how to code.

---

## 📝 What You Can Edit

### 1. **Change App Title & Description**
**File:** `index.html` (lines 6-52)

- **App Title:** Line 6 - Change `MoodPlaylist - AI-Powered Music Discovery`
- **Header Title:** Line 42 - Change `🎵 MoodPlaylist`
- **Subtitle:** Line 49 - Change `AI-powered playlists for every mood`

**Example:**
```html
<title>MyMusicApp - Your Vibe Curator</title>
...
<h1>🎵 MyMusicApp</h1>
<p>Your personal vibe curator</p>
```

---

### 2. **Add or Change Moods**
**File:** `App.js` (lines 14-21)

**Current Moods:**
```javascript
this.moods = [
  { name: 'Happy', emoji: '😊', color: '#FFD700' },
  { name: 'Sad', emoji: '😢', color: '#4169E1' },
  { name: 'Calm', emoji: '😌', color: '#87CEEB' },
  { name: 'Energetic', emoji: '⚡', color: '#FF6347' },
  { name: 'Romantic', emoji: '😍', color: '#FF69B4' },
  { name: 'Angry', emoji: '😠', color: '#FF4500' }
];
```

**To Add a New Mood:**
1. Copy a line (e.g., `{ name: 'Happy', emoji: '😊', color: '#FFD700' },`)
2. Paste it before the `];`
3. Change the `name`, `emoji`, and `color`

**Example - Adding "Chill" mood:**
```javascript
{ name: 'Chill', emoji: '😎', color: '#00CED1' },
```

**Emoji Ideas:** 😊 😢 😌 ⚡ 😍 😠 🤗 😎 🥳 😴 🤔 😱 🎉 🌙 ☀️ 🔥 ❄️ 🌈

**Color Codes:**
- Yellow: `#FFD700`
- Blue: `#4169E1`
- Light Blue: `#87CEEB`
- Red: `#FF6347`
- Pink: `#FF69B4`
- Orange: `#FF4500`
- Green: `#00FF00`
- Purple: `#9370DB`
- Turquoise: `#00CED1`

---

### 3. **Change Music Genres for Each Mood**
**File:** `config.js` (lines 54-89)

**Example - Change "Happy" mood to play different genres:**
```javascript
'Happy': { 
  genres: ['reggae', 'funk', 'soul'],  // Change these!
  target_energy: 0.8, 
  target_valence: 0.9,
  description: 'Groovy and uplifting vibes'  // Change this!
},
```

**Available Genres:**
- pop, rock, indie, folk, acoustic
- electronic, dance, house, techno, edm
- hip-hop, rap, r&b, soul, funk
- jazz, blues, country, reggae
- metal, punk, alternative
- classical, ambient, chill

---

### 4. **Change Background Colors**
**File:** `index.html` (line 12)

Current: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`

**Try These Gradients:**
- Blue/Purple: `#667eea 0%, #764ba2 100%`
- Pink/Orange: `#ff9a56 0%, #ff5757 100%`
- Green/Blue: `#11998e 0%, #38ef7d 100%`
- Red/Purple: `#e53935 0%, #e35d5b 100%`
- Dark Blue: `#2193b0 0%, #6dd5ed 100%`

---

### 5. **Customize AI Mood Detection Keywords**
**File:** `App.js` (lines 509-559)

Add your own keywords to improve mood detection:

```javascript
sad: [
  'sad', 'crying', 'depressed', 'down', 'lonely',
  'your-custom-keyword-here'  // Add here!
],
```

---

## 🚀 How to Apply Your Changes

### **If Running Locally:**
1. Save the file
2. Refresh your browser (Cmd+R or Ctrl+R)

### **If Deployed on Vercel:**
1. Save the file
2. Open Terminal
3. Run these commands:
   ```bash
   cd /Users/yaniknoetzli/Desktop/MoodPlaylist_Final
   git add .
   git commit -m "Updated customization"
   git push
   ```
4. Wait 2-3 minutes for Vercel to redeploy
5. Refresh your website

---

## 🆘 Need Help?

### Common Issues:

**Q: I broke something! How do I undo?**
**A:** Press Cmd+Z (Mac) or Ctrl+Z (Windows) to undo your changes.

**Q: The app stopped working after my changes**
**A:** Check that you didn't accidentally:
- Delete a comma (`,`)
- Delete a bracket (`{`, `}`, `[`, `]`)
- Delete a quote (`'` or `"`)

**Q: How do I add a new mood AND make it show different music?**
**A:** You need to edit TWO files:
1. `App.js` - Add the mood button
2. `config.js` - Add the mood's music genres

---

## 📚 Files You Can Safely Edit:

✅ **config.js** - Mood genres, descriptions, website URL  
✅ **App.js** (lines 14-21) - Mood buttons  
✅ **index.html** (lines 6-312) - Colors, title, styling  

⚠️ **Files to AVOID editing unless you know what you're doing:**
- server.js
- package.json
- vercel.json

---

## 🎨 Quick Customization Checklist:

- [ ] Change app title
- [ ] Change background colors
- [ ] Add or remove moods
- [ ] Customize genres for each mood
- [ ] Change mood descriptions
- [ ] Add custom emoji
- [ ] Test locally
- [ ] Deploy to Vercel

---

**Remember:** Always save a backup before making changes! Copy the original file and rename it to `filename.backup.js` or similar.

Happy customizing! 🎵
