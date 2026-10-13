import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { LegacyPage } from "@/components/LegacyPage";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
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

  if (!session) return null;

  return (
    <LegacyPage
      scope="dashboard"
      bodyClass={meta.bodyClass}
      html={html}
      script={script}
      fns={meta.fns}
      onReady={(root) => {
        const logout = async () => {
          await supabase.auth.signOut();
          toast.info("Đã đăng xuất khỏi Cổng Bệnh Nhân");
          navigate({ to: "/portal" });
        };
        root.querySelectorAll(".material-symbols-outlined").forEach((s) => {
          if (s.textContent?.trim() === "logout")
            s.closest("button,a")?.addEventListener("click", logout);
        });
        const btn = root.querySelector("#btn-submit-triage");
        const submit = async () => {
          const label = document.getElementById("pain-score-display")?.textContent ?? "";
          const pain = Number(label.match(/\d+/)?.[0] ?? 0);
          const urgent =
            !!(document.getElementById("urgent-chest-pain") as HTMLInputElement)?.checked ||
            !!(document.getElementById("urgent-stroke-sign") as HTMLInputElement)?.checked ||
            pain >= 8;
          const { error } = await supabase
            .from("triage_reports")
            .insert({ user_id: session.user.id, pain_level: pain, urgent });
          if (error) {
            toast.error("Gửi thất bại: " + error.message);
          } else {
            toast.success("Đã gửi khai báo y tế đến Bác sĩ trực GoCare!");
          }
        };
        btn?.addEventListener("click", submit);
        return () => btn?.removeEventListener("click", submit);
      }}
    />
  );
}
