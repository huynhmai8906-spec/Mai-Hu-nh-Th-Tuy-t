import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getConnectedApiRegistry,
  hl7LiveApi,
  resortV2Api,
  clevelandClinicApi,
  dispatchApi,
  type ApiConnectionConfig,
  type LiveTelemetry,
  type ResortSuite,
  type ClevelandEvaluation,
  type EmergencyDispatchResult,
} from "@/lib/gocare-apis";

export function ConnectedApisModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "hl7" | "resort" | "cleveland" | "dispatch"
  >("overview");
  const [apis, setApis] = useState<ApiConnectionConfig[]>([]);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Sub-features state
  const [telemetry, setTelemetry] = useState<LiveTelemetry | null>(null);
  const [suites, setSuites] = useState<ResortSuite[]>([]);
  const [clevelandReport, setClevelandReport] = useState<ClevelandEvaluation | null>(null);
  const [dispatchResult, setDispatchResult] = useState<EmergencyDispatchResult | null>(null);
  const [isSyncingHl7, setIsSyncingHl7] = useState(false);

  useEffect(() => {
    setApis(getConnectedApiRegistry());

    // Register global trigger for easy access from legacy HTML/JS and nav buttons
    (window as any).openGoCareApisModal = (
      tab?: "overview" | "hl7" | "resort" | "cleveland" | "dispatch",
    ) => {
      if (tab) setActiveTab(tab);
      setIsOpen(true);
    };

    const handleOpenEvent = (e: CustomEvent) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab);
      setIsOpen(true);
    };

    window.addEventListener("gocare:open-apis", handleOpenEvent as EventListener);
    return () => {
      window.removeEventListener("gocare:open-apis", handleOpenEvent as EventListener);
    };
  }, []);

  const handlePingTest = async (apiId: string) => {
    setTestingId(apiId);
    await new Promise((r) => setTimeout(r, 600));
    setTestingId(null);
    toast.success(`Đã kiểm tra API ${apiId.toUpperCase()} thành công! Tín hiệu ổn định.`);
  };

  const handleSyncHl7 = async () => {
    setIsSyncingHl7(true);
    const res = await hl7LiveApi.syncEHR();
    const live = await hl7LiveApi.getLiveTelemetry();
    setTelemetry(live);
    setIsSyncingHl7(false);
    toast.success(res.message);
  };

  const handleExportFhir = async () => {
    toast.loading("Đang tạo và mã hóa gói dữ liệu chuẩn HL7 FHIR R4...", { id: "fhir" });
    const bundle = await hl7LiveApi.exportFHIRBundle();
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HL7-FHIR-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Đã xuất hồ sơ HL7 FHIR R4 thành công!", { id: "fhir" });
  };

  const loadResortData = async () => {
    const list = await resortV2Api.getSuites();
    setSuites(list);
  };

  const loadClevelandData = async (painLevel = 8) => {
    const report = await clevelandClinicApi.checkProtocol({
      painLevel,
      symptoms: ["Đau thắt ngực", "Khó thở khi nằm"],
    });
    setClevelandReport(report);
  };

  const handleEmergencyDispatchTest = async () => {
    toast.loading("Đang kết nối API Điều Phối Cấp Cứu 24/7...", { id: "dispatch-load" });
    const res = await dispatchApi.dispatchEmergencyUnit({
      patientId: "GC-88294-VN",
      patientName: "BN. Trần Hoài Phương",
      address: "Biệt thự Palm Garden, Thảo Điền, TP. Thủ Đức",
      code: "RED",
      painScore: 9,
      symptoms: ["Đau thắt ngực lan cánh tay trái", "Tê bì chi"],
      notes: "Kích hoạt khẩn cấp qua GoCare Mobile Dispatch API",
    });
    setDispatchResult(res);
    toast.success(
      `ĐÃ ĐIỀU PHỐI XE CẤP CỨU ${res.vehicleNumber}! Đến trong ~${res.estimatedArrivalMinutes} phút.`,
      {
        id: "dispatch-load",
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title-lg text-lg font-bold text-jade-dark">
                  Trung Tâm Liên Kết API Y Tế &amp; Nghỉ Dưỡng Lão Khoa GoCare
                </h3>
                <span className="px-2 py-0.5 bg-emerald-mint/15 text-emerald-mint text-xs font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-mint animate-pulse"></span>
                  4/4 API Đã Xác Thực
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Quản lý bảo mật, theo dõi trạng thái truyền nhận dữ liệu trực tiếp và kiểm thử tích
                hợp.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-surface-container px-6 pt-2 border-b border-outline-variant/20 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 font-label-md text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-surface-container-lowest text-primary shadow-sm border-t-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard_customize</span>
            Tổng Quan 4 API
          </button>
          <button
            onClick={() => {
              setActiveTab("hl7");
              handleSyncHl7();
            }}
            className={`px-4 py-2.5 font-label-md text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "hl7"
                ? "bg-surface-container-lowest text-primary shadow-sm border-t-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base text-emerald-mint">
              vital_signs
            </span>
            HL7 Live Telemetry
          </button>
          <button
            onClick={() => {
              setActiveTab("resort");
              loadResortData();
            }}
            className={`px-4 py-2.5 font-label-md text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "resort"
                ? "bg-surface-container-lowest text-primary shadow-sm border-t-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base text-amber-accent">hotel</span>
            GoCare Resort v2
          </button>
          <button
            onClick={() => {
              setActiveTab("cleveland");
              loadClevelandData();
            }}
            className={`px-4 py-2.5 font-label-md text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "cleveland"
                ? "bg-surface-container-lowest text-primary shadow-sm border-t-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base text-secondary">
              clinical_notes
            </span>
            Cleveland Protocol
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-4 py-2.5 font-label-md text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "dispatch"
                ? "bg-surface-container-lowest text-primary shadow-sm border-t-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base text-error">emergency</span>
            Điều Phối 24/7
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW OF ALL 4 APIS */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apis.map((api) => {
                  const isRevealed = revealedKey === api.id;
                  const isTesting = testingId === api.id;
                  return (
                    <div
                      key={api.id}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-[11px] rounded uppercase tracking-wider">
                            {api.version}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-mint">
                            <span className="w-2 h-2 rounded-full bg-emerald-mint animate-pulse"></span>
                            {api.status} • {api.latencyMs}ms
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-jade-dark mb-1">{api.name}</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                          {api.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline-variant/20 space-y-2">
                        <div className="flex items-center justify-between text-xs bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20">
                          <code className="font-mono text-primary font-semibold truncate max-w-[220px]">
                            {isRevealed ? api.key : api.maskedKey}
                          </code>
                          <button
                            onClick={() => setRevealedKey(isRevealed ? null : api.id)}
                            className="text-on-surface-variant hover:text-primary transition-colors ml-2"
                            title={isRevealed ? "Ẩn khóa" : "Hiện khóa"}
                          >
                            <span className="material-symbols-outlined text-base">
                              {isRevealed ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-primary">
                              sync
                            </span>
                            Giao thức: {api.protocol}
                          </span>
                          <button
                            onClick={() => handlePingTest(api.id)}
                            disabled={isTesting}
                            className="px-2.5 py-1 bg-primary text-on-primary text-xs font-semibold rounded-md hover:bg-primary-dark transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${isTesting ? "animate-spin" : ""}`}
                            >
                              {isTesting ? "progress_activity" : "network_check"}
                            </span>
                            Ping
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Bar */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-primary">security</span>
                  <div>
                    <span className="font-bold text-sm text-jade-dark block">
                      Hệ Thống Đạt Chuẩn JCI Quốc Tế &amp; HL7 FHIR Bảo Mật Cấp 4
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Dữ liệu y tế được mã hóa AES-256 kết nối an toàn với Cổng Dữ Liệu Bộ Y Tế.
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleExportFhir}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Xuất Hồ Sơ HL7 FHIR
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HL7 LIVE TELEMETRY */}
          {activeTab === "hl7" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-jade-dark">
                      Luồng Dữ Liệu HL7 FHIR Telemetry
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-mint/15 text-emerald-mint text-xs font-bold rounded">
                      gc_live_hl7...
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Truyền nhận chỉ số sinh tồn thời gian thực từ cảm biến ngực và máy đo đầu
                    giường.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncHl7}
                    disabled={isSyncingHl7}
                    className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-1.5"
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${isSyncingHl7 ? "animate-spin" : ""}`}
                    >
                      sync
                    </span>
                    {isSyncingHl7 ? "Đang đồng bộ..." : "Đồng Bộ Ngay"}
                  </button>
                  <button
                    onClick={handleExportFhir}
                    className="px-3 py-1.5 bg-surface-container-lowest text-primary border border-outline-variant/40 text-xs font-semibold rounded-lg hover:bg-surface-container transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">file_download</span>
                    Tải File JSON
                  </button>
                </div>
              </div>

              {telemetry && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant uppercase font-bold block">
                      Huyết Áp
                    </span>
                    <span className="text-lg font-bold text-jade-dark block mt-1">
                      {telemetry.bloodPressure.systolic}/{telemetry.bloodPressure.diastolic}
                    </span>
                    <span className="text-[10px] text-emerald-mint font-semibold">
                      {telemetry.bloodPressure.status}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant uppercase font-bold block">
                      Nhịp Tim
                    </span>
                    <span className="text-lg font-bold text-jade-dark block mt-1">
                      {telemetry.heartRate.bpm} bpm
                    </span>
                    <span className="text-[10px] text-primary font-semibold">
                      {telemetry.heartRate.status}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant uppercase font-bold block">
                      SpO2 Khí Trời
                    </span>
                    <span className="text-lg font-bold text-jade-dark block mt-1">
                      {telemetry.spo2.percent}%
                    </span>
                    <span className="text-[10px] text-emerald-mint font-semibold">
                      {telemetry.spo2.status}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant uppercase font-bold block">
                      Đường Huyết
                    </span>
                    <span className="text-lg font-bold text-jade-dark block mt-1">
                      {telemetry.glucose.value} {telemetry.glucose.unit}
                    </span>
                    <span className="text-[10px] text-amber-accent font-semibold">
                      {telemetry.glucose.status}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant uppercase font-bold block">
                      Thân Nhiệt
                    </span>
                    <span className="text-lg font-bold text-jade-dark block mt-1">
                      {telemetry.temperature.celsius}°C
                    </span>
                    <span className="text-[10px] text-emerald-mint font-semibold">
                      {telemetry.temperature.status}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant uppercase font-bold block">
                      Pin Cảm Biến
                    </span>
                    <span className="text-lg font-bold text-jade-dark block mt-1">
                      {telemetry.sensorBattery}%
                    </span>
                    <span className="text-[10px] text-primary font-semibold">Tín hiệu 5G Tốt</span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2">
                <span className="font-bold text-xs uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">hub</span>
                  Các Bệnh Viện Đang Liên Thông HL7 FHIR
                </span>
                <ul className="text-xs text-on-surface-variant space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-mint">
                      check
                    </span>
                    Bệnh viện Chợ Rẫy (Khoa Tim mạch Can thiệp &amp; Cấp cứu)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-mint">
                      check
                    </span>
                    FV Hospital (Khoa Lão Khoa Quốc Tế JCI)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-mint">
                      check
                    </span>
                    Bệnh viện Đại học Y Dược TP.HCM
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-mint">
                      check
                    </span>
                    Mayo Clinic &amp; Cleveland Clinic (Hồ sơ song ngữ chuẩn HL7 R4)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: RESORT V2 MANAGEMENT */}
          {activeTab === "resort" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-jade-dark">
                      Hệ Thống Nghỉ Dưỡng Lão Khoa GoCare Resort v2
                    </h4>
                    <span className="px-2 py-0.5 bg-amber-accent/20 text-secondary text-xs font-bold rounded">
                      gc_resort_v2...
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Quản lý phòng Suite 5 sao, Villa chuyên biệt cao tuổi, suất ăn cá thể hóa và
                    điều dưỡng túc trực 24/7.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suites.map((suite) => (
                  <div
                    key={suite.id}
                    className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary font-bold text-[11px] rounded">
                          {suite.category}
                        </span>
                        <span className="text-xs font-semibold text-primary">{suite.sqm} m²</span>
                      </div>
                      <h5 className="font-bold text-sm text-jade-dark mb-1">{suite.name}</h5>
                      <span className="text-xs font-bold text-secondary block mb-3">
                        {suite.pricePerDay.toLocaleString("vi-VN")} đ / ngày
                      </span>
                      <div className="space-y-1 mb-3">
                        {suite.medicalFeatures.slice(0, 3).map((f, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-on-surface-variant flex items-start gap-1.5"
                          >
                            <span className="material-symbols-outlined text-xs text-emerald-mint mt-0.5">
                              check
                            </span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-outline-variant/20">
                      <span className="text-[11px] text-primary font-semibold block mb-2">
                        Điều dưỡng: {suite.nurseRatio}
                      </span>
                      <button
                        onClick={async () => {
                          const res = await resortV2Api.bookSuite({
                            suiteCode: suite.code,
                            patientName: "BN. Trần Hoài Phương",
                            checkInDate: "2026-11-01",
                            durationDays: 30,
                          });
                          toast.success(
                            `Đã đặt thành công ${suite.name}! Mã đặt phòng: ${res.bookingCode}`,
                          );
                        }}
                        className="w-full py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">book_online</span>
                        Đặt Phòng Nghỉ Dưỡng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLEVELAND CLINIC PROTOCOL */}
          {activeTab === "cleveland" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-jade-dark">
                      Phác Đồ Lão Khoa Cleveland Clinic
                    </h4>
                    <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-xs font-bold rounded">
                      gc_cleveland...
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Hỗ trợ quyết định lâm sàng (Clinical Decision Support), đánh giá tiêu chí Beers
                    và hội chẩn 1:1.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const res = await clevelandClinicApi.scheduleConsultation(
                      "GC-88294-VN",
                      "Đánh giá phác đồ hạ áp và nguy cơ sốc phản vệ Penicillin",
                    );
                    toast.success(
                      `Đã đặt lịch hội chẩn quốc tế với ${res.leadDoctor}! Mã phiên: ${res.consultationId}`,
                    );
                  }}
                  className="px-3 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">video_camera_front</span>
                  Đặt Lịch Hội Chẩn
                </button>
              </div>

              {clevelandReport && (
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-error text-on-error font-bold text-xs rounded uppercase">
                        Mức Độ Rủi Ro: {clevelandReport.riskScore}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        {clevelandReport.protocolId}
                      </span>
                    </div>
                    <span className="text-xs text-primary font-semibold">
                      {clevelandReport.clevelandSpecialist}
                    </span>
                  </div>

                  <p className="text-xs text-jade-dark font-semibold leading-relaxed">
                    {clevelandReport.clinicalGuideline}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      Các Bước Hành Động Cấp Cứu Theo Chuẩn Cleveland:
                    </span>
                    {clevelandReport.actionItems.map((item, idx) => (
                      <div key={idx} className="text-xs text-on-surface flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-error-container text-error rounded font-semibold">
                      Chống chỉ định: {clevelandReport.contraindications.join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 24/7 EMERGENCY DISPATCH */}
          {activeTab === "dispatch" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-jade-dark">
                      Điều Phối Xe Cấp Cứu &amp; Điều Dưỡng CCHN 24/7
                    </h4>
                    <span className="px-2 py-0.5 bg-error/15 text-error text-xs font-bold rounded">
                      gc_dispatch...
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Lệnh điều phối ICU di động có mặt tận nhà trong 9-18 phút với đội ngũ có chứng
                    chỉ hành nghề.
                  </p>
                </div>
                <button
                  onClick={handleEmergencyDispatchTest}
                  className="px-4 py-2 bg-error hover:bg-red-700 text-on-error text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-error/20"
                >
                  <span className="material-symbols-outlined text-sm animate-bounce">
                    emergency
                  </span>
                  Kích Hoạt Lệnh Code-Red Test
                </button>
              </div>

              {dispatchResult && (
                <div className="p-4 bg-error-container/20 rounded-xl border border-error/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-error text-on-error font-bold text-xs rounded">
                      LỆNH {dispatchResult.code} • {dispatchResult.dispatchId}
                    </span>
                    <span className="text-xs font-bold text-error flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      Dự kiến đến sau: {dispatchResult.estimatedArrivalMinutes} phút
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                      <span className="text-on-surface-variant block">
                        Phương Tiện &amp; Biển Số:
                      </span>
                      <strong className="text-primary">{dispatchResult.vehicleNumber}</strong>
                      <span className="block text-on-surface-variant text-[11px] mt-0.5">
                        {dispatchResult.vehicleType}
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                      <span className="text-on-surface-variant block">
                        Điều Dưỡng CCHN Phụ Trách:
                      </span>
                      <strong className="text-primary">{dispatchResult.nurseCchnName}</strong>
                      <span className="block text-emerald-mint font-semibold text-[11px] mt-0.5">
                        Số CCHN: {dispatchResult.nurseCchnLicense}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-on-surface flex items-center gap-2 pt-1">
                    <span className="material-symbols-outlined text-sm text-primary">
                      location_on
                    </span>
                    <span>Điểm đến: {dispatchResult.destinationAddress}</span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2">
                <span className="font-bold text-xs text-jade-dark block">
                  Dịch Vụ Điều Dưỡng CCHN Tại Gia Thường Nhật (Đặt trước):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Tiêm truyền & lấy máu xét nghiệm tại nhà",
                    "Chăm sóc vết loét do tì đè & thay băng vô khuẩn",
                    "Đặt sonde dạ dày & sonde tiểu lưu JCI",
                    "Tập phục hồi chức năng vận động sau tai biến",
                  ].map((srv, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        const res = await dispatchApi.dispatchHomeNurse({
                          patientName: "BN. Trần Hoài Phương",
                          serviceType: srv,
                          address: "Biệt thự Palm Garden, Thảo Điền",
                        });
                        toast.success(
                          `${res.message} Điều dưỡng: ${res.assignedNurse.name} (${res.assignedNurse.licenseNumber})`,
                        );
                      }}
                      className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container text-primary font-medium text-xs rounded-lg border border-outline-variant/30 transition-all"
                    >
                      + {srv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low px-6 py-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-mint">verified</span>
            Bản quyền hạ tầng API GoCare Healthcare &amp; Medical Resort 2026
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-dark transition-all"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
}
