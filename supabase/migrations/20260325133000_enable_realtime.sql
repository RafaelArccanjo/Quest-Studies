-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulados;
ALTER PUBLICATION supabase_realtime ADD TABLE public.detailed_simulados;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_contests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.redacoes;
