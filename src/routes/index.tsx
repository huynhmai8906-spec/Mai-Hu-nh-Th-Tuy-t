import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LegacyPage } from "@/components/LegacyPage";
import { supabase } from "@/integrations/supabase/client";
import { DB_OFFLINE_MESSAGE, isSupabaseConfigured, realUserId } from "@/lib/db-status";
import html from "@/legacy/home.html.txt?raw";
import script from "@/legacy/home.js.txt?raw";
import meta from "@/legacy/home.meta.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoCare | Nghỉ Dưỡng Lão Khoa & Y Tế 5 Sao" },
      {
        name: "description",
        content: "Dưỡng lão 5 sao, điều dưỡng CCHN 24/7 tại gia và bảng giá phòng minh bạch.",
      },
      { property: "og:title", content: "GoCare | Nghỉ Dưỡng Lão Khoa & Y Tế 5 Sao" },
      {
        property: "og:description",
        content: "Dưỡng lão 5 sao, điều dưỡng CCHN 24/7 tại gia và bảng giá phòng minh bạch.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  return (
    <div className="relative">
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

      <LegacyPage
        scope="home"
        bodyClass={meta.bodyClass}
        html={html}
        script={script}
        fns={meta.fns}
        extraExports={["getCart: () => cart"]}
        onReady={(root, api) => {
          const btn = root.querySelector("#btn-checkout");
          const handler = async (e: Event) => {
            e.preventDefault();

            // Legal compliance check: customer MUST agree to legal terms before placing an order
            const termsCheckbox = root.querySelector<HTMLInputElement>("#terms-agreement-checkbox");
            if (!termsCheckbox || !termsCheckbox.checked) {
              toast.error(
                "Yêu cầu pháp lý: Quý khách vui lòng đọc và bấm chọn đồng ý với Điều khoản dịch vụ trước khi đặt hàng!",
                { duration: 5000 },
              );
              const legalBox = root.querySelector("#legal-agreement-box");
              if (legalBox) {
                legalBox.classList.add("ring-2", "ring-rose-500", "bg-rose-50");
                legalBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
                setTimeout(() => {
                  legalBox.classList.remove("ring-2", "ring-rose-500", "bg-rose-50");
                }, 3500);
              }
              termsCheckbox?.focus();
              return;
            }

            const items = api["getCart"]?.() ?? [];
            if (!items.length) {
              toast.info("Giỏ dịch vụ đang trống. Vui lòng chọn dịch vụ.");
              return;
            }
            // Guests can order too; signed-in patients get the order linked to their account
            const { data } = await supabase.auth.getSession();
            const subtotal = items.reduce((s: number, i: any) => s + i.price, 0);
            const total = Math.max(0, subtotal - 500000);
            const { error } = await supabase.from("service_orders").insert({
              user_id: realUserId(data.session?.user.id),
              customer_email: data.session?.user.email ?? null,
              items,
              total,
            });
            if (error) {
              toast.error("Không thể tạo đơn: " + error.message);
              return;
            }
            api["toggleCartDrawer"]?.(false);
            if (!isSupabaseConfigured) {
              toast.warning(DB_OFFLINE_MESSAGE, { duration: 8000 });
              return;
            }
            toast.success("Đã tạo đơn dịch vụ! Bộ phận CSKH GoCare sẽ liên hệ trong 15 phút.");
            if (!data.session) {
              toast.info("Đăng nhập Cổng Bệnh Nhân để theo dõi đơn của bạn.", {
                action: { label: "Đăng nhập", onClick: () => navigate({ to: "/portal" }) },
              });
            }
          };
          btn?.addEventListener("click", handler);
          return () => btn?.removeEventListener("click", handler);
        }}
      />
    </div>
  );
}
