-- AAAIP — extend audit export domain check to allow the Arataki pilot
-- Pilot 10 — Arataki (automotive dealer intelligence) submits audit
-- logs with domain = 'arataki'. Rebuild the CHECK constraint to allow
-- it alongside every existing pilot.

ALTER TABLE public.aaaip_audit_exports
  DROP CONSTRAINT IF EXISTS aaaip_audit_exports_domain_check;

ALTER TABLE public.aaaip_audit_exports
  ADD CONSTRAINT aaaip_audit_exports_domain_check
  CHECK (domain IN (
    'clinic',
    'robot',
    'science',
    'community',
    'waihanga',
    'pikau',
    'manaaki',
    'auaha',
    'arataki',
    'toro'
  ));
