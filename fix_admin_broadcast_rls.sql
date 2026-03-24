-- ==========================================
-- FIX: ALLOW ADMINS TO READ ALL PUSH SUBSCRIPTIONS
-- ==========================================
-- This is necessary for Global Broadcasts to work when triggered by an Admin.
-- Prevents RLS from filtering out other users' devices.

DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.push_subscriptions;

CREATE POLICY "Admins can read all subscriptions" 
ON public.push_subscriptions FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Success marker
COMMENT ON POLICY "Admins can read all subscriptions" ON public.push_subscriptions IS 'Applied to fix Global Broadcasts visibility.';
