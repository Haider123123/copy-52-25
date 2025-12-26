
import React, { useState, useEffect } from 'react';
import { googleDriveService } from '../services/googleDrive';
import { ClinicData, Language, Doctor, Secretary } from '../types';
import { Building2, Stethoscope, Cloud, Layout, Database, ChevronLeft, ChevronRight, BrainCircuit, ShieldCheck, Settings as SettingsIcon, Sparkles } from 'lucide-react';

// Sub-components imports
import { BackupModal, RestoreModal, VerificationModal, ChangeAdminPasswordModal, DoctorDeleteChoiceModal } from './settings/SettingsModals';
import { IdentitySection } from './settings/IdentitySection';
import { ProfilesSection } from './settings/ProfilesSection';
import { SyncSection } from './settings/SyncSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { DataManagementSection } from './settings/DataManagementSection';

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

export const SettingsView: React.FC<SettingsViewProps> = (props) => {
  const { t, data, setData, handleAddDoctor, handleUpdateDoctor, handleDeleteDoctor, handleAddSecretary, handleDeleteSecretary, handleImportData, deferredPrompt, handleInstallApp, openConfirm, currentLang, setDeviceLang, currentTheme, setLocalTheme, activeThemeId, setActiveThemeId, activeDoctorId, activeSecretaryId, deviceScale, setDeviceScale, onLinkDrive } = props;
  
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempClinicName, setTempClinicName] = useState(data.clinicName);
  const [tempClinicPhone, setTempClinicPhone] = useState(data.settings.clinicPhone || '');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [showAddSecretaryModal, setShowAddSecretaryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isDriveVerifiedOnDevice, setIsDriveVerifiedOnDevice] = useState(googleDriveService.hasActiveToken());
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showChangeAdminPassModal, setShowChangeAdminPassModal] = useState(false);
  const [showDoctorDeleteChoice, setShowDoctorDeleteChoice] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', target: 'doctor' | 'secretary', data: any } | null>(null);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkSyncProgress, setBulkSyncProgress] = useState('');

  const isAdmin = !activeDoctorId && !activeSecretaryId;
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  const fontClass = isRTL ? 'font-cairo' : 'font-sans';
  const [formDoc, setFormDoc] = useState({ id: '', name: '', user: '', pass: '' });
  const [formSec, setFormSec] = useState({ name: '', user: '', pass: '' });

  useEffect(() => {
    const check = () => setIsDriveVerifiedOnDevice(googleDriveService.hasActiveToken());
    window.addEventListener('dentro_drive_auth_change', check);
    return () => window.removeEventListener('dentro_drive_auth_change', check);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // scrollIntoView will move the viewport to the element
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'clinic-identity', label: t.clinicIdentity, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', adminOnly: true },
    { id: 'profiles-mgmt', label: t.manageProfiles, icon: Stethoscope, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30', adminOnly: true },
    { id: 'sync-mgmt', label: t.cloudSync, icon: Cloud, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30', adminOnly: false },
    { id: 'preferences-mgmt', label: t.preferences, icon: Layout, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', adminOnly: false },
    { id: 'ai-section-anchor', label: t.aiAssistant, icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', adminOnly: false },
    { id: 'data-mgmt', label: isRTL ? "إدارة البيانات" : "Data Management", icon: Database, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  const handleVerifySuccess = (passwordInput: string) => {
      const adminPass = data.settings.adminPassword || '123456';
      if (passwordInput === adminPass) {
          const action = pendingAction;
          setShowVerificationModal(false); setVerifyError('');
          if (!action) { setShowChangeAdminPassModal(true); return; }
          if (action.target === 'doctor') {
              if (action.type === 'edit') { setFormDoc({ id: action.data.id, name: action.data.name, user: action.data.username || '', pass: action.data.password || '' }); setShowEditDoctorModal(true); }
              else if (action.type === 'delete') { setShowDoctorDeleteChoice(true); }
          } else if (action.target === 'secretary') {
              if (action.type === 'delete') { openConfirm(t.deleteSecretary, isRTL ? `هل أنت متأكد من حذف حساب ${action.data.name}؟` : `Delete ${action.data.name}?`, () => handleDeleteSecretary(action.data.id)); }
          }
          setPendingAction(null);
      } else { setVerifyError(t.wrongPin); }
  };

  const saveAdminPassword = (newPass: string) => {
      setData(prev => ({ ...prev, lastUpdated: Date.now(), settings: { ...prev.settings, adminPassword: newPass } }));
      alert(isRTL ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully");
  };

  const handleDoctorDeleteFinal = (deletePatients: boolean) => {
      if (pendingAction?.data) { handleDeleteDoctor(pendingAction.data.id, deletePatients); setShowDoctorDeleteChoice(false); setPendingAction(null); }
  };

  const handleBulkSyncToDrive = async () => {
      if (!isDriveVerifiedOnDevice) { const token = await googleDriveService.login('consent'); if (!token) return; setIsDriveVerifiedOnDevice(true); }
      setIsBulkSyncing(true); setBulkSyncProgress(t.syncingNow);
      try {
          const rootId = await googleDriveService.ensureRootFolder();
          let updatedPatients = [...data.patients]; let changed = false;
          for (let i = 0; i < updatedPatients.length; i++) {
              const patient = updatedPatients[i]; let patientChanged = false; let patientFolderId = '';
              if (patient.profilePicture && !patient.profilePictureDriveId && patient.profilePicture.startsWith('data:')) {
                  patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
                  const blob = await (await fetch(patient.profilePicture)).blob();
                  const file = new File([blob], `ProfilePic_${patient.name}_${Date.now()}.png`, { type: blob.type });
                  const result = await googleDriveService.uploadFile(patientFolderId, file);
                  patient.profilePictureDriveId = result.id; patient.profilePicture = result.url; patientChanged = true;
              }
              if (patient.images && patient.images.some(img => !img.driveFileId)) {
                  if (!patientFolderId) patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
                  const updatedImages = [...patient.images];
                  for (let j = 0; j < updatedImages.length; j++) {
                      const img = updatedImages[j];
                      if (!img.driveFileId && img.url.startsWith('data:')) {
                          const blob = await (await fetch(img.url)).blob();
                          const file = new File([blob], img.name, { type: blob.type });
                          const result = await googleDriveService.uploadFile(patientFolderId, file);
                          updatedImages[j] = { ...img, driveFileId: result.id, url: result.url }; patientChanged = true;
                      }
                  }
                  patient.images = updatedImages;
              }
              if (patient.rctDrawing && !patient.rctDrawingDriveId && patient.rctDrawing.startsWith('data:')) {
                  if (!patientFolderId) patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
                  const blob = await (await fetch(patient.rctDrawing)).blob();
                  const file = new File([blob], `RCT_Chart_${patient.name}_${Date.now()}.png`, { type: 'image/png' });
                  const result = await googleDriveService.uploadFile(patientFolderId, file);
                  patient.rctDrawingDriveId = result.id; patientChanged = true;
              }
              if (patientChanged) { updatedPatients[i] = { ...patient }; changed = true; }
          }
          if (changed) { setData(prev => ({ ...prev, patients: updatedPatients, lastUpdated: Date.now() })); alert(t.saveSuccessDrive); } else { alert(t.allSynced); }
      } catch (err) { alert(t.errorDrive); } finally { setIsBulkSyncing(false); setBulkSyncProgress(''); }
  };

  const unsyncedCount = (() => {
      let count = 0;
      data.patients.forEach(p => {
          if (p.profilePicture && !p.profilePictureDriveId) count += 1;
          if (p.images) count += p.images.filter(img => !img.driveFileId).length;
          if (p.rctDrawing && !p.rctDrawingDriveId) count += 1;
      });
      return count;
  })();

  const handleResetLocalData = () => { openConfirm( t.resetConfirmTitle, t.resetConfirmMsg, () => { localStorage.clear(); window.location.reload(); }, t.resetLocalData, t.cancel ); };
  
  const handleUpdateApp = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
        }
    }
    if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
            await caches.delete(key);
        }
    }
    window.location.reload();
  };

  const adjustScale = (delta: number) => setDeviceScale(Math.max(80, Math.min(150, deviceScale + delta)));
  const saveClinicName = () => { if (!tempClinicName.trim()) return; setData(prev => ({ ...prev, clinicName: tempClinicName })); setIsEditingClinic(false); };
  const saveClinicPhone = () => { setData(prev => ({ ...prev, settings: { ...prev.settings, clinicPhone: tempClinicPhone } })); setIsEditingPhone(false); };

  return (
    <div className={`animate-fade-in pb-10 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{t.settings}</h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">{isRTL ? "تخصيص وإدارة نظامك" : "Customize and manage your system"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 px-4 py-2 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-center gap-2">
                 <ShieldCheck size={18} />
                 <span className="text-xs font-black uppercase tracking-tighter">{isAdmin ? t.adminAccount : t.doctorProfile}</span>
              </div>
            </div>
        </div>

        {/* Dashboard Grid Navigation - Centered and NARROW (max-w-4xl) to match sections below */}
        <div className="mb-16 flex justify-center w-full px-2 md:px-0">
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl">
                  {navItems.map((item) => (
                      <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="group flex flex-col items-center justify-center p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-700 transition-all active:scale-95 text-center overflow-hidden"
                      >
                          <div className={`w-14 h-14 md:w-16 md:h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                              <item.icon size={28} className="md:w-8 md:h-8" />
                          </div>
                          <span className="text-[10px] md:text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-tighter leading-tight">{item.label}</span>
                      </button>
                  ))}
             </div>
        </div>
        
        <BackupModal show={showBackupModal} onClose={() => setShowBackupModal(false)} t={t} data={data} isRTL={isRTL} fontClass={fontClass} />
        <RestoreModal show={showRestoreModal} onClose={() => setShowRestoreModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onImport={handleImportData} />
        <VerificationModal show={showVerificationModal} onClose={() => setShowVerificationModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} error={verifyError} onVerify={handleVerifySuccess} data={data} />
        <ChangeAdminPasswordModal show={showChangeAdminPassModal} onClose={() => setShowChangeAdminPassModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onSave={saveAdminPassword} />
        <DoctorDeleteChoiceModal show={showDoctorDeleteChoice} onClose={() => setShowDoctorDeleteChoice(false)} t={t} doctorName={pendingAction?.data?.name} onChoice={handleDoctorDeleteFinal} isRTL={isRTL} fontClass={fontClass} />

        <div className="space-y-16 max-w-4xl mx-auto">
          {isAdmin && (
              <div id="clinic-identity" className="scroll-mt-10 animate-fade-in">
                <IdentitySection t={t} data={data} isRTL={isRTL} isEditingClinic={isEditingClinic} setIsEditingClinic={setIsEditingClinic} tempClinicName={tempClinicName} setTempClinicName={setTempClinicName} saveClinicName={saveClinicName} isEditingPhone={isEditingPhone} setIsEditingPhone={setIsEditingPhone} tempClinicPhone={tempClinicPhone} setTempClinicPhone={setTempClinicPhone} saveClinicPhone={saveClinicPhone} setShowVerificationModal={setShowVerificationModal} />
              </div>
          )}

          {isAdmin && (
              <div id="profiles-mgmt" className="scroll-mt-10 animate-fade-in">
                <ProfilesSection t={t} data={data} showAddDoctorModal={showAddDoctorModal} setShowAddDoctorModal={setShowAddDoctorModal} showEditDoctorModal={showEditDoctorModal} setShowEditDoctorModal={setShowEditDoctorModal} formDoc={formDoc} setFormDoc={setFormDoc} handleAddDoctor={handleAddDoctor} handleUpdateDoctor={handleUpdateDoctor} setPendingAction={setPendingAction} setShowVerificationModal={setShowVerificationModal} showAddSecretaryModal={showAddSecretaryModal} setShowAddSecretaryModal={setShowAddSecretaryModal} formSec={formSec} setFormSec={setFormSec} handleAddSecretary={handleAddSecretary} />
              </div>
          )}

          <div id="sync-mgmt" className="scroll-mt-10 animate-fade-in">
            <SyncSection t={t} data={data} isAdmin={isAdmin} isRTL={isRTL} onLinkDrive={onLinkDrive} handleBulkSyncToDrive={handleBulkSyncToDrive} isBulkSyncing={isBulkSyncing} bulkSyncProgress={bulkSyncProgress} unsyncedCount={unsyncedCount} />
          </div>

          <div id="preferences-mgmt" className="scroll-mt-10 animate-fade-in">
            <PreferencesSection t={t} data={data} setData={setData} deviceScale={deviceScale} setDeviceScale={setDeviceScale} adjustScale={adjustScale} currentTheme={currentTheme} setLocalTheme={setLocalTheme} currentLang={currentLang} setDeviceLang={setDeviceLang} activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId} isRTL={isRTL} />
          </div>

          {isAdmin && (
              <div id="data-mgmt" className="scroll-mt-10 animate-fade-in">
                <DataManagementSection t={t} isRTL={isRTL} setShowBackupModal={setShowBackupModal} setShowRestoreModal={setShowRestoreModal} handleResetLocalData={handleResetLocalData} handleUpdateApp={handleUpdateApp} deferredPrompt={deferredPrompt} handleInstallApp={handleInstallApp} />
              </div>
          )}
        </div>

        {/* Floating Quick Action Button to jump back to top */}
        <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-8 end-8 p-4 bg-primary-600 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 md:hidden"
        >
            <SettingsIcon size={24} className="animate-[spin_4s_linear_infinite]" />
        </button>
    </div>
  );
};
