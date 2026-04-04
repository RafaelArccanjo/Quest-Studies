-- Add reset columns to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS last_cycle_reset_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_battle_reset_at TIMESTAMPTZ;
