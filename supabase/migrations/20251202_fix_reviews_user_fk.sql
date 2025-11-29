-- Fix reviews foreign key to reference profiles instead of auth.users
-- This allows proper JOIN queries in Supabase

-- Drop existing foreign key constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add new foreign key to profiles
ALTER TABLE reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Add comment
COMMENT ON CONSTRAINT reviews_user_id_fkey ON reviews IS 'References profiles table for proper JOIN support in queries';
