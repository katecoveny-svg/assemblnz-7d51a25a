
ALTER TABLE public.agent_prompts ADD CONSTRAINT agent_prompts_agent_name_key UNIQUE (agent_name);

CREATE TABLE IF NOT EXISTS public.sms_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  kete TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  provider TEXT DEFAULT 'tnz_group',
  whatsapp_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sms_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage channels" ON public.sms_channels
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
