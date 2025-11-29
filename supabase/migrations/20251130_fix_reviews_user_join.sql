-- Fix RLS for reviews with user join
-- Allow reading basic user info for displaying review authors

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- Grant select on specific columns needed for reviews (id, email, raw_user_meta_data for full_name)
GRANT SELECT (id, email, raw_user_meta_data) ON auth.users TO anon, authenticated;
