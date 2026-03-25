-- Initial Schema for Quest Studies

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completions (Missions)
CREATE TABLE IF NOT EXISTS public.completions (
  id TEXT PRIMARY KEY, -- user_id + date + subject
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Completions
CREATE TABLE IF NOT EXISTS public.task_completions (
  id TEXT PRIMARY KEY, -- user_id + subject + task_id
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  task_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulados
CREATE TABLE IF NOT EXISTS public.simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  score NUMERIC NOT NULL,
  target_score NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed Simulados
CREATE TABLE IF NOT EXISTS public.detailed_simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  contest_id TEXT NOT NULL,
  subject_scores JSONB NOT NULL,
  total_score NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Contests
CREATE TABLE IF NOT EXISTS public.user_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cutoff_score NUMERIC NOT NULL,
  warning_score NUMERIC NOT NULL,
  subjects JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redacoes
CREATE TABLE IF NOT EXISTS public.redacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  score NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: only user can read/write their own profile
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Completions: only user can read/write their own missions
CREATE POLICY "Users can view their own completions" ON public.completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completions" ON public.completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completions" ON public.completions FOR DELETE USING (auth.uid() = user_id);

-- Task Completions
CREATE POLICY "Users can view their own task completions" ON public.task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own task completions" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own task completions" ON public.task_completions FOR DELETE USING (auth.uid() = user_id);

-- Simulados
CREATE POLICY "Users can view their own simulados" ON public.simulados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own simulados" ON public.simulados FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own simulados" ON public.simulados FOR DELETE USING (auth.uid() = user_id);

-- Detailed Simulados
CREATE POLICY "Users can view their own detailed simulados" ON public.detailed_simulados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own detailed simulados" ON public.detailed_simulados FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own detailed simulados" ON public.detailed_simulados FOR DELETE USING (auth.uid() = user_id);

-- User Contests
CREATE POLICY "Users can view their own contests" ON public.user_contests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contests" ON public.user_contests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contests" ON public.user_contests FOR DELETE USING (auth.uid() = user_id);

-- Redacoes
CREATE POLICY "Users can view their own redacoes" ON public.redacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own redacoes" ON public.redacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own redacoes" ON public.redacoes FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
