import { createFileRoute, Link } from "@tanstack/react-router";
import { HeaderNav } from "@/components/HeaderNav";
import { toast } from "sonner";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Văn Bản Pháp Lý & Điều Khoản Đặt Hàng | GoCare" },
      {
        name: "description",
        content:
          "Văn bản pháp lý chính thức về Điều khoản dịch vụ y tế, quy chế thương mại điện tử, bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và Luật Khám bệnh, chữa bệnh.",
      },
      { property: "og:title", content: "Văn Bản Pháp Lý & Điều Khoản Đặt Hàng | GoCare" },
      {
        property: "og:description",
        content:
          "Quy chế đặt cọc, hợp đồng dịch vụ y tế và cam kết bảo vệ dữ liệu sức khỏe người bệnh GoCare.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const handlePrint = () => {
    window.print();
  };

  const handleAgreeGlobal = () => {
    // Check any active checkbox in drawers or modals
    const cb1 = document.getElementById("terms-agreement-checkbox") as HTMLInputElement | null;
    if (cb1) {
      cb1.checked = true;
      cb1.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof (window as any).handleLegalAgreementChange === "function") {
        (window as any).handleLegalAgreementChange(true);
      }
    }
    const cb2 = document.getElementById("live-booking-terms-checkbox") as HTMLInputElement | null;
    if (cb2) cb2.checked = true;

    const cb3 = document.getElementById("pharmacy-terms-checkbox") as HTMLInputElement | null;
    if (cb3) {
      cb3.checked = true;
      cb3.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof (window as any).handlePharmacyTermsChange === "function") {
        (window as any).handlePharmacyTermsChange(true);
      }
    }

    window.dispatchEvent(new CustomEvent("gocare:terms-agreed"));
    toast.success(
      "Quý khách đã xác nhận đồng ý với toàn bộ Văn bản Pháp lý & Điều khoản dịch vụ GoCare!",
    );
  };

  return (
    <div className="min-h-screen bg-[#F7FBF9] text-stone-900 font-sans">
      <HeaderNav />

      <main className="pt-28 pb-24 max-w-5xl mx-auto px-6">
        {/* Top Control Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D7C66] hover:text-[#00614f] transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Quay lại trang chủ</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>In Văn Bản Này</span>
            </button>
            <button
              onClick={handleAgreeGlobal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00614f] via-[#0D7C66] to-[#10B981] hover:brightness-110 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Tôi Đồng Ý Điều Khoản</span>
            </button>
          </div>
        </div>

        {/* Official Document Sheet */}
        <article className="bg-white rounded-3xl p-8 sm:p-14 shadow-xl border border-stone-200/80 space-y-8 select-text">
          {/* Quốc Hiệu & Tiêu Ngữ */}
          <div className="text-center space-y-1 pb-6 border-b-2 border-stone-800">
            <h4 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-900">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h4>
            <p className="text-xs sm:text-sm font-serif italic text-stone-800">
              Độc lập – Tự do – Hạnh phúc
            </p>
            <div className="w-32 h-[1px] bg-stone-800 mx-auto mt-2"></div>
            <div className="pt-4">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#0D7C66] border border-emerald-200 text-[11px] font-black uppercase tracking-wider">
                VĂN BẢN PHÁP LÝ CHÍNH THỨC SỐ: 01/2026/GOCARE-LEGAL
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-bold text-[#0A3D31] pt-3 leading-tight tracking-tight">
              ĐIỀU KHOẢN DỊCH VỤ, QUY CHẾ HOẠT ĐỘNG THƯƠNG MẠI ĐIỆN TỬ
              <br />
              VÀ CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN Y TẾ
            </h1>
            <p className="text-xs text-stone-500 pt-1">
              Ban hành bởi Hội đồng Cố vấn Pháp chế &amp; Ban Giám đốc Y khoa Hệ thống GoCare Luxury
              Healthcare
              <br />
              (Áp dụng từ ngày 01 tháng 01 năm 2026 cho mọi giao dịch đặt hàng, đặt lịch và thanh
              toán dịch vụ)
            </p>
          </div>

          {/* Căn Cứ Pháp Lý */}
          <section className="bg-amber-50/80 p-5 rounded-2xl border border-amber-300 text-stone-800 text-xs sm:text-sm space-y-2">
            <h2 className="font-bold text-amber-950 uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-800 text-lg">gavel</span>
              CĂN CỨ PHÁP LÝ BAN HÀNH:
            </h2>
            <ul className="list-disc list-inside space-y-1 text-stone-700 leading-relaxed pl-2 font-light">
              <li>
                Căn cứ <strong>Bộ luật Dân sự số 91/2015/QH13</strong> ngày 24/11/2015 của Quốc hội
                Nước CHXHCN Việt Nam;
              </li>
              <li>
                Căn cứ <strong>Luật Khám bệnh, chữa bệnh số 15/2023/QH15</strong> có hiệu lực từ
                ngày 01/01/2024;
              </li>
              <li>
                Căn cứ <strong>Luật Dược số 105/2016/QH13</strong> và các Thông tư hướng dẫn quản lý
                nhà thuốc chuẩn GSP;
              </li>
              <li>
                Căn cứ <strong>Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15</strong>;
              </li>
              <li>
                Căn cứ <strong>Nghị định số 52/2013/NĐ-CP</strong> và{" "}
                <strong>Nghị định số 85/2021/NĐ-CP</strong> của Chính phủ về Thương mại điện tử;
              </li>
              <li>
                Căn cứ <strong>Nghị định số 13/2023/NĐ-CP</strong> ngày 17/04/2023 của Chính phủ về
                Bảo vệ dữ liệu cá nhân;
              </li>
              <li>
                Căn cứ <strong>Giấy phép hoạt động khám bệnh, chữa bệnh số 08842/BYT-GPHĐ</strong>{" "}
                do Bộ Y Tế cấp.
              </li>
            </ul>
          </section>

          {/* NỘI DUNG CHI TIẾT 11 ĐIỀU KHOẢN */}
          <div className="space-y-8 text-stone-800 text-xs sm:text-sm leading-relaxed">
            {/* ĐIỀU 1 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 1
                </span>
                ĐỊNH NGHĨA VÀ GIẢI THÍCH THUẬT NGỮ
              </h3>
              <p className="pl-2">
                <strong>1.1. &quot;Hệ sinh thái GoCare&quot;</strong>: Bao gồm Viện Dưỡng Lão Nghỉ
                Dưỡng Lão Khoa 5 Sao, Trung tâm Điều dưỡng tư gia CCHN 24/7, Cổng Bệnh Nhân điện tử
                EHR và Nhà thuốc trực tuyến chuẩn y khoa.
                <br />
                <strong>1.2. &quot;Khách hàng&quot;</strong>: Là cá nhân trực tiếp thụ hưởng dịch vụ
                y tế (người cao tuổi, bệnh nhân) hoặc thân nhân, người đại diện theo ủy quyền hợp
                pháp của người bệnh.
                <br />
                <strong>1.3. &quot;Hợp đồng dịch vụ y tế điện tử&quot;</strong>: Là thỏa thuận được
                xác lập trực tuyến giữa Khách hàng và GoCare thông qua việc bấm tích chọn đồng ý
                điều khoản và tiến hành đặt cọc hoặc xác nhận đặt lịch trên website.
                <br />
                <strong>1.4. &quot;Điều dưỡng CCHN&quot;</strong>: Là nhân viên y tế đã được cấp
                Chứng chỉ hành nghề khám bệnh, chữa bệnh theo Luật Khám bệnh, chữa bệnh của Việt
                Nam, chịu sự quản lý chuyên môn của Giám đốc Y khoa GoCare.
              </p>
            </section>

            {/* ĐIỀU 2 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 2
                </span>
                TƯ CÁCH PHÁP LÝ &amp; NĂNG LỰC CỦA NGƯỜI ĐẶT HÀNG
              </h3>
              <p className="pl-2">
                <strong>2.1. Năng lực hành vi dân sự</strong>: Khách hàng xác nhận có đầy đủ năng
                lực hành vi dân sự theo quy định của pháp luật Việt Nam tại thời điểm tạo đơn hàng.
                <br />
                <strong>2.2. Đại diện cho người cao tuổi</strong>: Trường hợp người con hoặc người
                thân nhân đứng tên đặt dịch vụ nghỉ dưỡng, khám chữa bệnh cho cha mẹ hoặc người cao
                tuổi:
                <br />
                - Người đặt cam kết có sự đồng thuận của gia đình và người bệnh.
                <br />- Chịu trách nhiệm pháp lý về tính chính xác của các thông tin khai báo bệnh
                nền, tiền sử dị ứng thuốc và thông tin liên hệ khẩn cấp.
              </p>
            </section>

            {/* ĐIỀU 3 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 3
                </span>
                QUY TRÌNH ĐẶT HÀNG &amp; YÊU CẦU BẮT BUỘC ĐỒNG Ý TRƯỚC KHI TẠO ĐƠN
              </h3>
              <p className="pl-2">
                <strong>3.1. Cơ chế bắt buộc bấm đồng ý</strong>: Theo quy định tại Điều 17 Nghị
                định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP về điều kiện giao dịch chung trong
                thương mại điện tử, Khách hàng{" "}
                <strong>
                  bắt buộc phải bấm chọn hộp kiểm (checkbox) xác nhận đã đọc và đồng ý toàn bộ văn
                  bản pháp lý này
                </strong>{" "}
                thì nút Đặt hàng / Đặt cọc / Xuất ca mới được mở khóa để thực hiện giao kết.
                <br />
                <strong>3.2. Hiệu lực hợp đồng điện tử</strong>: Đơn hàng sau khi được xác nhận trên
                hệ thống có giá trị chứng cứ pháp lý và giá trị ràng buộc nghĩa vụ giữa hai bên
                tương đương hợp đồng văn bản ký kết tay.
                <br />
                <strong>3.3. Thời gian phản hồi</strong>: Sau khi nhận được đơn hàng dịch vụ, Tổng
                đài Điều phối Y tế GoCare (Hotline: 1900 6868) sẽ liên hệ xác minh thông tin lâm
                sàng và điều kiện đón tiếp trong vòng tối đa <strong>15 phút</strong>.
              </p>
            </section>

            {/* ĐIỀU 4 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 4
                </span>
                BIỂU PHÍ DỊCH VỤ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN
              </h3>
              <p className="pl-2">
                <strong>4.1. Bảng giá niêm yết</strong>: Mọi chi phí phòng suite nghỉ dưỡng, ca điều
                dưỡng tại gia và phí khám Bác sĩ chuyên khoa được niêm yết công khai bằng Đồng Việt
                Nam (VND), đã bao gồm thuế Giá trị gia tăng (VAT) và các trang thiết bị y tế tiêu
                hao chuẩn kèm theo.
                <br />
                <strong>4.2. Khấu trừ bảo hiểm</strong>: Mức ước tính giảm trừ Bảo hiểm Y tế (BHYT)
                hoặc Bảo hiểm tư nhân quốc tế chỉ có giá trị tạm tính trên website và sẽ được thanh
                quyết toán chính thức căn cứ trên thẻ bảo hiểm gốc cùng hồ sơ phê duyệt bồi thường
                thực tế.
                <br />
                <strong>4.3. Phương thức thanh toán</strong>: Khách hàng có thể thanh toán tiền đặt
                cọc hoặc chi phí trọn gói qua chuyển khoản ngân hàng trực tiếp, thẻ
                Visa/Mastercard/JCB hoặc tiền mặt có hóa đơn điện tử hợp lệ của Bộ Tài Chính.
              </p>
            </section>

            {/* ĐIỀU 5 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 5
                </span>
                CHÍNH SÁCH ĐỔI LỊCH, HỦY DỊCH VỤ &amp; HOÀN TIỀN CỌC 100%
              </h3>
              <div className="pl-2 space-y-1.5">
                <p>
                  <strong>5.1. Miễn phí đổi lịch</strong>: Khách hàng được quyền đổi thời gian khám
                  hoặc ca điều dưỡng miễn phí nếu thông báo trước giờ hẹn tối thiểu{" "}
                  <strong>12 tiếng</strong>.
                </p>
                <p>
                  <strong>
                    5.2. Hoàn cọc 100% không thu phí trong các trường hợp bất khả kháng y khoa
                  </strong>
                  :
                  <br />
                  - Người bệnh có diễn biến sức khỏe bất thường cần nhập viện cấp cứu tại cơ sở hồi
                  sức tuyến trên.
                  <br />- Có chỉ định chống chỉ định can thiệp hoặc tạm hoãn điều trị bằng văn bản
                  của Bác sĩ chuyên khoa.
                </p>
                <p>
                  <strong>5.3. Thời hạn hoàn tiền</strong>: Tiền hoàn cọc được chuyển khoản hoàn trả
                  về tài khoản của Khách hàng trong vòng <strong>3 đến 5 ngày làm việc</strong> kể
                  từ khi bộ phận Chăm sóc Khách hàng xác nhận thủ tục hoàn hủy.
                </p>
              </div>
            </section>

            {/* ĐIỀU 6 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 6
                </span>
                TIÊU CHUẨN CHỨNG CHỈ HÀNH NGHỀ &amp; TRÁCH NHIỆM NGHỀ NGHIỆP Y TẾ
              </h3>
              <p className="pl-2">
                <strong>6.1. Chứng chỉ hành nghề hợp pháp</strong>: 100% Bác sĩ và Điều dưỡng viên
                thực hiện thăm khám tại gia hoặc phụ trách phòng nghỉ dưỡng GoCare đều sở hữu Chứng
                chỉ hành nghề khám bệnh, chữa bệnh do Bộ Y Tế hoặc Sở Y Tế cấp có thẩm quyền, đã qua
                đào tạo chuyên sâu về Hồi sức cấp cứu và Chăm sóc Lão khoa.
                <br />
                <strong>6.2. Bảo hiểm trách nhiệm nghề nghiệp</strong>: GoCare duy trì hợp đồng bảo
                hiểm trách nhiệm nghề nghiệp y tế toàn diện cho toàn bộ đội ngũ y bác sĩ, bảo đảm an
                toàn và quyền lợi bồi thường tối đa cho bệnh nhân theo chuẩn mực quốc tế.
                <br />
                <strong>6.3. Minh bạch hồ sơ</strong>: Khách hàng và gia đình có quyền kiểm tra thẻ
                nhân viên y tế, số hiệu CCHN và hồ sơ năng lực của Điều dưỡng viên trước khi bắt đầu
                ca trực tại nhà.
              </p>
            </section>

            {/* ĐIỀU 7 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 7
                </span>
                BẢO VỆ DỮ LIỆU CÁ NHÂN &amp; HỒ SƠ Y KHOA (NGHỊ ĐỊNH 13/2023/NĐ-CP)
              </h3>
              <div className="pl-2 space-y-1.5">
                <p>
                  <strong>7.1. Dữ liệu sức khỏe là dữ liệu cá nhân nhạy cảm</strong>: Các thông tin
                  bao gồm nhóm máu, tiền sử dị ứng thuốc (Penicillin, NSAIDs), chỉ số sinh hiệu
                  (Huyết áp, ECG, SpO2), chẩn đoán bệnh án và đơn thuốc được bảo vệ theo chế độ bảo
                  mật cấp độ cao nhất quy định tại Nghị định số 13/2023/NĐ-CP.
                </p>
                <p>
                  <strong>7.2. Phạm vi sử dụng</strong>: GoCare chỉ sử dụng dữ liệu y tế phục vụ mục
                  đích hội chẩn, cảnh báo tương tác thuốc tự động qua thuật toán y khoa, điều phối
                  cấp cứu và chăm sóc sức khỏe cho người bệnh. Tuyệt đối không chia sẻ hoặc thương
                  mại hóa thông tin cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý bằng văn bản của
                  Khách hàng.
                </p>
                <p>
                  <strong>7.3. Tiêu chuẩn mã hóa</strong>: Dữ liệu hồ sơ bệnh án điện tử (EHR) được
                  lưu trữ trên hạ tầng điện toán bảo mật, mã hóa đường truyền chuẩn quốc tế HL7 FHIR
                  R4 và TLS 1.3 / AES-256. Khách hàng có quyền truy cập, sao lưu hoặc yêu cầu xóa dữ
                  liệu bất kỳ lúc nào qua Cổng Bệnh Nhân GoCare.
                </p>
              </div>
            </section>

            {/* ĐIỀU 8 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 8
                </span>
                QUY CHẾ PHÂN PHỐI DƯỢC PHẨM &amp; ĐƠN THUỐC BÁC SĨ
              </h3>
              <p className="pl-2">
                <strong>8.1. Thuốc kê đơn</strong>: Đối với các loại thuốc biệt dược thuộc danh mục
                thuốc kê đơn (ETC) như thuốc huyết áp, tim mạch, đái tháo đường, kháng sinh: Khách
                hàng bắt buộc phải cung cấp đơn thuốc hợp lệ của Bác sĩ chuyên khoa. Dược sĩ Lão
                khoa GoCare sẽ rà soát liều dùng và chống chỉ định trước khi xuất kho.
                <br />
                <strong>8.2. Mạng lưới liên kết đối tác</strong>: Các sản phẩm thuốc và thực phẩm bổ
                sung xương khớp được điều phối trực tiếp từ mạng lưới hơn 2.500 nhà thuốc chính hãng
                của <strong>FPT Long Châu</strong> và{" "}
                <strong>Nhà thuốc An Khang (MWG Group)</strong>, bảo quản chuẩn GSP 15–25°C và giao
                nhanh trong 1–2 giờ.
              </p>
            </section>

            {/* ĐIỀU 9 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 9
                </span>
                GIỚI HẠN TRÁCH NHIỆM &amp; XỬ TRÍ TÌNH HUỐNG CẤP CỨU KHẨN CẤP (CODE RED)
              </h3>
              <p className="pl-2">
                <strong>9.1. Trách nhiệm trung thực</strong>: Khách hàng và gia đình có nghĩa vụ
                cung cấp thông tin trung thực về tiền sử bệnh, dị ứng thuốc và trạng thái thể chất
                của người cao tuổi. GoCare được miễn trừ trách nhiệm đối với các biến chứng phát
                sinh do gia đình cố ý che giấu thông tin y khoa quan trọng.
                <br />
                <strong>9.2. Kích hoạt Code Red cấp cứu</strong>: Dịch vụ đặt lịch và tư vấn trực
                tuyến không thay thế hoàn toàn cho cấp cứu ngoại viện đối với các trường hợp đe dọa
                tính mạng cấp tính (ngưng tim, sốc phản vệ độ 3, tai biến mạch máu não cấp). Khi xảy
                ra tình huống khẩn cấp, người nhà cần liên hệ ngay Hotline Cấp Cứu GoCare{" "}
                <strong>1900 6868</strong> hoặc gọi <strong>115</strong> để kích hoạt xe cứu thương
                ICU di động.
              </p>
            </section>

            {/* ĐIỀU 10 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 10
                </span>
                CƠ CHẾ GIẢI QUYẾT KHIẾU NẠI, TRANH CHẤP &amp; LUẬT ĐIỀU CHỈNH
              </h3>
              <p className="pl-2">
                <strong>10.1. Tiếp nhận khiếu nại</strong>: Mọi phản ánh về chất lượng phục vụ của
                Bác sĩ, Điều dưỡng viên hoặc sự cố đơn hàng được tiếp nhận 24/7 qua đường dây nóng{" "}
                <strong>1900 6868</strong> hoặc email: <em>phapche@gocare.vn</em>. Ban Giám đốc Y
                khoa cam kết giải quyết và phản hồi bằng văn bản trong vòng{" "}
                <strong>24 đến 48 giờ</strong>.
                <br />
                <strong>10.2. Luật áp dụng</strong>: Mọi tranh chấp phát sinh từ hoặc liên quan đến
                thỏa thuận này sẽ được giải thích và điều chỉnh theo quy định của pháp luật Nước
                Cộng hòa Xã hội Chủ nghĩa Việt Nam. Nếu không thể thương lượng hòa giải, tranh chấp
                sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh.
              </p>
            </section>

            {/* ĐIỀU 11 */}
            <section className="space-y-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0A3D31] flex items-center gap-2 border-b border-stone-200 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#0D7C66] text-xs font-black">
                  ĐIỀU 11
                </span>
                HIỆU LỰC THI HÀNH &amp; CAM KẾT CỦA KHÁCH HÀNG
              </h3>
              <p className="pl-2 font-medium">
                Văn bản pháp lý này có hiệu lực kể từ ngày công bố. Bằng việc bấm tích chọn vào ô
                xác nhận &quot;Tôi đồng ý với Điều khoản pháp lý&quot; trên giao diện website trước
                khi bấm Đặt Hàng hoặc Đặt Cọc, Khách hàng xác nhận đã đọc toàn bộ 11 Điều nêu trên,
                hiểu rõ quyền và nghĩa vụ của mình, tự nguyện chấp thuận và cam kết tuân thủ đầy đủ
                các điều khoản này.
              </p>
            </section>
          </div>

          {/* Dấu Chứng Thực Cuối Văn Bản */}
          <div className="pt-8 border-t-2 border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                ĐƠN VỊ VẬN HÀNH &amp; PHÁP CHẾ:
              </span>
              <strong className="text-sm text-[#0A3D31] block font-serif">
                HỆ THỐNG Y TẾ &amp; DƯỠNG LÃO CAO CẤP GOCARE VIỆT NAM
              </strong>
              <p className="text-xs text-stone-600">
                Giấy chứng nhận hoạt động y khoa số 08842/BYT-GPHĐ cấp bởi Bộ Y Tế.
              </p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-[#0D7C66]">verified</span>
              <span className="text-[11px] font-bold text-[#0A3D31] uppercase tracking-wide mt-1">
                CHỨNG THỰC PHÁP LÝ SỐ
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                SHA-256: 8F8EEA60-2026-LAW
              </span>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
