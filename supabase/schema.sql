-- =============================================================================
-- Qodewk — Supabase Schema Migration (receipts)
-- Run this in your Supabase Project -> SQL Editor -> Click 'Run'
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT UNIQUE NOT NULL,
    project_alias TEXT NOT NULL,
    repo_hash TEXT NOT NULL,
    branch_hash TEXT,
    files_changed INTEGER NOT NULL,
    insertions INTEGER NOT NULL,
    deletions INTEGER NOT NULL,
    estimated_tokens INTEGER NOT NULL,
    estimated_cost NUMERIC(10, 4) NOT NULL,
    provider TEXT NOT NULL,
    model TEXT,
    confidence NUMERIC(3, 2) NOT NULL,
    payload_json JSONB NOT NULL,
    claim_token_hash TEXT,
    is_public BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '365 days'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instant public ID lookup
CREATE INDEX IF NOT EXISTS idx_receipts_public_id ON public.receipts (public_id);

-- Index for project queries
CREATE INDEX IF NOT EXISTS idx_receipts_project_alias ON public.receipts (project_alias);

-- Enable Row Level Security (RLS)
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to receipts marked as public
DROP POLICY IF EXISTS "Allow public read access" ON public.receipts;
CREATE POLICY "Allow public read access" ON public.receipts
    FOR SELECT USING (is_public = true);

-- Writes are reserved for the serverless API, which uses the service role key.
-- The service role bypasses RLS, so it needs no policy. An earlier version of this
-- file created "Allow service role insert" FOR ALL USING (true) without a role,
-- which let anyone holding the anon key read, modify or delete every receipt.
-- Drop it on existing databases by re-running this file.
DROP POLICY IF EXISTS "Allow service role insert" ON public.receipts;
