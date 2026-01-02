
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileUp, Database, UserCircle, Download, PlusCircle, RefreshCw, AlertTriangle, ShieldCheck, Lock, Key, AlertOctagon, UserX, FolderX, LogOut, UserCheck } from 'lucide-react';
import { storageService } from '../../services/storage';

export const BackupModal = ({ show, onClose, t, data, isRTL, fontClass }: any) => {
    if (!show) return null;
    const handleDoctorBackup = (docId: string) => {
        const filteredData = {
            ...data,
            doctors: data.doctors.filter((d: any) => d.id === docId),
            patients: data.patients.filter((p: any) => p.doctorId === docId),
            secretaries: [],
            labOrders: data.labOrders?.filter((o: any) => data.patients.find((p: any) => p.id === o.patientId && p.doctorId === docId))
        };
        storageService.exportBackup(filteredData, `doctor_${docId}`);
        onClose();
    };
    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileUp className="text-emerald-500" />
                        {t.backupOptions}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <button onClick={() => { storageService.exportBackup(data); onClose(); }} className="w-full flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl hover:bg-emerald-100 transition group">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                            <Database size={24} />
                        </div>
                        <div className="text-start">
                            <div className="font-bold text-emerald-900 dark:text-emerald-100">{t.fullBackup}</div>
                            <div className="text-xs text-emerald-600/60 dark:text-emerald-400/60">{isRTL ? "تصدير كافة بيانات العيادة في ملف واحد" : "Export all clinic data in one file"}</div>
                        </div>
                    </button>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.doctorBackup}</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {data.doctors.map((doc: any) => (
                                <button key={doc.id} onClick={() => handleDoctorBackup(doc.id)} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-2xl border border-transparent hover:border-gray-200 transition shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                            <UserCircle size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">{doc.name}</span>
                                    </div>
                                    <FileUp size={16} className="text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const RestoreModal = ({ show, onClose, t, onImport, isRTL, fontClass }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'merge' | 'replace' | null>(null);
    if (!show) return null;
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (mode) {
            onImport(e, mode);
            onClose();
            setMode(null);
        }
    };
    const triggerImport = (selectedMode: 'merge' | 'replace') => {
        setMode(selectedMode);
        setTimeout(() => fileInputRef.current?.click(), 100);
    };
    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Download className="text-blue-500" />
                        {t.restoreOptions}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileSelect} />
                <div className="space-y-4">
                    <button onClick={() => triggerImport('merge')} className="w-full flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 rounded-3xl hover:bg-blue-100 transition group text-start">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-blue-900 dark:text-blue-100">{t.restoreMerge}</div>
                            <div className="text-xs text-blue-600/60 dark:text-blue-400/60">{t.mergeDesc}</div>
                        </div>
                    </button>
                    <button onClick={() => triggerImport('replace')} className="w-full flex items-center gap-4 p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800 rounded-3xl hover:bg-red-100 transition group text-start">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm text-red-600 group-hover:scale-110 transition-transform">
                            <RefreshCw size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-red-900 dark:text-red-100">{t.restoreReplace}</div>
                                <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                            </div>
                            <div className="text-xs text-red-600/60 dark:text-red-400/60">{t.replaceDesc}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const VerificationModal = ({ show, onClose, t, onVerify, error, isRTL, fontClass, data }: any) => {
    const [pass, setPass] = useState('');
    useEffect(() => { if (show) setPass(''); }, [show]);
    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{t.adminAccessOnly}</h3>
                    <p className="text-sm text-gray-500 mt-1">{isRTL ? "يرجى تأكيد الهوية للمتابعة" : "Verify identity to continue"}</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onVerify(pass); }} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                        <input type="password" autoFocus placeholder={t.adminPassword} value={pass} autoComplete="new-password" onChange={e => setPass(e.target.value)} className="w-full ps-10 pe-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold transition hover:bg-gray-200">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition transform active:scale-95">{t.login}</button>
                    </div>
                </form>
            </div>
        </div>, document.body
    );
};

