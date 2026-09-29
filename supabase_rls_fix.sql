-- Enable RLS on the profiles table (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema public to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant all privileges on profiles table to authenticated users (RLS will still restrict rows)
GRANT ALL ON TABLE public.profiles TO authenticated;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Create comprehensive RLS policies

-- 1. Allow authenticated users to view any profile (or limit to their own if you prefer)
-- If you want them to only view their own:
-- CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
-- If you want them to view all profiles:
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Allow authenticated users to INSERT their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);
