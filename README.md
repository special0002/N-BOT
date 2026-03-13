# ✨ Birthday Chatbot — Setup & Deployment Guide

A private AI-powered chatbot built just for your girlfriend, running on Groq (free tier),
with a beautiful dark-gold UI and secure email-based auth.

---

## 📁 Project Structure

```
birthday-app/
├── backend/
│   ├── main.py              ← FastAPI server
│   ├── requirements.txt
│   ├── generate_passwords.py ← Run this to hash passwords
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/Login.js   ← Login screen
│   │   ├── pages/Chat.js    ← Chat screen
│   │   ├── hooks/useAuth.js
│   │   ├── utils/api.js
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
└── knowledge-base/
    └── about_her.txt        ← FILL THIS IN ← most important file
```

---

## STEP 1 — Fill in `knowledge-base/about_her.txt`

Open `about_her.txt` and replace all the `[placeholders]` with real details.
The more you write, the better the AI can answer. Include:
- Favorites, personality, your shared memories
- Her quirks, dreams, things she says often
- Anything personal and meaningful

---

## STEP 2 — Get a Free Groq API Key

1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Copy it — you'll need it in the next step

---

## STEP 3 — Configure the Backend

### Set up passwords:
```bash
cd backend
pip install passlib[bcrypt]
python generate_passwords.py
```
Copy the two hashes it outputs.

### Edit `backend/main.py`:
Find `ALLOWED_USERS` and update:
```python
ALLOWED_USERS = {
    "your-actual-email@gmail.com": {
        "hashed_password": "PASTE_YOUR_HASH_HERE",
        "name": "You ❤️"
    },
    "her-actual-email@gmail.com": {
        "hashed_password": "PASTE_HER_HASH_HERE",
        "name": "The Birthday Girl 🎂"
    }
}
```

### Create `.env` file:
```bash
cp .env.example .env
```
Edit `.env`:
```
GROQ_API_KEY=gsk_your_groq_key_here
SECRET_KEY=run: openssl rand -hex 32
```

---

## STEP 4 — Run Locally (Test First)

### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### Frontend:
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

Open http://localhost:3000 and test login + chat.

---

## STEP 5 — Deploy to the Internet (Free)

### Option A: Railway (Easiest — Recommended)

**Backend on Railway:**
1. Go to https://railway.app — sign up free
2. New Project → Deploy from GitHub (push your code first)
   OR: New Project → Empty Project → Add Service → Docker
3. Set environment variables in Railway dashboard:
   - `GROQ_API_KEY`
   - `SECRET_KEY`
4. Railway gives you a URL like: `https://your-app.railway.app`

**Frontend on Vercel:**
1. Go to https://vercel.com — sign up free
2. Import your GitHub repo, set root to `frontend/`
3. Add environment variable:
   - `REACT_APP_API_URL` = your Railway backend URL
4. Deploy → Vercel gives you a URL like `https://your-app.vercel.app`

### Option B: Render (Also Free)
- Backend: https://render.com → New Web Service → connect repo → set env vars
- Frontend: Render Static Site → build command `npm run build` → publish dir `build`

### Option C: All-in-one on a VPS (DigitalOcean / Hetzner ~$4/mo)
```bash
# On your VPS:
git clone your-repo
cd birthday-app/backend
pip install -r requirements.txt
# Run with: uvicorn main:app --host 0.0.0.0 --port 8000

# Build frontend:
cd ../frontend
REACT_APP_API_URL=http://your-vps-ip:8000 npm run build
# Serve with nginx pointing to the build/ folder
```

---

## STEP 6 — Share the Link

Send her the Vercel/Railway URL with her credentials.
That's it — she opens it on her phone/laptop and can chat! 🎂

---

## 🔄 Updating the Knowledge Base

After editing `about_her.txt`, the embeddings cache needs to be refreshed:

```bash
# Delete the cache and restart:
rm backend/embeddings_cache.pkl
# Restart backend
```

Or call the API endpoint while logged in:
```
POST /reload-kb
Authorization: Bearer <your-token>
```

---

## 🛡️ Security Notes

- Only the 2 emails in `ALLOWED_USERS` can log in — everyone else gets rejected
- JWTs expire after 24 hours — she'll need to log in again each day
- Keep your `.env` file secret — never commit it to git
- Add `.env` and `embeddings_cache.pkl` to `.gitignore`

---

## 🎨 Customizing the App Name

In `frontend/public/index.html`, change:
```html
<title>✨ For [Her Name]</title>
```

In `frontend/src/pages/Chat.js`, update:
```js
content: `Hello, [Her Name] ✨\n\nI know everything about you...`
```

And the header title in Chat.js:
```jsx
<h1 className="header-title">All About [Her Name]</h1>
<p className="header-sub">A gift from [Your Name] with love 💕</p>
```

---

## Troubleshooting

**"Knowledge base not found"** → Check the path in `KNOWLEDGE_BASE_PATH` in main.py

**Login fails** → Re-run `generate_passwords.py` and make sure hashes are correct in main.py

**CORS errors** → In main.py, replace `allow_origins=["*"]` with your Vercel URL

**Slow first response** → SentenceTransformer downloads on first run (~80MB). Give it a minute.
