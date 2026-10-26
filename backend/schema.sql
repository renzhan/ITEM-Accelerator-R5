-- Run with: wrangler d1 execute iss-r5-submissions --remote --file=backend/schema.sql
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('prework', 'convergence')),
  record_id TEXT NOT NULL UNIQUE,
  workshop TEXT NOT NULL CHECK (workshop = 'ISS-R5'),
  fields_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_kind ON submissions(kind);
