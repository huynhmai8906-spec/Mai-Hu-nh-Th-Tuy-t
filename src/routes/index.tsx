import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LegacyPage } from "@/components/LegacyPage";
import { supabase } from "@/integrations/supabase/client";
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
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            toast.warning("Vui lòng đăng nhập Cổng Bệnh Nhân để đặt cọc.");
            navigate({ to: "/portal" });
            return;
          }
          const items = api["getCart"]?.() ?? [];
          if (!items.length) {
            toast.info("Giỏ dịch vụ đang trống. Vui lòng chọn dịch vụ.");
            return;
          }
          const subtotal = items.reduce((s: number, i: any) => s + i.price, 0);
          const total = Math.max(0, subtotal - 500000);
          const { error } = await supabase
            .from("service_orders")
            .insert({ user_id: data.session.user.id, items, total });
          if (error) {
            toast.error("Không thể tạo đơn: " + error.message);
            return;
          }
          api["toggleCartDrawer"]?.(false);
          toast.success("Đã tạo đơn đặt cọc! CSKH GoCare sẽ liên hệ ký hợp đồng trong 15 phút.");
        };
        btn?.addEventListener("click", handler);
        return () => btn?.removeEventListener("click", handler);
      }}
    />
  );
}
