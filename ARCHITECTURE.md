# Architecture Decisions

## Overview

This document explains the architectural choices made for the workout calendar app, focusing on simplicity, cost-effectiveness, and maintainability.

## Tech Stack Justification

### Frontend: React + Vite

**Why React?**
- Most popular, well-documented
- Large ecosystem
- Easy to find help/resources
- Component-based architecture fits calendar UI well

**Why Vite?**
- Faster than Create React App
- Better developer experience
- Smaller bundle size
- Modern tooling

**Alternative considered**: Next.js - Rejected because it adds complexity (SSR, routing) we don't need for a simple SPA.

### Backend: FastAPI

**Why FastAPI?**
- Fast (async support)
- Automatic API documentation (Swagger UI)
- Type hints and validation with Pydantic
- Simple, Pythonic syntax
- Great for REST APIs

**Alternative considered**: Flask - FastAPI is faster and has better async support. Django - Too heavy for this simple API.

### Database: PostgreSQL (via Supabase)

**Why PostgreSQL?**
- Robust, reliable
- Free tier available
- ACID compliance
- Great for date-based queries
- Industry standard

**Why Supabase?**
- Generous free tier (500MB, 2GB bandwidth)
- Easy setup
- Built-in connection pooling
- Good documentation
- Alternative: Neon (also excellent)

**Local Development**: SQLite for zero-setup local dev. Production uses PostgreSQL.

## API Design

### RESTful Endpoints

Simple REST API with 4 endpoints:
- `GET /api/workouts` - List all workouts
- `POST /api/workouts` - Toggle workout (idempotent)
- `GET /api/streaks` - Get streak stats
- `GET /api/health` - Health check

**Why toggle instead of separate create/delete?**
- Simpler UX (one click toggles)
- Fewer API calls
- Less state management in frontend

### Data Models

**Workout Model:**
```python
- id: String (UUID as string for SQLite compatibility)
- date: Date (unique constraint)
```

**Why this simple schema?**
- One workout per day (enforced by unique constraint)
- No need for workout details (minimal app)
- Easy to query and calculate streaks
- Can extend later if needed

## Streak Calculation

### Algorithm

**Current Streak:**
1. Check if today has workout
2. If yes, count backwards from today
3. If no, count backwards from yesterday
4. Stop at first gap

**Longest Streak:**
1. Sort all workout dates chronologically
2. Iterate through, tracking consecutive sequences
3. Return maximum sequence length

### Edge Cases Handled

1. **Today's workout**: Counts in current streak
2. **Yesterday's workout**: Counts if today not done
3. **Gaps**: Any missing day breaks streak
4. **Timezone**: Uses date (not datetime) to avoid timezone issues
5. **Empty data**: Returns 0 for both streaks
6. **Future dates**: Not allowed (validated by API)

## Hosting Strategy

### Frontend: Vercel

**Why Vercel?**
- Zero-config deployments
- Automatic HTTPS
- Global CDN (fast worldwide)
- 100GB bandwidth/month free
- Perfect for React/Vite apps
- Automatic deployments from Git

**Cost**: Free (generous limits)

### Backend: Render

**Why Render?**
- Free tier: 750 hours/month (enough for 24/7)
- Automatic deployments from Git
- Built-in SSL
- Easy environment variable management
- Supports Python/FastAPI
- Good documentation

**Limitation**: Free tier spins down after 15 min inactivity (first request takes ~30s). Acceptable for personal use.

**Alternative considered**: Railway - Similar, but Render's free tier is more generous.

**Cost**: Free

### Database: Supabase

**Why Supabase?**
- 500MB database free
- 2GB bandwidth/month free
- Built-in connection pooling
- Easy to set up
- Good free tier limits

**Cost**: Free

**Total Monthly Cost: $0**

## Security Considerations

### Current Implementation
- CORS configured (restrict in production)
- No authentication (single-user app)
- Input validation via Pydantic
- SQL injection protection via SQLAlchemy ORM

### For Production
1. Update CORS to allow only your Vercel domain
2. Add rate limiting (if needed)
3. Use environment variables for secrets
4. Enable HTTPS (automatic on Vercel/Render)

## Scalability

### Current Limits (Free Tier)
- **Vercel**: 100GB bandwidth/month
- **Render**: 750 hours/month
- **Supabase**: 500MB database, 2GB bandwidth/month

### When to Upgrade
- If you exceed free tier limits
- If you need faster backend (no spin-down)
- If you need more database storage

### Scaling Path
1. **Backend**: Upgrade Render to paid ($7/month) for always-on
2. **Database**: Supabase Pro ($25/month) for more storage
3. **Frontend**: Vercel Pro ($20/month) for more bandwidth

**But**: Free tier should handle personal use for years.

## Code Organization

### Backend Structure
```
app.py          # FastAPI app, routes, streak logic
models.py       # SQLAlchemy models
database.py     # Database connection
```

**Why this simple structure?**
- Small app doesn't need complex folder structure
- Easy to understand
- Can refactor later if needed

### Frontend Structure
```
src/
  App.jsx           # Main component, state management
  api.js            # API client functions
  components/
    Calendar.jsx    # Calendar UI
    StreakDisplay.jsx  # Streak stats
```

**Why component-based?**
- Reusable components
- Clear separation of concerns
- Easy to test and maintain

## Performance Optimizations

### Backend
- Database indexes on `date` column (fast lookups)
- Connection pooling (via SQLAlchemy)
- Efficient streak calculation (single query + in-memory processing)

### Frontend
- Vite for fast builds
- Minimal dependencies
- No unnecessary re-renders (React best practices)

## Future Enhancements (If Needed)

1. **Caching**: Add Redis for streak calculations (only if needed)
2. **Background Jobs**: Calculate streaks async (only if slow)
3. **Analytics**: Add simple stats endpoint
4. **Export**: CSV export of workout data

**But**: Keep it simple. Don't add until actually needed.

## Development Workflow

1. **Local**: SQLite for zero-setup
2. **Staging**: Use Render + Supabase (same as production)
3. **Production**: Same as staging

**Why this approach?**
- Local dev is fast (no external dependencies)
- Staging matches production (catches issues early)
- Simple deployment (just push to Git)

## Monitoring

### Current
- Render logs (backend)
- Vercel logs (frontend)
- Supabase dashboard (database)

### If Needed Later
- Sentry for error tracking (free tier available)
- Uptime monitoring (UptimeRobot free tier)

## Conclusion

This architecture prioritizes:
1. **Simplicity**: Easy to understand and maintain
2. **Cost**: $0/month forever
3. **Speed**: Fast development and deployment
4. **Reliability**: Proven technologies and services

Perfect for a personal workout tracking app that you want to run free forever.

