# VidGet — Universal Multi-Platform Video Downloader

A complete, production-ready video downloader supporting 13+ platforms with multilingual support (7 languages), a dynamic theme engine, blog system, newsletter, ads, and a full admin panel.

---

## 🏗 Architecture

```
vidget/
├── frontend/     → Astro (Static) — Netlify / Vercel
├── backend/      → Python Flask — Render / Railway
├── admin/        → Next.js (App Router) — Vercel
└── docker-compose.yml
```

---

## 🚀 Quick Start (Docker)

```bash
# Clone and start everything
git clone https://github.com/yourname/vidget.git
cd vidget
cp backend/.env.example backend/.env
docker-compose up -d

# Access:
# Frontend  → http://localhost:4321
# Backend   → http://localhost:5000
# Admin     → http://localhost:3001
```

---

## ⚙️ Manual Setup

### Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and edit env
cp .env.example .env

# Init database
python -c "from models.models import init_db; init_db()"

# Create first admin user
python create_admin.py

# Run
flask run --port 5000
# OR production:
gunicorn app:app --workers 2 --bind 0.0.0.0:5000 --timeout 120
```

### Frontend (Astro)

```bash
cd frontend
npm install

# Set API URL
echo "PUBLIC_API_URL=http://localhost:5000" > .env

# Dev
npm run dev

# Build (static)
npm run build
```

### Admin Panel (Next.js)

```bash
cd admin
npm install

echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

npm run dev   # → http://localhost:3001
```

---

## ☁️ Deployment

### Frontend → Netlify / Vercel

```bash
# Build command:
npm run build

# Output directory:
dist/

# Environment variables:
PUBLIC_API_URL=https://api.vidget.app
```

### Backend → Render

1. Connect your GitHub repo to Render
2. Use `render.yaml` (already configured)
3. Add environment variables in Render dashboard
4. PostgreSQL database is auto-provisioned

### Admin → Vercel

```bash
# Root directory: admin/
# Build command: npm run build
# Environment variables:
NEXT_PUBLIC_API_URL=https://api.vidget.app
```

---

## 🌍 Supported Platforms

| Platform      | Watermark-Free | Audio | Max Quality |
|---------------|---------------|-------|-------------|
| YouTube       | ✅            | ✅    | 4K          |
| TikTok        | ✅            | ✅    | 1080p       |
| Instagram     | ✅            | ✅    | 1080p       |
| Facebook      | ✅            | ✅    | 1080p       |
| Twitter / X   | ✅            | ✅    | 1080p       |
| Pinterest     | ✅            | —     | 1080p       |
| Vimeo         | ✅            | ✅    | 4K          |
| Twitch        | ✅            | ✅    | 1080p       |
| Reddit        | ✅            | ✅    | 1080p       |
| Dailymotion   | ✅            | ✅    | 1080p       |
| Threads       | ✅            | —     | 1080p       |
| LinkedIn      | ✅            | —     | 1080p       |
| Snapchat      | ✅            | —     | 1080p       |

---

## 🌐 Languages

- 🇬🇧 English
- 🇸🇦 Arabic (RTL)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇮🇳 Hindi
- 🇨🇳 Chinese
- 🇷🇺 Russian

---

## 🎛 Admin Panel

Access: `https://admin.vidget.app`

Features:
- **Dashboard** — Overview stats
- **Posts** — Create / edit / delete blog posts (EN + AR)
- **Ads** — Manage ad slots and HTML code
- **Messages** — View and reply to contact form submissions
- **Newsletter** — View subscribers, filter by language, copy emails

---

## 🔒 Security

- JWT authentication for admin
- bcrypt password hashing
- Rate limiting per IP (Flask-Limiter)
- SQL injection protection via SQLAlchemy ORM
- XSS protection via bleach sanitization
- CORS restricted to known origins
- All secrets via environment variables

---

## 📁 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze video URL |
| POST | `/api/download` | Get download URL |
| POST | `/api/like` | Like a post |
| GET  | `/api/likes/:id` | Get like count |
| GET  | `/api/blog` | List blog posts |
| GET  | `/api/blog/:slug` | Get blog post |
| POST | `/api/blog/:slug/comment` | Add comment |
| POST | `/api/newsletter/subscribe` | Subscribe |
| POST | `/api/contact` | Contact form |
| GET  | `/health` | Health check |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| GET/POST | `/api/admin/posts` | Manage posts |
| PUT/DELETE | `/api/admin/posts/:id` | Edit/delete post |
| GET/POST | `/api/admin/ads` | Manage ads |
| PUT/DELETE | `/api/admin/ads/:id` | Edit/delete ad |
| GET  | `/api/admin/messages` | View messages |
| PATCH | `/api/admin/messages/:id/read` | Mark read |
| GET  | `/api/admin/newsletter` | View subscribers |

---

## 📄 Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage with downloader |
| `/youtube-downloader` | YouTube-specific page |
| `/tiktok-downloader` | TikTok-specific page |
| `/{platform}-downloader` | (×11 more platforms) |
| `/blog` | Blog listing |
| `/blog/{slug}` | Blog post |
| `/about` | About page |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/disclaimer` | Disclaimer |
| `/advertise` | Advertising info |
| `/download` | Download page (query param based) |

---

## 🗄 Database Schema

Tables: `users`, `downloads`, `likes`, `logs`, `messages`, `ads`, `posts`, `comments`, `newsletter_subscribers`

---

## 📝 License

MIT License. See LICENSE for details.

---

Built with ❤️ using Astro, Flask, Next.js, yt-dlp, PostgreSQL, Redis.
