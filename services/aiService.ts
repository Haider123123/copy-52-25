import { GoogleGenAI } from "@google/genai";

/**
 * خدمة الذكاء الاصطناعي للحصول على الرؤى السريرية.
 * تلتزم هذه الخدمة باستخدام المفتاح البرمجي من متغيرات البيئة فقط لضمان الأمان والاستقرار.
 */
export const aiService = {
  generateInsights: async (prompt: string): Promise<string> => {
    // تهيئة العميل عند الاستدعاء لضمان استخدام أحدث تكوين للمفتاح البرمجي
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          // تعليمات النظام لضمان مخرجات طبية احترافية
          systemInstruction: "You are a senior dental consultant. Analyze the following patient data and provide: 1) Potential diagnosis, 2) Recommended treatment plan, 3) Medical alerts if any. Keep it professional and concise. Always respond in the language of the prompt or Arabic/English as appropriate.",
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      });

      if (!response || !response.text) {
        throw new Error("Empty AI response");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini AI Service Error:", error);
      
      const errorMsg = error.toString().toLowerCase();
      
      // معالجة أخطاء المصادقة أو الحصص البرمجية
      if (errorMsg.includes('401') || errorMsg.includes('key')) {
        throw new Error("فشل في المصادقة مع خدمة الذكاء الاصطناعي. يرجى التأكد من إعدادات النظام.");
      }
      
      if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        throw new Error("تم الوصول للحد الأقصى من الطلبات حالياً. يرجى المحاولة بعد قليل.");
      }

      throw new Error("حدث خطأ أثناء معالجة البيانات بالذكاء الاصطناعي.");
    }
  }
};
