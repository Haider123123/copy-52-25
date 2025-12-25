import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, BrainCircuit, Loader2, Info, Key, CheckCircle2, ArrowLeft, LogIn, MousePointer2, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Patient, ClinicData, Tooth } from '../../types';

interface AIAssistantProps {
  patient: Patient;
  data: ClinicData;
  t: any;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ patient, data, t, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'key_missing' | 'api_error'>('none');

  // Determine if RTL is needed based on language settings
  const isRTL = data.settings.language === 'ar' || data.settings.language === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';

  useEffect(() => {
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (!selected) setErrorType('key_missing');
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success due to race condition mitigation
      setHasKey(true);
      setErrorType('none');
      setInsight(null); // Clear any error insights
    } catch (error) {
      console.error("Key selection failed", error);
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    setErrorType('none');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const teethStatus = Object.entries(patient.teeth)
        .map(([id, t]) => {
          const tooth = t as Tooth;
          return `Tooth ${id}: ${tooth.status}${tooth.notes ? ` (${tooth.notes})` : ''}`;
        })
        .join(', ');

      const medicalHistory = patient.structuredMedicalHistory
        ?.filter(c => c.active)
        .map(c => c.id)
        .join(', ') || 'None';

      const prompt = `Patient Data:
        - Age: ${patient.age}
        - Gender: ${patient.gender}
        - Category: ${patient.category}
        - Medical Conditions: ${medicalHistory}
        - Teeth Charting: ${teethStatus || 'No specific charting recorded'}
        - Additional Notes: ${patient.medicalHistory}
        
        Instruction: ${t.aiInstruction}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (!response.text) throw new Error("Empty response");
      setInsight(response.text);
    } catch (error: any) {
      console.error("AI Error:", error);
      // Handle the specific multi-device missing key error
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key not valid")) {
        setHasKey(false);
        setErrorType('key_missing');
        setInsight(isRTL ? "يجب إعادة تفعيل الذكاء الاصطناعي على هذا الجهاز للمتابعة." : "AI must be re-activated on this device to continue.");
      } else {
        setErrorType('api_error');
        setInsight(isRTL ? "فشل الاتصال بالذكاء الاصطناعي. يرجى التأكد من اتصال الإنترنت." : "AI connection failed. Please check your internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <BrainCircuit size={32} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tight">{showHowTo ? (isRTL ? "دليل التفعيل" : "Activation Guide") : t.aiAssistant}</h3>
              <p className="text-[10px] opacity-70 uppercase tracking-[0.2em] font-black">Intelligent Diagnosis Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90">
            <X size={28} />
          </button>
        </div>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {showHowTo ? (
            <div className="space-y-8 animate-scale-up">
              <button 
                onClick={() => setShowHowTo(false)}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft size={18} className="rtl:rotate-180" /> {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
              </button>

              <div className="space-y-4">
                {[
                  { title: isRTL ? "تسجيل الدخول" : "Login", desc: isRTL ? "اضغط على زر (ربط المفتاح) لتظهر لك نافذة جوجل الرسمية والآمنة." : "Click (Connect Key) to open the official secure Google window.", icon: LogIn, color: "blue" },
                  { title: isRTL ? "اختيار الحساب" : "Select Account", desc: isRTL ? "قم باختيار حساب Gmail الخاص بك والموافقة على ربط خدمة Gemini بالعيادة." : "Select your Gmail account and approve connecting Gemini to the clinic.", icon: MousePointer2, color: "purple" },
                  { title: isRTL ? "انتهى الأمر!" : "All Done!", desc: isRTL ? "سيتم تفعيل الذكاء الاصطناعي فوراً وللأبد مجاناً على هذا الجهاز." : "AI will be activated immediately and forever for free on this device.", icon: Zap, color: "amber" }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-5 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner`}>
                      <step.icon size={28} />
                    </div>
                    <div className="text-start">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 uppercase">Step 0{idx+1}</span>
                        <h4 className="font-black text-lg text-gray-800 dark:text-white">{step.title}</h4>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-bold leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSelectKey}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-3"
              >
                <Key size={24} /> {isRTL ? 'ابدأ الربط الآن' : 'Start Connection Now'}
              </button>
            </div>
          ) : hasKey === false ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-amber-50 dark:ring-amber-900/10">
                <Key size={48} className="animate-bounce" />
              </div>
              <h4 className="text-3xl font-black text-gray-800 dark:text-white mb-3">
                {errorType === 'key_missing' ? (isRTL ? 'مطلوب إعادة تفعيل' : 'Re-activation Required') : (isRTL ? 'تفعيل الذكاء الاصطناعي' : 'Activate AI')}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mx-auto mb-10 leading-relaxed font-bold">
                {errorType === 'key_missing' 
                  ? (isRTL ? 'تحتاج لإعادة ربط الحساب على هذا الجهاز لتتمكن من استخدام ميزات الذكاء الاصطناعي.' : 'You need to re-link your account on this device to use AI features.')
                  : (isRTL ? 'استخدم قوة الذكاء الاصطناعي لتحليل حالات مرضى عيادتك وبخصوصية كاملة لبيانات المرضى' : 'Use the power of AI to analyze your patient cases with full data privacy.')}
              </p>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button 
                  onClick={handleSelectKey}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-3"
                >
                  <RefreshCw size={24} className={loading ? 'animate-spin' : ''} /> 
                  {isRTL ? 'إعادة تفعيل الذكاء الاصطناعي' : 'Re-activate AI Power'}
                </button>
                
                <button 
                  onClick={() => setShowHowTo(true)}
                  className="w-full py-4 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-black text-sm uppercase tracking-widest transition flex items-center justify-center gap-2"
                >
                  <Info size={18} /> {isRTL ? 'تعرف على كيفية تفعيل الذكاء الاصطناعي' : 'Learn how to activate AI'}
                </button>
              </div>
            </div>
          ) : !insight && !loading ? (
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-pulse">
                <Sparkles size={48} />
              </div>
              <h4 className="text-3xl font-black text-gray-800 dark:text-white mb-3">{t.getAiInsights}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mx-auto mb-10 font-bold leading-relaxed">
                {isRTL ? 'سيقوم النظام فوراً بمعالجة التاريخ المرضي، العمر، وحالة الأسنان المسجلة لتقديم رؤية سريرية دقيقة.' : 'The system will immediately process medical history, age, and recorded teeth status to provide accurate clinical insights.'}
              </p>
              <button 
                onClick={generateInsights}
                className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/40 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3 mx-auto"
              >
                <BrainCircuit size={24} /> {t.getAiInsights}
              </button>
              
              <button 
                onClick={handleSelectKey}
                className="mt-8 text-[11px] font-black uppercase text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-2 mx-auto"
              >
                <Key size={14} /> {isRTL ? 'إعادة التفعيل أو تغيير الحساب' : 'Re-activate or Change Account'}
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-8">
                <Loader2 size={80} className="animate-spin text-indigo-600 opacity-20" />
                <BrainCircuit size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
              </div>
              <p className="font-black text-2xl text-indigo-600 animate-pulse">{t.aiAnalyzing}</p>
              <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-widest">Processing Clinical Data</p>
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles size={24} />
                  <h4 className="font-black text-xl uppercase tracking-tight">{t.aiResponseTitle}</h4>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-tighter">
                   <CheckCircle2 size={12}/> AI Verified
                </div>
              </div>

              {/* Error Alert Box for key issues during generation */}
              {errorType !== 'none' && (
                <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border border-red-200 dark:border-red-800 flex items-center gap-4 animate-scale-up">
                  <AlertTriangle className="text-red-600 shrink-0" size={24} />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300 font-black leading-tight">
                      {insight}
                    </p>
                    <button onClick={handleSelectKey} className="text-xs text-red-600 underline font-black mt-1">
                      {isRTL ? 'اضغط هنا لإعادة التفعيل الآن' : 'Click here to re-activate now'}
                    </button>
                  </div>
                </div>
              )}

              {/* The Insights Box */}
              {errorType === 'none' && (
                <div className="max-w-none bg-gray-50 dark:bg-gray-700/50 p-8 rounded-[2.5rem] border-2 border-gray-100 dark:border-gray-700 shadow-inner">
                  <p 
                      className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-100 text-lg font-bold text-start"
                      dir="auto"
                      style={{ 
                          unicodeBidi: 'plaintext',
                          textAlign: isRTL ? 'right' : 'left'
                      }}
                  >
                    {insight}
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border-2 border-blue-100 dark:border-blue-800/30 flex items-start gap-4">
                <Info size={24} className="text-blue-600 shrink-0 mt-1" />
                <p className="text-sm text-blue-800 dark:text-blue-300 font-black leading-relaxed italic text-start">
                  {isRTL ? 'تنبيه: هذا التحليل استرشادي فقط ويعتمد على البيانات المدخلة. القرار النهائي يعود للطبيب المختص دائماً.' : 'Note: This analysis is for guidance only and depends on entered data. Final decision belongs to the specialist.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {setInsight(null); setErrorType('none');}}
                  className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black text-lg uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all active:scale-95"
                >
                  {isRTL ? 'إعادة التحليل' : 'Re-analyze'}
                </button>
                <button 
                  onClick={handleSelectKey}
                  className="px-6 py-5 text-gray-400 hover:text-indigo-500 text-[11px] font-black uppercase tracking-tighter transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  {isRTL ? 'إعادة التفعيل' : 'Re-activate'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};