import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { HeaderNav } from "@/components/HeaderNav";
import { dispatchApi, GOCARE_KEYS } from "@/lib/gocare-apis";
import { supabase } from "@/integrations/supabase/client";
import { DB_OFFLINE_MESSAGE, isSupabaseConfigured, realUserId } from "@/lib/db-status";

export const Route = createFileRoute("/nursing")({
  head: () => ({
    meta: [
      { title: "Đặt Lịch Điều Dưỡng CCHN 24/7 Tại Gia | GoCare" },
      {
        name: "description",
        content:
          "Dịch vụ điều dưỡng chuyên môn cao có Chứng Chỉ Hành Nghề (CCHN) Bộ Y Tế. Tiêm truyền, chăm sóc vết loét, đặt sonde và trực ca 24/7 tại nhà.",
      },
      { property: "og:title", content: "Đặt Lịch Điều Dưỡng CCHN 24/7 Tại Gia | GoCare" },
      {
        property: "og:description",
        content: "100% Điều dưỡng có chứng chỉ hành nghề chính thức. Có mặt sau 15-30 phút.",
      },
    ],
  }),
  component: NursingPage,
});

interface Nurse {
  id: string;
  name: string;
  cchn: string;
  hospitalExperience: string;
  yearsOfExp: number;
  rating: number;
  reviews: number;
  image: string;
  specialties: string[];
  bio: string;
  availability: "Sẵn sàng nhận ca (15-30p)" | "Đang trong ca trực" | "Hẹn lịch trước";
}

interface ServicePackage {
  id: string;
  name: string;
  category: "Thủ Thuật Tại Nhà" | "Theo Ca Trực";
  price: number;
  unit: string;
  duration: string;
  description: string;
  items: string[];
  popular?: boolean;
}

