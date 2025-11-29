-- Fix event_codes table to cascade delete when events are deleted
ALTER TABLE public.event_codes 
DROP CONSTRAINT IF EXISTS event_codes_event_id_fkey;

ALTER TABLE public.event_codes 
ADD CONSTRAINT event_codes_event_id_fkey 
FOREIGN KEY (event_id) 
REFERENCES public.events(id) 
ON DELETE CASCADE;

-- Verify the change
COMMENT ON CONSTRAINT event_codes_event_id_fkey ON public.event_codes IS 
'Ensures event codes are automatically deleted when their parent event is deleted';

-----------------------------------

-- Clean up any existing orphaned records from previous deletions
DELETE FROM public.event_codes WHERE event_id IS NULL;