import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HeaderNav } from "@/components/HeaderNav";
import { triggerLegalTermsModal } from "@/components/LegalTermsModal";
import { clevelandClinicApi, GOCARE_KEYS } from "@/lib/gocare-apis";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Chuyên Khoa & Đội Ngũ Bác Sĩ Lão Học | GoCare" },
      {
        name: "description",
        content:
          "Đội ngũ bác sĩ chuyên khoa Lão khoa, Tim mạch can thiệp, Thần kinh đột quỵ đầu ngành từ BV Chợ Rẫy, ĐHYD TP.HCM, BV Thống Nhất.",
      },
      { property: "og:title", content: "Chuyên Khoa & Đội Ngũ Bác Sĩ Lão Học | GoCare" },
      {
        property: "og:description",
        content: "Khám trực tiếp tại viện, thăm khám tận tư gia và hội chẩn quốc tế 1:1.",
      },
    ],
  }),
  component: DoctorsPage,
});

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  subSpecialty: string;
  hospital: string;
  experienceYears: number;
  consultationFee: number;
  homeVisitFee: number;
  teleconsultFee: number;
  image: string;
  rating: number;
  reviewCount: number;
  bio: string;
  highlights: string[];
  schedule: string;
}

const DOCTORS: Doctor[] = [
  {
    id: "dr-khang",
    name: "ThS. BS CKI. Trần Trọng Khang",
    title: "Trưởng Khối Lão Khoa & Tim Mạch Can Thiệp",
    specialty: "Tim Mạch & Lão Khoa",
    subSpecialty: "Tăng huyết áp kháng trị, Suy tim lão hóa, Đặt stent can thiệp",
    hospital: "Nguyên Phó Khoa Tim Mạch Can Thiệp - BV ĐH Y Dược TP.HCM",
    experienceYears: 18,
    consultationFee: 500000,
    homeVisitFee: 1500000,
    teleconsultFee: 450000,
    image: "/assets/team/dr-khang.jpg",
    rating: 4.9,
    reviewCount: 342,
    bio: "Chuyên gia tim mạch lão khoa hàng đầu với hơn 18 năm kinh nghiệm xử trí các ca suy tim mạn, tăng huyết áp phức tạp ở người cao tuổi và dự phòng biến cố vành cấp.",
    highlights: [
      "Hội đồng Tim Mạch Hoa Kỳ (ACC)",
      "Chủ trì ca cấp cứu tim mạch GoCare",
      "Hội chẩn cùng Cleveland Clinic",
    ],
    schedule: "Thứ 2 - Thứ 7 (08:00 - 17:30)",
  },
  {
    id: "dr-thanh",
    name: "PGS. TS. BS. Nguyễn Văn Thành",
    title: "Chuyên Gia Cao Cấp Thần Kinh & Phòng Ngừa Đột Quỵ",
    specialty: "Thần Kinh & Đột Quỵ",
    subSpecialty: "Dự phòng đột quỵ tái phát, Sa sút trí tuệ Alzheimer, Bệnh Parkinson",
    hospital: "Nguyên Trưởng Khoa Nội Thần Kinh - Bệnh Viện Chợ Rẫy",
    experienceYears: 28,
    consultationFee: 800000,
    homeVisitFee: 2200000,
    teleconsultFee: 650000,
    image: "/assets/team/dr-thanh.jpg",
    rating: 5.0,
    reviewCount: 420,
    bio: "Gần 3 thập kỷ cống hiến tại BV Chợ Rẫy, chuyên gia tiên phong trong việc thiết lập quy trình cửa sổ vàng 4.5 giờ xử trí đột quỵ thiếu máu não và phục hồi nhận thức người cao niên.",
    highlights: [
      "Chủ tịch phân hội Đột quỵ Lão khoa",
      "Chứng nhận chuyên gia Thần kinh JCI",
      "Hơn 1.000 ca đột quỵ hồi phục",
    ],
    schedule: "Thứ 3, Thứ 5, Thứ 7 (08:30 - 16:30)",
  },
  {
    id: "dr-nguyet",
    name: "TS. BS. Lê Thị Minh Nguyệt",
    title: "Trưởng Khoa Nội Tiết - Đái Tháo Đường & Chuyển Hóa Cao Tuổi",
    specialty: "Nội Tiết & Đái Tháo Đường",
    subSpecialty: "Kiểm soát đường huyết không hạ đường huyết, Bệnh tuyến giáp, Rối loạn lipid máu",
    hospital: "Bác Sĩ Nội Trú - Bệnh Viện Cán Bộ Thống Nhất TP.HCM",
    experienceYears: 20,
    consultationFee: 600000,
    homeVisitFee: 1600000,
    teleconsultFee: 500000,
    image: "/assets/team/dr-nguyet.jpg",
    rating: 4.9,
    reviewCount: 289,
    bio: "Tiến sĩ Y khoa chuyên sâu về đái tháo đường tuýp 2 ở người già có nhiều bệnh nền, cá thể hóa mục tiêu HbA1c nhằm loại bỏ hoàn toàn nguy cơ hạ đường huyết nguy hiểm lúc nửa đêm.",
    highlights: [
      "Thành viên Hiệp hội Đái tháo đường Hoa Kỳ (ADA)",
      "Phác đồ an toàn cho người già đa bệnh lý",
      "Theo dõi CGM liên tục",
    ],
    schedule: "Thứ 2 - Thứ 6 (08:00 - 17:00)",
  },
  {
    id: "dr-phuc",
    name: "BSCKII. Đặng Hoàng Phúc",
    title: "Trưởng Khoa Cơ Xương Khớp & Phục Hồi Chức Năng Vận Động",
    specialty: "Cơ Xương Khớp",
    subSpecialty: "Thoái hóa khớp nặng, Loãng xương gãy xương, Phục hồi sau thay khớp háng/gối",
    hospital: "Nguyên Giảng Viên Bộ Môn Lão Khoa - ĐH Y Dược TP.HCM",
    experienceYears: 19,
    consultationFee: 550000,
    homeVisitFee: 1500000,
    teleconsultFee: 450000,
    image: "/assets/team/dr-phuc.jpg",
    rating: 4.8,
    reviewCount: 195,
    bio: "Bác sĩ Chuyên khoa 2 với kinh nghiệm phục hồi chức năng vận động toàn diện, điều trị tiêm khớp axit hyaluronic nội khớp và giảm đau bảo tồn không phụ thuộc morphin.",
    highlights: [
      "Chuyên gia cơ xương khớp lão khoa",
      "Liệu pháp tế bào mô sinh học",
      "Hồi phục bước đi cho người cao tuổi",
    ],
    schedule: "Thứ 2, Thứ 4, Thứ 6 (08:00 - 16:30)",
  },
  {
    id: "dr-nam",
    name: "ThS. BS. Vũ Hoài Nam",
    title: "Chuyên Gia Hồi Sức Cấp Cứu & Chăm Sóc Giảm Nhẹ Lão Khoa",
    specialty: "Hồi Sức Cấp Cứu",
    subSpecialty:
      "Cấp cứu suy hô hấp, Thông khí nhân tạo, Kiểm soát đau ung thư & chăm sóc cuối đời",
    hospital: "Bác Sĩ Khoa Hồi Sức Tích Cực (ICU) - BV Nhân Dân Gia Định",
    experienceYears: 15,
    consultationFee: 650000,
    homeVisitFee: 1800000,
    teleconsultFee: 500000,
    image: "/assets/team/dr-nam.jpg",
    rating: 4.9,
    reviewCount: 215,
    bio: "Chuyên gia hồi sức cấp cứu chịu trách nhiệm điều phối mạng lưới cấp cứu 24/7 GoCare Dispatch, kinh nghiệm dày dạn trong hồi sức tim phổi và kiểm soát cơn đau mãn tính nhân văn.",
    highlights: [
      "Trưởng kíp cấp cứu Code Red GoCare",
      "Chứng chỉ Quốc tế Hồi sức nâng cao (ACLS)",
      "Túc trực điều phối 24/7",
    ],
    schedule: "Túc trực thường trực 24/7",
  },
  {
    id: "dr-mai",
    name: "TS. BS. Huỳnh Thị Tuyết Mai",
    title: "Chuyên Gia Dinh Dưỡng Lâm Sàng & Tiết Chế Cao Niên",
    specialty: "Dinh Dưỡng & Tiết Chế",
    subSpecialty:
      "Dinh dưỡng qua sonde dạ dày, Dinh dưỡng chống suy kiệt sarcopenia, Tiết chế bệnh thận",
    hospital: "Cố Vấn Dinh Dưỡng Cấp Cao Viện Nghiên Cứu Lão Học & BV Chợ Rẫy",
    experienceYears: 22,
    consultationFee: 500000,
    homeVisitFee: 1400000,
    teleconsultFee: 400000,
    image: "/assets/team/dr-mai.jpg",
    rating: 5.0,
    reviewCount: 310,
    bio: "Hơn 22 năm nghiên cứu và điều trị dinh dưỡng lâm sàng, trực tiếp thiết kế thực đơn năng lượng cao dễ tiêu hóa, chống teo cơ suy mòn cho các cụ cao tuổi tại viện và tại gia.",
    highlights: [
      "Thiết kế thực đơn cá thể hóa 1:1",
      "Chuẩn hóa dinh dưỡng viện 5 sao",
      "Cố vấn Bộ Y Tế về lão khoa",
    ],
    schedule: "Thứ 2 - Thứ 6 (08:30 - 17:00)",
  },
  {
    id: "dr-long",
    name: "BSCKI. Trương Hoàng Long",
    title: "Bác Sĩ Chuyên Khoa Siêu Âm Tim & Mạch Máu Tại Giường",
    specialty: "Tim Mạch & Lão Khoa",
    subSpecialty: "Siêu âm tim Dopper màu, Đo xơ vữa động mạch cảnh, Tầm soát phình động mạch chủ",
    hospital: "Bác Sĩ Khoa Tim Mạch Can Thiệp - Viện Tim TP.HCM",
    experienceYears: 14,
    consultationFee: 500000,
    homeVisitFee: 1500000,
    teleconsultFee: 400000,
    image: "/assets/team/dr-long.jpg",
    rating: 4.8,
    reviewCount: 168,
    bio: "Chuyên gia siêu âm chẩn đoán hình ảnh tim mạch tận nơi với máy siêu âm di động cao cấp, phát hiện sớm nguy cơ huyết khối buồng tim gây tắc mạch não.",
    highlights: [
      "Siêu âm tim tại giường tận nhà",
      "Đo độ đàn hồi mạch máu",
      "Liên thông hồ sơ DICOM trực tuyến",
    ],
    schedule: "Thứ 3, Thứ 5, Chủ Nhật (08:00 - 17:00)",
  },
  {
    id: "dr-hang",
    name: "ThS. BS. Đỗ Thúy Hằng",
    title: "Chuyên Khoa Tâm Thần Kinh & Rối Loạn Giấc Ngủ Người Cao Tuổi",
    specialty: "Tâm Lý & Giấc Ngủ",
    subSpecialty: "Trầm cảm tuổi già, Lo âu mạn tính, Mất ngủ kinh niên, Ảo giác mê sảng",
    hospital: "Bác Sĩ Tâm Thần Kinh Lão Khoa - BV Tâm Thần TP.HCM",
    experienceYears: 13,
    consultationFee: 550000,
    homeVisitFee: 1500000,
    teleconsultFee: 450000,
    image: "/assets/team/dr-hang.jpg",
    rating: 4.9,
    reviewCount: 228,
    bio: "Thạc sĩ Bác sĩ tâm lý học y khoa, tận tâm lắng nghe và giải tỏa căng thẳng tâm lý, hồi sinh giấc ngủ tự nhiên không lạm dụng thuốc an thần gây lệ thuộc cho người cao niên.",
    highlights: [
      "Liệu pháp nhận thức hành vi (CBT-I)",
      "An thần không độc tính Beers",
      "Không gian tâm tình 1:1",
    ],
    schedule: "Thứ 2 - Thứ 7 (09:00 - 18:00)",
  },
  {
    id: "dr-vinh",
    name: "PGS. TS. BS. Nguyễn Văn Vinh",
    title: "Chủ Tịch Hội Đồng Cố Vấn Y Khoa Lão Niên & Tim Mạch",
    specialty: "Tim Mạch & Lão Khoa",
    subSpecialty:
      "Xơ vữa động mạch vành, Bệnh van tim thoái hóa người già, Hội chẩn đa chuyên khoa",
    hospital: "Nguyên Trưởng Khối Nội - Bệnh Viện Chợ Rẫy & Giảng Viên Cao Cấp ĐHYD TP.HCM",
    experienceYears: 36,
    consultationFee: 1000000,
    homeVisitFee: 2500000,
    teleconsultFee: 800000,
    image: "/assets/team/dr-vinh.jpg",
    rating: 5.0,
    reviewCount: 560,
    bio: "Hơn 36 năm cống hiến y học, chuyên gia đầu ngành cố vấn các phác đồ điều trị phức tạp cho bệnh nhân cao tuổi có từ 3 bệnh nền trở lên, giữ gìn chất lượng sống minh mẫn, an yên.",
    highlights: [
      "Thầy thuốc Nhân dân Việt Nam",
      "Đại diện Cleveland Clinic Global Alliance",
      "Hội chẩn quốc tế liên viện",
    ],
    schedule: "Thứ 3 & Thứ 6 (09:00 - 15:30)",
  },
  {
    id: "dr-oanh",
    name: "TS. BS. Trần Thị Kiều Oanh",
    title: "Chuyên Gia Thận Học - Tiết Niệu & Lọc Máu Người Cao Tuổi",
    specialty: "Nội Tiết & Đái Tháo Đường",
    subSpecialty:
      "Suy thận mạn tính giai đoạn 3-5, Nhiễm trùng tiết niệu tái phát, Lọc màng bụng tại nhà",
    hospital: "Bác Sĩ Cố Vấn Cao Cấp - Bệnh Viện Bình Dân & Viện Lão Khoa",
    experienceYears: 21,
    consultationFee: 600000,
    homeVisitFee: 1600000,
    teleconsultFee: 500000,
    image: "/assets/team/dr-oanh.jpg",
    rating: 4.9,
    reviewCount: 247,
    bio: "Chuyên gia hàng đầu trong kiểm soát tiến triển suy thận ở người đái tháo đường và tăng huyết áp lâu năm, ứng dụng kỹ thuật lọc máu và dinh dưỡng thận bảo tồn không cần chạy thận nhân tạo sớm.",
    highlights: [
      "Bảo tồn chức năng thận người cao tuổi",
      "Hướng dẫn lọc màng bụng tại tư gia",
      "Đánh giá mức lọc cầu thận eGFR định kỳ",
    ],
    schedule: "Thứ 2, Thứ 4, Thứ 7 (08:30 - 16:30)",
  },
];

