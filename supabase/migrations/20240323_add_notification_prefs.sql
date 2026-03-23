-- Add notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "new_games": true,
    "season_results": true,
    "rank_ups": true,
    "reminders": true
}'::JSONB;

-- Update existing profiles to have default preferences
UPDATE public.profiles 
SET notification_preferences = '{
    "new_games": true,
    "season_results": true,
    "rank_ups": true,
    "reminders": true
}'::JSONB
WHERE notification_preferences IS NULL;
