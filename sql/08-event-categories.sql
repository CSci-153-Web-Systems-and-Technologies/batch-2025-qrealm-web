-- Create event_categories reference table (for future admin management)
CREATE TABLE IF NOT EXISTS public.event_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined categories
INSERT INTO public.event_categories (name) VALUES
  ('Sports'),
  ('Academics'),
  ('Arts'),
  ('Music'),
  ('Theater'),
  ('Community'),
  ('Fundraiser'),
  ('Field Trip'),
  ('Assembly'),
  ('Graduation'),
  ('Holiday'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for categories (read-only for all users)
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.event_categories
  FOR SELECT USING (is_active = true);