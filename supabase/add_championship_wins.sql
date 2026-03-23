-- Add championship_wins (JSONB array) to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'championship_wins'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN championship_wins JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
