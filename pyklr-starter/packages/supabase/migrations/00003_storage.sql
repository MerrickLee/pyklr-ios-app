-- ============================================================
-- PYKLR — Storage Buckets & Policies
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('court-photos', 'court-photos', true),
  ('avatars', 'avatars', true),
  ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for court-photos
CREATE POLICY "court_photos_select" ON storage.objects FOR SELECT USING (bucket_id = 'court-photos');
CREATE POLICY "court_photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'court-photos' AND auth.role() = 'authenticated');
CREATE POLICY "court_photos_delete" ON storage.objects FOR DELETE USING (bucket_id = 'court-photos' AND auth.role() = 'authenticated');

-- RLS for avatars
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- RLS for forum-images
CREATE POLICY "forum_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'forum-images');
CREATE POLICY "forum_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');
CREATE POLICY "forum_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'forum-images' AND auth.role() = 'authenticated');
