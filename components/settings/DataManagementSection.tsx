import React from 'react';
import { Database, FileUp, Download, AlertOctagon, Trash, Layout, RefreshCw, Smartphone, CheckCircle, Info } from 'lucide-react';

interface DataManagementSectionProps {
  t: any;
  isRTL: boolean;
  setShowBackupModal: (val: boolean) => void;
  setShowRestoreModal: (val: boolean) => void;
  handleResetLocalData: () => void;
  handleUpdateApp?: () => void;
  deferredPrompt: any;
  handleInstallApp: () => void;
}

export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  t, isRTL, setShowBackupModal, setShowRestoreModal, handleResetLocalData, handleUpdateApp, deferredPrompt, handleInstallApp
}) => {
  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl shadow-inner"><Database size={24} /></div>
                <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{isRTL ? "إدارة البيانات" : "Data Management"}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button onClick={() => setShowBackupModal(true)} className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all gap-4 group">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><FileUp size={28} className="text-emerald-600" /></div>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 text-lg uppercase tracking-wider">{t.backup}</span>
                </button>
                <button onClick={() => setShowRestoreModal(true)} className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-red-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all gap-4 group">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Download size={28} className="text-blue-600" /></div>
                    <span className="font-black text-blue-700 dark:text-blue-300 text-lg uppercase tracking-wider">{t.import}</span>
                </button>
            </div>
        </div>

        {/* Update App Files Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shadow-inner"><RefreshCw size={24} /></div>
                <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.updateAppFiles}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-bold">
                {t.updateAppDesc}
            </p>
            <button 
                onClick={handleUpdateApp} 
                className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95"
            >
                <RefreshCw size={20} />
                <span>{t.reloadNow}</span>
            </button>
        </div>

        {/* Permanent Install Section - Added here as requested */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Smartphone size={24} /></div>
                <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{isRTL ? "تثبيت التطبيق على الجهاز" : "Install App on Device"}</h3>
            </div>
            
            <div className="space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
                    {isRTL 
                        ? "قم بتثبيت Dentro كبرنامج مستقل ليعمل بسرعة أكبر وبدقة عالية، ولتتمكن من فتح ملفات المرضى حتى عند انقطاع الإنترنت." 
                        : "Install Dentro as a standalone app for faster performance and to access patient records even without internet."}
                </p>

                {deferredPrompt ? (
                    <button 
                        onClick={handleInstallApp} 
                        className="w-full flex items-center justify-center gap-3 py-5 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-primary-700 shadow-xl shadow-primary-500/30 active:scale-95 animate-pulse"
                    >
                        <Download size={20} />
                        <span>{isRTL ? "تثبيت الآن (متوفر)" : "Install Now (Available)"}</span>
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-3">
                            <CheckCircle className="text-green-500" size={32} />
                            <div className="text-sm font-black text-gray-700 dark:text-gray-200">
                                {isRTL ? "التطبيق جاهز للعمل أوفلاين" : "App is ready for offline use"}
                            </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-bold leading-relaxed">
                                {isRTL 
                                    ? "إذا لم يظهر زر التثبيت، فقد يكون التطبيق مثبتاً بالفعل أو أنك لا تستخدم متصفح Chrome/Safari. يمكنك دائماً الضغط على 'إضافة إلى الشاشة الرئيسية' من إعدادات المتصفح." 
                                    : "If the install button is missing, the app might be already installed or you are not using Chrome/Safari. You can always use 'Add to Home Screen' from browser settings."}
                            </p>
                        </div>

                        {/* Force Show Button anyway but with different label if prompt is gone */}
                        <button 
                            onClick={handleInstallApp} 
                            className="w-full flex items-center justify-center gap-3 py-5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-2xl font-black text-sm uppercase transition-all"
                        >
                            <Download size={20} />
                            <span>{isRTL ? "إعادة محاولة التثبيت" : "Retry Installation"}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[3rem] border-2 border-red-100 dark:border-red-900/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/30"><AlertOctagon size={24} /></div>
                <h3 className="font-black text-red-600 dark:text-red-400 text-xl uppercase tracking-tighter">{t.dangerZone}</h3>
            </div>
            <p className="text-sm md:text-base text-red-800/80 dark:text-red-300/60 leading-relaxed font-bold">{t.resetLocalDataDesc}</p>
            <button onClick={handleResetLocalData} className="w-full flex items-center justify-center gap-3 py-5 bg-white dark:bg-red-900/20 text-red-600 border-2 border-red-200 dark:border-red-800 rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-red-600 hover:text-white shadow-sm active:scale-95"><Trash size={20} /><span>{t.resetLocalData}</span></button>
        </div>
    </div>
  );
};