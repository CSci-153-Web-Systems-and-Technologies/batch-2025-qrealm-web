-- Create event_codes table for QR codes
CREATE TABLE IF NOT EXISTS public.event_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NULL REFERENCES public.events(id) ON DELETE SET NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS event_codes_event_id_idx ON public.event_codes(event_id);
CREATE INDEX IF NOT EXISTS event_codes_code_idx ON public.event_codes(code);

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE events, event_codes;