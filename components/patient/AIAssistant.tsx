
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, BrainCircuit, Loader2, Info, AlertCircle, CloudCheck, Zap, ShieldCheck, Settings2, ArrowRightCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Patient, ClinicData, Tooth } from '../../types';
import { PATIENT_QUESTIONS_LIST } from '../../constants';

interface AIAssistantProps {
  patient: Patient;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  t: any;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ patient, data, setData, t, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRTL = data.settings.language === 'ar' || data.settings.language === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';
  
  const syncedApiKey = data.settings.geminiApiKey;
  const isActivated = !!syncedApiKey;

  const generateInsights = async () => {
    if (!syncedApiKey) return;

    setLoading(true);
    setErrorMsg(null);
    setInsight(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: syncedApiKey });
      
      // 1. Detailed Teeth & Surfaces Status
      const teethData = Object.entries(patient.teeth)
        .map(([id, t]) => {
          const tooth = t as Tooth;
          let description = `Tooth ${id}: ${tooth.status}`;
          
          if (tooth.surfaces) {
              const activeSurfaces = Object.entries(tooth.surfaces)
                  .filter(([_, status]) => status !== 'none')
                  .map(([side, status]) => `${side} surface is ${status}`)
                  .join(', ');
              if (activeSurfaces) description += ` (Surfaces: ${activeSurfaces})`;
          }
          
          if (tooth.notes) description += ` - Note: ${tooth.notes}`;
          return description;
        })
        .join('\n');

      // 2. Detailed Dental History (Queries)
      const dentalHistoryQueries = patient.patientQueries?.map(q => {
          const question = PATIENT_QUESTIONS_LIST.find(pq => pq.id === q.questionId);
          const option = question?.options.find(o => o.id === q.answerId);
          const qText = isRTL ? (data.settings.language === 'ku' ? question?.ku : question?.ar) : question?.en;
          const aText = isRTL ? (data.settings.language === 'ku' ? option?.ku : option?.ar) : option?.en;
          return `${qText}: ${aText}`;
      }).join('\n') || 'No specific dental history recorded.';

      // 3. Medical History
      const medicalHistory = patient.structuredMedicalHistory
        ?.filter(c => c.active)
        .map(c => c.id)
        .join(', ') || 'None';

