
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Edit2, Phone, Trash2, Plus, Moon, Sun, X, Upload, Cloud, Download, Instagram, AlertTriangle, Palette, CheckCircle2, User, Lock, ShieldCheck, Contact, Database, PlusCircle, UserMinus, Users, Eye, EyeOff, Save, Stethoscope, Maximize, Minus, Layout, Link, RefreshCw, Key, FileUp, Files, UserCircle, UserCheck, CheckCircle, Globe, AlertOctagon, Trash } from 'lucide-react';
import { CURRENCY_LIST, THEMES } from '../constants';
import { storageService } from '../services/storage';
import { googleDriveService } from '../services/googleDrive';
import { ClinicData, Language, Doctor, Secretary } from '../types';

interface SettingsViewProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  handleAddDoctor: (name: string, username?: string, password?: string) => void;
  handleUpdateDoctor: (id: string, updates: Partial<Doctor>) => void;
  handleDeleteDoctor: (id: string, deletePatients?: boolean) => void;
  handleAddSecretary: (name: string, username: string, password?: string) => void;
  handleDeleteSecretary: (id: string) => void;
  handleRxFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportData: (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => void;
  syncStatus: string;
  deferredPrompt: any;
  handleInstallApp: () => void;
  openConfirm: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  currentLang: Language;
  setDeviceLang: (lang: Language) => void;
  currentTheme: 'light' | 'dark';
  setLocalTheme: (theme: 'light' | 'dark') => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeDoctorId?: string | null;
  activeSecretaryId?: string | null;
  deviceScale: number;
  setDeviceScale: (scale: number) => void;
  onLinkDrive: () => void;
}

