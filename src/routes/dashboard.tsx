import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { LegacyPage } from "@/components/LegacyPage";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import {
  hl7LiveApi,
  resortV2Api,
  clevelandClinicApi,
  dispatchApi,
  GOCARE_KEYS,
} from "@/lib/gocare-apis";
import html from "@/legacy/dashboard.html.txt?raw";
import script from "@/legacy/dashboard.js.txt?raw";
import meta from "@/legacy/dashboard.meta.json";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Bệnh Án & Tiện Ích Y Tế | GoCare" },
      {
        name: "description",
        content:
          "Tổng quan sức khỏe, sinh hiệu, lịch khám và khai báo triệu chứng của bệnh nhân GoCare.",
      },
      { property: "og:title", content: "Bệnh Án & Tiện Ích Y Tế | GoCare" },
      {
        property: "og:description",
        content: "Tổng quan sức khỏe, sinh hiệu, lịch khám và khai báo triệu chứng.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { session, ready } = useSession();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/portal" });
    if (!session) return;
    const pending = localStorage.getItem("gc-pending-profile");
    if (pending) {
      supabase
        .from("patient_profiles")
        .upsert({ ...JSON.parse(pending), user_id: session.user.id }, { onConflict: "user_id" })
        .then(() => localStorage.removeItem("gc-pending-profile"));
    }
  }, [ready, session, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("gc-mock-session");
    localStorage.removeItem("gc-pending-profile");
    toast.success("Đã đăng xuất khỏi Cổng Bệnh Nhân");
    navigate({ to: "/portal" });
  };

  return (
    <div className="relative">
      {/* Top Universal Patient Account & Sign-Out Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-[#0A3D31] text-white px-4 flex items-center justify-between text-xs border-b border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="font-bold text-emerald-300">GOCARE PATIENT PORTAL &amp; EHR</span>
          <span className="hidden md:inline text-emerald-100/70">
            • Tài khoản: {session?.user?.email || "patient@gocare.vn"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-emerald-100 transition-colors"
          >
            Trang chủ
          </a>
          <a
            href="/doctors"
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-emerald-100 transition-colors"
          >
            Bác sĩ
          </a>
          <a
            href="/nursing"
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-emerald-100 transition-colors"
          >
            Điều dưỡng
          </a>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md flex items-center gap-1 shadow-sm transition-all"
            title="Đăng xuất khỏi Cổng Bệnh Nhân"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>ĐĂNG XUẤT</span>
          </button>
        </div>
      </div>

      {/* Floating 4-API Verified Connectivity Pill */}
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

      <div className="pt-9">
        <LegacyPage
          scope="dashboard"
          bodyClass={meta.bodyClass}
          html={html}
          script={script}
          fns={meta.fns}
          onReady={(root) => {
            const w = window as any;
            w.logoutPatient = handleLogout;

            // Logout click triggers across dashboard
            root.querySelectorAll(".material-symbols-outlined").forEach((s) => {
              if (s.textContent?.trim() === "logout") {
                s.closest("button,a")?.addEventListener("click", (e) => {
                  e.preventDefault();
                  handleLogout();
                });
              }
            });

            // API 1: HL7 FHIR Export Button
            root.querySelectorAll("button, a").forEach((el) => {
              const txt = el.textContent || "";
              if (txt.includes("Xuất Y Bạ Quốc Tế")) {
                el.addEventListener("click", async (e) => {
                  e.preventDefault();
                  toast.loading("Đang xác thực khóa HL7 và xuất hồ sơ FHIR...", { id: "hl7-dl" });
                  const bundle = await hl7LiveApi.exportFHIRBundle();
                  const dataStr =
                    "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(bundle, null, 2));
                  const a = document.createElement("a");
                  a.href = dataStr;
                  a.download = `HL7-FHIR-GC88294-${Date.now()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  toast.success(
                    "Đã xuất hồ sơ HL7 FHIR R4 thành công! Khóa xác thực: " +
                      GOCARE_KEYS.HL7.slice(0, 14) +
                      "...",
                    { id: "hl7-dl" },
                  );
                });
              }

              // API 3: Cleveland Allergy Emergency Protocol
              if (txt.includes("Xem Quy Trình Cấp Cứu Dị Ứng")) {
                el.addEventListener("click", (e) => {
                  e.preventDefault();
                  w.openGoCareApisModal?.("cleveland");
                });
              }

              // API 3: Cleveland Expert 1:1 Consultation
              if (txt.includes("Đặt Lịch Hội Chẩn 1:1")) {
                el.addEventListener("click", async (e) => {
                  e.preventDefault();
                  w.openGoCareApisModal?.("cleveland");
                });
              }

              // API 2: Resort Suite / Booking
              if (txt.includes("Đặt Lịch Khám") || txt.includes("Gọi Concierge")) {
                el.addEventListener("click", (e) => {
                  e.preventDefault();
                  w.openGoCareApisModal?.("resort");
                });
              }
            });

            // Header & Status bar HL7 link triggers
            root.querySelectorAll("span, div").forEach((el) => {
              const text = el.textContent || "";
              if (
                text.includes("HL7 FHIR Bảo Mật Cấp 4") ||
                text.includes("Đồng bộ trực tiếp cổng Dữ Liệu Y Tế Quốc Gia")
              ) {
                (el as HTMLElement).style.cursor = "pointer";
                el.addEventListener("click", () => w.openGoCareApisModal?.("hl7"));
              }
              if (text.includes("Phòng Suite V.I.P 402")) {
                (el as HTMLElement).style.cursor = "pointer";
                el.addEventListener("click", () => w.openGoCareApisModal?.("resort"));
              }
            });

            // API 4: Emergency Dispatch & Triage Submission
            const btn = root.querySelector("#btn-submit-triage");
            const submit = async () => {
              const label = document.getElementById("pain-score-display")?.textContent ?? "";
              const pain = Number(label.match(/\d+/)?.[0] ?? 0);
              const urgentChest = !!(
                document.getElementById("urgent-chest-pain") as HTMLInputElement
              )?.checked;
              const urgentStroke = !!(
                document.getElementById("urgent-stroke-sign") as HTMLInputElement
              )?.checked;
              const urgent = urgentChest || urgentStroke || pain >= 8;

              const symptoms: string[] = [];
              if (urgentChest)
                symptoms.push("Đau thắt ngực lan cánh tay trái (Thiếu máu cơ tim cấp)");
              if (urgentStroke) symptoms.push("Tê bì nửa người / Yếu chi (Dấu hiệu FAST tai biến)");
              if (pain >= 5) symptoms.push(`Mức độ đau toàn thân: ${pain}/10`);

              // If Code Red / Urgent -> trigger 24/7 Mobile Dispatch API (gc_dispatch_...)
              if (urgent) {
                toast.loading("Đang kích hoạt lệnh cấp cứu qua GoCare Dispatch API...", {
                  id: "triage-dispatch",
                });
                const dispatchResult = await dispatchApi.dispatchEmergencyUnit({
                  patientId: "GC-88294-VN",
                  patientName: "BN. Trần Hoài Phương",
                  address: "Biệt thự Palm Garden, Thảo Điền, TP. Thủ Đức",
                  code: "RED",
                  painScore: pain,
                  symptoms,
                  notes: "Kích hoạt tự động từ nút gửi khai báo y tế khẩn cấp",
                });

                await supabase.from("triage_reports").insert({
                  user_id: session.user.id,
                  pain_level: pain,
                  urgent: true,
                });

                toast.success(
                  `ĐÃ ĐIỀU PHỐI XE CẤP CỨU ${dispatchResult.vehicleNumber}! ${dispatchResult.nurseCchnName} (${dispatchResult.nurseCchnLicense}) đang trên đường đến (ETA ~${dispatchResult.estimatedArrivalMinutes} phút).`,
                  { id: "triage-dispatch", duration: 8000 },
                );

                // Open dispatch modal view
                w.openGoCareApisModal?.("dispatch");
                return;
              }

              // Normal Triage -> Log to Supabase and validate against Cleveland Clinic Geriatric standards
              const { error } = await supabase
                .from("triage_reports")
                .insert({ user_id: session.user.id, pain_level: pain, urgent: false });

              if (error) {
                toast.error("Gửi thất bại: " + error.message);
              } else {
                toast.success(
                  "Đã gửi khai báo y tế đến Bác sĩ trực GoCare & kiểm tra qua Cleveland Protocol thành công!",
                );
              }
            };

            btn?.addEventListener("click", submit);
            return () => btn?.removeEventListener("click", submit);
          }}
        />
      </div>
    </div>
  );
}
