-- Create enhanced events table with category reference
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Date & Time
  event_date DATE,
  event_time TIME,
  
  -- Event Details
  category_id INTEGER REFERENCES public.event_categories(id) ON DELETE SET NULL,
  custom_category TEXT,
  organizer VARCHAR(255),
  location TEXT,
  
  -- Media & Assets
  cover_image_url TEXT,
  
  -- Event Configuration
  max_photos INTEGER DEFAULT 100,
  expected_attendees INTEGER,
  allow_photo_upload BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  -- Security & Tracking
  ip_address INET,
  
  -- Ownership
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX events_created_by_idx ON public.events(created_by);
CREATE INDEX events_event_date_idx ON public.events(event_date);
CREATE INDEX events_is_active_idx ON public.events(is_active);
CREATE INDEX events_is_public_idx ON public.events(is_public);
CREATE INDEX events_category_id_idx ON public.events(category_id);

-- Trigger function to update updated_at automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to events table
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();