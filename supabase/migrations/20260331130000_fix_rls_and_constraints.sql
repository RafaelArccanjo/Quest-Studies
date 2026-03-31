-- Migration to fix missing RLS policies and add constraints for robust upserts
-- Add UPDATE policies for all tables that were missing them
DO $$ 
BEGIN
    -- Completions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'completions' AND policyname = 'Users can update their own completions') THEN
        CREATE POLICY "Users can update their own completions" ON public.completions FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Task Completions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_completions' AND policyname = 'Users can update their own task completions') THEN
        CREATE POLICY "Users can update their own task completions" ON public.task_completions FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Simulados
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'simulados' AND policyname = 'Users can update their own simulados') THEN
        CREATE POLICY "Users can update their own simulados" ON public.simulados FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Detailed Simulados
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'detailed_simulados' AND policyname = 'Users can update their own detailed simulados') THEN
        CREATE POLICY "Users can update their own detailed simulados" ON public.detailed_simulados FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User Contests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_contests' AND policyname = 'Users can update their own contests') THEN
        CREATE POLICY "Users can update their own contests" ON public.user_contests FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Redacoes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redacoes' AND policyname = 'Users can update their own redacoes') THEN
        CREATE POLICY "Users can update their own redacoes" ON public.redacoes FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add unique constraints to allow upserts without providing the 'id' primary key if needed
-- This also serves as a safety net for data integrity
ALTER TABLE public.completions DROP CONSTRAINT IF EXISTS completions_user_date_subject_key;
ALTER TABLE public.completions ADD CONSTRAINT completions_user_date_subject_key UNIQUE (user_id, date, subject);

ALTER TABLE public.task_completions DROP CONSTRAINT IF EXISTS task_completions_user_subject_task_key;
ALTER TABLE public.task_completions ADD CONSTRAINT task_completions_user_subject_task_key UNIQUE (user_id, subject, task_id);