const NURSES: Nurse[] = [
  {
    id: "nurse-ngoc",
    name: "ĐD CKI. Hoàng Bích Ngọc",
    cchn: "014892/HCM-CCHN",
    hospitalExperience: "14 năm Khoa Hồi Sức Tích Cực (ICU) - BV Chợ Rẫy",
    yearsOfExp: 14,
    rating: 5.0,
    reviews: 284,
    image: "/assets/team/nurse-ngoc.jpg",
    specialties: ["Hồi sức cấp cứu", "Chăm sóc bệnh nhân thở máy", "Đặt sonde dạ dày khó"],
    bio: "Điều dưỡng Chuyên khoa 1 với kinh nghiệm dày dạn trong theo dõi sát sao sinh hiệu và xử lý biến chứng nguy kịch ở người bệnh cao tuổi nằm một chỗ.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-ha",
    name: "ĐD. Nguyễn Thị Thu Hà",
    cchn: "021948/HCM-CCHN",
    hospitalExperience: "12 năm Khoa Cán Bộ Lão Học - Bệnh Viện Thống Nhất",
    yearsOfExp: 12,
    rating: 4.9,
    reviews: 312,
    image: "/assets/team/nurse-ha.jpg",
    specialties: ["Vết loét tì đè độ 1-4", "Băng vô trùng JCI", "Lấy máu xét nghiệm êm ái"],
    bio: "Chuyên gia chăm sóc vết thương hở và loét tì đè lâu ngày bằng gạc sinh học kháng khuẩn, giúp hồi phục biểu mô nhanh chóng mà không gây đau đớn cho người già.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-quang",
    name: "ĐD. Trần Minh Quang",
    cchn: "018374/HCM-CCHN",
    hospitalExperience: "10 năm Khoa Phục Hồi Chức Năng - BV Chấn Thương Chỉnh Hình",
    yearsOfExp: 10,
    rating: 4.9,
    reviews: 198,
    image: "/assets/team/nurse-quang.jpg",
    specialties: ["Tập đi sau tai biến", "Vận động khớp thụ động", "Chống teo cơ cứng khớp"],
    bio: "Kiên nhẫn và tận tình, chuyên trách hướng dẫn tập phục hồi vận động, tập đứng, tập đi và cải thiện khả năng sinh hoạt độc lập cho bệnh nhân sau tai biến đột quỵ.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-lan",
    name: "ĐD. Lê Thị Mai Lan",
    cchn: "025619/HCM-CCHN",
    hospitalExperience: "9 năm Khoa Nội Tim Mạch - BV ĐHYD TP.HCM",
    yearsOfExp: 9,
    rating: 4.8,
    reviews: 175,
    image: "/assets/team/nurse-lan.jpg",
    specialties: ["Ca trực đêm 12h", "Theo dõi máy SpO2/ECG", "Hỗ trợ vệ sinh an toàn"],
    bio: "Túc trực đêm tận tâm, kiểm tra huyết áp định kỳ mỗi 2-4 tiếng, phát hiện sớm dấu hiệu suy tim về đêm hoặc tụt huyết áp tư thế khi trở mình.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-tuan",
    name: "ĐD. Bùi Văn Tuấn",
    cchn: "019283/HCM-CCHN",
    hospitalExperience: "11 năm Khoa Cấp Cứu Tổng Hợp - BV Nhân Dân 115",
    yearsOfExp: 11,
    rating: 4.9,
    reviews: 230,
    image: "/assets/team/nurse-tuan.jpg",
    specialties: ["Tiêm truyền tĩnh mạch", "Đặt sonde tiểu Foley", "Khí dung hút đờm"],
    bio: "Thao tác chuẩn xác, nhẹ nhàng, tuân thủ nghiêm ngặt quy trình chống nhiễm khuẩn bệnh viện khi thực hiện các thủ thuật xâm lấn tại nhà.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-thao",
    name: "ĐD. Đặng Thu Thảo",
    cchn: "023190/HCM-CCHN",
    hospitalExperience: "8 năm Khoa Thần Kinh - BV Nguyễn Tri Phương",
    yearsOfExp: 8,
    rating: 4.8,
    reviews: 142,
    image: "/assets/team/nurse-thao.jpg",
    specialties: [
      "Chăm sóc toàn diện 24/7",
      "Dinh dưỡng người cao tuổi",
      "Tâm lý tiếp xúc thân thiện",
    ],
    bio: "Nhiệt huyết, chu đáo như người thân trong gia đình, đồng hành hỗ trợ người cao tuổi trong ăn uống, tắm gội, massage thư giãn và trò chuyện mỗi ngày.",
    availability: "Hẹn lịch trước",
  },
  {
    id: "nurse-hien",
    name: "ĐD. Phan Thị Thanh Hiền",
    cchn: "027415/HCM-CCHN",
    hospitalExperience: "10 năm Khoa Tim Mạch Can Thiệp - Bệnh Viện Thống Nhất",
    yearsOfExp: 10,
    rating: 4.9,
    reviews: 188,
    image: "/assets/team/nurse-hien.jpg",
    specialties: ["Theo dõi điện tâm đồ", "Chăm sóc sau đặt Stent", "Đo huyết áp liên tục"],
    bio: "Được đào tạo chuyên sâu về chăm sóc bệnh nhân mạch vành, kiểm soát các cơn đau thắt ngực và hướng dẫn thân nhân xử lý tình huống tăng huyết áp đột ngột.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-duc",
    name: "ĐD. Nguyễn Minh Đức",
    cchn: "024183/HCM-CCHN",
    hospitalExperience: "7 năm Trung Tâm Cấp Cứu 115 TP.HCM",
    yearsOfExp: 7,
    rating: 4.8,
    reviews: 165,
    image: "/assets/team/nurse-duc.jpg",
    specialties: ["Cấp cứu ngoại viện", "Hồi sinh tim phổi CPR", "Băng nẹp cố định chấn thương"],
    bio: "Thành viên nòng cốt kíp phản ứng nhanh GoCare Dispatch, tiếp cận hiện trường trong 15 phút với trang thiết bị cấp cứu di động chuẩn quốc tế.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-yen",
    name: "ĐD. Vũ Hải Yến",
    cchn: "029314/HCM-CCHN",
    hospitalExperience: "9 năm Khoa Phục Hồi Chức Năng Đột Quỵ - BV An Bình",
    yearsOfExp: 9,
    rating: 4.9,
    reviews: 210,
    image: "/assets/team/nurse-yen.jpg",
    specialties: ["Âm ngữ trị liệu", "Luyện nuốt chống sặc", "Kích thích vận động tay liệt"],
    bio: "Chuyên sâu phục hồi rối loạn nuốt và tập nói cho bệnh nhân di chứng sau tai biến, giảm thiểu tối đa nguy cơ viêm phổi hít sặc ở người già.",
    availability: "Sẵn sàng nhận ca (15-30p)",
  },
  {
    id: "nurse-tam",
    name: "ĐD CKI. Lê Hoàng Tâm",
    cchn: "017529/HCM-CCHN",
    hospitalExperience: "15 năm Khoa Cấp Cứu & Điều Dưỡng Trưởng Khối Nội - BV ĐHYD",
    yearsOfExp: 15,
    rating: 5.0,
    reviews: 320,
    image: "/assets/team/nurse-tam.jpg",
    specialties: [
      "Giám sát quy trình JCI",
      "Chăm sóc giảm nhẹ cuối đời",
      "Đào tạo điều dưỡng tư gia",
    ],
    bio: "Trưởng ban giám sát chất lượng điều dưỡng tại GoCare, đảm bảo mọi thao tác tiêm truyền, vô khuẩn và thái độ phục vụ đều đạt tiêu chuẩn y khoa 5 sao.",
    availability: "Hẹn lịch trước",
  },
];

