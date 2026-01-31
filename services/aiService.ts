
import { GoogleGenAI } from "@google/genai";

/**
 * خدمة الذكاء الاصطناعي للحصول على الرؤى السريرية.
 * مصممة للعمل في البيئات المحلية والخارجية عبر متغيرات البيئة.
 */
export const aiService = {
  generateInsights: async (prompt: string): Promise<string> => {
    // التحقق من وجود المفتاح البرمجي
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === 'undefined') {
      throw new Error("API Key is missing. Please configure your environment variables (API_KEY) on your hosting provider.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a world-class senior dental consultant. Analyze the provided patient data (Medical history, dental chart, and clinical notes) and provide professional insights including: 1) Potential diagnosis, 2) Recommended immediate actions, 3) Long-term treatment plan suggestions, 4) Urgent medical alerts. Be concise, professional, and use the language of the provided prompt.",
          temperature: 0.7,
          topP: 0.9,
          topK: 40
        }
      });

      if (!response || !response.text) {
        throw new Error("The AI returned an empty response. Please try again.");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini AI Service Error:", error);
      
      const errorStr = error.toString().toLowerCase();
      
      if (errorStr.includes('401') || errorStr.includes('key')) {
        throw new Error("خطأ في المصادقة: مفتاح الـ API غير صالح أو غير مهيأ بشكل صحيح على الاستضافة.");
      }
      
      if (errorStr.includes('429')) {
        throw new Error("تم تجاوز حد الطلبات المسموح به. يرجى الانتظار دقيقة والمحاولة مرة أخرى.");
      }

      if (errorStr.includes('fetch') || errorStr.includes('network')) {
        throw new Error("مشكلة في الاتصال بالشبكة. تأكد من أن الاستضافة تسمح بالاتصال بخوادم Google API.");
      }

      throw new Error("حدث خطأ تقني أثناء تحليل البيانات. يرجى مراجعة إعدادات الاستضافة.");
    }
  }
};
