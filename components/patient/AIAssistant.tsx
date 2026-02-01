import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, BrainCircuit, Loader2, Info, AlertCircle, CloudCheck, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { Patient, ClinicData, Tooth } from '../../types';
import { PATIENT_QUESTIONS_LIST } from '../../constants';

interface AIAssistantProps {
  patient: Patient;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  t: any;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ patient, data, t, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRTL = data.settings.language === 'ar' || data.settings.language === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';
  
  const generateInsights = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInsight(null);
    
    try {
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

      const dentalHistoryQueries = patient.patientQueries?.map(q => {
          const question = PATIENT_QUESTIONS_LIST.find(pq => pq.id === q.questionId);
          const option = question?.options.find(o => o.id === q.answerId);
          const qText = isRTL ? (data.settings.language === 'ku' ? question?.ku : question?.ar) : question?.en;
          const aText = isRTL ? (data.settings.language === 'ku' ? option?.ku : option?.ar) : option?.en;
          return `${qText}: ${aText}`;
      }).join('\n') || 'No specific dental history recorded.';

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

      const text = await aiService.generateInsights(prompt);
      setInsight(text);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setErrorMsg(error.message);
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
                    AI System Active
                 </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-90">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative mb-8">
                <Loader2 size={80} className="animate-spin text-indigo-600 opacity-20" />
                <BrainCircuit size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
              </div>
              <p className="font-black text-2xl text-indigo-600 animate-pulse">{t.aiAnalyzing}</p>
            </div>
          ) : insight ? (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles size={24} />
                  <h4 className="font-black text-xl uppercase tracking-tight">{t.aiResponseTitle}</h4>
                </div>
              </div>
              <div className="max-w-none p-8 rounded-[2.5rem] border-2 shadow-inner bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                <p className="whitespace-pre-wrap leading-relaxed text-lg font-bold text-start" dir="auto">
                  {insight}
                </p>
              </div>
              <div className="pt-4">
                <button onClick={() => setInsight(null)} className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black text-lg uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all">
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
                  {isRTL ? "تحليل التاريخ الطبي والسني ومخطط الأسنان بالذكاء الاصطناعي." : "AI analysis for medical/dental history and charts."}
                </p>
              </div>
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 text-xs font-bold animate-shake">
                        <AlertCircle size={24} className="shrink-0" />
                        <p className="text-start leading-relaxed">{errorMsg}</p>
                    </div>
                )}
                <button 
                    onClick={generateInsights}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:opacity-90 transition transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                    <Zap size={24} /> {t.getAiInsights}
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