const SERVICES: ServicePackage[] = [
  {
    id: "srv-injection",
    name: "Tiêm Truyền & Bổ Não Tĩnh Mạch Tại Nhà",
    category: "Thủ Thuật Tại Nhà",
    price: 350000,
    unit: "/lần",
    duration: "45 - 60 phút",
    description:
      "Thực hiện tiêm bắp, tiêm tĩnh mạch, truyền dịch điện giải hoặc thuốc bổ não theo đúng đơn chỉ định của bác sĩ.",
    items: [
      "Kiểm tra sinh hiệu (HA, Mạch, SpO2) trước & sau tiêm",
      "Dụng cụ kim luồn vô trùng và dây truyền đạt chuẩn BYT",
      "Theo dõi chống sốc phản vệ 30 phút sau truyền",
    ],
  },
  {
    id: "srv-wound",
    name: "Chăm Sóc & Thay Băng Vết Loét Tì Đè Vô Khuẩn JCI",
    category: "Thủ Thuật Tại Nhà",
    price: 450000,
    unit: "/lần",
    duration: "45 phút",
    description:
      "Rửa vết thương vô trùng, cắt lọc mô hoại tử nông và đắp gạc sinh học Hydrocolloid giúp lành sẹo nhanh.",
    items: [
      "Bộ dụng cụ phẫu thuật vô khuẩn dùng một lần",
      "Gạc màng sinh học thấm hút dịch và kháng khuẩn",
      "Chụp ảnh theo dõi tiến trình lành vết loét vào EHR",
    ],
    popular: true,
  },
  {
    id: "srv-sonde",
    name: "Đặt & Thay Sonde Dạ Dày (Levine) / Sonde Tiểu (Foley)",
    category: "Thủ Thuật Tại Nhà",
    price: 550000,
    unit: "/lần",
    duration: "45 phút",
    description:
      "Quy trình thay ống xông dinh dưỡng hoặc ống thông tiểu vô khuẩn, hạn chế tối đa cảm giác khó chịu và đau tức.",
    items: [
      "Ống sonde silicone y tế cao cấp mềm mại chống kích ứng",
      "Bơm rửa kiểm tra vị trí chính xác trước khi cho ăn",
      "Hướng dẫn thân nhân cách vệ sinh ống đúng chuẩn",
    ],
  },
  {
    id: "srv-blood",
    name: "Lấy Máu & Bệnh Phẩm Xét Nghiệm Tại Gia Hỏa Tốc",
    category: "Thủ Thuật Tại Nhà",
    price: 300000,
    unit: "/lần",
    duration: "20 phút",
    description:
      "Lấy mẫu máu phân tích sinh hóa, đường huyết HbA1c, chức năng gan thận tại nhà và gửi mẫu về viện phân tích.",
    items: [
      "Ống nghiệm chân không Vacutainer không đau",
      "Bảo quản hộp lạnh chuyên dụng chuyển phòng Lab",
      "Trả kết quả trực tiếp lên Cổng Bệnh Nhân EHR sau 2 giờ",
    ],
  },
  {
    id: "shift-8h",
    name: "Gói Điều Dưỡng Ca 8 Tiếng Tiêu Chuẩn (Ban Ngày)",
    category: "Theo Ca Trực",
    price: 850000,
    unit: "/ca",
    duration: "8 giờ liên tục (08:00 - 16:00 hoặc 09:00 - 17:00)",
    description:
      "Điều dưỡng CCHN túc trực bên cạnh người bệnh suốt ca ngày, hỗ trợ dinh dưỡng, uống thuốc và sinh hoạt.",
    items: [
      "Đo sinh hiệu 3 lần/ca (Huyết áp, Mạch, SpO2, Đường huyết)",
      "Hỗ trợ ăn uống, cho ăn qua sonde, uống thuốc đúng giờ",
      "Vệ sinh thân thể tại giường, thay bỉm và xoa bóp ngừa loét",
      "Hỗ trợ người bệnh tập vận động nhẹ trong nhà",
    ],
    popular: true,
  },
  {
    id: "shift-12h",
    name: "Gói Điều Dưỡng Ca Đêm 12 Tiếng Chuyên Sâu",
    category: "Theo Ca Trực",
    price: 1100000,
    unit: "/ca",
    duration: "12 giờ đêm (19:00 - 07:00 sáng hôm sau)",
    description:
      "Chuyên biệt cho người cao tuổi hay mất ngủ, lẫn đêm, nguy cơ té ngã cao hoặc có bệnh tim mạch hô hấp cần canh chừng.",
    items: [
      "Canh chừng giấc ngủ và phát hiện sớm cơn ngưng thở",
      "Hỗ trợ đi vệ sinh hoặc thay tã ban đêm an toàn",
      "Cung cấp oxy hoặc hút đờm khi xuất hiện khó thở",
      "Báo cáo sinh hiệu chi tiết buổi sáng cho gia đình",
    ],
  },
  {
    id: "shift-24h",
    name: "Gói Điều Dưỡng Toàn Diện 24/7 Riêng Biệt (1 Kèm 1)",
    category: "Theo Ca Trực",
    price: 2100000,
    unit: "/ngày",
    duration: "24 giờ trọn gói (Đổi ca điều dưỡng chuyên nghiệp)",
    description:
      "Chế độ phụng dưỡng cao cấp nhất. Ekip điều dưỡng túc trực liên tục bên giường bệnh 24/24 giờ như người thân.",
    items: [
      "Toàn quyền điều phối điều dưỡng riêng biệt 1 kèm 1",
      "Bao gồm toàn bộ thủ thuật tiêm truyền và chăm sóc vết loét",
      "Kết nối bác sĩ chuyên khoa hội chẩn ngay khi có dấu hiệu lạ",
      "Miễn phí xe cứu thương điều phối khi cần chuyển viện",
    ],
  },
];

