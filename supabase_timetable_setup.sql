-- Create timetable table if it does not exist
CREATE TABLE IF NOT EXISTS public.timetable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    teacher TEXT,
    day TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Grant usage and permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.timetable TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own timetable" ON public.timetable;
DROP POLICY IF EXISTS "Users can insert their own timetable" ON public.timetable;
DROP POLICY IF EXISTS "Users can update their own timetable" ON public.timetable;
DROP POLICY IF EXISTS "Users can delete their own timetable" ON public.timetable;

-- Create comprehensive RLS policies tied to auth.uid()
CREATE POLICY "Users can view their own timetable" 
ON public.timetable FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timetable" 
ON public.timetable FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetable" 
ON public.timetable FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetable" 
ON public.timetable FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
