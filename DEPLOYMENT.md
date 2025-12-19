# Quick Deployment Guide

## Prerequisites
- GitHub account
- Supabase account (free)
- Render account (free)
- Vercel account (free)

## Step-by-Step Deployment

### 1. Database Setup (Supabase) - 5 minutes

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: workout-calendar (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for project creation (~2 minutes)
6. Go to **Settings** → **Database**
7. Scroll to "Connection string" section
8. Copy the **URI** connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
9. **Save this connection string** - you'll need it in Step 2

### 2. Backend Deployment (Render) - 10 minutes

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to https://render.com
3. Sign up / Log in (use GitHub for easier integration)
4. Click "New +" → "Web Service"
5. Connect your GitHub account if not already connected
6. Select your repository
7. Configure the service:
   - **Name**: `workout-calendar-api`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or `master`)
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
8. Scroll down to "Environment Variables"
9. Click "Add Environment Variable":
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Supabase connection string from Step 1
10. Click "Create Web Service"
11. Wait for deployment (~5 minutes)
12. Once deployed, copy your service URL (e.g., `https://workout-calendar-api.onrender.com`)
13. **Important**: Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds. This is normal and free.

### 3. Frontend Deployment (Vercel) - 5 minutes

1. Go to https://vercel.com
2. Sign up / Log in (use GitHub for easier integration)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `npm run build` (should auto-fill)
   - **Output Directory**: `dist` (should auto-fill)
   - **Install Command**: `npm install` (should auto-fill)
6. Click "Environment Variables"
7. Add variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL from Step 2 (e.g., `https://workout-calendar-api.onrender.com`)
8. Click "Deploy"
9. Wait for deployment (~2 minutes)
10. Your app is live! Copy the URL (e.g., `https://workout-calendar.vercel.app`)

### 4. Update CORS (Backend) - 2 minutes

1. Go back to your code editor
2. Open `app.py`
3. Find the CORS middleware section (around line 18)
4. Update `allow_origins`:
   ```python
   allow_origins=["https://your-frontend-url.vercel.app"],  # Replace with your Vercel URL
   ```
5. Commit and push:
   ```bash
   git add app.py
   git commit -m "Update CORS for production"
   git push
   ```
6. Render will automatically redeploy (takes ~2 minutes)

### 5. Test Your App

1. Visit your Vercel URL
2. Click on today's date to mark a workout
3. Check that the streak updates
4. Navigate to different months
5. Test on mobile device

## Troubleshooting

### Backend not responding
- Render free tier spins down after inactivity. First request takes ~30 seconds.
- Check Render logs: Go to your service → "Logs" tab
- Verify `DATABASE_URL` environment variable is set correctly

### Frontend can't connect to backend
- Check browser console for errors
- Verify `VITE_API_URL` is set in Vercel environment variables
- Make sure CORS is updated in `app.py` with your Vercel URL
- Check that backend is running (visit backend URL directly)

### Database connection errors
- Verify Supabase project is active
- Check connection string format (should start with `postgresql://`)
- Make sure password in connection string matches your Supabase password
- Check Supabase dashboard → Settings → Database for correct connection string

### Build failures
- **Backend**: Check Python version (should be 3.11+). Render auto-detects from `runtime.txt`
- **Frontend**: Make sure `package.json` is in `frontend/` directory
- Check build logs in Render/Vercel dashboard

## Cost

**Total: $0/month**

- Supabase: Free (500MB database, 2GB bandwidth)
- Render: Free (750 hours/month, enough for 24/7)
- Vercel: Free (100GB bandwidth/month)

All services have generous free tiers perfect for personal use.

## Updating Your App

1. Make changes locally
2. Test locally (`npm run dev` in frontend, `uvicorn app:app --reload` in root)
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
4. Render and Vercel will automatically redeploy

## Monitoring

- **Backend logs**: Render dashboard → Your service → Logs
- **Frontend logs**: Vercel dashboard → Your project → Deployments → Click deployment → View Function Logs
- **Database**: Supabase dashboard → Table Editor (view data) or SQL Editor (run queries)

