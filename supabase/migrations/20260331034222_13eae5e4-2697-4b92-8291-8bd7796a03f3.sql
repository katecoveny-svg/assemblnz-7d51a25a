-- SMS phone number to agent mappings
CREATE TABLE sms_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twilio_number TEXT NOT NULL UNIQUE,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SMS conversations (one per phone number + agent pair)
CREATE TABLE sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  sms_phone_number_id UUID REFERENCES sms_phone_numbers(id),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(phone_number, agent_id)
);

-- Individual SMS messages
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES sms_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  body TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sms_conversations_phone ON sms_conversations(phone_number);
CREATE INDEX idx_sms_conversations_agent ON sms_conversations(agent_id);
CREATE INDEX idx_sms_messages_conversation ON sms_messages(conversation_id);
CREATE INDEX idx_sms_messages_created ON sms_messages(created_at DESC);
CREATE INDEX idx_sms_phone_numbers_twilio ON sms_phone_numbers(twilio_number);

-- RLS
ALTER TABLE sms_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
CREATE POLICY "Service role full access on sms_phone_numbers" ON sms_phone_numbers FOR ALL USING (true);
CREATE POLICY "Service role full access on sms_conversations" ON sms_conversations FOR ALL USING (true);
CREATE POLICY "Service role full access on sms_messages" ON sms_messages FOR ALL USING (true);

-- Validation trigger for direction
CREATE OR REPLACE FUNCTION validate_sms_direction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction NOT IN ('inbound', 'outbound') THEN
    RAISE EXCEPTION 'direction must be inbound or outbound';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_sms_messages_direction
  BEFORE INSERT OR UPDATE ON sms_messages
  FOR EACH ROW EXECUTE FUNCTION validate_sms_direction();

-- Auto-update timestamps
CREATE TRIGGER sms_conversations_updated
  BEFORE UPDATE ON sms_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sms_phone_numbers_updated
  BEFORE UPDATE ON sms_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();