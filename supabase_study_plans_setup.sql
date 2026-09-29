-- Create study_plans table if it does not exist
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    study_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- duration in minutes
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Grant usage and permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.study_plans TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own study plans" ON public.study_plans;
DROP POLICY IF EXISTS "Users can insert their own study plans" ON public.study_plans;
DROP POLICY IF EXISTS "Users can update their own study plans" ON public.study_plans;
DROP POLICY IF EXISTS "Users can delete their own study plans" ON public.study_plans;

-- Create comprehensive RLS policies tied to auth.uid()
CREATE POLICY "Users can view their own study plans" 
ON public.study_plans FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study plans" 
ON public.study_plans FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" 
ON public.study_plans FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" 
ON public.study_plans FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
