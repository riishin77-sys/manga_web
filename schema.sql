-- Drop existing tables if needed
-- DROP TABLE IF EXISTS chapters;
-- DROP TABLE IF EXISTS mangas;

-- Create the mangas table
CREATE TABLE mangas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  cover_url text,
  category text,
  story text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the chapters table
CREATE TABLE chapters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  manga_id uuid NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
  chapter_number numeric NOT NULL,
  title text,
  drive_folder_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(manga_id, chapter_number)
);

-- Set up Row Level Security (RLS)
ALTER TABLE mangas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Allow public read access to mangas
CREATE POLICY "Public profiles are viewable by everyone."
  ON mangas FOR SELECT USING (true);

-- Allow public read access to chapters
CREATE POLICY "Public chapters are viewable by everyone."
  ON chapters FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete mangas and chapters
-- For Admin pages (assuming you use Supabase Auth)
CREATE POLICY "Authenticated users can insert mangas."
  ON mangas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update mangas."
  ON mangas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete mangas."
  ON mangas FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert chapters."
  ON chapters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update chapters."
  ON chapters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete chapters."
  ON chapters FOR DELETE USING (auth.role() = 'authenticated');
