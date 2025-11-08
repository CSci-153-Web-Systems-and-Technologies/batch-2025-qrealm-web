-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_codes ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Public can view public events" ON public.events
  FOR SELECT USING (is_public = true);

-- Event codes policies
CREATE POLICY "Users can view own event codes" ON public.event_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_codes.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create event codes" ON public.event_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_codes.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Public can view event codes for public events" ON public.event_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_codes.event_id 
      AND events.is_public = true
    )
  );
