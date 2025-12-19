# Database Migration Guide

## Problem
If you're getting an error like `column workouts.user_id does not exist`, your database schema is out of date.

## Solution Options

### Option 1: Drop and Recreate (Recommended for Development)
If you don't have important data to preserve:

```bash
python migrate_db.py
```

This will:
- Drop the old `workouts` table
- Recreate it with the new schema (user_id, image_url, notes)

### Option 2: Manual SQL Migration (For Production)
If you have existing data you want to preserve:

1. Connect to your database (Supabase, Railway, etc.)
2. Run the SQL commands from `migrate_db_sql.sql`
3. **Important**: You'll need to assign existing workouts to users before making user_id NOT NULL

### Option 3: Quick Fix via Railway/Supabase Dashboard

1. **Railway**: Go to your database service → Connect → Run SQL
2. **Supabase**: Go to SQL Editor → Run the SQL from `migrate_db_sql.sql`

**Quick SQL for fresh start (drops old table):**
```sql
DROP TABLE IF EXISTS workouts CASCADE;
```

Then restart your app - it will recreate the table with the correct schema.

## After Migration

1. Restart your backend service
2. Test registration and workout creation
3. Verify the new columns exist in your database

## Checking Your Schema

To verify the migration worked, run:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workouts';
```

You should see:
- `id` (VARCHAR)
- `user_id` (VARCHAR, NOT NULL)
- `date` (DATE, NOT NULL)
- `image_url` (VARCHAR, NOT NULL)
- `notes` (VARCHAR, nullable)

