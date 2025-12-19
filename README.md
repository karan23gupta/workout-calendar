# Workout Calendar

A minimal, free-to-host workout tracking app with streak tracking. Built with React and FastAPI.

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (free tier)
- **Hosting**: 
  - Frontend: Vercel (free tier)
  - Backend: Render (free tier)
  - Database: Supabase PostgreSQL (free tier)

### Why These Choices?

**Vercel for Frontend:**
- Zero-config deployments
- Automatic HTTPS
- Global CDN
- Generous free tier (100GB bandwidth/month)
- Perfect for React apps

**Render for Backend:**
- Free tier with 750 hours/month (enough for 24/7)
- Automatic deployments from Git
- Built-in SSL
- Easy environment variable management
- Supports Python/FastAPI out of the box

**Supabase for Database:**
- Free PostgreSQL database (500MB storage)
- 2GB bandwidth/month
- Built-in connection pooling
- Easy to set up and manage
- Alternative: Neon (also excellent free tier)

## Database Schema

```sql
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    CONSTRAINT unique_workout_date UNIQUE (date)
);

CREATE INDEX idx_workout_date ON workouts(date);
```

Simple schema: one table storing workout dates. The unique constraint ensures one workout per day.

## API Design

### Endpoints

#### `GET /api/workouts`
Returns all workout dates.

**Response:**
```json
[
  {"date": "2024-01-15", "id": "uuid-here"},
  {"date": "2024-01-16", "id": "uuid-here"}
]
```

#### `POST /api/workouts`
Toggles workout status for a date (creates if doesn't exist, deletes if exists).

**Request:**
```json
{"date": "2024-01-15"}
```

**Response:**
```json
{"date": "2024-01-15", "id": "uuid-here"}
```

#### `GET /api/streaks`
Returns current and longest streak.

**Response:**
```json
{
  "current_streak": 5,
  "longest_streak": 12
}
```

#### `GET /api/health`
Health check endpoint.

## Streak Calculation Logic

### Current Streak
- Counts consecutive days with workouts ending at today or yesterday
- If today has a workout, streak includes today
- If today doesn't have a workout, streak ends at yesterday
- Must be consecutive (no gaps)

### Longest Streak
- Finds the longest sequence of consecutive workout days in history
- Calculated by iterating through all workout dates in chronological order
- Tracks the maximum consecutive sequence found

### Edge Cases Handled
1. **Today's workout**: Counts if done today
2. **Yesterday's workout**: Counts if today not done
3. **Gaps**: Any gap breaks the current streak
4. **Timezone**: Uses date comparison (not datetime) to avoid timezone issues
5. **Empty data**: Returns 0 for both streaks if no workouts exist

## Folder Structure

```
calendar/
├── app.py                 # FastAPI application
├── database.py            # Database configuration
├── models.py              # SQLAlchemy models
├── requirements.txt       # Python dependencies
├── Procfile              # Render deployment config
├── .env.example          # Environment variables template
├── README.md             # This file
└── frontend/
    ├── package.json      # Node dependencies
    ├── vite.config.js    # Vite configuration
    ├── index.html        # HTML entry point
    └── src/
        ├── main.jsx      # React entry point
        ├── App.jsx       # Main app component
        ├── App.css       # App styles
        ├── index.css     # Global styles
        ├── api.js        # API client functions
        └── components/
            ├── Calendar.jsx
            ├── Calendar.css
            ├── StreakDisplay.jsx
            └── StreakDisplay.css
```

## Local Development

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up database:
   - Option A: Use Supabase (recommended for production-like setup)
     - Create account at https://supabase.com
     - Create new project
     - Get connection string from Settings > Database
   - Option B: Use SQLite locally (no setup needed, auto-created)

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your DATABASE_URL (or leave empty for SQLite)
```

4. Run backend:
```bash
uvicorn app:app --reload
```

Backend runs on http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:8000):
```bash
cp .env.example .env
# Edit if your backend is on a different URL
```

4. Run development server:
```bash
npm run dev
```

Frontend runs on http://localhost:3000

## Deployment

### Step 1: Set Up Database (Supabase)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" (URI format)
5. Save this for Step 3

### Step 2: Deploy Backend (Render)

1. Push your code to GitHub
2. Go to https://render.com and sign up
3. Click "New +" > "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: workout-calendar-api (or your choice)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Supabase connection string from Step 1
7. Click "Create Web Service"
8. Wait for deployment (takes ~5 minutes)
9. Copy your service URL (e.g., `https://workout-calendar-api.onrender.com`)

### Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com and sign up
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL from Step 2 (e.g., `https://workout-calendar-api.onrender.com`)
6. Click "Deploy"
7. Wait for deployment (takes ~2 minutes)
8. Your app is live! Vercel provides a URL like `https://workout-calendar.vercel.app`

### Step 4: Update CORS (Backend)

After deploying frontend, update CORS in `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.vercel.app"],  # Your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy backend on Render.

## Cost Breakdown

**Total Monthly Cost: $0**

- Vercel: Free (100GB bandwidth/month)
- Render: Free (750 hours/month, enough for 24/7)
- Supabase: Free (500MB database, 2GB bandwidth/month)

All services have generous free tiers that should be sufficient for personal use.

## Features

✅ Month-view calendar
✅ Click to toggle workout status
✅ Current streak tracking
✅ Longest streak tracking
✅ Automatic streak reset on missed days
✅ Data persistence (PostgreSQL)
✅ Mobile-friendly responsive design
✅ Clean, minimal UI

## Future Enhancements (Optional)

- Weekly/monthly statistics
- Export data
- Dark mode
- Workout notes
- Calendar year view

## License

MIT - Use freely for personal projects.

