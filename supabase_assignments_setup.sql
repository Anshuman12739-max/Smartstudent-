-- Create assignments table if it does not exist
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Grant usage and permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.assignments TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can insert their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete their own assignments" ON public.assignments;

-- Create comprehensive RLS policies tied to auth.uid()
CREATE POLICY "Users can view their own assignments" 
ON public.assignments FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments" 
ON public.assignments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments" 
ON public.assignments FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments" 
ON public.assignments FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
