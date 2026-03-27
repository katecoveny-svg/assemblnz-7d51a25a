
-- Response cache table
CREATE TABLE IF NOT EXISTS public.response_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  response_text TEXT NOT NULL,
  model_used TEXT,
  tokens_saved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cache_key ON public.response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expiry ON public.response_cache(expires_at);
ALTER TABLE public.response_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cache readable by authenticated" ON public.response_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can manage cache" ON public.response_cache FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Agent analytics table
CREATE TABLE IF NOT EXISTS public.agent_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  session_id TEXT,
  message_count INTEGER DEFAULT 1,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  model_used TEXT,
  complexity TEXT,
  from_cache BOOLEAN DEFAULT false,
  estimated_cost_nzd FLOAT DEFAULT 0,
  response_time_ms INTEGER,
  error BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_agent ON public.agent_analytics(agent_name);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.agent_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.agent_analytics(user_id);
ALTER TABLE public.agent_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own analytics" ON public.agent_analytics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert analytics" ON public.agent_analytics FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  messages_used INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_nzd FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period)
);
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own usage" ON public.usage_tracking FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service can manage usage" ON public.usage_tracking FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- User notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.user_notifications(read);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.user_notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.user_notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
