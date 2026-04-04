
CREATE TABLE public.travel_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  travellers INTEGER DEFAULT 2,
  budget_nzd INTEGER,
  interests TEXT[] DEFAULT '{}',
  accommodation_style TEXT DEFAULT 'mixed',
  itinerary JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  image_url TEXT,
  rating INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.travel_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own itineraries"
  ON public.travel_itineraries FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own destinations"
  ON public.saved_destinations FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_itineraries_user ON public.travel_itineraries(user_id);
CREATE INDEX idx_destinations_user ON public.saved_destinations(user_id);
