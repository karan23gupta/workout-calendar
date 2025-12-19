from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List, Optional
from pydantic import BaseModel, field_validator

import models
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Workout Calendar API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


class WorkoutResponse(BaseModel):
    date: str
    id: str

    class Config:
        from_attributes = True


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int


class WorkoutDate(BaseModel):
    date: str
    
    @field_validator('date')
    @classmethod
    def validate_date(cls, v: str) -> str:
        """Validate date format and ensure it's a valid date"""
        if not v:
            raise ValueError("Date cannot be empty")
        
        # Try to parse the date
        try:
            date_obj = date.fromisoformat(v)
        except ValueError as e:
            # Provide more helpful error message
            if "Invalid isoformat string" in str(e) or "month must be in 1..12" in str(e):
                raise ValueError(f"Invalid date: '{v}'. Month must be between 01-12. Use format YYYY-MM-DD (e.g., 2025-01-20)")
            raise ValueError(f"Invalid date format: '{v}'. Use YYYY-MM-DD format (e.g., 2025-01-20)")
        
        # Optional: Reject future dates (uncomment if you want to prevent future dates)
        # today = date.today()
        # if date_obj > today:
        #     raise ValueError(f"Date cannot be in the future. Today is {today}")
        
        return v


@app.get("/api/workouts", response_model=List[WorkoutResponse])
def get_workouts(db: Session = Depends(get_db)):
    """Get all workout dates"""
    workouts = db.query(models.Workout).order_by(models.Workout.date).all()
    return [{"date": str(w.date), "id": str(w.id)} for w in workouts]


@app.post("/api/workouts", response_model=WorkoutResponse)
def toggle_workout(workout_date: WorkoutDate, db: Session = Depends(get_db)):
    """Toggle workout status for a date (create if doesn't exist, delete if exists)"""
    # Date is already validated by Pydantic, so we can safely parse it
    workout_date_obj = date.fromisoformat(workout_date.date)
    
    existing = db.query(models.Workout).filter(models.Workout.date == workout_date_obj).first()
    
    if existing:
        # Delete workout (toggle off)
        db.delete(existing)
        db.commit()
        return {"date": workout_date.date, "id": str(existing.id)}
    else:
        # Create workout (toggle on)
        new_workout = models.Workout(date=workout_date_obj)
        db.add(new_workout)
        db.commit()
        db.refresh(new_workout)
        return {"date": workout_date.date, "id": str(new_workout.id)}


def calculate_streaks(workout_dates: List[date], today: date) -> tuple[int, int]:
    """
    Calculate current streak and longest streak.
    
    Edge cases handled:
    - Today's workout counts if done today
    - Yesterday's workout counts if today not done
    - Streak must be consecutive (no gaps)
    - Handles timezone edge cases by using date comparison
    """
    if not workout_dates:
        return 0, 0
    
    # Sort dates descending (most recent first)
    sorted_dates = sorted(set(workout_dates), reverse=True)
    
    # Calculate current streak
    current_streak = 0
    check_date = today
    
    # If today has a workout, start from today
    # Otherwise, start from yesterday
    if today in sorted_dates:
        current_streak = 1
        check_date = today - timedelta(days=1)
    else:
        check_date = today - timedelta(days=1)
    
    # Count consecutive days going backwards
    for workout_date in sorted_dates:
        if workout_date == check_date:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif workout_date < check_date:
            # Gap found, streak broken
            break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0
    prev_date = None
    
    # Sort ascending for longest streak calculation
    sorted_asc = sorted(set(workout_dates))
    
    for workout_date in sorted_asc:
        if prev_date is None:
            temp_streak = 1
        elif workout_date == prev_date + timedelta(days=1):
            # Consecutive day
            temp_streak += 1
        else:
            # Gap found, reset streak
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
        
        prev_date = workout_date
    
    longest_streak = max(longest_streak, temp_streak)
    
    return current_streak, longest_streak


@app.get("/api/streaks", response_model=StreakResponse)
def get_streaks(db: Session = Depends(get_db)):
    """Get current streak and longest streak"""
    workouts = db.query(models.Workout).all()
    workout_dates = [w.date for w in workouts]
    today = date.today()
    
    current_streak, longest_streak = calculate_streaks(workout_dates, today)
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
