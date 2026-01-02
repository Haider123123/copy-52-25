
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Printer, Edit2, Trash2, Search, Settings, X, Info, Activity } from 'lucide-react';
import { CURRENCY_LIST } from '../../constants';
import { Patient, ClinicData, Examination } from '../../types';

interface ExaminationSectionProps {
  activePatient: Patient;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  t: any;
  openExaminationModal: (examination?: Examination) => void;
  setPrintingExamination: (e: Examination) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  handleDeleteExamination: (id: string) => void;
}

export const ExaminationSection: React.FC<ExaminationSectionProps> = ({
  activePatient, data, setData, t, openExaminationModal, setPrintingExamination, openConfirm, handleDeleteExamination
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const examinations = activePatient.examinations || [];
  const totalAmount = examinations.reduce((acc, curr) => acc + curr.amount, 0);

  const lang = data.settings.language;
  const isRTL = lang === 'ar' || lang === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';

  const toggleShortcut = () => {
    setData(prev => ({
        ...prev,
        settings: { ...prev.settings, thousandsShortcut: !prev.settings.thousandsShortcut },
        lastUpdated: Date.now()
    }));
  };

  return (
    <div className="animate-fade-in space-y-8 relative">
        {/* Quick Settings Modal */}
        {showSettings && createPortal(
            <div className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'} onClick={() => setShowSettings(false)}>
                <div 
                    className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-700 animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-3 text-2xl">
                            <Settings size={26} className="text-primary-600" />
                            {t.settings}
                        </h3>
                        <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-black text-gray-800 dark:text-gray-200 text-lg">{t.thousandsShortcut}</span>
                                <button 
                                    onClick={toggleShortcut}
                                    className={`w-16 h-9 rounded-full p-1 transition-colors duration-300 flex items-center ${data.settings.thousandsShortcut ? 'bg-primary-600 justify-end' : 'bg-gray-200 dark:bg-gray-600 justify-start'}`}
                                >
                                    <div className="w-7 h-7 rounded-full bg-white shadow-md"></div>
                                </button>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                                <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-bold">
                                    {t.thousandsShortcutDesc}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowSettings(false)}
                            className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition transform active:scale-95"
                        >
                            {t.done}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            <Activity className="text-primary-500" />
            {t.examination}
          </h3>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-primary-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 block">{t.totalExaminations}</span>
                <div className="text-3xl font-black">{data.settings.currency} {totalAmount.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl"><Activity size={32} /></div>
          </div>
          
          <button onClick={() => openExaminationModal()} className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-dashed border-primary-200 dark:border-gray-700 rounded-[2.5rem] hover:bg-primary-50 dark:hover:bg-gray-700/50 transition-all group">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-2xl group-hover:scale-110 transition-transform"><Plus size={24} /></div>
              <span className="font-black text-primary-600 dark:text-primary-400 text-lg uppercase tracking-tight">{t.addExamination}</span>
          </button>
        </div>

        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white mt-4 uppercase tracking-wider text-sm">{t.transactionHistory}</h3>
            {examinations.length === 0 ? ( 
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2.5rem] flex flex-col items-center justify-center opacity-40">
                   <Activity size={48} className="mb-2" />
                   <p className="font-bold">{t.noTransactions}</p>
                </div>
            ) : (
                examinations.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-5 bg-white dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-700 group hover:shadow-lg hover:border-primary-100 transition-all animate-fade-in">
                        <div className="flex-1">
                            <div className="text-gray-800 dark:text-white font-black text-lg leading-tight mb-1">{e.description || t.checkup}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(e.date).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-2xl font-black text-primary-600 dark:text-primary-400">{data.settings.currency} {e.amount.toLocaleString()}</div>
                           <div className="flex gap-1.5">
                               <button onClick={() => setPrintingExamination(e)} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-600 rounded-xl transition" title={t.print}><Printer size={18} /></button>
                               <button onClick={() => openExaminationModal(e)} className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition" title="Edit"><Edit2 size={18} /></button>
                               <button onClick={() => openConfirm(t.deleteItem, t.deleteRxConfirm, () => handleDeleteExamination(e.id))} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete"><Trash2 size={18} /></button>
                           </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
