from sqlalchemy import Column, Date, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(Date, nullable=False)

# Use String for UUID to support both SQLite (local dev) and PostgreSQL (production)
class Workout(Base):
    __tablename__ = "workouts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    image_url = Column(String, nullable=False)  # Required: gym selfie
    notes = Column(String, nullable=True)  # Optional: workout notes
    
    # Unique constraint: each user can only have one workout per date
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='unique_user_workout_date'),
    )
