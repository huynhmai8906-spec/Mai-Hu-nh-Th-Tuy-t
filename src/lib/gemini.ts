import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAi(): GoogleGenAI | null {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const SYSTEM_INSTRUCTION = `
Bạn là Dược Sĩ & Bác Sĩ Lão Khoa Trí Tuệ Nhân Tạo Cao Cấp của Hệ sinh thái GoCare (Clinical Sanctuary & Pharmacy 5 Sao).
Bạn có nhiệm vụ tư vấn chuyên sâu, ân cần, chuẩn mực y khoa cho bệnh nhân cao tuổi và gia đình người chăm sóc.

Nguyên tắc tư vấn:
1. Thân thiện, tôn trọng, xưng hô kính cẩn (ví dụ: 'Dạ kính chào Bác/Cô/Chú', 'GoCare xin được tư vấn...').
2. Kiến thức chuyên sâu về:
   - Cơ Xương Khớp & Cột Sống (thoái hóa khớp gối, viêm khớp, đau lưng, thoát vị đĩa đệm, loãng xương, Glucosamine, Chondroitin, Celecoxib, Canxi D3 + K2...).
   - Thuốc Tim Mạch, Huyết Áp (Amlodipine, Micardis, Betaloc...) và Đái Tháo Đường (Metformin, Januvia...).
   - Tương tác thuốc nguy hiểm ở người cao tuổi (chú ý: thuốc NSAID kháng viêm khớp có thể ảnh hưởng dạ dày, tăng huyết áp, tương tác thuốc chống đông).
3. Hỗ trợ liên kết mua thuốc và thực phẩm bổ sung chính hãng:
   - Giới thiệu liên kết chính thức đến Nhà Thuốc FPT Long Châu (https://nhathuoclongchau.com.vn/) với mạng lưới giao nhanh hỏa tốc 1-2h toàn quốc.
   - Giới thiệu danh mục Bổ Xương Khớp chuyên sâu tại Nhà Thuốc An Khang (https://www.nhathuocankhang.com/bo-xuong-khop) khi người dùng hỏi về thuốc xương khớp, glucosamine, bổ sụn, canxi.
4. An toàn y tế:
   - Luôn nhắc nhở người bệnh dùng thuốc kê đơn theo chỉ định của Bác sĩ điều trị.
   - Nếu phát hiện dấu hiệu khẩn cấp (đau thắt ngực lan cánh tay, méo miệng yếu liệt nửa người, khó thở cấp tính, tụt huyết áp), lập tức khuyên gọi Hotline Cấp Cứu GoCare 24/7: 1900 6868 hoặc đưa đến bệnh viện gần nhất.
`;

export async function askGeminiConsultation(params: {
  message: string;
  history?: Array<{ role: "user" | "model"; content: string }>;
  contextType?: "general" | "bone_joint" | "prescription" | "interaction";
  imageB64?: string;
  imageMimeType?: string;
}): Promise<string> {
  const { message, history = [], contextType = "general", imageB64, imageMimeType } = params;

  const ai = getAi();
  if (ai) {
    try {
      let promptText = message;
      if (contextType === "bone_joint") {
        promptText = `[Chủ đề: Cơ Xương Khớp & Bổ Xương Khớp Nhà Thuốc An Khang / Long Châu] ${message}`;
      } else if (contextType === "prescription") {
        promptText = `[Chủ đề: Đọc & Phân Tích Đơn Thuốc Y Tế] ${message}`;
      } else if (contextType === "interaction") {
        promptText = `[Chủ đề: Rà Soát Tương Tác Thuốc Người Cao Tuổi] ${message}`;
      }

      // If an image is provided (e.g. prescription scan)
      if (imageB64 && imageMimeType) {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: imageB64,
                  mimeType: imageMimeType,
                },
              },
              {
                text:
                  promptText ||
                  "Hãy phân tích chi tiết đơn thuốc này: các loại thuốc, liều lượng chỉ định, cách uống, các lưu ý về tương tác và lời khuyên chăm sóc.",
              },
            ],
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
        return (
          response.text ||
          "Dược sĩ GoCare đã tiếp nhận đơn thuốc nhưng chưa phân tích được nội dung chi tiết. Vui lòng gửi lại ảnh rõ nét hơn hoặc gọi 1900 6868."
        );
      }

      // Multi-turn or single-turn content
      const contents = [
        ...history.map((h) => ({
          role: h.role,
          parts: [{ text: h.content }],
        })),
        {
          role: "user" as const,
          parts: [{ text: promptText }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return (
        response.text ||
        "Dạ kính chào Quý khách! Dược sĩ GoCare luôn sẵn sàng hỗ trợ. Quý khách vui lòng đặt câu hỏi cụ thể về thuốc hoặc bệnh lý."
      );
    } catch (err) {
      console.error("[GoCare Gemini Consultation Error]", err);
    }
  }

  // Graceful high-quality offline / mock fallback when GEMINI_API_KEY is not configured
  return generateClinicalFallback(message, contextType);
}

function generateClinicalFallback(message: string, contextType: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("xương khớp") ||
    lower.includes("khớp") ||
    lower.includes("glucosamine") ||
    lower.includes("đau lưng") ||
    lower.includes("thoái hóa") ||
    lower.includes("an khang") ||
    contextType === "bone_joint"
  ) {
    return `Dạ kính chào Bác/Cô/Chú! Dược sĩ Lão khoa GoCare xin được giải đáp về vấn đề Cơ Xương Khớp:

1. **Về chế độ điều trị & dinh dưỡng sụn khớp:**
- Ở người cao tuổi, tình trạng thoái hóa sụn khớp gối và đốt sống thường do thoái hóa tự nhiên và giảm dịch khớp.
- Các hoạt chất thường được Bác sĩ khuyên dùng gồm: **Glucosamine Sulfate 1500mg**, **Chondroitin**, **Collagen Type 2 không biến tính**, kết hợp cùng **Canxi Nano + Vitamin D3 & K2** để ngăn ngừa loãng xương.
- Thời gian dùng: Nên uống liên tục theo đợt 2 - 3 tháng trong hoặc ngay sau bữa ăn chính.

2. **Khuyến cáo an toàn:**
- Nếu Bác/Cô/Chú đang có bệnh lý dạ dày (viêm loét) hoặc tăng huyết áp, cần thận trọng khi sử dụng các thuốc giảm đau nhóm NSAID (như Meloxicam, Celebrex). Cần có sự chỉ định của Bác sĩ và thường phối hợp thuốc bảo vệ dạ dày.

3. **Liên kết mua thuốc & thực phẩm chức năng chính hãng:**
- Quý khách có thể xem và đặt mua các dòng sản phẩm bổ khớp chuyên sâu chính hãng, có hóa đơn VAT tại **Chuyên mục Bổ Xương Khớp - Nhà Thuốc An Khang** (đang có ưu đãi giao nhanh): [Xem danh mục Bổ Xương Khớp An Khang](https://www.nhathuocankhang.com/bo-xuong-khop?gad_source=1&gad_campaignid=24093045004&gbraid=0AAAAA_Tw4OKNOJqRMJfMgBtMMtFkoQWEr&gclid=CjwKCAjwl4HXBhAjEiwAHlpWhATmUDRoOJCRO8_Gkl5jTg4PxIpe4xzJi2a5JYf_kSfNlpMwGln-mxoC6TkQAvD_BwE).
- Hoặc tìm các sản phẩm theo đơn tại mạng lưới **Nhà Thuốc FPT Long Châu**: [Truy cập Nhà Thuốc Long Châu](https://nhathuoclongchau.com.vn/).

Cần Bác sĩ Lão khoa GoCare đến khám tại nhà hoặc tư vấn trực tiếp 1:1, xin gọi ngay Tổng đài Y tế: **1900 6868**.`;
  }

  if (lower.includes("long châu") || lower.includes("nhà thuốc")) {
    return `Dạ kính chào Quý khách! 

Hệ thống GoCare hiện đã **liên thông điều phối dược phẩm trực tiếp** với:
1. **Nhà thuốc FPT Long Châu**: Mạng lưới hơn 1.600 nhà thuốc khắp 63 tỉnh thành, đảm bảo 100% thuốc kê đơn chính hãng, bảo quản chuẩn GSP 15-25°C và giao nhanh trong 1-2 giờ. [Bấm vào đây để tới website Nhà Thuốc Long Châu](https://nhathuoclongchau.com.vn/).
2. **Nhà thuốc An Khang (MWG)**: Hệ sinh thái dược phẩm uy tín, nổi bật với chuyên mục sản phẩm chăm sóc Xương Khớp & Tim mạch người cao tuổi. [Bấm vào đây để tới danh mục Bổ Xương Khớp An Khang](https://www.nhathuocankhang.com/bo-xuong-khop?gad_source=1&gad_campaignid=24093045004&gbraid=0AAAAA_Tw4OKNOJqRMJfMgBtMMtFkoQWEr&gclid=CjwKCAjwl4HXBhAjEiwAHlpWhATmUDRoOJCRO8_Gkl5jTg4PxIpe4xzJi2a5JYf_kSfNlpMwGln-mxoC6TkQAvD_BwE).

Mọi đơn thuốc đặt qua hệ thống liên kết đều được Dược sĩ GoCare tự động đồng bộ vào Hồ sơ bệnh án điện tử (EHR) để Bác sĩ gia đình theo dõi.`;
  }

  if (lower.includes("đơn thuốc") || lower.includes("toa") || contextType === "prescription") {
    return `Dạ, Dược sĩ GoCare sẵn sàng hỗ trợ rà soát đơn thuốc của Quý khách!

Quý khách có thể:
1. Sử dụng tính năng **'Tải Lên Đơn Thuốc'** trên thanh Tiện ích Y tế thông minh để hệ thống AI nhận diện tên thuốc, hoạt chất và thời gian uống.
2. Dược sĩ Lão khoa của GoCare sẽ kiểm tra liều lượng, loại trừ tương tác thuốc với bệnh nền (như suy thận, đái tháo đường, tim mạch).
3. Sau đó, thuốc sẽ được đóng gói điều phối từ **Nhà thuốc FPT Long Châu** hoặc **Nhà thuốc An Khang** giao tận giường bệnh nhân trong 1 - 2 giờ.

Quý khách cũng có thể gửi ảnh đơn thuốc qua Zalo hotline y tế **1900 6868** để Dược sĩ túc trực phản hồi ngay.`;
  }

  return `Dạ kính chào Quý khách! Tôi là Dược sĩ Trí Tuệ Nhân Tạo thuộc Hệ thống Y tế Lão Khoa GoCare.

Tôi có thể hỗ trợ Quý khách:
- **Tư vấn bệnh lý xương khớp & lão khoa**: Hướng dẫn dùng Glucosamine, sụn khớp, Canxi, giảm đau an toàn cho người cao tuổi.
- **Liên kết mua thuốc chính hãng**: Mua tại [Nhà Thuốc Long Châu](https://nhathuoclongchau.com.vn/) & chuyên mục [Bổ Xương Khớp Nhà Thuốc An Khang](https://www.nhathuocankhang.com/bo-xuong-khop?gad_source=1&gad_campaignid=24093045004&gbraid=0AAAAA_Tw4OKNOJqRMJfMgBtMMtFkoQWEr&gclid=CjwKCAjwl4HXBhAjEiwAHlpWhATmUDRoOJCRO8_Gkl5jTg4PxIpe4xzJi2a5JYf_kSfNlpMwGln-mxoC6TkQAvD_BwE).
- **Rà soát tương tác thuốc**: Đảm bảo thuốc huyết áp, tim mạch, khớp không kỵ nhau.
- **Nhắc lịch uống thuốc & chăm sóc điều dưỡng tại nhà**: Điều dưỡng có chứng chỉ hành nghề túc trực 24/7.

Quý khách đang băn khoăn về loại thuốc hay triệu chứng nào cần GoCare giải đáp ngay ạ?`;
}
