-- RSVP (jaman) tables, enums, and RLS.
-- Run in Supabase SQL Editor after verifying `public.miqaat` exists.

CREATE TYPE public.rsvp_event_type AS ENUM (
  'miqaat',
  'darees',
  'majlis',
  'shadi',
  'birthday'
);

CREATE TYPE public.rsvp_host_mode AS ENUM (
  'jamaat',
  'individual'
);

CREATE TYPE public.rsvp_response_status AS ENUM (
  'yes',
  'no',
  'maybe'
);

CREATE TABLE public.rsvp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  event_type public.rsvp_event_type NOT NULL,
  host_mode public.rsvp_host_mode NOT NULL,
  scheduled_at timestamptz NOT NULL,
  message text,
  title text,
  host_label text NOT NULL DEFAULT '',
  linked_miqaat_id integer REFERENCES public.miqaat (id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  creator_device_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  CONSTRAINT rsvp_events_slug_format CHECK (
    char_length(slug) >= 8
    AND char_length(slug) <= 32
    AND slug ~ '^[a-z0-9]+$'
  ),
  CONSTRAINT rsvp_events_creator_check CHECK (
    created_by IS NOT NULL
    OR (
      creator_device_id IS NOT NULL
      AND char_length(creator_device_id) >= 8
    )
  )
);

CREATE INDEX rsvp_events_created_by_idx ON public.rsvp_events (created_by);
CREATE INDEX rsvp_events_creator_device_id_idx ON public.rsvp_events (creator_device_id);
CREATE INDEX rsvp_events_scheduled_at_idx ON public.rsvp_events (scheduled_at);

CREATE TABLE public.rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.rsvp_events (id) ON DELETE CASCADE,
  status public.rsvp_response_status NOT NULL,
  headcount integer NOT NULL DEFAULT 1,
  guest_name text,
  responder_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rsvp_responses_headcount_range CHECK (
    headcount >= 1
    AND headcount <= 50
  )
);

CREATE INDEX rsvp_responses_event_id_idx ON public.rsvp_responses (event_id);

ALTER TABLE public.rsvp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

-- Creators manage their own events (public reads go through Edge Function + service role).
CREATE POLICY "rsvp_events_select_own"
  ON public.rsvp_events
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "rsvp_events_insert_own"
  ON public.rsvp_events
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "rsvp_events_update_own"
  ON public.rsvp_events
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "rsvp_events_delete_own"
  ON public.rsvp_events
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Hosts can read responses for events they own.
CREATE POLICY "rsvp_responses_select_host"
  ON public.rsvp_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rsvp_events e
      WHERE e.id = event_id
        AND e.created_by = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE on rsvp_responses for anon/authenticated clients;
-- use Edge Function `rsvp-public` with service role.

COMMENT ON TABLE public.rsvp_events IS 'Community jaman / RSVP events; public get/respond via Edge Function rsvp-public.';
COMMENT ON TABLE public.rsvp_responses IS 'RSVP answers; inserted via Edge Function rsvp-public.';
