-- Ensure trigger exists for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  file_path TEXT,
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Materials are viewable by everyone" ON public.materials;
DROP POLICY IF EXISTS "Authenticated users can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON public.materials;

CREATE POLICY "Materials are viewable by everyone" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON public.materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON public.materials FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS materials_subject_idx ON public.materials(subject);
CREATE INDEX IF NOT EXISTS materials_grade_idx ON public.materials(grade_level);

INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Material files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own material files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own material files" ON storage.objects;

CREATE POLICY "Material files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Authenticated users can upload materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own material files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own material files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);