const SPECIALTIES = [
  "Tất Cả Chuyên Khoa",
  "Tim Mạch & Lão Khoa",
  "Thần Kinh & Đột Quỵ",
  "Nội Tiết & Đái Tháo Đường",
  "Cơ Xương Khớp",
  "Hồi Sức Cấp Cứu",
  "Dinh Dưỡng & Tiết Chế",
  "Tâm Lý & Giấc Ngủ",
];

function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất Cả Chuyên Khoa");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Booking Form State
  const [consultType, setConsultType] = useState<"clinic" | "home" | "teleconsult">("clinic");
  const [patientName, setPatientName] = useState("BN. Trần Hoài Phương");
  const [patientPhone, setPatientPhone] = useState("0908 688 829");
  const [appointmentDate, setAppointmentDate] = useState("2026-11-02");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [medicalNotes, setMedicalNotes] = useState(
    "Thăm khám định kỳ huyết áp, rà soát lại thuốc theo phác đồ.",
  );
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically mark agreeTerms = true when user confirms in LegalTermsModal
  useEffect(() => {
    const onAgreed = () => setAgreeTerms(true);
    window.addEventListener("gocare:terms-agreed", onAgreed);
    return () => window.removeEventListener("gocare:terms-agreed", onAgreed);
  }, []);

  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSpecialty =
      selectedSpecialty === "Tất Cả Chuyên Khoa" || doc.specialty === selectedSpecialty;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subSpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleOpenBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAgreeTerms(false);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    if (!agreeTerms) {
      toast.error(
        "Yêu cầu pháp lý: Quý khách vui lòng đọc và bấm chọn đồng ý với Điều khoản pháp lý trước khi xác nhận đặt lịch!",
        { duration: 5000 },
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Connect with Cleveland Clinic protocol API
      await clevelandClinicApi.checkProtocol({
        painLevel: 3,
        symptoms: ["Hội chẩn cùng " + selectedDoctor.name, medicalNotes],
      });

      const appointmentCode = `GC-DOC-${Math.floor(100000 + Math.random() * 900000)}`;
      const typeLabel =
        consultType === "clinic"
          ? "Khám trực tiếp tại Viện GoCare"
          : consultType === "home"
            ? "Bác sĩ đến khám tại tư gia"
            : "Hội chẩn từ xa Tele-consult 1:1";

      toast.success(
        `ĐẶT LỊCH THÀNH CÔNG! Mã hẹn: ${appointmentCode}\nBác sĩ: ${selectedDoctor.name}\nHình thức: ${typeLabel}\nThời gian: ${appointmentTime} ngày ${appointmentDate}`,
        { duration: 8000 },
      );

      setIsBookingOpen(false);
    } catch {
      toast.error("Không thể hoàn tất đặt lịch. Vui lòng thử lại hoặc gọi Hotline 1900 6868.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FBF9] text-stone-900 font-sans">
      <HeaderNav activePath="doctors" />

      <main className="pt-24 pb-20">
        {/* HERO BANNER */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#0A3D31] via-[#0D7C66] to-[#064E3B] text-white p-8 md:p-12 shadow-xl shadow-emerald-950/15 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Đội Ngũ Bác Sĩ Lão Khoa Đầu Ngành Việt Nam</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Hội Tụ Chuyên Gia Y Khoa Cấp Cao Phụng Sự Tuổi Cao Niên
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
                Các Giáo sư, Tiến sĩ, Bác sĩ Chuyên khoa 2 nguyên là Trưởng/Phó khoa từ các bệnh
                viện tuyến đầu (Chợ Rẫy, ĐH Y Dược TP.HCM, BV Thống Nhất, Viện Tim). Tận tâm thăm
                khám tại Viện dưỡng lão, đến tận tư gia hoặc hội chẩn từ xa chuẩn Cleveland Clinic
                Hoa Kỳ.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#FFD580]">verified</span>{" "}
                  100% Bác sĩ có CCHN &amp; kinh nghiệm &gt;14 năm
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#FFD580]">verified</span>{" "}
                  Khám tại gia mang đầy đủ thiết bị chẩn đoán
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#FFD580]">verified</span>{" "}
                  Đồng bộ trực tiếp Bệnh Án Điện Tử HL7 FHIR
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & SPECIALTY FILTER TABS */}
        <section className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bác sĩ, bệnh viện hoặc bệnh lý (ví dụ: Chợ Rẫy, suy tim, đột quỵ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66] transition-all"
              />
            </div>

            {/* Total Results Count */}
            <div className="text-xs text-stone-500 font-semibold shrink-0">
              Hiển thị <span className="text-[#0D7C66] font-bold">{filteredDoctors.length}</span>{" "}
              chuyên gia phù hợp
            </div>
          </div>

          {/* Specialty Pills */}
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  selectedSpecialty === spec
                    ? "bg-[#0D7C66] text-white shadow-md shadow-emerald-900/20"
                    : "bg-white text-stone-700 hover:bg-emerald-50 border border-stone-200"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </section>

        {/* DOCTORS GRID */}
        <section className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Doctor Card Top Header with Photo */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border-2 border-emerald-500/30 shadow-md group-hover:scale-105 transition-transform"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                        title="Đã xác thực chứng chỉ hành nghề"
                      >
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-[#0D7C66] text-[10px] font-bold uppercase tracking-wider mb-1">
                        {doc.specialty}
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#0A3D31] group-hover:text-[#0D7C66] transition-colors leading-snug">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium line-clamp-1 mt-0.5">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 font-bold">
                        <span className="material-symbols-outlined text-sm fill-current text-amber-500">
                          star
                        </span>
                        <span>{doc.rating}</span>
                        <span className="text-stone-400 font-normal">
                          ({doc.reviewCount} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Affiliation */}
                  <div className="mt-4 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-700 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-[#0D7C66] shrink-0 mt-0.5">
                      local_hospital
                    </span>
                    <span className="font-medium leading-tight">{doc.hospital}</span>
                  </div>

                  {/* Sub-specialty description */}
                  <p className="text-xs text-stone-600 mt-3 line-clamp-2 leading-relaxed font-light">
                    {doc.bio}
                  </p>

                  {/* Highlights */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {doc.highlights.map((hl, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#065f46] text-[10px] font-medium border border-emerald-100"
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Pricing & Actions */}
                <div className="p-4 sm:p-6 bg-stone-50/70 border-t border-emerald-100/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Phí khám tại Viện:</span>
                    <strong className="text-base text-[#0D7C66] font-serif font-bold">
                      {doc.consultationFee.toLocaleString("vi-VN")} đ
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                    <span className="truncate">
                      Tư gia: {doc.homeVisitFee.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="truncate text-right">
                      Tele: {doc.teleconsultFee.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleOpenBooking(doc)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00614f] to-[#0D7C66] hover:brightness-110 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">calendar_month</span>
                      <span>Đặt Lịch Ngay</span>
                    </button>
                    <button
                      onClick={() => {
                        toast.info(
                          `Lịch trực của ${doc.name}:\n${doc.schedule}\nVui lòng bấm 'Đặt Lịch Ngay' để chọn giờ.`,
                        );
                      }}
                      className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-stone-700 border border-stone-200 transition-colors"
                      title="Xem lịch trực bác sĩ"
                    >
                      <span className="material-symbols-outlined text-base text-[#0D7C66]">
                        schedule
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL: ĐẶT LỊCH KHÁM BÁC SĨ */}
      {isBookingOpen && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A3D31] to-[#0D7C66] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-14 h-14 rounded-2xl object-cover object-top border-2 border-white/40 shadow-md shrink-0"
                />
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">
                    Đặt Lịch Khám Chuyên Khoa
                  </span>
                  <h3 className="font-serif font-bold text-lg text-white">{selectedDoctor.name}</h3>
                  <p className="text-xs text-emerald-100/90">{selectedDoctor.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
              {/* Consultation Method Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  1. Chọn Hình Thức Khám:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConsultType("clinic")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultType === "clinic"
                        ? "bg-emerald-50 border-[#0D7C66] text-[#0A3D31] shadow-xs"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-base text-[#0D7C66]">
                        domain
                      </span>
                      <strong className="text-xs">Tại Viện GoCare</strong>
                    </div>
                    <span className="text-[11px] block font-semibold text-[#0D7C66]">
                      {selectedDoctor.consultationFee.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-[10px] text-stone-500">Phòng khám JCI Thảo Điền</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType("home")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultType === "home"
                        ? "bg-emerald-50 border-[#0D7C66] text-[#0A3D31] shadow-xs"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-base text-[#0D7C66]">
                        home_health
                      </span>
                      <strong className="text-xs">Khám Tại Tư Gia</strong>
                    </div>
                    <span className="text-[11px] block font-semibold text-[#0D7C66]">
                      {selectedDoctor.homeVisitFee.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-[10px] text-stone-500">Mang máy siêu âm/ECG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType("teleconsult")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultType === "teleconsult"
                        ? "bg-emerald-50 border-[#0D7C66] text-[#0A3D31] shadow-xs"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-base text-[#0D7C66]">
                        video_camera_front
                      </span>
                      <strong className="text-xs">Tele-consult 1:1</strong>
                    </div>
                    <span className="text-[11px] block font-semibold text-[#0D7C66]">
                      {selectedDoctor.teleconsultFee.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-[10px] text-stone-500">Video bảo mật HL7 FHIR</span>
                  </button>
                </div>
              </div>

              {/* Patient Info */}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ngày Hẹn Khám:
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Khung Giờ Khám:
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66]"
                  >
                    <option value="08:30">08:30 Sáng (Khung giờ tối ưu)</option>
                    <option value="09:30">09:30 Sáng</option>
                    <option value="10:30">10:30 Sáng</option>
                    <option value="14:00">14:00 Chiều</option>
                    <option value="15:30">15:30 Chiều</option>
                    <option value="16:30">16:30 Chiều</option>
                  </select>
                </div>
              </div>

              {/* Symptoms / Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mô Tả Triệu Chứng Hoặc Lý Do Khám:
                </label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66] resize-none"
                  placeholder="Ghi chú triệu chứng gần đây hoặc tiền sử thuốc đang dùng..."
                ></textarea>
              </div>

              {/* Bắt buộc: Thỏa thuận văn bản pháp lý */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-stone-800 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="doctor-terms-checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => {
                      if (e.target.checked && !agreeTerms) {
                        triggerLegalTermsModal();
                      } else {
                        setAgreeTerms(e.target.checked);
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded text-[#0D7C66] focus:ring-[#0D7C66] border-stone-300 cursor-pointer accent-[#0D7C66]"
                  />
                  <label
                    htmlFor="doctor-terms-checkbox"
                    className="text-xs leading-relaxed text-stone-700 cursor-pointer select-none"
                  >
                    <strong className="text-amber-950 font-bold block mb-0.5">
                      Văn bản pháp lý bắt buộc:
                    </strong>
                    Tôi xác nhận đã đọc, hiểu rõ và{" "}
                    <a
                      href="/terms"
                      onClick={(e) => {
                        e.preventDefault();
                        triggerLegalTermsModal();
                      }}
                      className="font-bold text-[#0D7C66] underline hover:text-[#00614f] cursor-pointer inline-block"
                    >
                      đồng ý với Văn bản Pháp lý &amp; Điều khoản dịch vụ y tế
                    </a>{" "}
                    của GoCare trước khi hoàn tất đặt lịch.
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => triggerLegalTermsModal()}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-[#0D7C66] border border-[#0D7C66] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  <span>
                    {agreeTerms
                      ? "Đã Đồng Ý (Bấm để xem lại văn bản pháp lý)"
                      : "Bấm Vào Đây Để Xem Văn Bản Pháp Lý & Đồng Ý"}
                  </span>
                </button>
                <p className="text-[11px] text-amber-900 flex items-center gap-1 font-medium pl-1">
                  <span className="material-symbols-outlined text-[13px] text-amber-700">
                    {agreeTerms ? "check_circle" : "lock"}
                  </span>
                  {agreeTerms
                    ? "Đã xác nhận đồng ý điều khoản. Quý khách có thể bấm 'Xác Nhận Đặt Lịch' ngay."
                    : "Bắt buộc bấm đồng ý văn bản pháp lý để mở khóa nút đặt lịch."}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200">
                <span className="text-xs text-stone-500">
                  Xác nhận thông tin qua SMS &amp; Cổng Bệnh Nhân GoCare
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreeTerms}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                      agreeTerms && !isSubmitting
                        ? "bg-[#0D7C66] hover:bg-[#00614f] text-white cursor-pointer"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed opacity-75"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">
                          progress_activity
                        </span>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">
                          {agreeTerms ? "check_circle" : "lock"}
                        </span>
                        <span>Xác Nhận Đặt Lịch</span>
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
