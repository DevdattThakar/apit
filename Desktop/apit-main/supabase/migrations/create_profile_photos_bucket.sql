-- Create profile-photos storage bucket for user profile pictures
-- Run this in Supabase SQL Editor

-- Method 1: Using storage.createBucket function (recommended)
SELECT storage.create_bucket('profile-photos', public => true);

-- If the above doesn't work, use direct insert:
-- INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
-- VALUES ('profile-photos', 'profile-photos', true, now(), now())
-- ON CONFLICT (id) DO NOTHING;

-- Allow public read access to profile photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public access to profile-photos' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public access to profile-photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profile-photos');
  END IF;
END
$$;

-- Allow authenticated users to upload profile photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow insert to profile-photos' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow insert to profile-photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'profile-photos');
  END IF;
END
$$;

-- Allow users to update their own profile photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow update to profile-photos' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow update to profile-photos"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'profile-photos');
  END IF;
END
$$;
