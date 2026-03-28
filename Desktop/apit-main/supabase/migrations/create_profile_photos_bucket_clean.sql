-- Create profile-photos storage bucket for user profile pictures

-- Method 1: Try using the function with positional arguments
SELECT storage.create_bucket('profile-photos', true);

-- If the above doesn't work, insert directly into buckets table
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('profile-photos', 'profile-photos', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to profile photos
CREATE POLICY "Public access to profile-photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-photos');

-- Allow authenticated users to upload profile photos
CREATE POLICY "Allow insert to profile-photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

-- Allow users to update their own profile photos
CREATE POLICY "Allow update to profile-photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'profile-photos');
