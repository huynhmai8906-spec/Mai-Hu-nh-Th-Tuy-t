-- GoCare shared database: web khách hàng (Mai-Hu-nh-Th-Tuy-t) + web quản lý (quanlyweb)
-- Chạy toàn bộ file này một lần trong Supabase → SQL Editor. Chạy lại nhiều lần vẫn an toàn.

-- ============ 1. Bảng gốc của web khách hàng (giống drizzle/migrations/0000_gocare_core.sql) ============
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text, birth_year int, gender text, guardian_name text, emergency_phone text, citizen_id text, service_need text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_profiles TO authenticated;
GRANT ALL ON public.patient_profiles TO service_role;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own profile" ON public.patient_profiles;
CREATE POLICY "own profile" ON public.patient_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.service_orders (
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
DROP POLICY IF EXISTS "own orders read" ON public.service_orders;
DROP POLICY IF EXISTS "own orders insert" ON public.service_orders;
CREATE POLICY "own orders read" ON public.service_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own orders insert" ON public.service_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.triage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pain_level int NOT NULL DEFAULT 0,
  urgent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.triage_reports TO authenticated;
GRANT ALL ON public.triage_reports TO service_role;
ALTER TABLE public.triage_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own triage read" ON public.triage_reports;
DROP POLICY IF EXISTS "own triage insert" ON public.triage_reports;
CREATE POLICY "own triage read" ON public.triage_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own triage insert" ON public.triage_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Khách vãng lai (chưa đăng nhập) cũng đặt được đơn giỏ dịch vụ ở trang chủ
ALTER TABLE public.service_orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS customer_email text;
GRANT INSERT ON public.service_orders TO anon;
DROP POLICY IF EXISTS "own orders insert" ON public.service_orders;
CREATE POLICY "own orders insert" ON public.service_orders FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- ============ 2. Bảng mới: đặt lịch điều dưỡng từ trang /nursing ============
-- Khách không cần đăng nhập vẫn đặt được; nếu đã đăng nhập thì gắn user_id.
CREATE TABLE IF NOT EXISTS public.nursing_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  patient_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  service_id text,
  service_name text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  nurse_name text,
  nurse_cchn text,
  urgency text NOT NULL DEFAULT 'immediate' CHECK (urgency IN ('immediate', 'scheduled')),
  scheduled_at text,
  medical_note text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.nursing_bookings TO anon, authenticated;
GRANT SELECT ON public.nursing_bookings TO authenticated;
GRANT ALL ON public.nursing_bookings TO service_role;
ALTER TABLE public.nursing_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can book" ON public.nursing_bookings;
DROP POLICY IF EXISTS "own bookings read" ON public.nursing_bookings;
CREATE POLICY "anyone can book" ON public.nursing_bookings FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "own bookings read" ON public.nursing_bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ 3. Quyền nhân viên cho web quản lý ============
-- Nhân viên = tài khoản có app_metadata.role = 'staff' (chỉ đặt được bằng SQL/service role, khách không tự gán được).
CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
$$;

GRANT UPDATE ON public.service_orders, public.nursing_bookings TO authenticated;

DROP POLICY IF EXISTS "staff read profiles" ON public.patient_profiles;
DROP POLICY IF EXISTS "staff read orders" ON public.service_orders;
DROP POLICY IF EXISTS "staff update orders" ON public.service_orders;
DROP POLICY IF EXISTS "staff read triage" ON public.triage_reports;
DROP POLICY IF EXISTS "staff read bookings" ON public.nursing_bookings;
DROP POLICY IF EXISTS "staff update bookings" ON public.nursing_bookings;
CREATE POLICY "staff read profiles" ON public.patient_profiles FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "staff read orders" ON public.service_orders FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "staff update orders" ON public.service_orders FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "staff read triage" ON public.triage_reports FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "staff read bookings" ON public.nursing_bookings FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "staff update bookings" ON public.nursing_bookings FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ============ 4. Realtime: web quản lý nhận đơn mới ngay lập tức ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['service_orders', 'nursing_bookings', 'triage_reports', 'patient_profiles'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ============ 5. Cấp quyền nhân viên (chạy SAU khi đã tạo tài khoản admin trong Authentication → Users) ============
-- Thay email bên dưới rồi bỏ dấu "--" ở 3 dòng này để chạy:
-- UPDATE auth.users
--   SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"staff"}'::jsonb
--   WHERE email = 'admin@gocare.vn';
