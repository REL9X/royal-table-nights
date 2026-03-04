-- ==========================================
-- V4 MIGRATION: STORAGE BUCKETS (AVATARS)
-- ==========================================

DO $$
BEGIN
    -- Check if avatars bucket exists, if not create it securely
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('avatars', 'avatars', true);
    END IF;
END
$$;

-- Allow public access to any files in the "avatars" bucket
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload new files
CREATE POLICY "Authenticated users can upload avatars."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner AND bucket_id = 'avatars');
