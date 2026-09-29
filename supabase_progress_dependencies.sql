-- ========================================================
-- 1. SUBJECTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    teacher TEXT,
    course TEXT,
    credits NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.subjects TO authenticated;

DROP POLICY IF EXISTS "Users can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON public.subjects;

CREATE POLICY "Users can view their own subjects" 
ON public.subjects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subjects" 
ON public.subjects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subjects" 
ON public.subjects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subjects" 
ON public.subjects FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ========================================================
-- 2. ASSIGNMENTS TABLE
-- ========================================================
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

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.assignments TO authenticated;

DROP POLICY IF EXISTS "Users can view their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can insert their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete their own assignments" ON public.assignments;

CREATE POLICY "Users can view their own assignments" 
ON public.assignments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assignments" 
ON public.assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assignments" 
ON public.assignments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assignments" 
ON public.assignments FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ========================================================
-- 3. STUDY PLANS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    study_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.study_plans TO authenticated;

DROP POLICY IF EXISTS "Users can view their own study plans" ON public.study_plans;
DROP POLICY IF EXISTS "Users can insert their own study plans" ON public.study_plans;
DROP POLICY IF EXISTS "Users can update their own study plans" ON public.study_plans;
DROP POLICY IF EXISTS "Users can delete their own study plans" ON public.study_plans;

CREATE POLICY "Users can view their own study plans" 
ON public.study_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study plans" 
ON public.study_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study plans" 
ON public.study_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study plans" 
ON public.study_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
