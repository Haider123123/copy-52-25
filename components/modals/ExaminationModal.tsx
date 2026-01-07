
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Examination } from '../../types';

export const ExaminationModal = ({ show, onClose, t, handleSave, selectedItem, data, currentLang, isSaving, error }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    const isShortcutActive = data.settings.thousandsShortcut;

    if (!show) return null;

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[130] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3"> 
                    <Activity className="text-primary-600" />
                    {selectedItem ? t.editExamination : t.addExamination} 
                </h3>
                {isShortcutActive && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse shadow-sm">
                        {t.thousandsShortcut} Active
                    </span>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              let amountInput = fd.get('amount') as string;
              let amount = parseInt(amountInput) || 0;
              if (isShortcutActive && !isNaN(amount)) amount = amount * 1000;

              handleSave({ 
                  id: selectedItem?.id || Date.now().toString(),
                  amount: amount, 
                  description: fd.get('description') as string, 
                  date: fd.get('date') as string
              });
            }} className="space-y-6">
              <fieldset disabled={isSaving} className="space-y-6">
                <div> 
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">{t.description}</label> 
                    <input name="description" defaultValue={selectedItem?.description || t.checkup} autoComplete="off" className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white outline-none focus:border-primary-500 font-bold" placeholder={t.description} /> 
                </div>
                <div> 
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">{t.price}</label> 
                    <div className="relative"> 
                        <span className="absolute top-1/2 -translate-y-1/2 start-5 text-gray-400 font-black text-lg">{data.settings.currency}</span> 
                        <input 
                          name="amount" 
                          type="text" 
                          inputMode="numeric"
                          onInput={handleNumericInput}
                          defaultValue={selectedItem ? (isShortcutActive ? selectedItem.amount / 1000 : selectedItem.amount) : ''} 
                          className="w-full ps-16 pe-5 py-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white font-black text-2xl outline-none focus:border-primary-500 shadow-inner" 
                          required 
                          autoFocus
                        /> 
                        {isShortcutActive && (
                            <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-5' : 'right-5'} text-gray-300 font-black text-sm pointer-events-none`}>
                                ,000
                            </span>
                        )}
                    </div> 
                </div>
                <div> 
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">{t.date}</label> 
                    <input name="date" type="date" defaultValue={selectedItem ? format(new Date(selectedItem.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white outline-none focus:border-primary-500 font-bold" /> </div>
              </fieldset>

              <div className="flex gap-3 pt-4"> 
                  <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 py-4 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition disabled:opacity-30">{t.cancel}</button> 
                  <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"> 
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t.save} 
                  </button> 
              </div>
            </form>
          </div>
        </div>, document.body
    );
};
