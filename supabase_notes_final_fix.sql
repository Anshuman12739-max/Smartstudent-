-- 1. Ensure Row Level Security (RLS) is enabled
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 2. Grant necessary schema and table permissions
-- The 'permission denied' error occurs because these grants are missing.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.notes TO anon, authenticated;

-- 3. Safely drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- 4. Re-create policies cleanly (scoping strictly to auth.uid() = user_id)
-- SELECT: Users can only see their own notes
CREATE POLICY "Users can view their own notes" 
ON public.notes FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Users can only insert rows if the user_id matches their own auth.uid()
CREATE POLICY "Users can insert their own notes" 
ON public.notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own notes
CREATE POLICY "Users can update their own notes" 
ON public.notes FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own notes
CREATE POLICY "Users can delete their own notes" 
ON public.notes FOR DELETE 
USING (auth.uid() = user_id);
