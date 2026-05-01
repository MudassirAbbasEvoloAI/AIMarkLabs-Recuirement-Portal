-- Run this once in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS positions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  department   TEXT NOT NULL,
  location     TEXT NOT NULL,
  type         TEXT NOT NULL,
  experience   TEXT NOT NULL,
  description  TEXT NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  salary       TEXT DEFAULT 'Competitive',
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL,
  details    TEXT NOT NULL,
  status     TEXT DEFAULT 'new',
  source     TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS applications (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id    TEXT,
  position_title TEXT,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  experience     TEXT DEFAULT '',
  role   TEXT DEFAULT '',
  details        TEXT DEFAULT '',
  resume_name    TEXT,
  resume_url     TEXT,
  status         TEXT DEFAULT 'pending',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ
);

-- Disable RLS (internal admin tool — no user auth)
ALTER TABLE positions    DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads        DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
