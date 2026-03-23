-- ==========================================
-- REPAIR PUSH NOTIFICATIONS & BROADCASTS
-- ==========================================

-- 1. Create broadcasts table for global announcements (if missing)
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Enable realtime for broadcasts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'broadcasts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;
    END IF;
END $$;

-- RLS for broadcasts
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can insert broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can insert broadcasts" 
ON public.broadcasts FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Everyone can read broadcasts" ON public.broadcasts;
CREATE POLICY "Everyone can read broadcasts" 
ON public.broadcasts FOR SELECT 
TO authenticated 
USING (true);


-- 2. Fix push_subscriptions RLS (Ensure WITH CHECK is present for upsert)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" 
ON public.push_subscriptions
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Success marker
COMMENT ON TABLE public.broadcasts IS 'Push notification repair applied successfully.';
