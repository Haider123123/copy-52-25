
import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
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
}

export const ConfirmationModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, lang, confirmLabel, cancelLabel }) => {
  if (!isOpen) return null;
  
  const labels = {
      en: { confirm: 'Delete', cancel: 'Cancel' },
      ar: { confirm: 'حذف', cancel: 'إلغاء' },
      ku: { confirm: 'سڕینەوە', cancel: 'هەڵوەشاندنەوە' }
  };
  const defaultTxt = labels[lang] || labels.en;

  const confirmText = confirmLabel || defaultTxt.confirm;
  const cancelText = cancelLabel || defaultTxt.cancel;

  // Use Alert icon if it's a custom action (like Import), otherwise Trash for delete
  const Icon = confirmLabel ? AlertTriangle : Trash2;
  const iconColorClass = confirmLabel ? "text-orange-600 dark:text-orange-500" : "text-red-600 dark:text-red-500";
  const iconBgClass = confirmLabel ? "bg-orange-100 dark:bg-orange-900/30" : "bg-red-100 dark:bg-red-900/30";
  const confirmButtonClass = confirmLabel 
    ? "bg-primary-600 hover:bg-primary-700 shadow-primary-500/30" 
    : "bg-red-600 hover:bg-red-700 shadow-red-500/30";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{zIndex: 9999}}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all animate-scale-up border border-gray-100 dark:border-gray-700">
        <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full ${iconBgClass} mb-5`}>
           <Icon className={`h-7 w-7 ${iconColorClass}`} />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
           <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
             {cancelText}
           </button>
           <button onClick={onConfirm} className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition transform active:scale-95 ${confirmButtonClass}`}>
             {confirmText}
           </button>
        </div>
      </div>
    </div>
  );
};
