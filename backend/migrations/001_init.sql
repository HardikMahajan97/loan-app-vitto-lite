-- Migration Script (run - psql -h localhost -p 5432 -U <database_user> -d <database_name> -f 001_init.sql)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM: Application status
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: Preferred language
DO $$ BEGIN
  CREATE TYPE preferred_language AS ENUM ('Hindi', 'Tamil', 'Telugu', 'Marathi', 'English');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- TABLE: applications
CREATE TABLE IF NOT EXISTS applications (
  id           UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(120)        NOT NULL CHECK (char_length(TRIM(name)) >= 2),
  mobile       CHAR(10)            NOT NULL CHECK (mobile ~ '^[6-9][0-9]{9}$'),
  amount       NUMERIC(12, 2)      NOT NULL CHECK (amount >= 1000 AND amount <= 10000000),
  purpose      VARCHAR(200)        NOT NULL CHECK (char_length(TRIM(purpose)) >= 5),
  language     preferred_language  NOT NULL,
  status       application_status  NOT NULL DEFAULT 'pending',
  email        VARCHAR(254),
  created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- UNIQUE: One active application per mobile (pending/approved)
-- Allows re-apply only after rejection
CREATE UNIQUE INDEX IF NOT EXISTS uq_mobile_active
  ON applications (mobile)
  WHERE status IN ('pending', 'approved');

-- INDEXES for common query patterns
CREATE INDEX IF NOT EXISTS idx_applications_status      ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at  ON applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_mobile      ON applications (mobile);
CREATE INDEX IF NOT EXISTS idx_applications_name_trgm   ON applications USING gin (name gin_trgm_ops);

-- TRIGGER: auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable pg_trgm for ILIKE / full-text search (best-effort)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
