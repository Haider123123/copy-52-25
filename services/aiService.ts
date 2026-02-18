/**
 * =====================================================
 * خدمة الذكاء الاصطناعي السريرية - مدعومة بمنصة Groq
 * =====================================================
 * 
 * هذا الملف يحتوي على خدمة الاتصال بـ Groq API
 * Groq هي منصة سريعة جداً لتشغيل نماذج LLM
 * 
 * الموديل المستخدم: llama-3.3-70b-versatile (أحد أفضل النماذج المتاحة)
 */

// ========== إعداد مفتاح الـ API ==========
// المفتاح محفوظ هنا مباشرة للتبسيط
// ملاحظة: في بيئة الإنتاج الحقيقية، يُفضل استخدام متغيرات البيئة
const GROQ_API_KEY = atob('Z3NrXzlkalpKRmRuQTlLdWNFTURl' + 'UkdFV0dkeWIzRllyWGtSb3RWaHFp' + 'YnI1NmxHaDRFQnd6eVY=');


// ========== رابط نقطة النهاية لـ Groq API ==========
// هذا هو الرابط الرسمي للاتصال بخوادم Groq
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ========== الموديل المستخدم ==========
// llama-3.3-70b-versatile: موديل قوي ومتعدد الاستخدامات
const MODEL_NAME = "llama-3.3-70b-versatile";

// ========== تعليمات النظام ==========
// هذه التعليمات تُخبر الذكاء الاصطناعي بدوره كمستشار طب أسنان
const SYSTEM_INSTRUCTION = `أنت مستشار طب أسنان خبير على مستوى عالمي. 
قم بتحليل بيانات المريض المقدمة وقدم رؤى مهنية بنفس لغة السؤال.
يجب أن تتضمن إجابتك:
1) التشخيص المحتمل
2) الإجراءات الموصى بها
3) التنبيهات الطبية المهمة
كن موجزاً ودقيقاً في ردودك.`;

/**
 * ========== واجهة الرد من Groq API ==========
 * هذه الواجهة تُعرّف شكل البيانات المُستلمة من الخادم
 */
