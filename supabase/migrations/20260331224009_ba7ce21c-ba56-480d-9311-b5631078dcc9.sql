
CREATE TABLE public.onboarding_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT,
  selected_pack TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  step_1_at TIMESTAMP WITH TIME ZONE,
  step_2_at TIMESTAMP WITH TIME ZONE,
  step_3_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding sessions"
  ON public.onboarding_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own onboarding sessions"
  ON public.onboarding_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding sessions"
  ON public.onboarding_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert onboarding sessions"
  ON public.onboarding_sessions FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon can view by session_key"
  ON public.onboarding_sessions FOR SELECT TO anon
  USING (user_id IS NULL AND session_key IS NOT NULL);

CREATE POLICY "Anon can update by session_key"
  ON public.onboarding_sessions FOR UPDATE TO anon
  USING (user_id IS NULL AND session_key IS NOT NULL)
  WITH CHECK (user_id IS NULL AND session_key IS NOT NULL);

CREATE INDEX idx_onboarding_sessions_user ON public.onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_key ON public.onboarding_sessions(session_key);