      const prompt = `Comprehensive Clinical Analysis Request:
        PATIENT PROFILE:
        - Name: ${patient.name}
        - Age: ${patient.age}
        - Category: ${patient.category}
        
        MEDICAL HISTORY:
        - Systemic Conditions: ${medicalHistory}
        - General Medical Notes: ${patient.medicalHistory}
        
        DENTAL HISTORY:
        ${dentalHistoryQueries}
        - Additional Dental Notes: ${patient.dentalHistoryNotes || 'None'}
        
        DETAILED DENTAL CHART & SURFACES:
        ${teethData || 'No specific findings in chart.'}
        
        DOCTOR'S CLINICAL NOTES:
        ${patient.notes || 'No additional notes.'}
        
        INSTRUCTION: ${t.aiInstruction}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (!response.text) throw new Error("No response");
      setInsight(response.text);
    } catch (error: any) {
      console.error("AI Error:", error);
      if (error.message?.includes('API_KEY_INVALID')) {
          setErrorMsg(isRTL ? "مفتاح الـ API غير صحيح. يرجى التأكد منه في الإعدادات." : "Invalid API Key. Please check your settings.");
      } else {
          setErrorMsg(isRTL ? "فشل الاتصال بالذكاء الاصطناعي." : "AI engine connection failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
              <h3 className="font-black text-2xl tracking-tight">{t.aiAssistant}</h3>
              <div className="flex items-center gap-1 opacity-70">
                 <CloudCheck size={12} />
                 <p className="text-[9px] uppercase tracking-widest font-black">
                    {isActivated ? (isRTL ? "نظام الذكاء مفعل" : "AI System Active") : (isRTL ? "تفعيل الخدمة مطلوب" : "Activation Required")}
                 </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90">
            <X size={28} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {!isActivated ? (
            <div className="text-center py-6 space-y-8 animate-fade-in">
               <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2 shadow-inner">
                 <Settings2 size={48} />
               </div>
               
               <div>
                 <h4 className="text-3xl font-black text-gray-800 dark:text-white mb-4">{isRTL ? "يتطلب التفعيل أولاً" : "Activation Required"}</h4>
                 <div className="max-w-sm mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-bold leading-relaxed">
                      {isRTL 
                        ? "ميزة الذكاء الاصطناعي تحتاج إلى ربط مفتاح API الخاص بك لتعمل. يرجى اتباع الخطوات التالية:" 
                        : "AI features need an API key to function. Please follow these steps:"}
                    </p>
                    <div className="flex items-start gap-3 text-start">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                        <p className="text-xs text-gray-500 font-bold">{isRTL ? "اذهب إلى القائمة الجانبية ثم 'الإعدادات'" : "Go to Sidebar then 'Settings'"}</p>
                    </div>
                    <div className="flex items-start gap-3 text-start">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                        <p className="text-xs text-gray-500 font-bold">{isRTL ? "ابحث عن قسم 'مساعد الذكاء الاصطناعي' وقم بإكمال الربط" : "Find 'AI Assistant' section and complete the link"}</p>
                    </div>
                 </div>
               </div>

               <div className="pt-4 flex justify-center">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-black animate-pulse uppercase tracking-widest">
                     <ArrowRightCircle size={20} className="rtl:rotate-180" />
                     {isRTL ? "الرجاء الإعداد من قائمة الإعدادات" : "Please configure in Settings"}
                  </div>
               </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative mb-8">
                <Loader2 size={80} className="animate-spin text-indigo-600 opacity-20" />
                <BrainCircuit size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
              </div>
              <p className="font-black text-2xl text-indigo-600 animate-pulse">{t.aiAnalyzing}</p>
              <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-widest">Processing Clinical Data...</p>
            </div>
          ) : insight ? (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles size={24} />
                  <h4 className="font-black text-xl uppercase tracking-tight">{t.aiResponseTitle}</h4>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-tighter">
                   <ShieldCheck size={12}/> Analysis Verified
                </div>
              </div>

              <div className="max-w-none p-8 rounded-[2.5rem] border-2 shadow-inner bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                <p className="whitespace-pre-wrap leading-relaxed text-lg font-bold text-start" dir="auto">
                  {insight}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border-2 border-blue-100 dark:border-blue-800/30 flex items-start gap-4">
                <Info size={24} className="text-blue-600 shrink-0 mt-1" />
                <p className="text-sm text-blue-800 dark:text-blue-300 font-black leading-relaxed italic text-start">
                  {isRTL ? 'تنبيه: هذا التحليل استرشادي فقط. القرار الطبي النهائي يعود دائماً للطبيب المختص.' : 'Note: This analysis is for guidance. Final medical decision belongs to the specialist.'}
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setInsight(null)}
                  className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black text-lg uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all active:scale-95"
                >
                  {isRTL ? 'إعادة التحليل' : 'Re-analyze Case'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-8 animate-fade-in">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Sparkles size={48} />
              </div>
              
              <div>
                <h4 className="text-3xl font-black text-gray-800 dark:text-white mb-3">{t.getAiInsights}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mx-auto font-bold leading-relaxed">
                  {isRTL 
                    ? "استخدم قوة الذكاء الاصطناعي لتحليل التاريخ الطبي، التاريخ السني، ومخطط الأسنان مع الأسطح للحصول على رؤية شاملة." 
                    : "Use AI power to analyze medical history, dental history, and charts including surfaces for a comprehensive case insight."}
                </p>
              </div>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-bold animate-shake">
                        <AlertCircle size={20} className="shrink-0" />
                        <p className="text-start">{errorMsg}</p>
                    </div>
                )}
                
                <button 
                    onClick={generateInsights}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:opacity-90 transition transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                    <Zap size={24} /> {t.getAiInsights}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest group">
                    <CloudCheck size={14} className="text-green-500" />
                    <span>{isRTL ? "الحساب مرتبط وجاهز للعمل" : "Account Linked & Ready"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
