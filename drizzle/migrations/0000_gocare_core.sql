CREATE TABLE public.patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text, birth_year int, gender text, guardian_name text, emergency_phone text, citizen_id text, service_need text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_profiles TO authenticated;
GRANT ALL ON public.patient_profiles TO service_role;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.patient_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.service_orders TO authenticated;
GRANT ALL ON public.service_orders TO service_role;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.service_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own orders insert" ON public.service_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.triage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pain_level int NOT NULL DEFAULT 0,
  urgent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.triage_reports TO authenticated;
GRANT ALL ON public.triage_reports TO service_role;
ALTER TABLE public.triage_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own triage read" ON public.triage_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own triage insert" ON public.triage_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);