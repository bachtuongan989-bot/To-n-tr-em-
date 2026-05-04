import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const MATH_TOPICS = [
  { id: 'general', name: 'Tổng hợp', icon: '📚' },
  { id: 'fractions', name: 'Phân số', icon: '🍰' },
  { id: 'decimals', name: 'Số thập phân', icon: '🔢' },
  { id: 'geometry', name: 'Hình học tiểu học', icon: '📦' },
  { id: 'word_problems', name: 'Giải toán có lời văn', icon: '📝' },
];

const sessionCache: Record<string, any> = {};

export const mathService = {
  async solveAndExplain(problem: string, age: number) {
    const cacheKey = `solve_${problem}_${age}`;
    if (sessionCache[cacheKey]) return sessionCache[cacheKey];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một chuyên gia toán học thân thiện. Hãy giải bài toán sau cho trẻ ${age} tuổi: "${problem}". 
      Yêu cầu:
      1. Đưa ra KẾT QUẢ CUỐI CÙNG ngay đầu tiên, in đậm và to.
      2. Sau đó giải thích VẮN TẮT, cực kỳ đơn giản, dễ hiểu.
      3. Sử dụng ngôn ngữ vui nhộn, khích lệ.
      4. Định dạng bằng Markdown.`,
    });
    sessionCache[cacheKey] = response.text;
    return response.text;
  },

  async analyzeImageProblem(base64Image: string, mimeType: string, age: number) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Bạn là một chuyên gia toán học thân thiện. Hãy phân tích hình ảnh bài toán này và giải chi tiết từng bước cho trẻ ${age} tuổi. 
            Yêu cầu:
            1. Trích xuất đề bài từ hình ảnh một cách chính xác.
            2. Đưa ra KẾT QUẢ CUỐI CÙNG in đậm và to ở ngay sau phần trích xuất đề bài.
            3. Giải thích CHI TIẾT từng bước làm bài, tại sao lại làm như vậy, cách suy luận logic.
            4. Sử dụng ngôn ngữ vui nhộn, khích lệ trẻ.
            5. Định dạng bằng Markdown đẹp mắt.`,
          },
        ],
      },
    });
    return response.text;
  },

  async generateIllustrationPrompt(problem: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Dựa trên bài toán này: "${problem}", hãy tạo một prompt ngắn gọn bằng tiếng Anh để tạo một hình ảnh minh họa hoạt hình (cartoon style) sinh động, màu sắc tươi sáng giúp trẻ dễ hình dung bài toán. Chỉ trả về đoạn prompt tiếng Anh.`,
    });
    return response.text;
  },

  async generateImage(prompt: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async getPracticeProblems(grade: number, difficulty: 'easy' | 'medium' | 'hard', count: number = 5, topicId: string = 'general') {
    const cacheKey = `practice_${grade}_${difficulty}_${count}_${topicId}`;
    if (sessionCache[cacheKey]) return sessionCache[cacheKey];

    if (!navigator.onLine) {
      // Offline fallback
      return [
        { id: 1, category: "Cộng trừ", question: "15 + 7 bằng bao nhiêu?", options: ["21", "22", "23", "24"], answer: "22", explanation: "Lấy 15 thêm 7 đơn vị ta được 22." },
        { id: 2, category: "Cộng trừ", question: "30 - 12 bằng bao nhiêu?", options: ["18", "17", "16", "15"], answer: "18", explanation: "Lấy 30 bớt đi 12 đơn vị ta được 18." },
        { id: 3, category: "So sánh", question: "45 ... 54. Điền dấu thích hợp?", options: [">", "<", "="], answer: "<", explanation: "4 chục bé hơn 5 chục nên 45 < 54." },
        { id: 4, category: "Nhân chia", question: "5 x 4 bằng bao nhiêu?", options: ["15", "20", "25", "10"], answer: "20", explanation: "5 được lấy 4 lần là 20." },
        { id: 5, category: "Hình học", question: "Hình vuông có mấy cạnh?", options: ["3", "4", "5", "6"], answer: "4", explanation: "Hình vuông có 4 cạnh bằng nhau." }
      ].slice(0, count);
    }

    const topic = MATH_TOPICS.find(t => t.id === topicId)?.name || 'Tổng hợp';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là giáo viên toán lớp ${grade}. Tạo ${count} câu hỏi trắc nghiệm chủ đề ${topic}. 
      Yêu cầu:
      1. Nội dung phù hợp với độ khó ${difficulty}.
      2. Cung cấp một gợi ý nhỏ (hint) giúp trẻ suy luận mà không cho biết đáp án ngay.
      3. Cung cấp giải thích chi tiết sau khi có kết quả.
      Trả về JSON: [{ "id": 1, "category": "...", "question": "...", "options": ["...", "..."], "answer": "...", "explanation": "...", "hint": "..." }]`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);
    sessionCache[cacheKey] = result;
    return result;
  },

  async getExamPaper(age: number, topicId: string = 'general') {
    const grade = Math.max(1, Math.min(5, age - 5));
    const cacheKey = `exam_${grade}_${topicId}`;
    if (sessionCache[cacheKey]) return sessionCache[cacheKey];

    if (!navigator.onLine) {
      // Offline fallback exam
      return {
        examName: `ĐỀ ÔN TẬP TOÁN LỚP ${grade} (OFFLINE)`,
        timeLimit: 30,
        questions: [
          { id: 1, question: `Kết quả của phép tính ${grade * 10} + 25 là?`, options: [`${grade * 10 + 20}`, `${grade * 10 + 25}`, `${grade * 10 + 30}`, `${grade * 10 + 15}`], answer: `${grade * 10 + 25}`, explanation: "Cộng hàng đơn vị rồi đến hàng chục." },
          { id: 2, question: "Số lớn nhất có hai chữ số là?", options: ["10", "90", "99", "100"], answer: "99", explanation: "Số 99 là số lớn nhất có 2 chữ số." },
          { id: 3, question: "Một tuần lễ có bao nhiêu ngày?", options: ["5 ngày", "6 ngày", "7 ngày", "8 ngày"], answer: "7 ngày", explanation: "Một tuần gồm từ thứ Hai đến Chủ Nhật." },
          { id: 4, question: "Hình nào có 3 cạnh?", options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"], answer: "Hình tam giác", explanation: "Tam giác nghĩa là có 3 góc và 3 cạnh." },
          { id: 5, question: "Số 50 gồm mấy chục và mấy đơn vị?", options: ["5 chục và 0 đơn vị", "0 chục và 5 đơn vị", "5 chục và 5 đơn vị", "5 đơn vị"], answer: "5 chục và 0 đơn vị", explanation: "Số 50 có chữ số 5 ở hàng chục." },
          { id: 6, question: "Kết quả của 2 x 5 là?", options: ["7", "10", "12", "8"], answer: "10", explanation: "2 nhân 5 bằng 10." },
          { id: 7, question: "Số liền sau của số 19 là?", options: ["18", "20", "21", "17"], answer: "20", explanation: "Lấy 19 cộng thêm 1 đơn vị." },
          { id: 8, question: "100 cm bằng bao nhiêu mét?", options: ["1m", "10m", "0.1m", "100m"], answer: "1m", explanation: "1 mét bằng 100 xăng-ti-mét." },
          { id: 9, question: "Mẹ có 10 quả táo, mẹ cho bé 3 quả. Mẹ còn lại mấy quả?", options: ["6 quả", "7 quả", "8 quả", "9 quả"], answer: "7 quả", explanation: "Thực hiện phép tính trừ: 10 - 3 = 7." },
          { id: 10, question: "Đồng hồ chỉ 12 giờ thì kim dài và kim ngắn như thế nào?", options: ["Thẳng hàng", "Trùng nhau", "Vuông góc", "Đối nhau"], answer: "Trùng nhau", explanation: "Lúc 12 giờ cả hai kim đều chỉ số 12." }
        ]
      };
    }

    const topic = MATH_TOPICS.find(t => t.id === topicId)?.name || 'Tổng hợp';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một chuyên gia khảo thí toán học cấp tiểu học tại Việt Nam. Hãy soạn một đề thi toán học kỳ chất lượng cao cho học sinh lớp ${grade} (khoảng ${age} tuổi) với chủ đề "${topic}".
      
      Yêu cầu về nội dung:
      1. Đề thi phải bao gồm 10 câu hỏi trắc nghiệm khách quan với 4 lựa chọn (A, B, C, D).
      2. Cấu trúc đề thi: 3 câu nhận biết (dễ), 4 câu thông hiểu (trung bình), 2 câu vận dụng (khó) và 1 câu vận dụng cao (cực khó/thách thức).
      3. Câu hỏi phải đa dạng: tính toán thuần túy, giải toán có lời văn, hình học, đo lường và tư duy logic.
      4. Ngôn ngữ: Trong sáng, chuẩn sư phạm tiểu học Việt Nam, dễ hiểu nhưng vẫn trang trọng của một đề thi.

      Yêu cầu về kỹ thuật:
      1. Trường "answer" PHẢI trùng khớp hoàn toàn (từng ký tự) với một trong các phần tử trong mảng "options".
      2. Trường "explanation" phải giải thích cặn kẽ, sư phạm để trẻ tự học được từ lỗi sai.
      3. Trường "examName" phải thật kêu, ví dụ: "ĐỀ THI TRẠNG NGUYÊN NHÍ - TOÁN LỚP ${grade}".

      Trả về JSON theo cấu trúc:
      { 
        "examName": "Tên Đề Thi", 
        "timeLimit": 40, 
        "questions": [
          { 
            "id": 1, 
            "question": "Nội dung câu hỏi?", 
            "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], 
            "answer": "Lựa chọn đúng (copy paste từ options)", 
            "explanation": "Giải thích chi tiết tại sao đáp án đó đúng và các đáp án khác sai." 
          }
        ] 
      }`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const result = JSON.parse(response.text);
    sessionCache[cacheKey] = result;
    return result;
  },

  async generateExamFeedback(score: number, total: number, age: number) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một giáo viên toán tiểu học tâm lý và khích lệ. Học sinh ${age} tuổi vừa hoàn thành bài thi với số điểm ${score}/${total}. 
      Hãy đưa ra một lời nhận xét ngắn gọn (khoảng 2-3 câu), vui vẻ, khen ngợi những gì trẻ làm được và đưa ra lời khuyên chân thành nếu cần cố gắng thêm. 
      Ngôn ngữ phải gần gũi với trẻ em Việt Nam.`,
    });
    return response.text;
  },

  async speakText(text: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return wrapInWavHeader(base64Audio, 24000);
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
    return null;
  }
};

function wrapInWavHeader(base64Data: string, sampleRate: number): string {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM = 1)
  view.setUint16(20, 1, true);
  // channel count (mono = 1)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, len, true);

  // write the data
  for (let i = 0; i < len; i++) {
    view.setUint8(44 + i, bytes[i]);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
