-- Create broadcasts table for global announcements
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Enable realtime for broadcasts
ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;

-- RLS: Only admins can insert, everyone can read
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert broadcasts" 
ON public.broadcasts FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Everyone can read broadcasts" 
ON public.broadcasts FOR SELECT 
TO authenticated 
USING (true);
