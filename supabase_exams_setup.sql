-- Create exams table if it does not exist
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    exam_type TEXT DEFAULT 'Midterm',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Grant usage and permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.exams TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can insert their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON public.exams;

-- Create comprehensive RLS policies tied to auth.uid()
CREATE POLICY "Users can view their own exams" 
ON public.exams FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams" 
ON public.exams FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams" 
ON public.exams FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams" 
ON public.exams FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
