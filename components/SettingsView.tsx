import React, { useState, useEffect } from 'react';
import { googleDriveService } from '../services/googleDrive';
import { ClinicData, Language, Doctor, Secretary } from '../types';

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
    // Unregister service workers
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
        }
    }
    // Clear caches
    if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
            await caches.delete(key);
        }
    }
    // Hard reload
    window.location.reload();
  };

  const adjustScale = (delta: number) => setDeviceScale(Math.max(80, Math.min(150, deviceScale + delta)));
  const saveClinicName = () => { if (!tempClinicName.trim()) return; setData(prev => ({ ...prev, clinicName: tempClinicName })); setIsEditingClinic(false); };
  const saveClinicPhone = () => { setData(prev => ({ ...prev, settings: { ...prev.settings, clinicPhone: tempClinicPhone } })); setIsEditingPhone(false); };

  return (
    <div className={`animate-fade-in pb-10 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t.settings}</h1>
        
        <BackupModal show={showBackupModal} onClose={() => setShowBackupModal(false)} t={t} data={data} isRTL={isRTL} fontClass={fontClass} />
        <RestoreModal show={showRestoreModal} onClose={() => setShowRestoreModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onImport={handleImportData} />
        <VerificationModal show={showVerificationModal} onClose={() => setShowVerificationModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} error={verifyError} onVerify={handleVerifySuccess} data={data} />
        <ChangeAdminPasswordModal show={showChangeAdminPassModal} onClose={() => setShowChangeAdminPassModal(false)} t={t} isRTL={isRTL} fontClass={fontClass} onSave={saveAdminPassword} />
        <DoctorDeleteChoiceModal show={showDoctorDeleteChoice} onClose={() => setShowDoctorDeleteChoice(false)} t={t} doctorName={pendingAction?.data?.name} onChoice={handleDoctorDeleteFinal} isRTL={isRTL} fontClass={fontClass} />

        <div className="space-y-8 max-w-3xl mx-auto xl:mx-0">
          {isAdmin && (
              <IdentitySection t={t} data={data} isRTL={isRTL} isEditingClinic={isEditingClinic} setIsEditingClinic={setIsEditingClinic} tempClinicName={tempClinicName} setTempClinicName={setTempClinicName} saveClinicName={saveClinicName} isEditingPhone={isEditingPhone} setIsEditingPhone={setIsEditingPhone} tempClinicPhone={tempClinicPhone} setTempClinicPhone={setTempClinicPhone} saveClinicPhone={saveClinicPhone} setShowVerificationModal={setShowVerificationModal} />
          )}

          {isAdmin && (
              <ProfilesSection t={t} data={data} showAddDoctorModal={showAddDoctorModal} setShowAddDoctorModal={setShowAddDoctorModal} showEditDoctorModal={showEditDoctorModal} setShowEditDoctorModal={setShowEditDoctorModal} formDoc={formDoc} setFormDoc={setFormDoc} handleAddDoctor={handleAddDoctor} handleUpdateDoctor={handleUpdateDoctor} setPendingAction={setPendingAction} setShowVerificationModal={setShowVerificationModal} showAddSecretaryModal={showAddSecretaryModal} setShowAddSecretaryModal={setShowAddSecretaryModal} formSec={formSec} setFormSec={setFormSec} handleAddSecretary={handleAddSecretary} />
          )}

          <SyncSection t={t} data={data} isAdmin={isAdmin} isRTL={isRTL} onLinkDrive={onLinkDrive} handleBulkSyncToDrive={handleBulkSyncToDrive} isBulkSyncing={isBulkSyncing} bulkSyncProgress={bulkSyncProgress} unsyncedCount={unsyncedCount} />

          <PreferencesSection t={t} deviceScale={deviceScale} setDeviceScale={setDeviceScale} adjustScale={adjustScale} currentTheme={currentTheme} setLocalTheme={setLocalTheme} currentLang={currentLang} setDeviceLang={setDeviceLang} activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId} isRTL={isRTL} />

          {isAdmin && (
              <DataManagementSection t={t} isRTL={isRTL} setShowBackupModal={setShowBackupModal} setShowRestoreModal={setShowRestoreModal} handleResetLocalData={handleResetLocalData} handleUpdateApp={handleUpdateApp} deferredPrompt={deferredPrompt} handleInstallApp={handleInstallApp} />
          )}
        </div>
    </div>
  );
};