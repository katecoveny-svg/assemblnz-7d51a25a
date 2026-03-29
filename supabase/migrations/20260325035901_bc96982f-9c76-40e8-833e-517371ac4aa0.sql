
-- Health checks table for monitoring
CREATE TABLE public.health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamptz NOT NULL DEFAULT now(),
  service_name text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  response_time_ms integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view health checks" ON public.health_checks
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert health checks" ON public.health_checks
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Lead activity table
CREATE TABLE public.lead_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  activity_type text NOT NULL,
  details text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view lead activity" ON public.lead_activity
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service can insert lead activity" ON public.lead_activity
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Add lead_score column to contact_submissions
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS lead_score integer,
  ADD COLUMN IF NOT EXISTS lead_status text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS follow_up_sent boolean DEFAULT false;

-- Index for efficient health check queries
CREATE INDEX idx_health_checks_checked_at ON public.health_checks (checked_at DESC);
CREATE INDEX idx_health_checks_service ON public.health_checks (service_name, checked_at DESC);
CREATE INDEX idx_lead_activity_submission ON public.lead_activity (submission_id, created_at DESC);
