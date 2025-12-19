from sqlalchemy import Column, Date, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

# Use String for UUID to support both SQLite (local dev) and PostgreSQL (production)
class Workout(Base):
    __tablename__ = "workouts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(Date, nullable=False, unique=True, index=True)
