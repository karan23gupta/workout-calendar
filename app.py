from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date, timedelta, datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from PIL import Image
from PIL.ExifTags import TAGS
import os
import aiofiles
import uuid
import shutil

import models
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Workout Calendar API")

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class WorkoutResponse(BaseModel):
    date: str
    id: str
    image_url: str
    notes: Optional[str] = None

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
        
        try:
            date_obj = date.fromisoformat(v)
        except ValueError as e:
            if "Invalid isoformat string" in str(e) or "month must be in 1..12" in str(e):
                raise ValueError(f"Invalid date: '{v}'. Month must be between 01-12. Use format YYYY-MM-DD (e.g., 2025-01-20)")
            raise ValueError(f"Invalid date format: '{v}'. Use YYYY-MM-DD format (e.g., 2025-01-20)")
        
        return v


# Authentication endpoints
@app.post("/api/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username already exists
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists (if provided)
    if user_data.email:
        existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        created_at=date.today()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(new_user.id),
            "username": new_user.username,
            "email": new_user.email
        }
    }


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(models.User).filter(models.User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email
        }
    }


@app.get("/api/me", response_model=UserResponse)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email
    }


def validate_image_date(image_path: str, expected_date: date) -> bool:
    """Validate that image was taken on the expected date using EXIF data"""
    try:
        img = Image.open(image_path)
        exif_data = img.getexif()
        
        if exif_data is None:
            return False
        
        # EXIF tag IDs: 306 = DateTime, 36867 = DateTimeOriginal
        date_time = None
        date_time_original = None
        
        # Try to get DateTimeOriginal (tag 36867) first, then DateTime (tag 306)
        if 36867 in exif_data:
            date_time_original = exif_data[36867]
        elif 306 in exif_data:
            date_time = exif_data[306]
        
        # Use DateTimeOriginal if available, otherwise DateTime
        exif_datetime = date_time_original or date_time
        
        if not exif_datetime:
            return False
        
        # Parse EXIF datetime format: "YYYY:MM:DD HH:MM:SS"
        try:
            exif_date_str = str(exif_datetime).split()[0]  # Get date part
            exif_date = datetime.strptime(exif_date_str, "%Y:%m:%d").date()
            return exif_date == expected_date
        except (ValueError, IndexError, AttributeError):
            return False
            
    except Exception as e:
        print(f"Error validating image: {e}")
        return False


# Workout endpoints (require authentication)
@app.get("/api/workouts", response_model=List[WorkoutResponse])
def get_workouts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all workout dates for the current user"""
    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).order_by(models.Workout.date).all()
    return [{
        "date": str(w.date),
        "id": str(w.id),
        "image_url": w.image_url,
        "notes": w.notes
    } for w in workouts]


@app.post("/api/workouts", response_model=WorkoutResponse)
async def create_workout(
    workout_date: str = Form(...),
    notes: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a workout for today (requires gym selfie image)"""
    today = date.today()
    
    # Validate date - only allow current day
    try:
        workout_date_obj = date.fromisoformat(workout_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    if workout_date_obj != today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You can only mark workouts for today ({today}). Cannot mark past or future dates."
        )
    
    # Check if workout already exists for today
    existing = db.query(models.Workout).filter(
        and_(
            models.Workout.user_id == current_user.id,
            models.Workout.date == today
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workout already marked for today. Delete it first to create a new one."
        )
    
    # Validate image file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Save image temporarily to validate EXIF
    file_ext = os.path.splitext(image.filename)[1] or '.jpg'
    temp_filename = f"temp_{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    try:
        # Save uploaded file
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await image.read()
            await f.write(content)
        
        # Validate image was taken today
        if not validate_image_date(temp_path, today):
            os.remove(temp_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image metadata shows this photo was not taken today. Please upload a gym selfie taken today."
            )
        
        # Generate permanent filename
        permanent_filename = f"{current_user.id}_{today.isoformat()}_{uuid.uuid4()}{file_ext}"
        permanent_path = os.path.join(UPLOAD_DIR, permanent_filename)
        
        # Move to permanent location
        shutil.move(temp_path, permanent_path)
        image_url = f"/uploads/{permanent_filename}"
        
        # Create workout
        new_workout = models.Workout(
            user_id=current_user.id,
            date=today,
            image_url=image_url,
            notes=notes
        )
        db.add(new_workout)
        db.commit()
        db.refresh(new_workout)
        
        return {
            "date": str(new_workout.date),
            "id": str(new_workout.id),
            "image_url": new_workout.image_url,
            "notes": new_workout.notes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )


@app.delete("/api/workouts/{workout_date}")
def delete_workout(
    workout_date: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a workout (only allowed for today)"""
    today = date.today()
    
    try:
        workout_date_obj = date.fromisoformat(workout_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )
    
    # Only allow deleting today's workout
    if workout_date_obj != today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only delete today's workout"
        )
    
    existing = db.query(models.Workout).filter(
        and_(
            models.Workout.user_id == current_user.id,
            models.Workout.date == today
        )
    ).first()
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    # Delete image file
    if existing.image_url:
        image_path = existing.image_url.replace('/uploads/', UPLOAD_DIR + '/')
        if os.path.exists(image_path):
            try:
                os.remove(image_path)
            except:
                pass  # Continue even if file deletion fails
    
    db.delete(existing)
    db.commit()
    
    return {"message": "Workout deleted successfully"}


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
def get_streaks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current streak and longest streak for the current user"""
    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).all()
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
