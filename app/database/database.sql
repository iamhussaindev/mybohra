-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_duas (
  id bigint NOT NULL DEFAULT nextval('daily_daus_id_seq'::regclass),
  date integer NOT NULL CHECK (date >= 1 AND date <= 31),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  library_id bigint NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_duas_pkey PRIMARY KEY (id),
  CONSTRAINT daily_daus_library_id_fkey FOREIGN KEY (library_id) REFERENCES public.library(id)
);
CREATE TABLE public.data (
  id integer NOT NULL DEFAULT nextval('data_id_seq'::regclass),
  key character varying NOT NULL UNIQUE,
  value character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT data_pkey PRIMARY KEY (id)
);
CREATE TABLE public.library (
  id bigint NOT NULL DEFAULT nextval('library_id_seq'::regclass),
  name text NOT NULL,
  description text,
  audio_url text,
  pdf_url text,
  youtube_url text,
  album USER-DEFINED,
  metadata jsonb DEFAULT '{}'::jsonb,
  tags ARRAY DEFAULT ARRAY[]::text[],
  categories ARRAY DEFAULT ARRAY[]::text[],
  search_text text,
  search_vector tsvector,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT library_pkey PRIMARY KEY (id)
);
CREATE TABLE public.location (
  id integer NOT NULL DEFAULT nextval('location_id_seq'::regclass),
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['city'::character varying, 'state'::character varying, 'country'::character varying, 'region'::character varying, 'spot'::character varying, 'other'::character varying]::text[])),
  city character varying NOT NULL,
  country character varying NOT NULL,
  latitude double precision NOT NULL CHECK (latitude >= '-90'::integer::double precision AND latitude <= 90::double precision),
  longitude double precision NOT NULL CHECK (longitude >= '-180'::integer::double precision AND longitude <= 180::double precision),
  timezone character varying NOT NULL,
  state character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT location_pkey PRIMARY KEY (id)
);
CREATE TABLE public.miqaat (
  id bigint NOT NULL DEFAULT nextval('miqaat_id_seq'::regclass),
  name text NOT NULL,
  description text,
  date integer CHECK (date IS NULL OR date >= 1 AND date <= 31),
  month integer CHECK (month IS NULL OR month >= 1 AND month <= 12),
  location text,
  type USER-DEFINED,
  date_night integer CHECK (date_night IS NULL OR date_night >= 1 AND date_night <= 31),
  month_night integer CHECK (month_night IS NULL OR month_night >= 1 AND month_night <= 12),
  priority integer DEFAULT 0,
  important boolean DEFAULT false,
  phase USER-DEFINED NOT NULL DEFAULT 'DAY'::phase_enum,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  html text,
  CONSTRAINT miqaat_pkey PRIMARY KEY (id)
);
CREATE TABLE public.miqaat_library (
  miqaat_id bigint NOT NULL,
  library_id bigint NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT miqaat_library_pkey PRIMARY KEY (miqaat_id, library_id),
  CONSTRAINT miqaat_library_miqaat_id_fkey FOREIGN KEY (miqaat_id) REFERENCES public.miqaat(id),
  CONSTRAINT miqaat_library_library_id_fkey FOREIGN KEY (library_id) REFERENCES public.library(id)
);
CREATE TABLE public.tasbeeh (
  id bigint NOT NULL DEFAULT nextval('tasbeeh_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  text character varying,
  arabic_text character varying,
  image character varying,
  audio character varying,
  description character varying,
  count integer DEFAULT 0,
  type USER-DEFINED NOT NULL,
  tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tasbeeh_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying,
  phone_number character varying UNIQUE,
  country character varying,
  email character varying UNIQUE,
  unverfied_email character varying,
  roles ARRAY NOT NULL DEFAULT '{user}'::character varying[],
  status character varying DEFAULT 'CREATED'::character varying,
  CONSTRAINT user_pkey PRIMARY KEY (id)
);