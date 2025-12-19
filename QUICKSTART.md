# Quick Start Guide

Get the app running locally in 5 minutes.

## Prerequisites
- Python 3.11+ installed
- Node.js 18+ and npm installed

## Backend Setup (2 minutes)

```bash
# Install Python dependencies
pip install -r requirements.txt

# The app will use SQLite locally (no database setup needed!)
# Just run:
uvicorn app:app --reload
```

Backend runs on http://localhost:8000

## Frontend Setup (2 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs on http://localhost:3000

## Test It

1. Open http://localhost:3000
2. Click on today's date to mark a workout
3. See the streak update
4. Click again to unmark

That's it! The app uses SQLite locally, so no database setup needed.

## For Production

See `DEPLOYMENT.md` for deploying to free hosting (Vercel + Render + Supabase).

