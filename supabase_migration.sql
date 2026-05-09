-- QUEST STUDIES - SUPABASE INITIALIZATION SCRIPT
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    study_cycle JSONB DEFAULT '[]'::jsonb,
    review_subjects JSONB DEFAULT '{}'::jsonb,
    subject_notes JSONB DEFAULT '{}'::jsonb,
    completed_cycles INTEGER DEFAULT 0,
    studied_minutes INTEGER DEFAULT 0,
    double_count BOOLEAN DEFAULT FALSE,
    cycle_history JSONB DEFAULT '[]'::jsonb,
    study_min INTEGER DEFAULT 25,
    break_min INTEGER DEFAULT 5,
    last_cycle_reset_at TIMESTAMPTZ,
    last_battle_reset_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPLETIONS (MISSIONS)
CREATE TABLE IF NOT EXISTS public.completions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    subject TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASK COMPLETIONS
CREATE TABLE IF NOT EXISTS public.task_completions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    date DATE DEFAULT CURRENT_DATE
);

-- 5. SIMULADOS
CREATE TABLE IF NOT EXISTS public.simulados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    score NUMERIC
);

-- 6. DETAILED SIMULADOS
CREATE TABLE IF NOT EXISTS public.detailed_simulados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    correct_answers INTEGER,
    total_questions INTEGER,
    percentage NUMERIC,
    subject_scores JSONB DEFAULT '{}'::jsonb
);

-- 7. USER CONTESTS
CREATE TABLE IF NOT EXISTS public.user_contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status TEXT DEFAULT 'Ativo'
);

-- 8. REDACOES
CREATE TABLE IF NOT EXISTS public.redacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    theme TEXT,
    date DATE NOT NULL,
    score NUMERIC,
    feedback TEXT,
    status TEXT DEFAULT 'Concluída'
);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redacoes ENABLE ROW LEVEL SECURITY;

-- 10. POLICIES

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Completions Policies
CREATE POLICY "Users can view their own completions" ON public.completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completions" ON public.completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completions" ON public.completions FOR DELETE USING (auth.uid() = user_id);

-- Task Completions Policies
CREATE POLICY "Users can view their own task completions" ON public.task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update their own task completions" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own task completions" ON public.task_completions FOR DELETE USING (auth.uid() = user_id);

-- Simulados Policies
CREATE POLICY "Users can view their own simulados" ON public.simulados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own simulados" ON public.simulados FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own simulados" ON public.simulados FOR DELETE USING (auth.uid() = user_id);

-- Detailed Simulados Policies
CREATE POLICY "Users can view their own detailed simulados" ON public.detailed_simulados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own detailed simulados" ON public.detailed_simulados FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own detailed simulados" ON public.detailed_simulados FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own detailed simulados" ON public.detailed_simulados FOR DELETE USING (auth.uid() = user_id);

-- User Contests Policies
CREATE POLICY "Users can view their own contests" ON public.user_contests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contests" ON public.user_contests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contests" ON public.user_contests FOR DELETE USING (auth.uid() = user_id);

-- Redacoes Policies
CREATE POLICY "Users can view their own redacoes" ON public.redacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own redacoes" ON public.redacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own redacoes" ON public.redacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own redacoes" ON public.redacoes FOR DELETE USING (auth.uid() = user_id);

-- 11. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
