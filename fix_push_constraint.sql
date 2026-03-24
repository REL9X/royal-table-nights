-- ==========================================
-- FIX PUSH NOTIFICATION SUBSCRIPTIONS
-- ==========================================

-- The upsert command on the client side requires a UNIQUE constraint on the conflict target (user_id, endpoint).
-- Without this constraint, device registrations fail silently or throw an error in the console.

ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_endpoint_key;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_user_endpoint_key UNIQUE (user_id, endpoint);

COMMENT ON TABLE public.push_subscriptions IS 'Push notifications constraint added. Devices can now register seamlessly.';
