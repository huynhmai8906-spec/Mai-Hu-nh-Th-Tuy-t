import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function triggerLegalTermsModal() {
  if (typeof (window as any).showLegalTermsModal === "function") {
    (window as any).showLegalTermsModal();
  } else if (typeof (window as any).openLegalTermsModal === "function") {
    (window as any).openLegalTermsModal();
  }
  window.dispatchEvent(new CustomEvent("gocare:open-legal-terms"));
}

export function LegalTermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "full" | "privacy">("summary");

  useEffect(() => {
    const showModal = () => setIsOpen(true);
    (window as any).showLegalTermsModal = showModal;
    (window as any).openLegalTermsModal = showModal;

    const handleOpen = () => setIsOpen(true);
    window.addEventListener("gocare:open-legal-terms", handleOpen);
    return () => {
      window.removeEventListener("gocare:open-legal-terms", handleOpen);
    };
  }, []);

  const handleAgreeAndClose = () => {
    // Auto check any visible terms agreement checkboxes
    const checkbox = document.getElementById("terms-agreement-checkbox") as HTMLInputElement | null;
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof (window as any).handleLegalAgreementChange === "function") {
        (window as any).handleLegalAgreementChange(true);
      }
    }
    const liveCheckbox = document.getElementById(
      "live-booking-terms-checkbox",
    ) as HTMLInputElement | null;
    if (liveCheckbox) liveCheckbox.checked = true;

    const pharmacyCheckbox = document.getElementById(
      "pharmacy-terms-checkbox",
    ) as HTMLInputElement | null;
    if (pharmacyCheckbox) {
      pharmacyCheckbox.checked = true;
      pharmacyCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof (window as any).handlePharmacyTermsChange === "function") {
        (window as any).handlePharmacyTermsChange(true);
      }
    }

    // Also dispatch custom event for react components
    window.dispatchEvent(new CustomEvent("gocare:terms-agreed"));
    toast.success(
      "Quý khách đã xác nhận đồng ý với Điều khoản pháp lý & Quy chế giao dịch GoCare.",
    );
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-emerald-900/10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#00614f] via-[#0D7C66] to-[#10B981] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-2xl">gavel</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  VĂN BẢN PHÁP LÝ BẮT BUỘC
                </span>
                <span className="text-xs text-emerald-100 font-medium hidden sm:inline">
                  Hiệu lực: Năm 2026
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight mt-0.5">
                Điều Khoản Dịch Vụ, Quy Chế Đặt Hàng &amp; Bảo Mật Dữ Liệu Y Tế GoCare
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/terms"
              onClick={() => setIsOpen(false)}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
              title="Xem trang toàn văn"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Toàn Trang</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "summary"
                  ? "bg-[#0D7C66] text-white shadow-xs"
                  : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
              }`}
            >
              1. Tóm Tắt Quyền Lợi &amp; Trách Nhiệm
            </button>
            <button
              onClick={() => setActiveTab("full")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "full"
                  ? "bg-[#0D7C66] text-white shadow-xs"
                  : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
              }`}
            >
              2. Toàn Văn 11 Điều Khoản Giao Dịch
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-[#0D7C66] text-white shadow-xs"
                  : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
              }`}
            >
              3. Bảo Mật Dữ Liệu Y Tế (NĐ 13/2023)
            </button>
          </div>
          <span className="text-[11px] text-stone-500 font-medium hidden md:inline shrink-0">
            Luật Khám bệnh, chữa bệnh số 15/2023/QH15
          </span>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm leading-relaxed max-h-[60vh] select-text">
          {/* Important Notice Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-950 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-2xl shrink-0 mt-0.5">
              shield_with_heart
            </span>
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-amber-900">
                Lưu ý bắt buộc đối với Khách hàng &amp; Thân nhân trước khi đặt hàng:
              </strong>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Theo quy định tại <strong>Nghị định 52/2013/NĐ-CP</strong> (sửa đổi, bổ sung bởi{" "}
                <strong>Nghị định 85/2021/NĐ-CP</strong>) về Thương mại điện tử và{" "}
                <strong>Luật Khám bệnh, chữa bệnh số 15/2023/QH15</strong>, Khách hàng bắt buộc phải
                đọc rõ các điều khoản và bấm xác nhận đồng ý thì đơn hàng/lệnh đặt cọc dịch vụ y tế
                mới được hệ thống phê duyệt và có hiệu lực pháp lý ràng buộc.
              </p>
            </div>
          </div>

          {activeTab === "summary" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0D7C66] text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  Năng Lực Giao Kết Hợp Đồng &amp; Đại Diện Cho Người Cao Tuổi
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-600 pl-8">
                  Người thực hiện đặt dịch vụ cam kết đã đủ 18 tuổi, có đầy đủ năng lực hành vi dân
                  sự. Trường hợp đặt hộ người cao tuổi, người đặt xác nhận là người giám hộ, thân
                  nhân được ủy quyền hợp pháp để đưa ra quyết định chăm sóc y tế và thanh toán chi
                  phí.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0D7C66] text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  Tính Chất Của Lệnh Đặt Cọc &amp; Xác Lập Hợp Đồng Dịch Vụ
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-600 pl-8">
                  Khi bấm &quot;Tiến Hành Đặt Cọc &amp; Ký Hợp Đồng&quot; hoặc &quot;Xác Nhận Đặt
                  Lịch&quot;, hệ thống GoCare sẽ khóa lịch trực của Bác sĩ / Điều dưỡng CCHN hoặc
                  giữ phòng dưỡng lão VIP. Bộ phận Điều phối Y tế sẽ gọi điện xác thực thông tin y
                  khoa của người bệnh trong vòng <strong>15 phút</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0D7C66] text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  Chính Sách Đổi Lịch, Hủy Dịch Vụ &amp; Hoàn Tiền Cọc 100%
                </h3>
                <ul className="mt-2 text-xs sm:text-sm text-stone-600 pl-8 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Miễn phí đổi lịch</strong>: Trước giờ hẹn tối thiểu 12 tiếng đối với
                    dịch vụ khám tại nhà và ca điều dưỡng.
                  </li>
                  <li>
                    <strong>Hoàn cọc 100%</strong>: Trường hợp người bệnh có diễn biến sức khỏe bất
                    ngờ cần chuyển viện cấp cứu hoặc có chỉ định chống chỉ định y khoa bằng văn bản
                    từ Bác sĩ điều trị.
                  </li>
                  <li>
                    <strong>Hủy dịch vụ do khách quan</strong>: Hoàn tiền trong 3 - 5 ngày làm việc
                    qua tài khoản ngân hàng đã thanh toán.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0D7C66] text-xs font-black flex items-center justify-center">
                    4
                  </span>
                  Minh Bạch Về Chứng Chỉ Hành Nghề (CCHN) &amp; Tiêu Chuẩn 5 Sao
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-600 pl-8">
                  100% Bác sĩ và Điều dưỡng viên GoCare điều phối đến nhà bệnh nhân đều có Chứng chỉ
                  hành nghề do Bộ Y Tế hoặc Sở Y Tế TP.HCM cấp, có bảo hiểm trách nhiệm nghề nghiệp
                  y tế, mang thẻ công tác và hồ sơ chuyên môn sẵn sàng đối chiếu khi phục vụ.
                </p>
              </div>
            </div>
          )}

          {activeTab === "full" && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 1: CĂN CỨ PHÁP LÝ &amp; PHẠM VI ÁP DỤNG
                </h4>
                <p className="mt-1 text-stone-600">
                  Căn cứ Bộ luật Dân sự 2015, Luật Khám bệnh, chữa bệnh số 15/2023/QH15, Luật Dược
                  105/2016/QH13, Luật Bảo vệ quyền lợi người tiêu dùng 2023, Nghị định
                  52/2013/NĐ-CP, Nghị định 85/2021/NĐ-CP và Nghị định 13/2023/NĐ-CP. Áp dụng cho mọi
                  giao dịch đặt mua gói dưỡng lão, đặt khám Bác sĩ, đặt điều dưỡng tại gia và mua
                  dược phẩm.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 2: TƯ CÁCH PHÁP LÝ &amp; NĂNG LỰC NGƯỜI ĐẶT HÀNG
                </h4>
                <p className="mt-1 text-stone-600">
                  Khách hàng cam kết đủ 18 tuổi, có năng lực hành vi dân sự. Người đặt hộ cho cha mẹ
                  hoặc người cao tuổi cam kết là người giám hộ hoặc thân nhân được ủy quyền hợp
                  pháp.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 3: BẮT BUỘC ĐỒNG Ý ĐIỀU KHOẢN TRƯỚC KHI TẠO ĐƠN
                </h4>
                <p className="mt-1 text-stone-600">
                  Khách hàng bắt buộc phải bấm tích chọn đồng ý với văn bản pháp lý này trước khi
                  bấm Đặt Hàng. Việc xác nhận này tạo nên hợp đồng dịch vụ y tế điện tử có giá trị
                  ràng buộc theo pháp luật Việt Nam.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 4: BIỂU PHÍ DỊCH VỤ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN
                </h4>
                <p className="mt-1 text-stone-600">
                  Giá niêm yết bằng VND đã bao gồm VAT và vật tư tiêu hao chuẩn y tế. Mức giảm trừ
                  bảo hiểm BHYT trên website là ước tính và sẽ được quyết toán trên hóa đơn y tế
                  chính thức.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 5: CHÍNH SÁCH ĐỔI LỊCH &amp; HOÀN CỌC 100%
                </h4>
                <p className="mt-1 text-stone-600">
                  Miễn phí đổi lịch trước 12 tiếng. Hoàn cọc 100% trong trường hợp người bệnh có chỉ
                  định nhập viện cấp cứu hoặc hoãn can thiệp từ Bác sĩ. Tiền hoàn trả trong 3 - 5
                  ngày làm việc.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 6: TIÊU CHUẨN CHỨNG CHỈ HÀNH NGHỀ (CCHN)
                </h4>
                <p className="mt-1 text-stone-600">
                  100% Bác sĩ và Điều dưỡng viên có Chứng chỉ hành nghề do Bộ Y Tế hoặc Sở Y Tế cấp,
                  mang thẻ công tác và có bảo hiểm trách nhiệm nghề nghiệp y tế toàn diện.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 7: BẢO VỆ DỮ LIỆU CÁ NHÂN Y TẾ (NGHỊ ĐỊNH 13/2023/NĐ-CP)
                </h4>
                <p className="mt-1 text-stone-600">
                  Thông tin sinh hiệu, nhóm máu, dị ứng thuốc và đơn thuốc được bảo vệ theo chế độ
                  dữ liệu nhạy cảm cấp cao nhất. Mã hóa chuẩn HL7 FHIR R4 và TLS 1.3 / AES-256.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 8: QUY CHẾ DƯỢC PHẨM &amp; ĐỐI TÁC LONG CHÂU, AN KHANG
                </h4>
                <p className="mt-1 text-stone-600">
                  Thuốc kê đơn bắt buộc có toa Bác sĩ. Sản phẩm được điều phối chính hãng từ mạng
                  lưới FPT Long Châu và An Khang, bảo quản GSP 15-25°C và giao nhanh trong 1-2h.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 9: XỬ TRÍ TÌNH HUỐNG CẤP CỨU KHẨN CẤP (CODE RED)
                </h4>
                <p className="mt-1 text-stone-600">
                  Trường hợp đe dọa tính mạng cấp tính (ngưng tim, đột quỵ cấp), người nhà cần gọi
                  ngay Hotline cấp cứu 1900 6868 hoặc 115 để xuất xe cấp cứu ICU di động.
                </p>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 10: GIẢI QUYẾT KHIẾU NẠI &amp; TRANH CHẤP
                </h4>
                <p className="mt-1 text-stone-600">
                  Khiếu nại được tiếp nhận 24/7 qua 1900 6868 và xử lý bằng văn bản trong 24-48 giờ.
                  Tranh chấp được điều chỉnh bởi pháp luật Việt Nam tại Tòa án TP.HCM.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A3D31] uppercase tracking-wide">
                  ĐIỀU 11: HIỆU LỰC THI HÀNH &amp; CAM KẾT
                </h4>
                <p className="mt-1 text-stone-600 font-medium">
                  Bằng việc bấm tích chọn &quot;Tôi đồng ý với Điều khoản pháp lý&quot;, Khách hàng
                  cam kết đã đọc, hiểu rõ và tuân thủ toàn bộ 11 điều khoản nêu trên.
                </p>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <strong className="block text-xs font-bold text-emerald-900 uppercase">
                  CAM KẾT TUÂN THỦ NGHỊ ĐỊNH 13/2023/NĐ-CP VỀ BẢO VỆ DỮ LIỆU CÁ NHÂN
                </strong>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  GoCare coi dữ liệu sức khỏe, kết quả sinh hiệu, hồ sơ tiền sử bệnh án của Quý
                  khách là dữ liệu cá nhân nhạy cảm đặc biệt và cam kết bảo vệ ở cấp độ an toàn cao
                  nhất.
                </p>
              </div>
              <ul className="space-y-2.5 text-stone-600 list-disc list-inside">
                <li>
                  <strong>Mục đích thu thập</strong>: Chỉ sử dụng cho mục đích hội chẩn y khoa, cảnh
                  báo tương tác thuốc nguy hiểm, điều phối xe cấp cứu và chăm sóc sức khỏe cho người
                  bệnh.
                </li>
                <li>
                  <strong>Chuẩn mã hóa y tế quốc tế</strong>: Toàn bộ dữ liệu bệnh án điện tử (EHR)
                  được mã hóa chuẩn HL7 FHIR R4 và lưu trữ an toàn với giao thức bảo mật cấp ngân
                  hàng TLS 1.3 / AES-256.
                </li>
                <li>
                  <strong>Quyền của chủ thể dữ liệu</strong>: Khách hàng có quyền truy cập, chỉnh
                  sửa, yêu cầu trích xuất dữ liệu bệnh án (chuẩn FHIR JSON) hoặc yêu cầu xóa dữ liệu
                  bất kỳ lúc nào qua Cổng Bệnh Nhân GoCare.
                </li>
                <li>
                  <strong>Không chia sẻ cho bên thứ ba</strong>: Tuyệt đối không bán hoặc cung cấp
                  thông tin y tế cho bất kỳ đơn vị quảng cáo hoặc thương mại nào.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-stone-600 text-xs">
            <span className="material-symbols-outlined text-[#0D7C66] text-lg">verified_user</span>
            <span>Chứng thực pháp lý bởi Ban Cố Vấn Y Tế &amp; Pháp Chế GoCare Luxury Health</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/terms"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors text-center"
            >
              Xem Trang Toàn Văn
            </Link>
            <button
              type="button"
              onClick={handleAgreeAndClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00614f] via-[#0D7C66] to-[#10B981] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Tôi Đã Đọc Kỹ &amp; Đồng Ý Điều Khoản</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
