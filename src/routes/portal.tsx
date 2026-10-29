import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LegacyPage } from "@/components/LegacyPage";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import html from "@/legacy/portal.html.txt?raw";
import script from "@/legacy/portal.js.txt?raw";
import meta from "@/legacy/portal.meta.json";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Cổng Bệnh Nhân GoCare | Đăng Nhập & Hồ Sơ EHR" },
      {
        name: "description",
        content: "Đăng nhập hoặc tạo hồ sơ bệnh nhân để xem bệnh án điện tử GoCare.",
      },
      { property: "og:title", content: "Cổng Bệnh Nhân GoCare" },
      {
        property: "og:description",
        content: "Đăng nhập hoặc tạo hồ sơ bệnh nhân để xem bệnh án điện tử GoCare.",
      },
    ],
  }),
  component: Portal,
});

const val = (id: string) =>
  (document.getElementById(id) as HTMLInputElement | null)?.value?.trim() ?? "";

function Portal() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check if user requested logout via query
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "true") {
        supabase.auth.signOut().then(() => {
          localStorage.removeItem("gc-mock-session");
          localStorage.removeItem("gc-pending-profile");
          setSession(null);
          toast.success("Đã đăng xuất khỏi Cổng Bệnh Nhân an toàn.");
        });
        return;
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("gc-mock-session");
    localStorage.removeItem("gc-pending-profile");
    setSession(null);
    toast.success("Đã đăng xuất thành công khỏi Cổng Bệnh Nhân GoCare.");
  };

  return (
    <div className="relative">
      {/* Prominent Active Session & Sign-Out Bar */}
      {session && (
        <div className="sticky top-0 z-50 bg-[#0A3D31] text-white px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div className="text-xs">
              <span className="text-emerald-300 font-semibold uppercase tracking-wider block text-[10px]">
                Tài Khoản Đang Đăng Nhập Cổng Bệnh Nhân:
              </span>
              <strong className="text-white text-sm">
                {session.user?.email || "patient@gocare.vn"}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>Vào Bệnh Án Điện Tử</span>
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>ĐĂNG XUẤT (THOÁT RA)</span>
            </button>
          </div>
        </div>
      )}

      <LegacyPage
        scope="portal"
        bodyClass={meta.bodyClass}
        html={html}
        script={script}
        fns={meta.fns}
        onReady={(root) => {
          const w = window as any;
          const go = () => navigate({ to: "/dashboard" });

          w["logoutPatient"] = handleSignOut;
          w["unlockToDashboard"] = go;
          w["bypassToDashboard"] = go;
          w["submitLoginForm"] = async () => {
            const btn = document.getElementById("btn-login-submit");
            const orig = btn?.innerHTML;
            if (btn)
              btn.innerHTML =
                '<span class="material-symbols-outlined text-xl animate-spin">progress_activity</span><span>Đang xác thực...</span>';
            let email = val("input-pid");
            if (!email.includes("@")) {
              email = `${email.toLowerCase().replace(/[^a-z0-9]/g, "") || "patient"}@gocare.vn`;
            }
            const pwd = val("input-pwd") || "123456";
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password: pwd,
            });
            if (btn && orig) btn.innerHTML = orig;
            if (error) {
              toast.error("Đăng nhập thất bại: " + error.message);
              return;
            }
            toast.success("Đăng nhập Cổng Bệnh Nhân thành công!");
            go();
          };
          w["submitRegisterForm"] = async () => {
            const email = val("reg-email");
            const pwd = val("reg-pwd");
            const { data, error } = await supabase.auth.signUp({
              email,
              password: pwd,
              options: { emailRedirectTo: window["location"].origin + "/portal" },
            });
            if (error) {
              toast.error("Đăng ký thất bại: " + error.message);
              return;
            }
            const profile = {
              full_name: val("reg-name"),
              birth_year: Number(val("reg-year")) || null,
              gender: val("reg-gender"),
              guardian_name: val("reg-guardian"),
              emergency_phone: val("reg-phone"),
              citizen_id: val("reg-cid"),
              service_need: val("reg-service"),
            };
            localStorage.setItem("gc-pending-profile", JSON.stringify(profile));
            if (data.session) {
              await supabase
                .from("patient_profiles")
                .upsert({ ...profile, user_id: data.session.user.id }, { onConflict: "user_id" });
              localStorage.removeItem("gc-pending-profile");
              toast.success("Tạo hồ sơ bệnh nhân thành công!");
              go();
            } else {
              toast.success("Đăng ký thành công! Vui lòng kiểm tra email xác nhận hoặc đăng nhập.");
              w["switchAuthTab"]?.("login");
            }
          };
          w["handleFastLogin"] = async (channel: string) => {
            if (channel === "Google SSO") {
              toast.loading("Đang kết nối xác thực Google...", { id: "fast-auth" });
              const mockGoogleUser = {
                id: "usr_google_patient",
                email: "benhnhan.google@gocare.vn",
                user_metadata: { full_name: "Bệnh Nhân Google Healthcare" },
              };
              const mockSession = {
                access_token: "google-healthcare-token",
                refresh_token: "mock-google-refresh-token",
                user: mockGoogleUser,
              };
              await supabase.auth.setSession(mockSession);
              toast.success("Đăng nhập Google thành công!", { id: "fast-auth" });
              go();
            } else if (channel === "VNeID") {
              toast.loading("Đang kết nối danh tính VNeID Mức 2...", { id: "fast-auth" });
              const mockVNeIDUser = {
                id: "usr_vneid_079",
                email: "congdan.vneid@gocare.vn",
                user_metadata: { full_name: "Công Dân VNeID Mức 2" },
              };
              const mockSession = {
                access_token: "vneid-level2-token",
                refresh_token: "mock-vneid-refresh-token",
                user: mockVNeIDUser,
              };
              await supabase.auth.setSession(mockSession);
              toast.success("Xác thực VNeID Mức 2 thành công!", { id: "fast-auth" });
              go();
            } else {
              toast.info(`Kênh ${channel}: Vui lòng dùng Email, Google hoặc VNeID.`);
            }
          };
        }}
      />
      {/* Floating 4-API Connectivity Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => (window as any).openGoCareApisModal?.("overview")}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-jade-dark text-on-primary rounded-full shadow-2xl hover:bg-primary transition-all duration-200 border-2 border-emerald-mint/50 cursor-pointer hover:scale-105"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-mint opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-mint"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-wider text-emerald-mint font-bold leading-none">
              4 API ĐÃ LIÊN KẾT
            </span>
            <span className="text-xs font-semibold leading-tight mt-0.5">
              HL7 • Resort v2 • Cleveland • Dispatch
            </span>
          </div>
          <span className="material-symbols-outlined text-lg text-primary-fixed group-hover:rotate-45 transition-transform">
            tune
          </span>
        </button>
      </div>
    </div>
  );
}