const BackupModal = ({ show, onClose, t, data, isRTL, fontClass }: any) => {
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

const RestoreModal = ({ show, onClose, t, onImport, isRTL, fontClass }: any) => {
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

const VerificationModal = ({ show, onClose, t, onVerify, error, isRTL, fontClass }: any) => {
    const [pass, setPass] = useState('');
    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-scale-up ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck size={28} />
                    </div>
                    <h3 className="font-bold text-lg dark:text-white">{t.adminAccessOnly}</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onVerify(pass); }} className="space-y-4">
                    <input 
                        type="password" autoFocus placeholder={t.adminPassword} value={pass}
                        onChange={e => setPass(e.target.value)}
                        className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-xl font-bold">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition">{t.login}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  t, data, setData, handleAddDoctor, handleUpdateDoctor, handleDeleteDoctor, handleAddSecretary, handleDeleteSecretary, handleRxFileUpload, handleImportData, syncStatus, deferredPrompt, handleInstallApp, openConfirm, currentLang, setDeviceLang, currentTheme, setLocalTheme, activeThemeId, setActiveThemeId, activeDoctorId, activeSecretaryId, deviceScale, setDeviceScale, onLinkDrive
}) => {
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [showAddSecretaryModal, setShowAddSecretaryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isVerifyingDrive, setIsVerifyingDrive] = useState(false);
  const [isDriveVerifiedOnDevice, setIsDriveVerifiedOnDevice] = useState(googleDriveService.hasActiveToken());
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', target: 'doctor' | 'secretary', data: any } | null>(null);

  const isAdmin = !activeDoctorId && !activeSecretaryId;
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';

  const [formDoc, setFormDoc] = useState({ id: '', name: '', user: '', pass: '' });
  const [formSec, setFormSec] = useState({ name: '', user: '', pass: '' });

  // الاستماع لتغيير حالة الدرايف
  useEffect(() => {
    const check = () => setIsDriveVerifiedOnDevice(googleDriveService.hasActiveToken());
    window.addEventListener('dentro_drive_auth_change', check);
    return () => window.removeEventListener('dentro_drive_auth_change', check);
  }, []);

  const handleVerifySuccess = (passwordInput: string) => {
      const adminPass = data.settings.adminPassword || '123456';
      if (passwordInput === adminPass) {
          const action = pendingAction;
          setShowVerificationModal(false);
          setVerifyError('');
          if (!action) return;
          if (action.target === 'doctor') {
              if (action.type === 'edit') {
                  setFormDoc({ id: action.data.id, name: action.data.name, user: action.data.username || '', pass: action.data.password || '' });
                  setShowEditDoctorModal(true);
              } else if (action.type === 'delete') {
                  openConfirm(t.deleteDoctor, isRTL ? `هل أنت متأكد من حذف ${action.data.name}؟` : `Delete ${action.data.name}?`, () => handleDeleteDoctor(action.data.id));
              }
          } else if (action.target === 'secretary') {
              if (action.type === 'delete') {
                  openConfirm(t.deleteSecretary, isRTL ? `هل أنت متأكد من حذف حساب ${action.data.name}؟` : `Delete ${action.data.name}?`, () => handleDeleteSecretary(action.data.id));
              }
          }
      } else {
          setVerifyError(t.wrongPin);
      }
  };

  const tryOpenAddSecretary = () => {
      if ((data.secretaries || []).length >= 4) {
          alert(t.maxSecretaries);
          return;
      }
      setShowAddSecretaryModal(true);
  };

  const handleDeviceDriveVerify = async () => {
      setIsVerifyingDrive(true);
      try {
          // محاولة تسجيل الدخول
          const token = await googleDriveService.login('consent');
          if (token) {
              setIsDriveVerifiedOnDevice(true);
              // إشعار نجاح فوري
              alert(isRTL ? "تم تفعيل الاتصال بنجاح على هذا الجهاز" : "Connection verified on this device!");
          }
      } catch (e: any) {
          // في حال ألغى المستخدم النافذة، لا داعي لإظهار رسالة خطأ مزعجة
          if (e === 'popup_closed_by_user') return;
          
          // تحقق أخير قبل إظهار الخطأ، ربما تم حفظ التوكن بنجاح رغم الاستثناء
          if (googleDriveService.hasActiveToken()) {
              setIsDriveVerifiedOnDevice(true);
              return;
          }
          console.error("Verification error", e);
      } finally { setIsVerifyingDrive(false); }
  };

  const handleResetLocalData = () => {
      openConfirm(
          t.resetConfirmTitle, 
          t.resetConfirmMsg, 
          () => {
              localStorage.clear();
              window.location.reload();
          },
          t.resetLocalData,
          t.cancel
      );
  };

  const adjustScale = (delta: number) => setDeviceScale(Math.max(80, Math.min(150, deviceScale + delta)));

  return (
    <div className="animate-fade-in pb-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t.settings}</h1>
        
        <BackupModal show={showBackupModal} onClose={() => setShowBackupModal(false)} t={t} data={data} isRTL={isRTL} fontClass={fontClass} />
        <RestoreModal show={showRestoreModal} onClose={() => setShowRestoreModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onImport={handleImportData} />
        <VerificationModal show={showVerificationModal} onClose={() => setShowVerificationModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} error={verifyError} onVerify={handleVerifySuccess} />

        <div className="space-y-6 max-w-2xl">
          {isAdmin && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl"><Stethoscope size={20} /></div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t.clinicIdentity}</h3>
                  </div>
                  <div className="space-y-4">
                      <div className={`p-4 rounded-3xl border-2 transition-all duration-300 ${isEditingClinic ? 'border-primary-500 bg-primary-50/30' : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30'}`}>
                          <div className="flex justify-between items-center mb-1 px-1">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.clinicName}</label>
                              {!isEditingClinic && <button onClick={() => setIsEditingClinic(true)} className="p-1.5 text-blue-500 hover:bg-white dark:hover:bg-gray-600 rounded-full transition shadow-sm"><Edit2 size={14} /></button>}
                          </div>
                          {isEditingClinic ? (
                              <div className="flex gap-2 mt-1">
                                  <input type="text" autoFocus value={data.clinicName} onChange={(e) => setData(prev => ({ ...prev, clinicName: e.target.value }))} className="flex-1 p-3 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-800 rounded-2xl dark:text-white outline-none font-bold" />
                                  <button onClick={() => setIsEditingClinic(false)} className="bg-green-600 text-white px-4 rounded-2xl shadow-lg font-bold transition hover:bg-green-700"><Check size={20} /></button>
                              </div>
                          ) : <div className="text-xl font-extrabold text-gray-800 dark:text-white px-1 py-1">{data.clinicName}</div>}
                      </div>
                      <div className={`p-4 rounded-3xl border-2 transition-all duration-300 ${isEditingPhone ? 'border-primary-500 bg-primary-50/30' : 'border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30'}`}>
                          <div className="flex justify-between items-center mb-1 px-1">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.clinicPhone}</label>
                              {!isEditingPhone && <button onClick={() => setIsEditingPhone(true)} className="p-1.5 text-blue-500 hover:bg-white dark:hover:bg-gray-600 rounded-full transition shadow-sm"><Edit2 size={14} /></button>}
                          </div>
                          {isEditingPhone ? (
                              <div className="flex gap-2 mt-1">
                                  <div className="flex-1 flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center"><Phone size={14} /></div>
                                      <input type="text" autoFocus value={data.settings.clinicPhone || ''} onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, clinicPhone: e.target.value } }))} placeholder="+123 456 789" className="flex-1 bg-transparent dark:text-white outline-none font-bold text-lg" />
                                  </div>
                                  <button onClick={() => setIsEditingPhone(false)} className="bg-green-600 text-white px-4 rounded-2xl shadow-lg font-bold transition hover:bg-green-700"><Check size={20} /></button>
                              </div>
                          ) : (
                              <div className="flex items-center gap-3 px-1 py-1">
                                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center"><Phone size={14} /></div>
                                  <div className="text-xl font-extrabold text-gray-800 dark:text-white" dir="ltr">{data.settings.clinicPhone || '---'}</div>
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                          <ShieldCheck size={20} className="text-red-500" />
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t.security}</h3>
                      </div>
                      <button onClick={() => { setPendingAction(null); setVerifyError(''); setShowVerificationModal(true); }} className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 transition rounded-3xl group border border-red-100 dark:border-red-900/20">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-red-600 group-hover:scale-110 transition-transform"><Lock size={18} /></div>
                              <div className="text-start">
                                  <div className="font-bold text-gray-800 dark:text-white">{t.changeAdminPass}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{isRTL ? 'حماية الحساب الأساسي للعيادة' : 'Protect main clinic account'}</div>
                              </div>
                          </div>
                          <Edit2 size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                  </div>
              </div>
          )}

          {isAdmin && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
                  {/* Doctors */}
                  <div>
                      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                          <div className="flex items-center gap-2">
                              <Stethoscope size={20} className="text-blue-600" />
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t.manageProfiles}</h3>
                          </div>
                          <button onClick={() => { setFormDoc({ id: '', name: '', user: '', pass: '' }); setShowAddDoctorModal(true); }} className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-bold shadow-lg hover:bg-primary-700 transition"><Plus size={18} /> {t.addDoctor}</button>
                      </div>
                      {(showAddDoctorModal || showEditDoctorModal) && (
                          <form onSubmit={(e) => {
                              e.preventDefault();
                              if (showEditDoctorModal) handleUpdateDoctor(formDoc.id, { name: formDoc.name, username: formDoc.user, password: formDoc.pass });
                              else handleAddDoctor(formDoc.name, formDoc.user, formDoc.pass);
                              setShowAddDoctorModal(false); setShowEditDoctorModal(false);
                          }} className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-3xl mb-6 border border-gray-200 dark:border-gray-600 animate-fade-in space-y-4">
                              <div className="flex justify-between items-center">
                                  <h4 className="font-bold text-sm text-primary-600 uppercase tracking-widest">{showEditDoctorModal ? t.editItem : t.addDoctor}</h4>
                                  <button type="button" onClick={() => { setShowAddDoctorModal(false); setShowEditDoctorModal(false); }} className="text-gray-400"><X size={20}/></button>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.drNamePlaceholder}</label>
                                  <input value={formDoc.name} onChange={e => setFormDoc({...formDoc, name: e.target.value})} className="w-full p-3 rounded-2xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" required />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.username}</label>
                                      <input value={formDoc.user} onChange={e => setFormDoc({...formDoc, user: e.target.value})} className="w-full p-3 rounded-2xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" required />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.password}</label>
                                      <input value={formDoc.pass} onChange={e => setFormDoc({...formDoc, pass: e.target.value})} type="text" className="w-full p-3 rounded-2xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" required />
                                  </div>
                              </div>
                              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:bg-green-700">{t.save}</button>
                          </form>
                      )}
                      <div className="space-y-3">
                          {data.doctors.map(doc => (
                              <div key={doc.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 p-4 rounded-3xl border border-gray-50 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition shadow-sm">
                                  <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center"><User size={24} /></div>
                                      <div>
                                          <div className="font-extrabold text-gray-800 dark:text-white">{doc.name}</div>
                                          <div className="text-xs text-gray-500 font-bold">@{doc.username || '---'}</div>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => { setPendingAction({ type: 'edit', target: 'doctor', data: doc }); setVerifyError(''); setShowVerificationModal(true); }} className="text-blue-500 bg-white dark:bg-gray-600 p-2.5 rounded-xl border dark:border-gray-600 shadow-sm"><Edit2 size={16} /></button>
                                      <button onClick={() => { setPendingAction({ type: 'delete', target: 'doctor', data: doc }); setVerifyError(''); setShowVerificationModal(true); }} className="text-red-500 bg-white dark:bg-gray-600 p-2.5 rounded-xl border dark:border-gray-600 shadow-sm"><Trash2 size={16} /></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Secretary */}
                  <div>
                      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                          <div className="flex items-center gap-2">
                              <Contact size={20} className="text-purple-600" />
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t.manageSecretaries}</h3>
                          </div>
                          <button onClick={tryOpenAddSecretary} className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-bold shadow-lg hover:bg-purple-700 transition"><Plus size={18} /> {t.addSecretary}</button>
                      </div>
                      {showAddSecretaryModal && (
                          <form onSubmit={(e) => {
                              e.preventDefault();
                              handleAddSecretary(formSec.name, formSec.user, formSec.pass);
                              setFormSec({ name: '', user: '', pass: '' }); setShowAddSecretaryModal(false);
                          }} className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-3xl mb-6 border border-gray-200 dark:border-gray-600 animate-fade-in space-y-4 shadow-inner">
                              <div className="flex justify-between items-center">
                                  <h4 className="font-bold text-sm text-purple-600 uppercase tracking-widest">{t.addSecretary}</h4>
                                  <button type="button" onClick={() => setShowAddSecretaryModal(false)} className="text-gray-400"><X size={20}/></button>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.secretaryName}</label>
                                  <input value={formSec.name} onChange={e => setFormSec({...formSec, name: e.target.value})} className="w-full p-3 rounded-2xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.username}</label>
                                      <input value={formSec.user} onChange={e => setFormSec({...formSec, user: e.target.value})} className="w-full p-3 rounded-2xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.password}</label>
                                      <input value={formSec.pass} onChange={e => setFormSec({...formSec, pass: e.target.value})} type="text" className="w-full p-3 rounded-2xl border dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                  </div>
                              </div>
                              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:bg-purple-700">{t.save}</button>
                          </form>
                      )}
                      <div className="space-y-3">
                          {(data.secretaries || []).map(sec => (
                              <div key={sec.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 p-4 rounded-3xl border border-gray-50 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition shadow-sm">
                                  <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center"><UserCheck size={24} /></div>
                                      <div>
                                          <div className="font-extrabold text-gray-800 dark:text-white">{sec.name}</div>
                                          <div className="text-xs text-gray-500 font-bold">@{sec.username}</div>
                                      </div>
                                  </div>
                                  <button onClick={() => { setPendingAction({ type: 'delete', target: 'secretary', data: sec }); setVerifyError(''); setShowVerificationModal(true); }} className="text-red-500 bg-white dark:bg-gray-600 p-2.5 rounded-xl border dark:border-gray-600 shadow-sm"><Trash2 size={16} /></button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg border-b border-gray-100 dark:border-gray-700 pb-2">{t.preferences}</h3>
             
             {/* Google Drive Section */}
             <div className="p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl"><Cloud size={20} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{t.googleDriveStatus}</h4>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{data.settings.googleDriveLinked ? t.linked : t.notLinked}</p>
                    </div>
                </div>
                {!data.settings.googleDriveLinked ? (
                    isAdmin && <button onClick={onLinkDrive} className="w-full py-3 bg-white dark:bg-gray-600 border-2 border-primary-200 text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition flex items-center justify-center gap-2 shadow-sm"><Link size={18} />{t.googleDriveConnect}</button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl border border-green-100 dark:border-green-800"><CheckCircle2 size={18} /><span className="text-xs font-bold">{isRTL ? "تم تفعيل التخزين السحابي للعيادة" : "Cloud Storage Active"}</span></div>
                        {!isDriveVerifiedOnDevice ? (
                            <button onClick={handleDeviceDriveVerify} disabled={isVerifyingDrive} className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50">{isVerifyingDrive ? <RefreshCw size={18} className="animate-spin" /> : <Key size={18} />}<span>{isRTL ? "تفعيل الاتصال على هذا الجهاز" : "Activate on this device"}</span></button>
                        ) : <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-700/50 py-2 rounded-xl"><Check size={12} /> {isRTL ? "هذا الجهاز مفعل وجاهز للرفع" : "Device verified"}</div>}
                    </div>
                )}
             </div>

             {/* Interface Scale */}
             <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Layout size={18} className="text-primary-500" />
                    <span className="font-bold text-gray-800 dark:text-white text-sm">{t.appScale}</span>
                    <span className="ms-auto font-mono text-primary-600 font-bold">{deviceScale}%</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => adjustScale(-5)} className="p-3 bg-white dark:bg-gray-600 rounded-2xl shadow-sm hover:bg-red-50 text-gray-600 dark:text-white transition"><Minus size={20} /></button>
                    <input type="range" min="80" max="150" step="5" value={deviceScale} onChange={(e) => setDeviceScale(parseInt(e.target.value))} className="flex-1 accent-primary-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    <button onClick={() => adjustScale(5)} className="p-3 bg-white dark:bg-gray-600 rounded-2xl shadow-sm hover:bg-green-50 text-gray-600 dark:text-white transition"><Plus size={20} /></button>
                </div>
             </div>

             {/* Dark Mode & Language - Moved above Themes */}
             <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Moon size={18} className="text-indigo-500" />
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{t.darkMode}</span>
                    </div>
                    <button onClick={() => setLocalTheme(currentTheme === 'light' ? 'dark' : 'light')} className={`w-14 h-8 rounded-full p-1 transition duration-300 flex items-center ${currentTheme === 'dark' ? 'bg-primary-600 justify-end' : 'bg-gray-200 justify-start'}`}><div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700">{currentTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}</div></button>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-600 pt-3">
                    <div className="flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" />
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{t.language}</span>
                    </div>
                    <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-100 dark:border-gray-600">{(['en', 'ar', 'ku'] as const).map(lang => (<button key={lang} onClick={() => setDeviceLang(lang)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${currentLang === lang ? 'bg-primary-600 shadow text-white' : 'text-gray-500'}`}>{lang.toUpperCase()}</button>))}</div>
                </div>
             </div>

             {/* Themes Section */}
             <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Palette size={18} className="text-primary-500" />
                    <span className="font-bold text-gray-800 dark:text-white text-sm">{t.appTheme}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {THEMES.map(theme => (
                        <button 
                            key={theme.id}
                            onClick={() => setActiveThemeId(theme.id)}
                            className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${activeThemeId === theme.id ? 'border-primary-500 bg-white dark:bg-gray-600 shadow-md scale-105' : 'border-transparent bg-gray-100/50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex gap-1">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter">
                                {isRTL ? (currentLang === 'ku' ? theme.nameKu : theme.nameAr) : theme.nameEn}
                            </span>
                            {activeThemeId === theme.id && <div className="absolute -top-2 -right-2 bg-primary-500 text-white p-1 rounded-full shadow-lg"><CheckCircle size={12} /></div>}
                        </button>
                    ))}
                </div>
             </div>
          </div>

          {/* Data Management Section */}
          {isAdmin && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Database size={20} /></div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{isRTL ? "إدارة البيانات" : "Data Management"}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => setShowBackupModal(true)} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition gap-2 group">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><FileUp size={24} className="text-emerald-600" /></div>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">{t.backup}</span>
                      </button>
                      <button onClick={() => setShowRestoreModal(true)} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition gap-2 group">
                          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Download size={24} className="text-blue-600" /></div>
                          <span className="font-bold text-blue-700 dark:text-blue-300">{t.import}</span>
                      </button>
                  </div>
              </div>
          )}

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/20 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/30">
                      <AlertOctagon size={22} />
                  </div>
                  <h3 className="font-bold text-red-600 dark:text-red-400 text-lg uppercase tracking-tight">{t.dangerZone}</h3>
              </div>
              
              <p className="text-xs md:text-sm text-red-800/70 dark:text-red-400/60 leading-relaxed font-medium">
                  {t.resetLocalDataDesc}
              </p>

              <button 
                  onClick={handleResetLocalData}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-red-950/40 text-red-600 border-2 border-red-200 dark:border-red-900/40 rounded-2xl font-black text-sm uppercase transition-all duration-300 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm"
              >
                  <Trash size={18} />
                  <span>{t.resetLocalData}</span>
              </button>
          </div>

          {/* App Installation */}
          {deferredPrompt && (
              <div className="pt-4 px-2">
                  <button onClick={handleInstallApp} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-3">
                      <Layout size={20} />
                      {t.installApp}
                  </button>
              </div>
          )}
        </div>
    </div>
  );
};