export const ChangeAdminPasswordModal = ({ show, onClose, t, isRTL, fontClass, onSave }: any) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');
    if (!show) return null;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 4) { setError(isRTL ? "يجب أن تكون كلمة المرور 4 رموز على الأقل" : "Password must be at least 4 characters"); return; }
        if (newPass !== confirmPass) { setError(t.passwordsMismatch); return; }
        onSave(newPass); onClose();
    };
    return createPortal(
        <div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Key size={32} /></div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{t.changeAdminPass}</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.newPassword}</label>
                        <input type="password" required autoFocus value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.confirmNewPassword}</label>
                        <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold transition">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>, document.body
    );
};

export const DoctorDeleteChoiceModal = ({ show, onClose, t, onChoice, doctorName, isRTL, fontClass }: any) => {
    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-[3rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner"><AlertOctagon size={40} /></div>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-2">{isRTL ? `حذف الطبيب: ${doctorName}` : `Delete Doctor: ${doctorName}`}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{isRTL ? "يرجى اختيار نوع الحذف المفضل لديك" : "Please choose your preferred deletion method"}</p>
                </div>
                <div className="space-y-4">
                    <button onClick={() => onChoice(false)} className="w-full flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 border-2 border-transparent hover:border-blue-500 transition-all rounded-[2rem] group text-start shadow-sm">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform"><UserX size={28} /></div>
                        <div className="flex-1">
                            <div className="font-black text-gray-800 dark:text-white text-lg">{isRTL ? "حذف البروفايل فقط" : "Delete Profile Only"}</div>
                            <div className="text-xs text-gray-400 font-bold">{isRTL ? "سيتم حذف حساب الطبيب مع الإبقاء على بيانات المرضى" : "Remove account but keep patient data"}</div>
                        </div>
                    </button>
                    <button onClick={() => onChoice(true)} className="w-full flex items-center gap-4 p-5 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-transparent hover:border-red-500 transition-all rounded-[2rem] group text-start shadow-sm">
                        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform"><FolderX size={28} /></div>
                        <div className="flex-1">
                            <div className="font-black text-red-700 dark:text-red-400 text-lg">{isRTL ? "حذف كامل (شامل للمرضى)" : "Full Delete (Including Patients)"}</div>
                            <div className="text-xs text-red-600/60 font-bold">{isRTL ? "سيتم حذف الطبيب وكل المرضى التابعين له نهائياً" : "Wipe doctor and all associated patient records"}</div>
                        </div>
                    </button>
                </div>
                <button onClick={onClose} className="w-full mt-6 py-4 text-gray-400 hover:text-gray-600 font-black text-sm uppercase tracking-widest">{t.cancel}</button>
            </div>
        </div>, document.body
    );
};

export const DoctorUpdateChoiceModal = ({ show, onClose, doctorName, isRTL, fontClass, onChoice }: any) => {
    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-scale-up border border-gray-100 dark:border-gray-700 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <UserCheck size={32} />
                    </div>
                    <h3 className="font-black text-xl text-gray-900 dark:text-white mb-2">
                        {isRTL ? `تم تحديث بيانات ${doctorName}` : `Profile Updated: ${doctorName}`}
                    </h3>
                    <p className="text-sm text-gray-500 font-bold">
                        {isRTL ? "كيف ترغب في التعامل مع الجلسة الحالية؟" : "How would you like to handle the active session?"}
                    </p>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => onChoice(false)}
                        className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent hover:border-blue-500 transition-all rounded-2xl group text-start"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-blue-600"><UserCircle size={20} /></div>
                        <div className="flex-1">
                            <div className="font-black text-gray-800 dark:text-white text-sm">{isRTL ? "إبقاء تسجيل الدخول" : "Keep Session Active"}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? "لن يتم الخروج من الحساب" : "No logout required"}</div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => onChoice(true)}
                        className="w-full flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-2 border-transparent hover:border-orange-500 transition-all rounded-2xl group text-start"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-orange-600"><LogOut size={20} /></div>
                        <div className="flex-1">
                            <div className="font-black text-orange-900 dark:text-orange-100 text-sm">{isRTL ? "تسجيل الخروج والعودة للقائمة" : "Logout & Redirect"}</div>
                            <div className="text-[10px] text-orange-600/70 font-bold uppercase">{isRTL ? "يتطلب تسجيل الدخول بالبيانات الجديدة" : "Requires new login"}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
