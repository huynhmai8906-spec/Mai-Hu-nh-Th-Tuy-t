// Whether orders actually reach the shared Supabase database (also read by the management site).
// Without these env vars, `@/integrations/supabase/client` falls back to an in-memory mock.
export const isSupabaseConfigured = Boolean(
  import.meta.env["VITE_SUPABASE_URL"] && import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Demo logins (Google/VNeID fast login) create sessions with non-UUID ids that the
// database would reject; only real Supabase users are linked to their orders.
export function realUserId(id: string | undefined | null): string | null {
  return id && UUID_RE.test(id) ? id : null;
}

export const DB_OFFLINE_MESSAGE =
  "Chưa kết nối database: đơn chỉ lưu tạm trên trình duyệt và CHƯA gửi sang web quản lý.";
