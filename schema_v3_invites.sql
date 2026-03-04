-- ==========================================
-- V3 MIGRATION: INVITE-ONLY SYSTEM
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'allowed_phones'
    ) THEN
        CREATE TABLE public.allowed_phones (
          phone TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          added_by UUID REFERENCES public.profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE public.allowed_phones ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allowed phones viewable by everyone"
          ON public.allowed_phones FOR SELECT USING (true);

        CREATE POLICY "Only admins can manage allowed phones"
          ON public.allowed_phones FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
          );
    END IF;
END
$$;

-- Insert the default GM Berna phone number
INSERT INTO public.allowed_phones (phone, name) 
VALUES ('+35191234429', 'GM Berna')
ON CONFLICT (phone) DO NOTHING;
