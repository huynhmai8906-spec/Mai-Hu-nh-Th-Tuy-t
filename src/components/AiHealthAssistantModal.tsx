import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  Upload,
  Pill,
  Clock,
  Activity,
  Heart,
  Phone,
  Check,
  AlertTriangle,
  FileText,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { PARTNER_LINKS } from "@/lib/constants";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  time: string;
  isImage?: boolean;
}

interface Reminder {
  id: string;
  medicine: string;
  dosage: string;
  time: string;
  note: string;
  enabled: boolean;
}

export function AiHealthAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "chat" | "partners" | "prescription" | "reminder" | "bone_calc"
  >("chat");
  const [isExpanded, setIsExpanded] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      content:
        "Dạ kính chào Bác/Cô/Chú! Tôi là **Dược Sĩ & Bác Sĩ AI Lão Khoa GoCare**.\n\nTôi sẵn sàng tư vấn:\n• Thuốc thoái hóa & đau cơ xương khớp, cách dùng Glucosamine, sụn khớp an toàn\n• Rà soát tương tác thuốc tim mạch, huyết áp, tiểu đường\n• Hướng dẫn đặt hàng chính hãng tại **Nhà Thuốc Long Châu** & **Nhà Thuốc An Khang** (Giao hỏa tốc 1-2h)\n• Phân tích đơn thuốc và cài đặt nhắc giờ uống thuốc hàng ngày.\n\nBác/Cô/Chú đang cần GoCare giải đáp vấn đề sức khỏe nào ạ?",
      time: "Vừa xong",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prescription scan state
  const [prescriptionText, setPrescriptionText] = useState("");
  const [prescriptionImagePreview, setPrescriptionImagePreview] = useState<string | null>(null);
  const [prescriptionResult, setPrescriptionResult] = useState<string | null>(null);
  const [isAnalyzingPrescription, setIsAnalyzingPrescription] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      medicine: "Glucosamine Sulfate 1500mg",
      dosage: "1 viên sau ăn sáng",
      time: "07:30",
      note: "Bổ sụn khớp - Uống đều đặn 3 tháng",
      enabled: true,
    },
    {
      id: "2",
      medicine: "Amlodipine 5mg",
      dosage: "1 viên sáng",
      time: "08:00",
      note: "Huyết áp - Đo huyết áp trước khi uống",
      enabled: true,
    },
  ]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("08:00");
  const [newMedNote, setNewMedNote] = useState("");

  // Bone Assessment state
  const [boneAge, setBoneAge] = useState(65);
  const [bonePainLevel, setBonePainLevel] = useState(3);
  const [boneMobility, setBoneMobility] = useState<"good" | "stiff" | "hard">("stiff");
  const [hasCracking, setHasCracking] = useState(true);
  const [boneResult, setBoneResult] = useState<{
    level: string;
    score: number;
    description: string;
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle SpeechSynthesis
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Trình duyệt không hỗ trợ đọc giọng nói");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (
    textToSend?: string,
    contextType: "general" | "bone_joint" | "prescription" = "general",
  ) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          contextType,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: "b-" + Date.now(),
        role: "model",
        content:
          data.reply ||
          "Dạ, GoCare xin lỗi vì đường truyền y tế gián đoạn. Xin liên hệ hotline 1900 6868.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối đến máy chủ Dược sĩ AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setPrescriptionImagePreview(b64);
      analyzeUploadedPrescription(b64.split(",")[1] || "", file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeUploadedPrescription = async (b64Data: string, mimeType: string) => {
    setIsAnalyzingPrescription(true);
    setActiveTab("prescription");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "Hãy phân tích chi tiết đơn thuốc này: danh sách thuốc, hoạt chất, liều uống, tương tác và lời dặn.",
          imageB64: b64Data,
          imageMimeType: mimeType,
          contextType: "prescription",
        }),
      });
      const data = await res.json();
      setPrescriptionResult(data.reply);
      toast.success("Đã phân tích đơn thuốc thành công!");
    } catch {
      toast.error("Lỗi khi phân tích ảnh đơn thuốc");
    } finally {
      setIsAnalyzingPrescription(false);
    }
  };

  const analyzeTextPrescription = async () => {
    if (!prescriptionText.trim()) {
      toast.error("Vui lòng nhập danh sách thuốc hoặc nội dung đơn");
      return;
    }
    setIsAnalyzingPrescription(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Rà soát và hướng dẫn sử dụng đơn thuốc sau:\n${prescriptionText}`,
          contextType: "prescription",
        }),
      });
      const data = await res.json();
      setPrescriptionResult(data.reply);
    } catch {
      toast.error("Không thể phân tích đơn thuốc");
    } finally {
      setIsAnalyzingPrescription(false);
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const item: Reminder = {
      id: String(Date.now()),
      medicine: newMedName,
      dosage: newMedDosage || "1 liều",
      time: newMedTime,
      note: newMedNote || "Uống đúng giờ theo chỉ định",
      enabled: true,
    };
    setReminders((prev) => [...prev, item]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedNote("");
    toast.success(`Đã thêm nhắc uống thuốc: ${item.medicine}`);
  };

  const calculateBoneRisk = () => {
    let score = 0;
    if (boneAge >= 60) score += 2;
    if (boneAge >= 75) score += 3;
    score += bonePainLevel;
    if (boneMobility === "stiff") score += 2;
    if (boneMobility === "hard") score += 4;
    if (hasCracking) score += 2;

    let level = "Nhẹ / Chăm sóc định kỳ";
    let desc =
      "Khớp có dấu hiệu mỏi nhẹ theo tuổi tác. Cần bổ sung vi chất và duy trì vận động nhẹ nhàng.";
    const recs = [
      "Bổ sung Glucosamine Sulfate 1500mg kết hợp Chondroitin để nuôi dưỡng sụn khớp.",
      "Tập dưỡng sinh, đi bộ trên nền phẳng 20-30 phút mỗi sáng.",
      "Uống Canxi Nano kèm Vitamin D3 + K2 để phòng ngừa xốp xương.",
    ];

    if (score >= 6 && score < 10) {
      level = "Trung bình / Thoái hóa khớp độ 2";
      desc =
        "Có hiện tượng khô khớp, lục khục khi vận động, đau nhức khi thời tiết thay đổi hoặc leo cầu thang.";
      recs.push(
        "Tham khảo các dòng Bổ Xương Khớp chuyên sâu tại Nhà Thuốc An Khang hoặc Long Châu.",
        "Tránh mang vác nặng, sử dụng đai bảo vệ khớp gối khi đi lại nhiều.",
        "Đặt lịch Bác sĩ Lão khoa GoCare để rà soát phim X-quang khớp.",
      );
    } else if (score >= 10) {
      level = "Cao / Nguy cơ thoái hóa nặng hoặc viêm khớp tiến triển";
      desc =
        "Khớp bị viêm đau rõ rệt, cứng khớp buổi sáng kéo dài hoặc hạn chế đi lại. Cần can thiệp y tế sớm.";
      recs.push(
        "Đến cơ sở chuyên khoa Cơ Xương Khớp khám trực tiếp và kiểm tra dịch khớp.",
        "Sử dụng thuốc giảm đau kháng viêm an toàn dưới sự kiểm soát của Bác sĩ.",
        "Liên hệ Điều dưỡng GoCare hỗ trợ vật lý trị liệu phục hồi chức năng tại nhà.",
      );
    }

    setBoneResult({
      level,
      score,
      description: desc,
      recommendations: recs,
    });
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-full bg-gradient-to-r from-[#0A3D31] via-[#0D7C66] to-[#10B981] text-white shadow-2xl shadow-emerald-950/40 border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-300"
          title="Mở Dược Sĩ AI & Tiện Ích Sức Khỏe GoCare"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-200 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-[#0A3D31] rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-[#0A3D31] rounded-full"></span>
          </div>
          <div className="text-left hidden sm:flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 leading-tight">
              Dược Sĩ AI 24/7
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              Tư Vấn Thuốc &amp; Xương Khớp
            </span>
          </div>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase hidden md:inline-block">
            Gemini AI
          </span>
        </button>

        {/* Quick Link Badge: An Khang & Long Chau */}
        <div className="hidden xl:flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-full border border-emerald-200 shadow-lg text-[11px] font-semibold text-stone-700">
          <a
            href={PARTNER_LINKS.anKhangBoXuongKhop}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-emerald-50 text-[#00614f] font-bold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            Bổ Xương Khớp An Khang
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
          <span className="text-stone-300">|</span>
          <a
            href={PARTNER_LINKS.longChau}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-blue-50 text-blue-800 font-bold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Nhà Thuốc Long Châu
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* MODAL / DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-emerald-900/10 flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded ? "max-w-5xl h-[92vh]" : "max-w-2xl h-[88vh] sm:h-[750px]"
            }`}
          >
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-[#0A3D31] via-[#0D7C66] to-[#064E3B] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-600/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                      Dược Sĩ &amp; Bác Sĩ AI GoCare
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-extrabold uppercase">
                      Lão Khoa 5 Sao
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Liên thông FPT Long Châu &amp; Nhà thuốc An Khang
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:flex w-8 h-8 rounded-full hover:bg-white/10 text-emerald-200 items-center justify-center transition-colors"
                  title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PARTNER BANNER STRIP */}
            <div className="bg-[#f0f9f6] px-4 py-2 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0D7C66]" />
                <span className="font-semibold text-[#0A3D31]">Đối tác chính hãng:</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={PARTNER_LINKS.anKhangBoXuongKhop}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-all shadow-xs"
                >
                  Bổ Xương Khớp An Khang
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={PARTNER_LINKS.longChau}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all shadow-xs"
                >
                  FPT Long Châu
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex items-center border-b border-stone-200 bg-stone-50 px-3 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "chat"
                    ? "border-[#0D7C66] text-[#0D7C66] bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                Trò Chuyện AI
              </button>

              <button
                onClick={() => setActiveTab("partners")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "partners"
                    ? "border-[#0D7C66] text-[#0D7C66] bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                Kho Thuốc &amp; Xương Khớp
              </button>

              <button
                onClick={() => setActiveTab("prescription")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "prescription"
                    ? "border-[#0D7C66] text-[#0D7C66] bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Quét Đơn Thuốc AI
              </button>

              <button
                onClick={() => setActiveTab("reminder")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "reminder"
                    ? "border-[#0D7C66] text-[#0D7C66] bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Nhắc Giờ Uống Thuốc
              </button>

              <button
                onClick={() => setActiveTab("bone_calc")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "bone_calc"
                    ? "border-[#0D7C66] text-[#0D7C66] bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Đo Nguy Cơ Khớp
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto">
              {/* TAB 1: AI CHAT */}
              {activeTab === "chat" && (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${
                          m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            m.role === "user"
                              ? "bg-[#0A3D31] text-white"
                              : "bg-[#0D7C66]/15 text-[#0D7C66]"
                          }`}
                        >
                          {m.role === "user" ? (
                            <span className="text-xs font-bold">Tôi</span>
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                              m.role === "user"
                                ? "bg-[#0D7C66] text-white rounded-tr-none"
                                : "bg-stone-100 text-stone-800 rounded-tl-none border border-stone-200"
                            }`}
                          >
                            {m.content}
                          </div>
                          <div
                            className={`flex items-center gap-2 text-[10px] text-stone-400 ${
                              m.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{m.time}</span>
                            {m.role === "model" && (
                              <>
                                <span>•</span>
                                <button
                                  onClick={() => speakText(m.content)}
                                  className="hover:text-emerald-700 flex items-center gap-0.5 font-medium"
                                  title="Đọc to câu trả lời"
                                >
                                  {isSpeaking ? (
                                    <VolumeX className="w-3 h-3 text-red-500" />
                                  ) : (
                                    <Volume2 className="w-3 h-3 text-[#0D7C66]" />
                                  )}
                                  <span>{isSpeaking ? "Dừng" : "Đọc to"}</span>
                                </button>
                                <span>•</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(m.content);
                                    toast.success("Đã sao chép nội dung tư vấn!");
                                  }}
                                  className="hover:text-stone-600 flex items-center gap-0.5"
                                  title="Sao chép"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs text-[#0D7C66] font-medium p-3 bg-emerald-50/60 rounded-xl max-w-xs border border-emerald-100">
                        <span className="w-2 h-2 rounded-full bg-[#0D7C66] animate-ping"></span>
                        <span>Dược sĩ AI đang chuẩn bị tư vấn y khoa...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* QUICK SUGGESTIONS */}
                  <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2 shrink-0">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Tư vấn các loại thuốc và thực phẩm bổ xương khớp uy tín tại Nhà Thuốc An Khang cho người 65 tuổi.",
                            "bone_joint",
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#00614f] border border-emerald-200 whitespace-nowrap font-semibold shadow-xs"
                      >
                        🦴 Bổ Xương Khớp An Khang
                      </button>
                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Thuốc hạ huyết áp Amlodipine có thể uống cùng thuốc đau khớp Celecoxib không?",
                            "bone_joint",
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-stone-700 border border-stone-200 whitespace-nowrap font-medium shadow-xs"
                      >
                        ⚠️ Tương tác Huyết Áp &amp; Khớp
                      </button>
                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Cách đặt thuốc chính hãng giao nhanh 1-2h qua Nhà Thuốc Long Châu liên thông GoCare?",
                            "general",
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap font-semibold shadow-xs"
                      >
                        💊 Mua qua Long Châu
                      </button>
                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Người cao tuổi bị thoái hóa khớp gối nên dùng Glucosamine hay tiêm dịch khớp?",
                            "bone_joint",
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-stone-700 border border-stone-200 whitespace-nowrap font-medium shadow-xs"
                      >
                        🩺 Thoái hóa khớp gối
                      </button>
                    </div>

                    {/* INPUT FORM */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#0D7C66] hover:bg-emerald-50 transition-colors shadow-xs"
                        title="Tải ảnh đơn thuốc để AI đọc"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Hỏi về liều lượng, thuốc bổ xương khớp, nhà thuốc Long Châu / An Khang..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7C66]/30 focus:border-[#0D7C66]"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !inputText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#0D7C66] hover:bg-[#059669] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Gửi</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: PARTNERS & MEDICINE SHOWCASE */}
              {activeTab === "partners" && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Long Chau Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-blue-400/20">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-lg">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-400/40">
                          Mạng Lưới Đối Tác Chiến Lược
                        </span>
                        <h4 className="text-xl font-bold font-serif">
                          Hệ Thống Nhà Thuốc FPT Long Châu
                        </h4>
                        <p className="text-xs text-blue-100/90 leading-relaxed">
                          Hơn 1.600 nhà thuốc khắp 63 tỉnh thành, cam kết 100% thuốc kê đơn chính
                          hãng, chuẩn GSP 15–25°C, giao hỏa tốc 1-2h tận giường bệnh nhân GoCare.
                        </p>
                      </div>
                      <a
                        href={PARTNER_LINKS.longChau}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md shrink-0"
                      >
                        Truy cập Long Châu
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* An Khang Bone & Joint Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-[#0A3D31] to-teal-950 text-white shadow-xl relative overflow-hidden border border-emerald-400/20">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-lg">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/40">
                          Chuyên Mục Xương Khớp Trọng Điểm
                        </span>
                        <h4 className="text-xl font-bold font-serif">
                          Nhà Thuốc An Khang - Danh Mục Bổ Xương Khớp
                        </h4>
                        <p className="text-xs text-emerald-100/90 leading-relaxed">
                          Chuyên cung cấp Glucosamine, sụn vi cá mập, Collagen Type 2, Canxi hữu cơ
                          D3+K2 và các dòng cao xoa bóp thảo dược chính hãng của tập đoàn Thế Giới
                          Di Động (MWG).
                        </p>
                      </div>
                      <a
                        href={PARTNER_LINKS.anKhangBoXuongKhop}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#E09F3E] text-stone-950 hover:brightness-105 font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-md shrink-0"
                      >
                        Xem Bổ Xương Khớp An Khang
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* CURATED BONE & JOINT PRODUCTS LIST */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                        <Pill className="w-4 h-4 text-[#0D7C66]" />
                        Sản phẩm Bổ Xương Khớp khuyên dùng cho Người Cao Tuổi
                      </h5>
                      <span className="text-[11px] text-stone-500">Đồng bộ EHR GoCare</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Product 1 */}
                      <div className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-white transition-all space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#00614f] text-[10px] font-bold">
                              An Khang Chuyên Đề
                            </span>
                            <h6 className="font-bold text-xs text-stone-900 mt-1">
                              Glucosamine Sulfate 1500mg (Blackmores / Kirkland)
                            </h6>
                            <p className="text-[11px] text-stone-500 line-clamp-2">
                              Tái tạo mô sụn khớp gối, tăng dịch nhờn, giảm triệu chứng cứng khớp
                              buổi sáng.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#0D7C66] whitespace-nowrap">
                            680.000đ
                          </span>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                          <a
                            href={PARTNER_LINKS.anKhangBoXuongKhop}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
                          >
                            Mua tại An Khang <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() =>
                              handleSendMessage(
                                "Tư vấn cách dùng và liều lượng Glucosamine Sulfate 1500mg",
                                "bone_joint",
                              )
                            }
                            className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-700 text-[11px] font-medium"
                          >
                            Hỏi Dược Sĩ AI
                          </button>
                        </div>
                      </div>

                      {/* Product 2 */}
                      <div className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-white transition-all space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                              FPT Long Châu
                            </span>
                            <h6 className="font-bold text-xs text-stone-900 mt-1">
                              Celebrex 200mg (Celecoxib) - Giảm đau khớp có toa
                            </h6>
                            <p className="text-[11px] text-stone-500 line-clamp-2">
                              Kháng viêm chọn lọc COX-2, êm dịu dạ dày hơn NSAID cổ điển, điều trị
                              thoái hóa khớp cấp.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#0D7C66] whitespace-nowrap">
                            395.000đ
                          </span>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                          <a
                            href={PARTNER_LINKS.longChau}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                          >
                            Xem tại Long Châu <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() =>
                              handleSendMessage(
                                "Lưu ý gì khi người đau dạ dày uống Celebrex 200mg?",
                                "bone_joint",
                              )
                            }
                            className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-700 text-[11px] font-medium"
                          >
                            Hỏi Dược Sĩ AI
                          </button>
                        </div>
                      </div>

                      {/* Product 3 */}
                      <div className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-white transition-all space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#00614f] text-[10px] font-bold">
                              An Khang Bổ Khớp
                            </span>
                            <h6 className="font-bold text-xs text-stone-900 mt-1">
                              Canxi Hữu Cơ Sinh Học D3 + K2 (MK-7)
                            </h6>
                            <p className="text-[11px] text-stone-500 line-clamp-2">
                              Đưa canxi thẳng vào xương, tránh lắng đọng vôi hóa thành mạch máu
                              người cao tuổi.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#0D7C66] whitespace-nowrap">
                            420.000đ
                          </span>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                          <a
                            href={PARTNER_LINKS.anKhangBoXuongKhop}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
                          >
                            Mua tại An Khang <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() =>
                              handleSendMessage(
                                "Người sỏi thận có dùng được Canxi D3 K2 không?",
                                "bone_joint",
                              )
                            }
                            className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-700 text-[11px] font-medium"
                          >
                            Hỏi Dược Sĩ AI
                          </button>
                        </div>
                      </div>

                      {/* Product 4 */}
                      <div className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-white transition-all space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                              Long Châu &amp; An Khang
                            </span>
                            <h6 className="font-bold text-xs text-stone-900 mt-1">
                              Dầu Nóng Xoa Bóp &amp; Cao Dán Thảo Dược Giảm Đau
                            </h6>
                            <p className="text-[11px] text-stone-500 line-clamp-2">
                              Thấm sâu qua da, làm ấm huyệt đạo, giãn cơ thắt lưng và vùng cổ gáy
                              hiệu quả tức thì.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#0D7C66] whitespace-nowrap">
                            135.000đ
                          </span>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                          <a
                            href={PARTNER_LINKS.anKhangBoXuongKhop}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
                          >
                            Mua tại An Khang <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() =>
                              handleSendMessage(
                                "Hướng dẫn xoa bóp bấm huyệt giảm đau lưng cho người già",
                                "bone_joint",
                              )
                            }
                            className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-700 text-[11px] font-medium"
                          >
                            Hỏi Dược Sĩ AI
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRESCRIPTION SCANNER */}
              {activeTab === "prescription" && (
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-[#065f46] space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#0A3D31]">
                      <Sparkles className="w-4 h-4 text-[#0D7C66]" />
                      Trợ Lý AI Đọc &amp; Phân Tích Đơn Thuốc Bác Sĩ
                    </div>
                    <p>
                      Hệ thống tự động nhận diện tên thuốc, hoạt chất, phát hiện tương tác đối kháng
                      và hướng dẫn liều uống chuẩn mực cho người bệnh.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Upload box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-300 hover:border-[#0D7C66] rounded-2xl p-6 text-center cursor-pointer bg-white transition-all flex flex-col items-center justify-center gap-3 min-h-[180px]"
                    >
                      {prescriptionImagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={prescriptionImagePreview}
                            alt="Ảnh đơn thuốc"
                            className="max-h-36 rounded-lg object-contain mx-auto shadow-sm"
                          />
                          <p className="text-[11px] text-[#0D7C66] font-semibold">
                            Bấm để chọn ảnh khác
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0D7C66] flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-800">
                              Tải ảnh đơn thuốc (Camera / Thư viện)
                            </span>
                            <p className="text-[11px] text-stone-400 mt-1">
                              Định dạng JPG, PNG rõ nét chữ viết
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Text input */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Hoặc nhập danh sách thuốc thủ công:
                        </label>
                        <textarea
                          rows={4}
                          value={prescriptionText}
                          onChange={(e) => setPrescriptionText(e.target.value)}
                          placeholder="Ví dụ: 1. Amlor 5mg: 1v sáng&#10;2. Glucophage XR 750mg: 1v tối sau ăn&#10;3. Glucosamine 1500mg: 1v trưa"
                          className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D7C66]/30"
                        />
                      </div>
                      <button
                        onClick={analyzeTextPrescription}
                        disabled={isAnalyzingPrescription || !prescriptionText.trim()}
                        className="w-full py-2.5 rounded-xl bg-[#0D7C66] hover:bg-[#059669] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isAnalyzingPrescription ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Đang phân tích đơn thuốc...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            <span>Phân Tích Đơn Thuốc Này</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* RESULT */}
                  {prescriptionResult && (
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm text-[#0A3D31] flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          Kết Quả Phân Tích &amp; Lời Khuyên Dược Sĩ:
                        </span>
                        <button
                          onClick={() => speakText(prescriptionResult)}
                          className="text-xs text-[#0D7C66] font-semibold flex items-center gap-1 hover:underline"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Đọc to kết quả
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-stone-100">
                        {prescriptionResult}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <a
                          href={PARTNER_LINKS.longChau}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                        >
                          Mua đơn thuốc tại FPT Long Châu <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={PARTNER_LINKS.anKhangBoXuongKhop}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1"
                        >
                          Tìm thuốc khớp tại An Khang <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MEDICATION REMINDER */}
              {activeTab === "reminder" && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Form add */}
                  <form
                    onSubmit={handleAddReminder}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <h5 className="font-serif font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0D7C66]" />
                      Đặt Báo Thức &amp; Nhắc Uống Thuốc Hàng Ngày
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        placeholder="Tên thuốc (VD: Glucosamine)"
                        className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0D7C66]"
                        required
                      />
                      <input
                        type="text"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        placeholder="Liều dùng (VD: 1 viên sau ăn)"
                        className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0D7C66]"
                      />
                      <input
                        type="time"
                        value={newMedTime}
                        onChange={(e) => setNewMedTime(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0D7C66]"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMedNote}
                        onChange={(e) => setNewMedNote(e.target.value)}
                        placeholder="Ghi chú thêm (VD: Đo huyết áp trước khi uống, uống nhiều nước...)"
                        className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0D7C66]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#0D7C66] hover:bg-[#059669] text-white font-bold text-xs shrink-0 shadow-sm"
                      >
                        + Thêm Lịch
                      </button>
                    </div>
                  </form>

                  {/* List reminders */}
                  <div className="space-y-3">
                    <h6 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      Danh sách lịch uống thuốc hôm nay:
                    </h6>
                    <div className="space-y-2">
                      {reminders.map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D7C66] font-bold text-xs flex items-center justify-center border border-emerald-200">
                              {r.time}
                            </div>
                            <div>
                              <h6 className="font-bold text-xs sm:text-sm text-stone-900">
                                {r.medicine}
                              </h6>
                              <p className="text-[11px] text-stone-500">
                                {r.dosage} •{" "}
                                <span className="text-emerald-700 font-medium">{r.note}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setReminders(reminders.filter((item) => item.id !== r.id));
                              toast.info(`Đã xóa nhắc thuốc: ${r.medicine}`);
                            }}
                            className="text-stone-400 hover:text-red-500 p-1 text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BONE ASSESSMENT */}
              {activeTab === "bone_calc" && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#0A3D31]">
                      <Activity className="w-4 h-4 text-amber-600" />
                      Công Cụ Đo Nguy Cơ Thoái Hóa Khớp &amp; Xốp Xương Lão Khoa
                    </div>
                    <p>
                      Đánh giá nhanh tình trạng sụn khớp theo thang điểm lâm sàng của Hiệp hội Thấp
                      khớp học để có kế hoạch bổ sung dinh dưỡng phù hợp.
                    </p>
                  </div>

                  <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                        <span>Độ tuổi người bệnh:</span>
                        <span className="text-[#0D7C66] font-bold">{boneAge} tuổi</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="95"
                        value={boneAge}
                        onChange={(e) => setBoneAge(Number(e.target.value))}
                        className="w-full accent-[#0D7C66]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                        <span>Mức độ đau hoặc mỏi khớp (1 - 10):</span>
                        <span className="text-amber-600 font-bold">{bonePainLevel}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={bonePainLevel}
                        onChange={(e) => setBonePainLevel(Number(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Mức độ cứng khớp vào buổi sáng khi vừa thức dậy:
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setBoneMobility("good")}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            boneMobility === "good"
                              ? "bg-[#0D7C66] text-white border-[#0D7C66] font-bold"
                              : "bg-white text-stone-700 border-stone-200"
                          }`}
                        >
                          Không cứng khớp
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoneMobility("stiff")}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            boneMobility === "stiff"
                              ? "bg-[#0D7C66] text-white border-[#0D7C66] font-bold"
                              : "bg-white text-stone-700 border-stone-200"
                          }`}
                        >
                          Cứng dưới 30 phút
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoneMobility("hard")}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            boneMobility === "hard"
                              ? "bg-[#0D7C66] text-white border-[#0D7C66] font-bold"
                              : "bg-white text-stone-700 border-stone-200"
                          }`}
                        >
                          Cứng trên 30 phút
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700 pt-1">
                      <input
                        type="checkbox"
                        checked={hasCracking}
                        onChange={(e) => setHasCracking(e.target.checked)}
                        className="rounded text-[#0D7C66] focus:ring-[#0D7C66]"
                      />
                      <span>
                        Khớp có tiếng lạo xạo / lục khục khi co duỗi hoặc lên xuống cầu thang
                      </span>
                    </label>

                    <button
                      onClick={calculateBoneRisk}
                      className="w-full py-3 rounded-xl bg-[#0D7C66] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                      Tính Điểm Nguy Cơ Khớp &amp; Gợi Ý Dược Phẩm
                    </button>
                  </div>

                  {/* Assessment Result */}
                  {boneResult && (
                    <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-stone-500">
                          Phân loại lâm sàng:
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#00614f] font-extrabold text-xs">
                          {boneResult.level}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {boneResult.description}
                      </p>
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        <span className="text-xs font-bold text-stone-900">
                          Lời khuyên của Dược sĩ GoCare:
                        </span>
                        <ul className="text-xs text-stone-600 space-y-1 pl-4 list-disc">
                          {boneResult.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href={PARTNER_LINKS.anKhangBoXuongKhop}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          Mua sản phẩm Khớp tại An Khang <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setActiveTab("chat");
                            handleSendMessage(
                              `Tôi vừa đo nguy cơ thoái hóa khớp gối đạt mức: ${boneResult.level}. Dược sĩ tư vấn chi tiết đơn thuốc cho tôi nhé!`,
                              "bone_joint",
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1"
                        >
                          Hỏi Bác Sĩ Lão Khoa AI
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER STRIP */}
            <div className="p-3 bg-stone-100 border-t border-stone-200 text-stone-500 text-[11px] flex flex-wrap items-center justify-between gap-2 shrink-0 px-5">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Thông tin mang tính chất tham khảo y khoa. Cấp cứu khẩn cấp:
              </span>
              <a
                href="tel:19006868"
                className="font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                Hotline GoCare 24/7: 1900 6868
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
