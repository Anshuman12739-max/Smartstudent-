-- Create subjects table if it does not exist
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    teacher TEXT,
    course TEXT,
    credits NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Grant usage and permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.subjects TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON public.subjects;

-- Create comprehensive RLS policies tied to auth.uid()
CREATE POLICY "Users can view their own subjects" 
ON public.subjects FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" 
ON public.subjects FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" 
ON public.subjects FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" 
ON public.subjects FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
