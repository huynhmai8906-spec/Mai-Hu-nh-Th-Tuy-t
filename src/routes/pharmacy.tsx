import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy/pharmacy.html.txt?raw";
import script from "@/legacy/pharmacy.js.txt?raw";
import meta from "@/legacy/pharmacy.meta.json";

export const Route = createFileRoute("/pharmacy")({
  head: () => ({
    meta: [
      { title: "Wellness & Nhà Thuốc GoCare | Clinical Sanctuary" },
      {
        name: "description",
        content: "Gói chăm sóc y tế đặc quyền và nhà thuốc trực tuyến giao hỏa tốc 1-2 giờ.",
      },
      { property: "og:title", content: "Wellness & Nhà Thuốc GoCare" },
      {
        property: "og:description",
        content: "Gói chăm sóc y tế đặc quyền và nhà thuốc trực tuyến giao hỏa tốc 1-2 giờ.",
      },
    ],
  }),
  component: () => (
    <LegacyPage
      scope="pharmacy"
      bodyClass={meta.bodyClass}
      html={html}
      script={script}
      fns={meta.fns}
    />
  ),
});
