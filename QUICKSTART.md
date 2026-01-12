# Quick Start Guide

Get the app running locally in 5 minutes.

## Prerequisites
- Python 3.11+ installed
- Node.js 18+ and npm installed

## Backend Setup (2 minutes)

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Set up environment (optional for local dev):**
   - The app will use SQLite locally (no database setup needed!)
   - If you want to use PostgreSQL, create a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL
   ```

3. **Run the backend:**
```bash
uvicorn app:app --reload
```

Backend runs on **http://localhost:8000**

You can test it at:
- API: http://localhost:8000/api/health
- Docs: http://localhost:8000/docs (Swagger UI)

## Frontend Setup (2 minutes)

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

Frontend runs on **http://localhost:3000**

## Test It

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Click on today's date to mark a workout
4. Upload a gym selfie (must be taken today)
5. Add optional workout notes
6. See the streak update!

## Running Both at Once

Open **two terminal windows**:

**Terminal 1 (Backend):**
```bash
# In project root
uvicorn app:app --reload
```

**Terminal 2 (Frontend):**
```bash
# In frontend directory
cd frontend
npm run dev
```

## Troubleshooting

### Backend won't start
- Make sure Python 3.11+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

### Frontend won't start
- Make sure Node.js 18+ is installed: `node --version`
- Install dependencies: `npm install` (in frontend directory)
- Check if port 3000 is available

### Database errors
- For local dev, SQLite is used automatically (no setup needed)
- If using PostgreSQL, make sure DATABASE_URL is set in `.env`

### CORS errors
- Make sure backend is running on port 8000
- Frontend proxy is configured to connect to `http://localhost:8000`

## For Production

See `DEPLOYMENT.md` for deploying to free hosting (Vercel + Railway + Supabase).
