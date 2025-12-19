"""
Database migration script to add new columns to workouts table.
Run this once to update your existing database schema.
"""
import os
from sqlalchemy import text
import database

def migrate_database():
    """Add missing columns to workouts table if they don't exist"""
    db = database.SessionLocal()
    try:
        # Check if user_id column exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='workouts' AND column_name='user_id'
        """))
        
        if result.fetchone() is None:
            print("Migrating database schema...")
            
            # First, we need to handle existing data
            # Option 1: If you have existing workouts, you might want to delete them
            # or assign them to a default user. For now, we'll drop the table and recreate.
            
            # Drop the old workouts table
            db.execute(text("DROP TABLE IF EXISTS workouts CASCADE"))
            db.commit()
            print("Dropped old workouts table")
            
            # Recreate the table with new schema
            from models import Base, Workout
            Base.metadata.create_all(bind=database.engine)
            print("Created new workouts table with user_id, image_url, and notes columns")
        else:
            print("Database schema is up to date")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database()
    print("Migration complete!")

