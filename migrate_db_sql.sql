-- SQL migration script for PostgreSQL
-- Run this in your database if you want to preserve existing data
-- Otherwise, use migrate_db.py which will drop and recreate the table

-- Step 1: Add user_id column (you'll need to assign existing workouts to a user)
-- First, create a temporary default user or assign to existing users
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS user_id VARCHAR;

-- Step 2: If you have existing workouts, assign them to a default user
-- Replace 'default-user-id' with an actual user ID from your users table
-- UPDATE workouts SET user_id = 'default-user-id' WHERE user_id IS NULL;

-- Step 3: Make user_id NOT NULL after assigning values
-- ALTER TABLE workouts ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Add image_url column (required)
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS image_url VARCHAR NOT NULL DEFAULT '/uploads/default.jpg';

-- Step 5: Add notes column (optional)
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS notes VARCHAR;

-- Step 6: Add foreign key constraint
ALTER TABLE workouts 
ADD CONSTRAINT fk_workouts_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Step 7: Add unique constraint on user_id + date
ALTER TABLE workouts 
ADD CONSTRAINT unique_user_workout_date 
UNIQUE (user_id, date);

-- Step 8: Create index on user_id for performance
CREATE INDEX IF NOT EXISTS ix_workouts_user_id ON workouts(user_id);

-- Note: If you have existing data, you'll need to:
-- 1. Assign user_id to all existing workouts
-- 2. Add image_url for all existing workouts (or set a default)
-- 3. Then remove the DEFAULT from image_url if desired

