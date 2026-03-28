-- ==========================================
-- FIX PUSH DELIVERY (ALLOW ADMIN TO READ SUBS)
-- ==========================================

-- Allow admins to see ALL subscriptions so the broadcast action can find them
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

-- Ensure everyone can still manage their own subs (the FOR ALL policy we had before)
-- Just in case, re-verify the existing policy:
-- DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.push_subscriptions;
-- CREATE POLICY "Users can manage own subscriptions" 
-- ON public.push_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.push_subscriptions IS 'Admin access for push broadcasts fixed.';