function NursingPage() {
  const [activeCategory, setActiveCategory] = useState<
    "Tất Cả" | "Thủ Thuật Tại Nhà" | "Theo Ca Trực"
  >("Tất Cả");
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [urgency, setUrgency] = useState<"immediate" | "scheduled">("immediate");
  const [patientName, setPatientName] = useState("BN. Trần Hoài Phương");
  const [patientPhone, setPatientPhone] = useState("0908 688 829");
  const [patientAddress, setPatientAddress] = useState(
    "Biệt thự Palm Garden, Thảo Điền, TP. Thủ Đức",
  );
  const [scheduledDate, setScheduledDate] = useState("2026-11-02");
  const [scheduledTime, setScheduledTime] = useState("08:30");
  const [medicalCondition, setMedicalCondition] = useState(
    "Cụ bà cao tuổi có tiền sử huyết áp và vết loét nhẹ ở cùng cụt.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = SERVICES.filter((srv) => {
    if (activeCategory === "Tất Cả") return true;
    return srv.category === activeCategory;
  });

  const handleOpenBooking = (service?: ServicePackage, nurse?: Nurse) => {
    setSelectedService(service || SERVICES[0]!);
    setSelectedNurse(nurse || NURSES[0]!);
    setIsModalOpen(true);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduledAt =
        urgency === "immediate"
          ? "Có mặt ngay sau 15 - 30 phút"
          : `${scheduledTime} ngày ${scheduledDate}`;

      // Save to the shared database so the management site (quanlyweb) sees it
      const { data: auth } = await supabase.auth.getSession();
      const { error } = await supabase.from("nursing_bookings").insert({
        user_id: realUserId(auth.session?.user.id),
        patient_name: patientName,
        phone: patientPhone,
        address: patientAddress,
        service_id: selectedService?.id ?? null,
        service_name: selectedService?.name || "Điều Dưỡng CCHN 24/7",
        price: selectedService?.price ?? 0,
        nurse_name: selectedNurse?.name ?? null,
        nurse_cchn: selectedNurse?.cchn ?? null,
        urgency,
        scheduled_at: scheduledAt,
        medical_note: medicalCondition || null,
      });
      if (error) throw error;

      // Connect to GoCare Dispatch API
      const result = await dispatchApi.dispatchHomeNurse({
        patientName,
        serviceType: selectedService?.name || "Điều Dưỡng CCHN 24/7",
        address: patientAddress,
        scheduledTime: scheduledAt,
      });

      const assignedNurseName = selectedNurse?.name || result.assignedNurse.name;
      const assignedLicense = selectedNurse?.cchn || result.assignedNurse.licenseNumber;

      toast.success(
        `ĐIỀU PHỐI ĐIỀU DƯỠNG THÀNH CÔNG!\nMã lệnh: ${result.serviceDispatchId}\nĐiều dưỡng: ${assignedNurseName} (Số CCHN: ${assignedLicense})\nThời gian: ${result.scheduledTime}`,
        { duration: 8000 },
      );
      if (!isSupabaseConfigured) toast.warning(DB_OFFLINE_MESSAGE, { duration: 8000 });

      setIsModalOpen(false);
    } catch {
      toast.error("Không thể hoàn tất lệnh điều phối. Vui lòng gọi trực tiếp Hotline 1900 6868.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FBF9] text-stone-900 font-sans">
      <HeaderNav activePath="nursing" />

      <main className="pt-24 pb-20">
        {/* HERO BANNER */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#00614f] via-[#0D7C66] to-[#10B981] text-white p-8 md:p-12 shadow-xl shadow-emerald-950/20 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Mạng Lưới Điều Dưỡng CCHN GoCare Dispatch 24/7</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Điều Dưỡng Chuyên Môn Cao Tận Gia Trong 15 – 30 Phút
              </h1>
              <p className="text-sm sm:text-base text-emerald-50/95 leading-relaxed font-light">
                100% nhân sự có <strong>Chứng Chỉ Hành Nghề (CCHN)</strong> do Sở Y Tế / Bộ Y Tế
                cấp, tối thiểu 8 năm kinh nghiệm tại các bệnh viện lớn (Chợ Rẫy, Thống Nhất, BV
                ĐHYD). Chăm sóc tận tụy, nhẹ nhàng, tuân thủ nghiêm ngặt quy chuẩn vô trùng quốc tế
                JCI.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-100">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-sm text-amber-300">verified</span>{" "}
                  100% Có Số CCHN Minh Bạch
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-sm text-amber-300">speed</span> Có
                  Mặt Hỏa Tốc 15 - 30 Phút
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-sm text-amber-300">security</span>{" "}
                  Bảo Hiểm Trách Nhiệm Nghề Nghiệp
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: NURSING SERVICES & SHIFT PACKAGES */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#0D7C66] uppercase tracking-wider block">
                Bảng Giá Minh Bạch • Chuẩn Y Khoa
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A3D31]">
                Danh Mục Dịch Vụ Điều Dưỡng &amp; Gói Ca Trực
              </h2>
            </div>

            {/* Category Toggle */}
            <div className="flex p-1 bg-stone-200/70 rounded-xl">
              {(["Tất Cả", "Thủ Thuật Tại Nhà", "Theo Ca Trực"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? "bg-white text-[#0D7C66] shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 flex flex-col justify-between relative group ${
                  srv.popular
                    ? "border-emerald-400 shadow-md ring-1 ring-emerald-300/50"
                    : "border-emerald-100 hover:border-emerald-300 hover:shadow-lg"
                }`}
              >
                {srv.popular && (
                  <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-[#E09F3E] text-slate-900 font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                    Được Tin Dùng Nhất
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#0D7C66] font-bold text-[11px] uppercase tracking-wider">
                      {srv.category}
                    </span>
                    <span className="text-xs font-medium text-stone-500">{srv.duration}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#0A3D31] group-hover:text-[#0D7C66] transition-colors leading-snug">
                    {srv.name}
                  </h3>

                  <div className="my-3 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-bold text-[#0D7C66]">
                      {srv.price.toLocaleString("vi-VN")} đ
                    </span>
                    <span className="text-xs text-stone-500 font-normal">{srv.unit}</span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-light mb-4">
                    {srv.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-stone-100">
                    {srv.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                        <span className="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleOpenBooking(srv)}
                    className="w-full py-3 px-4 rounded-xl bg-[#0D7C66] hover:bg-[#00614f] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-emerald-800/30"
                  >
                    <span className="material-symbols-outlined text-base">local_shipping</span>
                    <span>Đặt Điều Dưỡng Ngay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: VERIFIED VIETNAMESE NURSES WITH CCHN */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-[#0D7C66] uppercase tracking-wider block">
                  Đội Ngũ Nhân Lực Thường Trực
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A3D31] mt-1">
                  Đội Ngũ Điều Dưỡng CCHN Người Việt Tiêu Biểu
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  100% Điều dưỡng đã được thẩm định lý lịch, sức khỏe và giấy phép hành nghề bởi Hội
                  đồng Y khoa GoCare.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>6 Điều Dưỡng Sẵn Sàng Xuất Ca</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NURSES.map((nurse) => (
                <div
                  key={nurse.id}
                  className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <img
                        src={nurse.image}
                        alt={nurse.name}
                        className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-emerald-400 shadow-md shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span className="font-mono">CCHN: {nurse.cchn}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#0A3D31] truncate mt-0.5">
                          {nurse.name}
                        </h4>
                        <span className="text-xs text-stone-500 block truncate">
                          {nurse.hospitalExperience}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-bold">
                          <span className="material-symbols-outlined text-xs fill-current text-amber-500">
                            star
                          </span>
                          <span>{nurse.rating}</span>
                          <span className="text-stone-400 font-normal">({nurse.reviews} ca)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 mt-3 line-clamp-2 leading-relaxed font-light">
                      {nurse.bio}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {nurse.specialties.map((sp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white text-stone-700 text-[10px] font-medium border border-stone-200"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {nurse.availability}
                    </span>
                    <button
                      onClick={() => handleOpenBooking(undefined, nurse)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D7C66] hover:bg-[#00614f] text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Chọn Điều Dưỡng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* MODAL: ĐẶT LỊCH / ĐIỀU PHỐI ĐIỀU DƯỠNG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#00614f] via-[#0D7C66] to-[#10B981] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25">
                  <span className="material-symbols-outlined text-2xl text-emerald-200">
                    home_health
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-200">
                    Lệnh Điều Phối GoCare Dispatch 24/7
                  </span>
                  <h3 className="font-serif font-bold text-lg text-white">
                    {selectedService?.name || "Đặt Dịch Vụ Điều Dưỡng"}
                  </h3>
                  <span className="text-xs text-emerald-100">
                    Phí dịch vụ: {selectedService?.price.toLocaleString("vi-VN")} đ{" "}
                    {selectedService?.unit}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmDispatch} className="p-6 space-y-4">
              {/* Urgency Switcher */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  1. Thời Gian Có Mặt Của Điều Dưỡng:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUrgency("immediate")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      urgency === "immediate"
                        ? "bg-rose-50 border-rose-400 text-rose-900 shadow-xs"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-rose-600 text-2xl animate-pulse">
                      emergency
                    </span>
                    <div>
                      <strong className="text-xs block text-rose-900 font-bold">
                        HỎA TỐC 15 - 30 PHÚT
                      </strong>
                      <span className="text-[10px] text-rose-700">
                        Điều phối xe &amp; ĐD gần nhất
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency("scheduled")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      urgency === "scheduled"
                        ? "bg-emerald-50 border-[#0D7C66] text-[#0A3D31] shadow-xs"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#0D7C66] text-2xl">
                      calendar_month
                    </span>
                    <div>
                      <strong className="text-xs block text-stone-900 font-bold">
                        HẸN NGÀY GIỜ TRƯỚC
                      </strong>
                      <span className="text-[10px] text-stone-500">Đặt lịch chăm sóc định kỳ</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Scheduled Date/Time if not immediate */}
              {urgency === "scheduled" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Ngày Hẹn:
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Giờ Hẹn:
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                    />
                  </div>
                </div>
              )}

              {/* Selected Nurse Preview */}
              {selectedNurse && (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedNurse.image}
                      alt={selectedNurse.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">
                        ĐIỀU DƯỠNG TIẾP NHẬN Y LỆNH:
                      </span>
                      <strong className="text-xs text-stone-900">{selectedNurse.name}</strong>
                      <span className="text-[10px] text-stone-500 block">
                        Số CCHN: {selectedNurse.cchn}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-white text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200">
                    Đã Khớp Lệnh
                  </span>
                </div>
              )}

              {/* Patient Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tên Bệnh Nhân:
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Số Điện Thoại Liên Hệ:
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Địa Chỉ Tư Gia (Số nhà, đường, phường/xã, quận/huyện):
                </label>
                <input
                  type="text"
                  required
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tình Trạng Bệnh Lý Hoặc Lưu Ý Cho Điều Dưỡng:
                </label>
                <textarea
                  rows={2}
                  value={medicalCondition}
                  onChange={(e) => setMedicalCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66] resize-none"
                  placeholder="Ví dụ: Người bệnh nằm liệt giường, có vết mổ thay khớp, dị ứng thuốc Penicillin..."
                ></textarea>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200">
                <span className="text-[11px] text-stone-500">
                  Phát lệnh tự động qua API GoCare Dispatch
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#0D7C66] hover:bg-[#00614f] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">
                          progress_activity
                        </span>
                        <span>Đang điều phối...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                        <span>Xác Nhận &amp; Xuất Ca</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