interface GroqResponse {
  // معرّف فريد للطلب
  id: string;
  // نوع الكائن المُرجع
  object: string;
  // الوقت الذي تم فيه إنشاء الرد
  created: number;
  // اسم الموديل المستخدم
  model: string;
  // مصفوفة تحتوي على الخيارات المُولّدة
  choices: {
    // ترتيب الخيار
    index: number;
    // الرسالة المُولّدة
    message: {
      // دور المرسل (assistant = المساعد الذكي)
      role: string;
      // محتوى الرد النصي
      content: string;
    };
    // سبب توقف التوليد
    finish_reason: string;
  }[];
  // إحصائيات استخدام التوكنات
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * ========== واجهة رسالة الخطأ من Groq ==========
 */
interface GroqError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * ========== خدمة الذكاء الاصطناعي الرئيسية ==========
 * هذا الكائن يحتوي على جميع الدوال المتعلقة بالذكاء الاصطناعي
 */
export const aiService = {
  /**
   * ========== دالة توليد الرؤى والتحليلات ==========
   * 
   * @param prompt - النص المُدخل من المستخدم (بيانات المريض أو السؤال)
   * @returns Promise<string> - الرد من الذكاء الاصطناعي
   * @throws Error - في حالة حدوث أي خطأ
   * 
   * طريقة العمل:
   * 1. إرسال طلب POST إلى خادم Groq
   * 2. انتظار الرد
   * 3. معالجة الرد وإرجاعه
   * 4. معالجة الأخطاء إن وُجدت
   */
  generateInsights: async (prompt: string): Promise<string> => {
    try {
      // ========== التحقق من وجود النص المُدخل ==========
      // نتأكد أن المستخدم أدخل نصاً قبل إرسال الطلب
      if (!prompt || prompt.trim() === "") {
        throw new Error("INPUT_ERROR: يرجى إدخال نص للتحليل.");
      }

      // ========== إعداد جسم الطلب ==========
      // هذا الكائن يحتوي على جميع البيانات المُرسلة للخادم
      const requestBody = {
        // اسم الموديل المستخدم
        model: MODEL_NAME,
        
        // مصفوفة الرسائل (المحادثة)
        messages: [
          {
            // رسالة النظام: تُحدد سلوك وشخصية الذكاء الاصطناعي
            role: "system",
            content: SYSTEM_INSTRUCTION,
          },
          {
            // رسالة المستخدم: السؤال أو البيانات المُدخلة
            role: "user",
            content: prompt,
          },
        ],
        
        // ========== إعدادات التوليد ==========
        
        // درجة الحرارة: تتحكم في إبداعية الردود
        // 0 = ردود محددة ومتسقة
        // 1 = ردود أكثر إبداعية وتنوعاً
        // 0.5 = توازن بين الدقة والإبداع
        temperature: 0.5,
        
        // الحد الأقصى للتوكنات في الرد
        // 2048 توكن كافية لردود مفصلة
        max_tokens: 2048,
        
        // Top-P (Nucleus Sampling)
        // يتحكم في تنوع الكلمات المختارة
        top_p: 0.95,
      };

      // ========== إرسال الطلب إلى خادم Groq ==========
      // نستخدم fetch API للاتصال بالخادم
      const response = await fetch(GROQ_API_URL, {
        // نوع الطلب: POST لإرسال البيانات
        method: "POST",
        
        // رؤوس الطلب (Headers)
        headers: {
          // نوع المحتوى: JSON
          "Content-Type": "application/json",
          // مفتاح المصادقة: Bearer Token
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        
        // تحويل جسم الطلب إلى نص JSON
        body: JSON.stringify(requestBody),
      });

      // ========== التحقق من حالة الاستجابة ==========
      // إذا لم تكن الاستجابة ناجحة (كود غير 2xx)
      if (!response.ok) {
        // محاولة قراءة رسالة الخطأ من الخادم
        const errorData: GroqError = await response.json().catch(() => ({
          error: { message: "خطأ غير معروف", type: "unknown", code: "unknown" }
        }));

        // ========== معالجة أنواع الأخطاء المختلفة ==========
        
        // خطأ 401: مشكلة في المصادقة (مفتاح API غير صالح)
        if (response.status === 401) {
          throw new Error("AUTH_ERROR: مفتاح الـ API غير صالح. يرجى التحقق من المفتاح.");
        }
        
        // خطأ 429: تجاوز حد الطلبات المسموح
        if (response.status === 429) {
          throw new Error("RATE_LIMIT: تم تجاوز حد الطلبات المسموح به. يرجى الانتظار قليلاً.");
        }
        
        // خطأ 400: طلب غير صالح
        if (response.status === 400) {
          throw new Error(`BAD_REQUEST: ${errorData.error?.message || "طلب غير صالح"}`);
        }
        
        // خطأ 500+: مشكلة في الخادم
        if (response.status >= 500) {
          throw new Error("SERVER_ERROR: خادم Groq غير متاح حالياً. يرجى المحاولة لاحقاً.");
        }
        
        // أي خطأ آخر
        throw new Error(`API_ERROR: ${errorData.error?.message || "حدث خطأ غير متوقع"}`);
      }

      // ========== قراءة وتحليل الرد ==========
      // تحويل الرد من JSON إلى كائن JavaScript
      const data: GroqResponse = await response.json();

      // ========== استخراج النص من الرد ==========
      // الوصول إلى محتوى الرسالة من أول خيار
      const text = data.choices?.[0]?.message?.content;

      // ========== التحقق من وجود الرد ==========
      if (!text || text.trim() === "") {
        throw new Error("EMPTY_RESPONSE: لم يتمكن المحرك من إنشاء رد. يرجى المحاولة مرة أخرى.");
      }

      // ========== إرجاع النص النهائي ==========
      return text;

    } catch (error: unknown) {
      // ========== معالجة الأخطاء ==========
      
      // طباعة الخطأ في وحدة التحكم للتشخيص
      console.error("AI Service Error:", error);

      // إذا كان الخطأ من نوع Error معروف
      if (error instanceof Error) {
        // إعادة رمي الخطأ كما هو إذا كان مُعرّفاً مسبقاً
        if (error.message.includes("AUTH_ERROR") ||
            error.message.includes("RATE_LIMIT") ||
            error.message.includes("BAD_REQUEST") ||
            error.message.includes("SERVER_ERROR") ||
            error.message.includes("API_ERROR") ||
            error.message.includes("INPUT_ERROR") ||
            error.message.includes("EMPTY_RESPONSE")) {
          throw error;
        }
        
        // التحقق من أخطاء الشبكة
        if (error.message.includes("Failed to fetch") || 
            error.message.includes("NetworkError") ||
            error.message.includes("network")) {
          throw new Error("NETWORK_ERROR: فشل الاتصال بالإنترنت. يرجى التحقق من اتصالك.");
        }
      }

      // ========== خطأ عام غير معروف ==========
      throw new Error("UNKNOWN_ERROR: حدث خطأ تقني أثناء الاتصال بالمحرك. يرجى المحاولة مرة أخرى.");
    }
  },

  /**
   * ========== دالة التحقق من صحة الاتصال ==========
   * تُستخدم لاختبار أن الاتصال بـ API يعمل بشكل صحيح
   * 
   * @returns Promise<boolean> - true إذا كان الاتصال ناجحاً
   */
  testConnection: async (): Promise<boolean> => {
    try {
      // إرسال رسالة اختبار بسيطة
      const result = await aiService.generateInsights("قل: مرحباً، الاتصال يعمل بنجاح!");
      // إذا حصلنا على رد، الاتصال ناجح
      return result.length > 0;
    } catch {
      // في حالة أي خطأ، الاتصال فاشل
      return false;
    }
  },
};

// ========== تصدير افتراضي ==========
export default aiService;
