
import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Language;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, lang, confirmLabel, cancelLabel, isLoading 
}) => {
  if (!isOpen) return null;
  
  const isRTL = lang === 'ar' || lang === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';

  const labels = {
      en: { confirm: 'Delete', cancel: 'Cancel', deleting: 'Deleting...' },
      ar: { confirm: 'حذف', cancel: 'إلغاء', deleting: 'جاري الحذف...' },
      ku: { confirm: 'سڕینەوە', cancel: 'هەڵوەشاندنەوە', deleting: 'خەریکی سڕینەوەیە...' }
  };
  const defaultTxt = labels[lang] || labels.en;

  const confirmText = isLoading ? defaultTxt.deleting : (confirmLabel || defaultTxt.confirm);
  const cancelText = cancelLabel || defaultTxt.cancel;

  const Icon = confirmLabel ? AlertTriangle : Trash2;
  const iconColorClass = confirmLabel ? "text-orange-600 dark:text-orange-500" : "text-red-600 dark:text-red-500";
  const iconBgClass = confirmLabel ? "bg-orange-100 dark:bg-orange-900/30" : "bg-red-100 dark:bg-red-900/30";
  const confirmButtonClass = confirmLabel 
    ? "bg-primary-600 hover:bg-primary-700 shadow-primary-500/30" 
    : "bg-red-600 hover:bg-red-700 shadow-red-500/30";

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{zIndex: 10000}}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full ${iconBgClass} mb-5`}>
           {isLoading ? <Loader2 className={`h-7 w-7 ${iconColorClass} animate-spin`} /> : <Icon className={`h-7 w-7 ${iconColorClass}`} />}
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2 leading-tight">{title}</h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">{message}</p>
        <div className="flex gap-3">
           <button 
             onClick={onCancel} 
             disabled={isLoading}
             className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
           >
             {cancelText}
           </button>
           <button 
             onClick={onConfirm} 
             disabled={isLoading}
             className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${confirmButtonClass} disabled:opacity-70`}
           >
             {isLoading && <Loader2 size={16} className="animate-spin" />}
             {confirmText}
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
