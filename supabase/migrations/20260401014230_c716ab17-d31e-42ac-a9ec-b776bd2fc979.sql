
-- Unified messaging conversations table
CREATE TABLE public.messaging_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'rcs')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),
  assigned_agent TEXT,
  assigned_pack TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Unified messaging messages table
CREATE TABLE public.messaging_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.messaging_conversations(id) ON DELETE CASCADE,
  tnz_message_id TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT,
  to_number TEXT,
  body TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'rcs')),
  media_url TEXT,
  media_type TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'sent', 'delivered', 'read', 'failed')),
  agent_used TEXT,
  model_used TEXT,
  compliance_checked BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  tnz_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Message templates table
CREATE TABLE public.messaging_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  channel TEXT CHECK (channel IN ('sms', 'whatsapp', 'both')),
  language TEXT DEFAULT 'en',
  category TEXT CHECK (category IN ('marketing', 'utility', 'authentication', 'greeting')),
  body_template TEXT NOT NULL,
  variables TEXT[],
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_msg_conversations_phone ON public.messaging_conversations(phone_number);
CREATE INDEX idx_msg_conversations_channel ON public.messaging_conversations(channel);
CREATE INDEX idx_msg_messages_conversation ON public.messaging_messages(conversation_id);
CREATE INDEX idx_msg_messages_created ON public.messaging_messages(created_at DESC);
CREATE INDEX idx_msg_messages_tnz_id ON public.messaging_messages(tnz_message_id);

-- Enable RLS
ALTER TABLE public.messaging_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for messaging_conversations
CREATE POLICY "Authenticated users can view conversations"
  ON public.messaging_conversations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert conversations"
  ON public.messaging_conversations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update conversations"
  ON public.messaging_conversations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Service role needs full access for edge functions
CREATE POLICY "Service role full access conversations"
  ON public.messaging_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS policies for messaging_messages
CREATE POLICY "Authenticated users can view messages"
  ON public.messaging_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON public.messaging_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Service role full access messages"
  ON public.messaging_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS policies for messaging_templates
CREATE POLICY "Authenticated users can view templates"
  ON public.messaging_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access templates"
  ON public.messaging_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_conversations;

-- Seed default templates
INSERT INTO public.messaging_templates (template_name, channel, category, body_template, variables, approved) VALUES
('greeting', 'both', 'greeting', 'Kia ora! Welcome to Assembl. I''m here to help. What can I do for you today?', '{}', true),
('after_hours', 'both', 'utility', 'Kia ora! We''ve received your message. Our team will respond during business hours (8am-6pm NZST). For urgent enquiries, visit assembl.co.nz', '{}', true),
('agent_handoff', 'both', 'utility', 'I''m connecting you with {{agent_name}} who specialises in {{area}}. One moment...', '{agent_name,area}', true),
('sms_help', 'sms', 'utility', 'Kia ora! Reply HELP for options or ask your question. We''ll respond shortly.', '{}', true),
('opt_out_confirm', 'both', 'utility', 'You''ve been unsubscribed from Assembl messages. Text START to re-subscribe anytime.', '{}', true);
