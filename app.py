from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import date

import models
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/workouts")
def get_workouts(db: Session = Depends(get_db)):
    return db.query(models.Workout).all()

@app.post("/workouts")
def add_workout(workout_date: date, workout_text: str, db: Session = Depends(get_db)):
    new = models.Workout(date=workout_date, workout_text=workout_text)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new
