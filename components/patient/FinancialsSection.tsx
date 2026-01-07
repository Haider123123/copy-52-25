
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Printer, Edit2, Trash2, DollarSign, Settings, X, Info } from 'lucide-react';
import { CURRENCY_LIST } from '../../constants';
import { Patient, ClinicData, Payment } from '../../types';

interface FinancialsSectionProps {
  activePatient: Patient;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  t: any;
  openLocalPaymentModal: (type: 'payment' | 'charge', payment?: Payment) => void;
  setPrintingPayment: (p: Payment) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  handleDeletePaymentTransaction: (id: string) => void;
}

export const FinancialsSection: React.FC<FinancialsSectionProps> = ({
  activePatient, data, setData, t, openLocalPaymentModal, setPrintingPayment, openConfirm, handleDeletePaymentTransaction
}) => {
  const [showFinSettings, setShowFinSettings] = useState(false);
  const totalPaid = activePatient.payments.filter(p => p.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCost = activePatient.payments.filter(p => p.type === 'charge').reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = totalCost - totalPaid;

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

  const setCurrency = (val: string) => {
    setData(prev => ({
        ...prev,
        settings: { ...prev.settings, currency: val },
        lastUpdated: Date.now()
    }));
  };

  return (
    <div className="animate-fade-in space-y-8 relative">
        {/* Financial Quick Settings Modal - Localized and Styled */}
        {showFinSettings && createPortal(
            <div className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'} onClick={() => setShowFinSettings(false)}>
                <div 
                    className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-700 animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-3 text-2xl">
                            <Settings size={26} className="text-primary-600" />
                            {t.financialSettings}
                        </h3>
                        <button onClick={() => setShowFinSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Currency Setting */}
                        <div>
                            <label className="block text-2xl font-black text-gray-800 dark:text-gray-200 uppercase mb-3 tracking-widest">{t.currency}</label>
                            <select
                                value={data.settings.currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none font-black text-lg cursor-pointer shadow-sm focus:border-primary-500 transition-colors"
                            >
                                {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Thousands Shortcut Toggle */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
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
                            onClick={() => setShowFinSettings(false)}
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
          <h3 className="text-xl font-black text-gray-800 dark:text-white">{t.financials}</h3>
          <button 
            onClick={() => setShowFinSettings(true)}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{t.totalCost}</span>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.settings.currency} {totalCost.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
              <span className="text-xs font-bold text-green-600 dark:text-blue-400 uppercase">{t.totalPaid}</span>
              <div className="text-2xl font-bold text-green-700 dark:text-blue-300">{data.settings.currency} {totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-blue-800">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">{t.remaining}</span>
              <div className="text-2xl font-bold text-orange-700 dark:text-blue-300">{data.settings.currency} {remaining.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-4">
            <button onClick={() => openLocalPaymentModal('charge')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition flex justify-center items-center gap-2 active:scale-95"><Plus size={18} /> {t.addCharge}</button>
            <button onClick={() => openLocalPaymentModal('payment')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 transition flex justify-center items-center gap-2 active:scale-95"><DollarSign size={18} /> {t.addPayment}</button>
        </div>

        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white mt-4 uppercase tracking-wider text-sm">{t.transactionHistory}</h3>
            {activePatient.payments.length === 0 ? ( <p className="text-center text-gray-400 italic py-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2rem]">{t.noTransactions}</p> ) : (
                activePatient.payments.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-all">
                        <div className="flex-1">
                            <div className={`text-[10px] font-black uppercase mb-1 tracking-widest ${p.type === 'payment' ? 'text-green-600' : 'text-blue-600'}`}>{p.type === 'payment' ? t.paymentReceived : t.treatmentCost}</div>
                            <div className="text-gray-800 dark:text-white font-black text-lg leading-tight">{p.description}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(p.date).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-xl font-black text-gray-800 dark:text-white">{p.type === 'payment' ? '+' : '-'}{p.amount.toLocaleString()}</div>
                           {p.type === 'payment' && ( <button onClick={() => setPrintingPayment(p)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition" title={t.print}><Printer size={18} /></button> )}
                           <button onClick={() => openLocalPaymentModal(p.type, p)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition" title="Edit"><Edit2 size={18} /></button>
                           <button onClick={() => openConfirm(t.deleteItem, isRTL ? 'هل تريد حذف هذه العملية المالية؟' : 'Remove this transaction?', () => handleDeletePaymentTransaction(p.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
