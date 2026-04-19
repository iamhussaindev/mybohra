-- Optional Supabase Auth for RSVP creators: tie events to app device_id when created_by is null.
-- Run after the original rsvp_schema.sql (or merge into a fresh deploy).

ALTER TABLE public.rsvp_events DROP CONSTRAINT IF EXISTS rsvp_events_created_by_fkey;

ALTER TABLE public.rsvp_events
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.rsvp_events
  ADD COLUMN IF NOT EXISTS creator_device_id text;

ALTER TABLE public.rsvp_events
  ADD CONSTRAINT rsvp_events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.rsvp_events DROP CONSTRAINT IF EXISTS rsvp_events_creator_check;

ALTER TABLE public.rsvp_events
  ADD CONSTRAINT rsvp_events_creator_check CHECK (
    created_by IS NOT NULL
    OR (
      creator_device_id IS NOT NULL
      AND char_length(creator_device_id) >= 8
    )
  );

CREATE INDEX IF NOT EXISTS rsvp_events_creator_device_id_idx ON public.rsvp_events (creator_device_id);

COMMENT ON COLUMN public.rsvp_events.creator_device_id IS 'App install device id when created without Supabase Auth; set via Edge Function rsvp-create.';
