# 🔐 GitHub Setup Guide

## **Quick Fix: GitHub Authentication**

GitHub requires a Personal Access Token (PAT) instead of password. Here's how to set it up:

---

## **Method 1: Using GitHub CLI (Easiest - Recommended)**

### **Step 1: Install GitHub CLI**
```bash
brew install gh
```

### **Step 2: Login to GitHub**
```bash
gh auth login
```

Follow the prompts:
1. Select "GitHub.com"
2. Select "HTTPS"
3. Authenticate with browser
4. Done! ✅

### **Step 3: Push Your Code**
```bash
cd /Users/yaniknoetzli/Desktop/MoodPlaylist_Final
git remote add origin https://github.com/yaniknoetzli-gif/moodplaylist.git
git push -u origin main
```

---

## **Method 2: Using Personal Access Token (Alternative)**

### **Step 1: Create Personal Access Token**

1. **Go to:** https://github.com/settings/tokens/new
2. **Note:** "MoodPlaylist Deployment"
3. **Expiration:** 90 days
4. **Scopes:** Check these boxes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. **Click "Generate token"**
6. **COPY THE TOKEN** (you'll need it in next step)
   - Looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Step 2: Push Using Token**

```bash
cd /Users/yaniknoetzli/Desktop/MoodPlaylist_Final

# Add remote
git remote add origin https://github.com/yaniknoetzli-gif/moodplaylist.git

# Push (it will ask for credentials)
git push -u origin main
```

When prompted:
- **Username:** `yaniknoetzli-gif`
- **Password:** Paste your token (NOT your GitHub password)

---

## **Method 3: Using SSH (Most Secure)**

### **Step 1: Generate SSH Key**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter for all prompts (use defaults)

### **Step 2: Copy SSH Key**
```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### **Step 3: Add to GitHub**

1. **Go to:** https://github.com/settings/keys
2. **Click "New SSH key"**
3. **Title:** "MacBook Pro"
4. **Key:** Paste (Cmd+V)
5. **Click "Add SSH key"**

### **Step 4: Push with SSH**
```bash
cd /Users/yaniknoetzli/Desktop/MoodPlaylist_Final
git remote add origin git@github.com:yaniknoetzli-gif/moodplaylist.git
git push -u origin main
```

---

## **Quick Command Summary**

### **If you choose Method 1 (GitHub CLI):**
```bash
# Install
brew install gh

# Login
gh auth login

# Push
cd /Users/yaniknoetzli/Desktop/MoodPlaylist_Final
git remote add origin https://github.com/yaniknoetzli-gif/moodplaylist.git
git push -u origin main
```

### **If you choose Method 2 (Token):**
```bash
# Create token at: https://github.com/settings/tokens/new
# Then:
cd /Users/yaniknoetzli/Desktop/MoodPlaylist_Final
git remote add origin https://github.com/yaniknoetzli-gif/moodplaylist.git
git push -u origin main
# Use token as password when prompted
```

---

## **After Successful Push:**

You should see:
```
Enumerating objects: 20, done.
Counting objects: 100% (20/20), done.
Delta compression using up to 8 threads
Compressing objects: 100% (18/18), done.
Writing objects: 100% (20/20), 45.67 KiB | 7.61 MiB/s, done.
Total 20 (delta 2), reused 0 (delta 0), pack-reused 0
To https://github.com/yaniknoetzli-gif/moodplaylist.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **SUCCESS!** Your code is now on GitHub!

---

## **Next: Deploy to Vercel**

1. **Go to:** https://vercel.com/signup
2. **Sign in with GitHub**
3. **Import your repository**
4. **Add environment variable:**
   - `SPOTIFY_CLIENT_SECRET`: `1517cc34e8c34f298cb332bb9005f245`
5. **Deploy!**

---

## **Need Help?**

If you get stuck:
- Method 1 is easiest (GitHub CLI)
- Method 2 works everywhere (Token)
- Method 3 is most secure (SSH)

Choose whichever you're comfortable with! 🚀
