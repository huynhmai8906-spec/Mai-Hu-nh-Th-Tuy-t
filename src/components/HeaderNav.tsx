import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderNavProps {
  activePath?: "home" | "doctors" | "nursing" | "pharmacy" | "portal" | "dashboard";
}

export function HeaderNav({ activePath }: HeaderNavProps) {
  const [hasSession, setHasSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasSession(true);
        setUserEmail(data.session.user.email || "");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setUserEmail(session?.user.email || "");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF7]/95 backdrop-blur-xl border-b border-emerald-900/10 shadow-[0_4px_20px_rgba(13,124,102,0.05)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              alt="GoCare - An tâm chăm sóc, kết nối tức thì"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
              src="/logo.png"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-serif font-bold text-base text-[#0A3D31] tracking-tight leading-none">
                GoCare
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#0D7C66] font-bold mt-1">
                Lão Khoa &amp; Dưỡng Lão 5 Sao
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 mx-auto flex-1">
          <Link
            to="/"
            className={`relative inline-flex items-center justify-center py-2 px-2 text-sm tracking-wide transition-colors whitespace-nowrap ${
              activePath === "home"
                ? "font-bold text-[#0D7C66] after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:bg-[#0D7C66] after:w-full"
                : "font-semibold text-stone-700 hover:text-[#0D7C66]"
            }`}
          >
            Trang chủ
          </Link>

          <Link
            to="/doctors"
            className={`relative inline-flex items-center justify-center py-2 px-2 text-sm tracking-wide transition-colors whitespace-nowrap ${
              activePath === "doctors"
                ? "font-bold text-[#0D7C66] after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:bg-[#0D7C66] after:w-full"
                : "font-semibold text-stone-700 hover:text-[#0D7C66]"
            }`}
          >
            Chuyên khoa &amp; Bác sĩ
          </Link>

          <Link
            to="/nursing"
            className={`relative inline-flex items-center justify-center py-2 px-2 text-sm tracking-wide transition-colors whitespace-nowrap gap-1.5 ${
              activePath === "nursing"
                ? "font-bold text-[#0D7C66] after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:bg-[#0D7C66] after:w-full"
                : "font-semibold text-stone-700 hover:text-[#0D7C66]"
            }`}
          >
            <span>Điều dưỡng CCHN 24/7</span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-[#E09F3E] text-slate-900 text-[10px] font-extrabold tracking-wider leading-none shadow-xs">
              JCI
            </span>
          </Link>

          <Link
            to="/pharmacy"
            className={`relative inline-flex items-center justify-center py-2 px-2 text-sm tracking-wide transition-colors whitespace-nowrap ${
              activePath === "pharmacy"
                ? "font-bold text-[#0D7C66] after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:bg-[#0D7C66] after:w-full"
                : "font-semibold text-stone-700 hover:text-[#0D7C66]"
            }`}
          >
            Wellness &amp; Nhà thuốc
          </Link>

          <Link
            to="/portal"
            className={`relative inline-flex items-center justify-center py-2 px-3 rounded-lg text-sm tracking-wide transition-all whitespace-nowrap gap-1.5 ${
              activePath === "portal" || activePath === "dashboard"
                ? "font-bold text-[#0D7C66] bg-emerald-50 border border-emerald-200"
                : "font-semibold text-stone-700 hover:text-[#0D7C66] hover:bg-emerald-50/50"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${hasSession ? "bg-emerald-500 animate-pulse" : "bg-primary"}`}
            ></span>
            <span>{hasSession ? "Cổng EHR (Đã Đăng Nhập)" : "Cổng bệnh nhân & EHR"}</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-primary border border-emerald-800/20 hover:border-emerald-700/50 hover:bg-emerald-50/50 transition-all shadow-xs"
            href="tel:19006868"
          >
            <span className="material-symbols-outlined text-lg text-[#0D7C66] animate-pulse">
              call
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold leading-none tracking-wider text-[#E09F3E]">
                Hotline 24/7
              </span>
              <span className="text-xs font-bold leading-tight text-emerald-950">1900 6868</span>
            </div>
          </a>

          {hasSession ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-[#0D7C66] text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span>Bệnh Án</span>
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/portal?logout=true";
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-200"
                title="Đăng xuất khỏi Cổng Bệnh Nhân"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </div>
          ) : (
            <Link
              to="/doctors"
              className="inline-flex items-center justify-center h-10 px-4 sm:px-5 rounded-full bg-gradient-to-r from-[#00614f] via-[#0D7C66] to-[#10B981] hover:brightness-110 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-emerald-800/25 active:scale-[0.98] gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              <span>ĐẶT LỊCH BÁC SĨ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
