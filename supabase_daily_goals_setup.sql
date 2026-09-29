-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Grant permissions (prevents "permission denied" error)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.daily_goals TO anon, authenticated;

-- Safely drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.daily_goals;

-- Re-create comprehensive RLS policies tied to auth.uid()
CREATE POLICY "Users can view their own goals" 
ON public.daily_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.daily_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.daily_goals FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.daily_goals FOR DELETE 
USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_daily_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_goals_timestamp ON public.daily_goals;
CREATE TRIGGER update_daily_goals_timestamp
    BEFORE UPDATE ON public.daily_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_goals_updated_at();
