
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Plus, Search, Trash2, Pill, WifiOff, LayoutDashboard, RefreshCw, AlertCircle, CloudCheck, Cloud, LayoutGrid, Folder, ChevronLeft, ArrowLeft, CheckCircle2, Smartphone } from 'lucide-react';
import { ClinicData, Doctor, Secretary, Patient, Appointment, Payment, Tooth, RootCanalEntry, Memo, Prescription, Medication, SupplyItem, ExpenseItem, TodoItem, ToothSurfaces, LabOrder, InventoryItem, ToothNote, Language, MemoStyle, Examination, MedicalConditionItem, PatientQueryAnswer, MedicationCategory } from './types';
import { INITIAL_DATA } from './initialData';
import { LABELS } from './locales';
import { storageService } from './services/storage';
import { supabaseService } from './services/supabase';
import { googleDriveService } from './services/googleDrive';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { ClinicSetup } from './components/ClinicSetup';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { PatientDetails } from './components/PatientDetails';
import { CalendarView } from './components/CalendarView';
import { MemosView } from './components/MemosView';
import { PurchasesView } from './components/PurchasesView';
import { InventoryView } from './components/InventoryView';
import { ExpensesView } from './components/ExpensesView';
import { SettingsView } from './components/SettingsView';
import { LabOrdersView } from './components/LabOrdersView';
import { PrintLayouts } from './components/PrintLayouts';
import { SupplyModal, MemoModal, PatientModal, PaymentModal, AppointmentModal, AddMasterDrugModal, ExpenseModal, LabOrderModal, InventoryModal, PrescriptionModal } from './components/AppModals';
import { ProfileSelector } from './components/ProfileSelector';
import { isSameDay, isSameWeek, isSameMonth, addDays } from 'date-fns';
import { Logo } from './components/Logo';
import { THEMES } from './constants';
import { hexToRgb, granularMerge, normalizeDigits, generateId } from './utils';

export default function App() {
  const [data, setData] = useState<ClinicData>(INITIAL_DATA);
  const [appState, setAppState] = useState<'landing' | 'auth' | 'profile_select' | 'app' | 'loading'>('loading');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);
  const [activeSecretaryId, setActiveSecretaryId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [currentView, setCurrentView] = useState<'patients' | 'dashboard' | 'memos' | 'calendar' | 'settings' | 'purchases' | 'expenses' | 'labOrders' | 'inventory'>('patients');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [apptPatientId, setApptPatientId] = useState<string | null>(null);
  const [patientTab, setPatientTab] = useState<'overview' | 'chart' | 'visits' | 'finance' | 'prescriptions' | 'documents' | 'examination'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isProcessingPatient, setIsProcessingPatient] = useState(false);
  const [isProcessingAppt, setIsProcessingAppt] = useState(false);
  const [isProcessingFinance, setIsProcessingFinance] = useState(false);
  const [isProcessingExam, setIsProcessingExam] = useState(false);
  const [isProcessingRx, setIsProcessingRx] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isProcessingProfilePic, setIsProcessingProfilePic] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'payment' | 'charge'>('payment'); 
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null); 
  const [appointmentMode, setAppointmentMode] = useState<'existing' | 'new'>('existing');
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [memoType, setMemoType] = useState<'text' | 'todo' | null>(null); 
  const [tempTodos, setTempTodos] = useState<TodoItem[]>([]);
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [showAddMasterDrugModal, setShowAddMasterDrugModal] = useState(false);
  const [printingRx, setPrintingRx] = useState<Prescription | null>(null);
  const [printingPayment, setPrintingPayment] = useState<Payment | null>(null);
  const [printingAppointment, setPrintingAppointment] = useState<Appointment | null>(null);
  const [printingExamination, setPrintingExamination] = useState<Examination | null>(null);
  const [printingDocument, setPrintingDocument] = useState<{ type: 'consent' | 'instructions', text: string, align: 'left'|'center'|'right', fontSize: number, topMargin: number } | null>(null);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<SupplyItem | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [guestToConvert, setGuestToConvert] = useState<Appointment | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [landingLang, setLandingLang] = useState<'en'|'ar'|'ku'>('ar');
  const [deviceLang, setDeviceLang] = useState<Language>(() => (localStorage.getItem('dentro_device_lang') as Language) || 'ar');
  const [deviceScale, setDeviceScale] = useState<number>(() => {
      const saved = localStorage.getItem('dentro_device_scale');
      return saved ? parseInt(saved) : 100;
  });
  const [activeThemeId, setActiveThemeId] = useState<string>(() => localStorage.getItem('dentro_theme_id') || 'classic');

  const checkOnlineStatus = () => {
    if (!navigator.onLine) {
        throw new Error(deviceLang === 'ar' ? 'يجب أن تكون متصلاً بالإنترنت لتنفيذ هذه العملية لضمان الحفظ السحابي.' : 'You must be online to perform this operation to ensure cloud synchronization.');
    }
  };

  const syncToCloud = async (newData: ClinicData, maxRetries = 5): Promise<boolean> => {
    if (!navigator.onLine || !newData.settings.isLoggedIn) {
        setSyncStatus('offline');
        return false;
    }
    setSyncStatus('syncing');
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            await supabaseService.saveData(newData);
            setSyncStatus('synced');
            return true;
        } catch (err: any) {
            attempt++;
            if (attempt >= maxRetries) {
                setSyncStatus('error');
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
    return false;
  };

  const updateAndSync = async (updater: (prev: ClinicData) => ClinicData) => {
      const ts = Date.now();
      setData(prev => {
          const next = { ...updater(prev), lastUpdated: ts };
          storageService.saveData(next);
          syncToCloud(next); 
          return next;
      });
  };

  const handleUpdateSettings = async (settings: Partial<ClinicData['settings']>) => {
      await updateAndSync(prev => ({
          ...prev,
          settings: { ...prev.settings, ...settings }
      }));
  };

  const handleManualSync = async (force: boolean = false) => {
      if (!navigator.onLine || !data.settings.isLoggedIn) return;
      setSyncStatus('syncing');
      try {
          const cloudData = await supabaseService.loadData();
          if (cloudData) {
              setData(prev => {
                  if (cloudData.lastUpdated <= prev.lastUpdated && !force) {
                      setSyncStatus('synced');
                      return prev;
                  }
                  const merged = granularMerge(prev, cloudData);
                  const final = mergeDataWithLocalPrefs(merged);
                  storageService.saveData(final);
                  setSyncStatus('synced');
                  return final;
              });
              return true;
          }
      } catch (e: any) {
          setSyncStatus('error');
      }
      return false;
  };

  const handleLinkDrive = async () => {
      try {
          const token = await googleDriveService.login('consent');
          if (token) {
              await updateAndSync(prev => ({
                  ...prev,
                  settings: { ...prev.settings, googleDriveLinked: true }
              }));
          }
      } catch (e) {
          alert(deviceLang === 'ar' ? "فشل ربط حساب Google Drive" : "Failed to link Google Drive account");
      }
  };

  const handleProfilePicUploadAsync = async (patientId: string, file: File) => {
      setIsProcessingProfilePic(true);
      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              
              // حفظ محلي فقط
              await updatePatient(patientId, {
                  profilePicture: base64String,
                  profilePictureDriveId: undefined, // نلغي الـ ID لنعرف أنها غير مزامنة
                  updatedAt: Date.now()
              });
              
              // إظهار التنبيه المطلوب
              alert(deviceLang === 'ar' 
                ? "تم حفظ صورة البروفايل محلياً. يرجى الذهاب للإعدادات ومزامنة الملفات لرفعها على حساب Google Drive ومشاركتها مع باقي الأجهزة." 
                : "Profile picture saved locally. Please go to Settings and sync files to upload it to Google Drive and share with other devices.");
          };
          reader.readAsDataURL(file);
      } catch (err: any) {
          alert(err.message || "Failed to save profile picture");
      } finally {
          setIsProcessingProfilePic(false);
      }
  };

  const handleDeletePatientAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, patients: data.patients.filter(x => x.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        const success = await syncToCloud(newData);
        if (success) setSelectedPatientId(null);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteAppointmentAsync = async (patientId: string, appId: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = {
            ...data,
            lastUpdated: ts,
            patients: data.patients.map(p => p.id === patientId ? { ...p, appointments: p.appointments.filter(a => a.id !== appId), updatedAt: ts } : p),
            guestAppointments: (data.guestAppointments || []).filter(a => a.id !== appId),
            deletedIds: [...(data.deletedIds || []), appId]
        };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeletePaymentAsync = async (patientId: string, paymentId: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = {
            ...data,
            lastUpdated: ts,
            patients: data.patients.map(p => p.id === patientId ? { ...p, payments: p.payments.filter(pay => pay.id !== paymentId), updatedAt: ts } : p),
            deletedIds: [...(data.deletedIds || []), paymentId]
        };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteExaminationAsync = async (patientId: string, examId: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = {
            ...data,
            lastUpdated: ts,
            patients: data.patients.map(p => p.id === patientId ? { ...p, examinations: (p.examinations || []).filter(e => e.id !== examId), updatedAt: ts } : p),
            deletedIds: [...(data.deletedIds || []), examId]
        };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteRxAsync = async (patientId: string, rxId: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = {
            ...data,
            lastUpdated: ts,
            patients: data.patients.map(p => p.id === patientId ? { ...p, prescriptions: p.prescriptions.filter(r => r.id !== rxId), updatedAt: ts } : p),
            deletedIds: [...(data.deletedIds || []), rxId]
        };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteRCTAsync = async (patientId: string, rctId: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = {
            ...data,
            lastUpdated: ts,
            patients: data.patients.map(p => p.id === patientId ? { ...p, rootCanals: p.rootCanals.filter(r => r.id !== rctId), updatedAt: ts } : p),
            deletedIds: [...(data.deletedIds || []), rctId]
        };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteMemoAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, memos: data.memos.filter(x => x.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteSupplyAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, supplies: (data.supplies || []).filter(x => x.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteInventoryItemAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, inventory: (data.inventory || []).filter(x => x.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteExpenseAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, expenses: (data.expenses || []).filter(x => x.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteLabOrderAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, labOrders: (data.labOrders || []).filter(x => x.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteSecretaryAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { ...data, lastUpdated: ts, secretaries: (data.secretaries || []).filter(s => s.id !== id), deletedIds: [...(data.deletedIds || []), id] };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  const handleDeleteDoctorAsync = async (id: string, deletePatients: boolean) => {
    setIsProcessingDelete(true);
    try {
        checkOnlineStatus();
        const ts = Date.now();
        const newData = { 
            ...data, 
            lastUpdated: ts, 
            doctors: data.doctors.filter(d => d.id !== id), 
            patients: deletePatients ? data.patients.filter(p => p.doctorId !== id) : data.patients,
            deletedIds: [...(data.deletedIds || []), id] 
        };
        setData(newData);
        storageService.saveData(newData);
        await syncToCloud(newData);
    } catch (err: any) { alert(err.message || 'Delete failed'); } finally { setIsProcessingDelete(false); }
  };

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isRTL = deviceLang === 'ar' || deviceLang === 'ku';
      alert(isRTL 
        ? 'التطبيق مثبت بالفعل أو أن متصفحك لا يدعم التثبيت التلقائي حالياً. يمكنك تثبيته يدوياً من قائمة إعدادات المتصفح عن طريق اختيار "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).' 
        : 'App is already installed or your browser doesn\'t support auto-install right now. You can install it manually from your browser menu by selecting "Add to Home Screen".');
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isProcessingPatient || isProcessingDelete || isProcessingAppt || isProcessingFinance || isProcessingExam || isProcessingRx) return; 
      if (showNewPatientModal) setShowNewPatientModal(false);
      else if (showEditPatientModal) setShowEditPatientModal(false);
      else if (showPaymentModal) setShowPaymentModal(false);
      else if (showAppointmentModal) setShowAppointmentModal(false);
      else if (showMemoModal) setShowMemoModal(false);
      else if (showLabOrderModal) setShowLabOrderModal(false);
      else if (showInventoryModal) setShowInventoryModal(false);
      else if (showRxModal) setShowRxModal(false);
      else if (showAddMasterDrugModal) setShowAddMasterDrugModal(false);
      else if (showSupplyModal) setShowSupplyModal(false);
      else if (showExpenseModal) setShowExpenseModal(false);
      else if (isSidebarOpen) setSidebarOpen(false);
      else if (selectedPatientId) setSelectedPatientId(null);
      else if (currentView !== 'patients' && appState === 'app') setCurrentView('patients');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    showNewPatientModal, showEditPatientModal, showPaymentModal, showAppointmentModal, 
    showMemoModal, showLabOrderModal, showInventoryModal, showRxModal, 
    showAddMasterDrugModal, showSupplyModal, showExpenseModal, isSidebarOpen, 
    selectedPatientId, currentView, appState, isProcessingPatient, isProcessingDelete, isProcessingAppt, isProcessingFinance, isProcessingExam, isProcessingRx
  ]);

  const pushNavState = () => {
    window.history.pushState({ navigated: true }, "");
  };

  const handleOpenPatient = (id: string) => {
    pushNavState();
    setSelectedPatientId(id);
  };

  const handleOpenModal = (setter: (val: boolean) => void) => {
    pushNavState();
    setter(true);
  };

  const handleRxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            await updateAndSync(prev => ({
                ...prev,
                settings: { ...prev.settings, rxBackgroundImage: base64String }
            }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveRxBg = async () => {
    await updateAndSync(prev => ({
        ...prev,
        settings: { ...prev.settings, rxBackgroundImage: '' }
    }));
  };

  const mergeDataWithLocalPrefs = (externalData: ClinicData): ClinicData => {
      const currentThemeMode = THEMES.find(t => t.id === activeThemeId)?.type || 'light';
      return {
          ...externalData,
          settings: {
              ...externalData.settings,
              language: deviceLang, 
              theme: currentThemeMode 
          }
      };
  };

  useEffect(() => {
    const initApp = async () => {
      const localData = storageService.loadData();
      if (localData && localData.clinicName) setData(mergeDataWithLocalPrefs(localData));

      googleDriveService.init(() => {
          console.log("Google Drive Service Initialized");
      });

      const user = await supabaseService.getUser();
      if (!user) { setAppState('landing'); setIsInitialLoading(false); return; }

      try {
          const cloudData = await supabaseService.loadData();
          if (cloudData) {
              setData(prev => {
                  const merged = granularMerge(prev, cloudData);
                  const final = mergeDataWithLocalPrefs(merged);
                  storageService.saveData(final);
                  return final;
              });
          }
      } catch (e: any) { console.warn("Initial sync failed, using local."); }
      
      const currentData = storageService.loadData();
      if (currentData && currentData.clinicName) {
          const savedProfileType = localStorage.getItem('dentro_profile_type');
          if (savedProfileType) {
              if (savedProfileType === 'admin') {
                  setAppState('app');
              } else if (savedProfileType === 'doctor') {
                  const docId = localStorage.getItem('dentro_active_profile');
                  if (docId) {
                      setActiveDoctorId(docId);
                      setAppState('app');
                  } else {
                      setAppState('profile_select');
                  }
              } else if (savedProfileType === 'secretary') {
                  const secId = localStorage.getItem('dentro_active_secretary');
                  if (secId) {
                      setActiveSecretaryId(secId);
                      setAppState('app');
                      setCurrentView('patients');
                  } else {
                      setAppState('profile_select');
                  }
              } else {
                  setAppState('profile_select');
              }
          } else {
              setAppState('profile_select');
          }
      } else {
          setAppState('app'); 
      }
      setIsInitialLoading(false);
    };
    initApp();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('');
    try {
        const result = await supabaseService.signIn(loginEmail, loginPassword);
        if (result.error) setAuthError(result.error.message); else {
            let cloudData = await supabaseService.loadData();
            
            // إذا كان الحساب جديداً (لا توجد بيانات سحابية)، قم بإنشاء السجل الأول
            if (!cloudData) {
                const initial = { ...INITIAL_DATA, settings: { ...INITIAL_DATA.settings, isLoggedIn: true } };
                await supabaseService.saveData(initial);
                cloudData = initial;
            }

            if (cloudData) {
                const newData = mergeDataWithLocalPrefs(cloudData); 
                newData.settings.isLoggedIn = true;
                setData(newData); 
                storageService.saveData(newData); 
                setIsInitialLoading(false); 
                setAppState(cloudData.clinicName ? 'profile_select' : 'app');
            }
        }
    } catch (err: any) { setAuthError(err.message || 'Auth failed'); } finally { setAuthLoading(false); }
  };

  const handleClinicNameSubmit = async (name: string) => { 
    await updateAndSync(prev => ({ ...prev, clinicName: name })); 
    setAppState('profile_select'); 
  };

  const handleAddPatientAsync = async (pData: any) => {
      setIsProcessingPatient(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newP = { ...pData, status: 'active', id: generateId(), createdAt: new Date().toISOString(), updatedAt: ts, teeth: {}, appointments: [], payments: [], examinations: [], notes: '', rootCanals: [], treatmentSessions: [], prescriptions: [], structuredMedicalHistory: [], patientQueries: [] };
          const newData = { ...data, lastUpdated: ts, patients: [newP, ...data.patients] };
          setData(newData);
          storageService.saveData(newData);
          const success = await syncToCloud(newData);
          if (success) {
            setShowNewPatientModal(false);
            return newP;
          }
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingPatient(false); }
  };

  const updatePatientAsync = async (id: string, updates: Partial<Patient>) => {
      setIsProcessingPatient(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newData = { ...data, lastUpdated: ts, patients: data.patients.map(p => p.id === id ? { ...p, ...updates, updatedAt: ts } : p) };
          setData(newData);
          storageService.saveData(newData);
          const success = await syncToCloud(newData);
          if (success) setShowEditPatientModal(false);
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingPatient(false); }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    await updateAndSync(prev => ({
        ...prev,
        patients: prev.patients.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)
    }));
  };

  const handleSaveRxAsync = async (patientId: string, updates: Partial<Patient>) => {
      setIsProcessingRx(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newData = { 
              ...data, 
              lastUpdated: ts, 
              patients: data.patients.map(p => p.id === patientId ? { ...p, ...updates, updatedAt: ts } : p) 
          };
          setData(newData);
          storageService.saveData(newData);
          const success = await syncToCloud(newData);
          if (success) setShowRxModal(false);
      } catch (err: any) { 
          setOpError(err.message || 'Sync failed'); 
      } finally { 
          setIsProcessingRx(false); 
      }
  };

  const handleSaveExaminationAsync = async (patientId: string, examData: Examination, isEdit: boolean) => {
      setIsProcessingExam(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newData = {
              ...data,
              lastUpdated: ts,
              patients: data.patients.map(p => {
                  if (p.id !== patientId) return p;
                  const exams = p.examinations || [];
                  const updatedExams = isEdit 
                      ? exams.map(e => e.id === examData.id ? { ...examData, updatedAt: ts } : e)
                      : [{ ...examData, updatedAt: ts }, ...exams];
                  return { ...p, examinations: updatedExams, updatedAt: ts };
              })
          };
          setData(newData);
          storageService.saveData(newData);
          const success = await syncToCloud(newData);
          return success;
      } catch (err: any) { setOpError(err.message || 'Sync failed'); return false; } finally { setIsProcessingExam(false); }
  };

  const handleSavePaymentAsync = async (patientId: string, paymentData: any, isEdit: boolean) => {
      setIsProcessingFinance(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newData = {
              ...data,
              lastUpdated: ts,
              patients: data.patients.map(p => {
                  if (p.id !== patientId) return p;
                  const payments = p.payments || [];
                  const updatedPayments = isEdit 
                      ? payments.map(pay => pay.id === paymentData.id ? { ...pay, ...paymentData, updatedAt: ts } : pay)
                      : [{ ...paymentData, id: generateId(), updatedAt: ts }, ...payments];
                  return { ...p, payments: updatedPayments, updatedAt: ts };
              })
          };
          setData(newData);
          storageService.saveData(newData);
          const success = await syncToCloud(newData);
          if (success) setShowPaymentModal(false);
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingFinance(false); }
  };

  const handleSaveAppointmentAsync = async (patientId: string | null, apptData: Partial<Appointment>) => {
      setIsProcessingAppt(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const id = selectedAppointment ? selectedAppointment.id : generateId();
          let newData;
          if (patientId) {
              newData = {
                  ...data,
                  lastUpdated: ts,
                  patients: data.patients.map(p => {
                      if (p.id !== patientId) return p;
                      const appts = selectedAppointment 
                          ? p.appointments.map(a => a.id === id ? { ...a, ...apptData, updatedAt: ts } : a)
                          : [...p.appointments, { ...apptData, id, patientId, patientName: p.name, status: 'scheduled', updatedAt: ts } as Appointment];
                      return { ...p, appointments: appts, updatedAt: ts };
                  })
              };
          } else {
              newData = {
                  ...data,
                  lastUpdated: ts,
                  guestAppointments: selectedAppointment 
                      ? (data.guestAppointments || []).map(a => a.id === id ? { ...a, ...apptData, updatedAt: ts } : a)
                      : [...(data.guestAppointments || []), { ...apptData, id, patientId: '', patientName: apptData.patientName || 'Guest', status: 'scheduled', updatedAt: ts } as Appointment]
              };
          }
          setData(newData);
          storageService.saveData(newData);
          const success = await syncToCloud(newData);
          if (success) {
            setShowAppointmentModal(false); 
            setSelectedAppointment(null);
          }
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingAppt(false); }
  };

  const handleUpdateAppointmentStatusAsync = async (patientId: string, appId: string, status: any) => {
      setIsProcessingAppt(true);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newData = {
              ...data,
              lastUpdated: ts,
              patients: data.patients.map(p => {
                  if (p.id !== patientId) return p;
                  return { ...p, appointments: p.appointments.map(a => a.id === appId ? { ...a, status, updatedAt: ts } : a), updatedAt: ts };
              })
          };
          setData(newData);
          storageService.saveData(newData);
          await syncToCloud(newData);
      } catch (err: any) { alert(err.message || 'Update failed'); } finally { setIsProcessingAppt(false); }
  };

  const handleUpdateTooth = async (patientId: string, toothId: number, status: Tooth['status']) => {
    await updateAndSync(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
            return { ...p, updatedAt: Date.now(), teeth: { ...p.teeth, [toothId]: { ...tooth, status, updatedAt: Date.now() } } };
        })
    }));
  };

  const handleUpdateToothSurface = async (patientId: string, toothId: number, surface: keyof ToothSurfaces | 'all', status: string) => {
    await updateAndSync(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy', surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } };
            let newSurfaces = { ...(tooth.surfaces || { top:'none', bottom:'none', left:'none', right:'none', center:'none' }) };
            if (surface === 'all') { const val = newSurfaces.center === status ? 'none' : status; newSurfaces = { top: val, bottom: val, left: val, right: val, center: val }; }
            else { newSurfaces[surface] = newSurfaces[surface] === status ? 'none' : status; }
            return { ...p, updatedAt: Date.now(), teeth: { ...p.teeth, [toothId]: { ...tooth, surfaces: newSurfaces, updatedAt: Date.now() } } };
        })
    }));
  };

  const handleUpdateToothNote = async (patientId: string, toothId: number, note: ToothNote) => {
    await updateAndSync(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
            return { ...p, updatedAt: Date.now(), teeth: { ...p.teeth, [toothId]: { ...tooth, specialNote: { ...note, updatedAt: Date.now() }, updatedAt: Date.now() } } };
        })
    }));
  };

  const handleSaveMemo = async (title: string, content: string, color: string, type: 'text'|'todo' = 'text', todos: TodoItem[], style?: MemoStyle) => {
    const ts = Date.now();
    const newData = {
        ...data,
        lastUpdated: ts,
        memos: selectedMemo 
            ? (data.memos || []).map(m => m.id === selectedMemo.id ? { ...m, title, content, color, type, todos, style, updatedAt: ts } : m)
            : [{ id: generateId(), title, content, color, type, todos, date: new Date().toISOString(), style, updatedAt: ts }, ...(data.memos || [])]
    };
    
    // Save locally immediately
    setData(newData);
    storageService.saveData(newData);
    
    // Close modal right away for instant feedback
    setShowMemoModal(false); 
    setSelectedMemo(null);
    
    // Attempt cloud sync in the background
    syncToCloud(newData);
  };

  useEffect(() => {
      const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
      const root = document.documentElement;
      root.style.setProperty('--primary-rgb', hexToRgb(theme.colors.primary));
      root.style.setProperty('--secondary-rgb', hexToRgb(theme.colors.secondary));
      root.style.setProperty('--bg-color', theme.colors.bg);
      if (theme.type === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
      localStorage.setItem('dentro_theme_id', activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${deviceScale}%`;
    localStorage.setItem('dentro_device_scale', deviceScale.toString());
  }, [deviceScale]);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const openConfirm = (title: string, message: string, onConfirm: () => void) => setConfirmState({ isOpen: true, title, message, onConfirm });
  const closeConfirm = () => { if (!isProcessingDelete) setConfirmState(prev => ({ ...prev, isOpen: false })); };

  const allAppointments = [
    ...data.patients.flatMap(p => p.appointments.map(a => ({ ...a, patientName: p.name, patient: p }))),
    ...(data.guestAppointments || []).map(a => ({ ...a, patient: null }))
  ];

  const filteredData = activeDoctorId ? { ...data, patients: data.patients.filter(p => p.doctorId === activeDoctorId) } : data;
  const activePatient = selectedPatientId ? data.patients.find(p => p.id === selectedPatientId) : null;
  const currentT = LABELS[deviceLang];
  const isRTL = deviceLang === 'ar' || deviceLang === 'ku';

  if (appState === 'loading' || isInitialLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 font-cairo">
      <Logo className="w-24 h-24 mb-6" />
      <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-primary-500 w-0 animate-progress-fill"></div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
        {deviceLang === 'ar' ? 'جاري المزامنة، يرجى الانتظار قليلاً...' : deviceLang === 'ku' ? 'خەریکی هاوکاتکردنە، تکایە کەمێک چاوەڕوان بن...' : 'Syncing, please wait a moment...'}
      </p>
    </div>
  );

  const handleLogout = () => {
      setActiveDoctorId(null);
      setActiveSecretaryId(null);
      localStorage.removeItem('dentro_profile_type');
      localStorage.removeItem('dentro_active_profile');
      localStorage.removeItem('dentro_active_secretary');
      setAppState('profile_select');
  };

  if (appState === 'landing') return <LandingPage setAppState={setAppState} landingLang={landingLang} setLandingLang={setLandingLang} isRTL={isRTL} />;
  if (appState === 'auth') return <AuthScreen t={currentT} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} authLoading={authLoading} authError={authError} handleAuth={handleAuth} setAppState={setAppState} />;
  if (appState === 'profile_select') return <ProfileSelector t={currentT} data={data} loginPassword={loginPassword} currentLang={deviceLang} isRTL={isRTL} onSelectAdmin={() => { localStorage.setItem('dentro_profile_type', 'admin'); setAppState('app'); }} onSelectDoctor={(id) => { setActiveDoctorId(id); localStorage.setItem('dentro_profile_type', 'doctor'); localStorage.setItem('dentro_active_profile', id); setAppState('app'); }} onSelectSecretary={(id) => { setActiveSecretaryId(id); localStorage.setItem('dentro_profile_type', 'secretary'); localStorage.setItem('dentro_active_secretary', id); setAppState('app'); setCurrentView('patients'); }} onLogout={() => { supabaseService.signOut(); localStorage.clear(); setAppState('landing'); }} />;

  if (appState === 'app' && !data.clinicName) {
      return (
        <ClinicSetup 
            t={currentT} 
            data={data} 
            setData={setData} 
            onboardingStep={1} 
            setOnboardingStep={() => {}} 
            handleClinicNameSubmit={handleClinicNameSubmit} 
            handleAddDoctor={() => {}} 
            handleDeleteDoctor={() => {}} 
            handleFinishSetup={() => {}} 
            isRTL={isRTL} 
            openConfirm={openConfirm} 
        />
      );
  }

  return (
    <div className={`min-h-screen flex bg-page-bg font-${isRTL ? 'cairo' : 'sans'} leading-relaxed overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
      <ConfirmationModal 
        isOpen={confirmState.isOpen} 
        title={confirmState.title} 
        message={confirmState.message} 
        onConfirm={async () => {
          await confirmState.onConfirm();
          closeConfirm();
        }} 
        onCancel={closeConfirm} 
        lang={deviceLang}
        isLoading={isProcessingDelete}
      />
      <Sidebar t={currentT} data={data} currentView={currentView} setCurrentView={(view) => { if(view !== currentView) pushNavState(); setCurrentView(view); }} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} setSelectedPatientId={setSelectedPatientId} handleLogout={handleLogout} isRTL={isRTL} isSecretary={!!activeSecretaryId} handleManualSync={handleManualSync} syncStatus={syncStatus} />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
         <div className="lg:hidden p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300"><Menu /></button>
            <div className="font-bold dark:text-white flex items-center gap-2"> {data.clinicName} {isOffline && <WifiOff size={14} className="text-red-500" />} </div>
         </div>
         
         <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto">
             {currentView === 'dashboard' && !activeSecretaryId && <DashboardView t={currentT} data={data} allAppointments={allAppointments} setData={setData} activeDoctorId={activeDoctorId} setSelectedPatientId={handleOpenPatient} setCurrentView={setCurrentView} setPatientTab={setPatientTab} />}
             {currentView === 'patients' && !selectedPatientId && <PatientsView t={currentT} data={filteredData} isRTL={isRTL} currentLang={deviceLang} setSelectedPatientId={handleOpenPatient} setPatientTab={setPatientTab} setCurrentView={setCurrentView} setShowNewPatientModal={(val) => handleOpenModal(() => { setShowNewPatientModal(val); setOpError(null); })} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddAppointment={(pid) => { setApptPatientId(pid); handleOpenModal(() => setShowAppointmentModal(true)); }} />}
             {currentView === 'patients' && selectedPatientId && activePatient && <PatientDetails t={currentT} data={data} setData={setData} activePatient={activePatient} patientTab={patientTab} setPatientTab={setPatientTab} setSelectedPatientId={setSelectedPatientId} currentLang={deviceLang} isRTL={isRTL} updatePatient={updatePatient} handleDeletePatient={handleDeletePatientAsync} handleUpdateTooth={handleUpdateTooth} handleUpdateToothSurface={handleUpdateToothSurface} handleUpdateToothNote={handleUpdateToothNote} handleUpdateHead={()=>{}} handleUpdateBody={()=>{}} handleAddRCT={(pid, rct) => updatePatient(pid, { rootCanals: [...(activePatient.rootCanals || []), { ...rct, id: generateId(), updatedAt: Date.now() }] })} handleDeleteRCT={handleDeleteRCTAsync} handleUpdateAppointmentStatus={handleUpdateAppointmentStatusAsync} handleDeleteRx={(rxid) => handleDeleteRxAsync(activePatient.id, rxid)} setPrintingRx={setPrintingRx} setPrintingPayment={setPrintingPayment} setPrintingAppointment={setPrintingAppointment} setPrintingExamination={setPrintingExamination} handleRxFileUpload={handleRxFileUpload} handleRemoveRxBg={handleRemoveRxBg} setShowEditPatientModal={(val) => handleOpenModal(() => { setShowEditPatientModal(val); setOpError(null); })} setShowAppointmentModal={(val) => handleOpenModal(() => { setShowAppointmentModal(val); setOpError(null); })} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} 
                setShowPaymentModal={(val) => handleOpenModal(() => { setShowPaymentModal(val); setOpError(null); })} 
                setPaymentType={setPaymentType} 
                setSelectedPayment={setSelectedPayment}
                setShowRxModal={(val) => handleOpenModal(() => { setShowRxModal(val); setOpError(null); })} 
                setShowAddMasterDrugModal={(val) => handleOpenModal(() => setShowAddMasterDrugModal(val))} 
                openConfirm={openConfirm} 
                setPrintingDocument={setPrintingDocument} 
                isSecretary={!!activeSecretaryId} 
                handleSaveExamination={handleSaveExaminationAsync} 
                handleDeleteExamination={handleDeleteExaminationAsync} 
                handleDeletePayment={handleDeletePaymentAsync}
                handleProfilePicUpload={handleProfilePicUploadAsync}
                isProcessingExam={isProcessingExam} 
                isProcessingFinance={isProcessingFinance} 
                isProcessingAppt={isProcessingAppt} 
                isProcessingProfilePic={isProcessingProfilePic}
                opError={opError} 
                setOpError={setOpError} 
              />}
             {currentView === 'calendar' && <CalendarView t={currentT} data={data} currentLang={deviceLang} isRTL={isRTL} calendarView={calendarView} setCalendarView={setCalendarView} currentDate={currentDate} setCurrentDate={setCurrentDate} filteredAppointments={allAppointments} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} setShowAppointmentModal={(val) => handleOpenModal(() => setShowAppointmentModal(val))} handleUpdateAppointmentStatus={handleUpdateAppointmentStatusAsync} handleDeleteAppointment={handleDeleteAppointmentAsync} setSelectedPatientId={handleOpenPatient} setCurrentView={setCurrentView} setPatientTab={setPatientTab} setGuestToConvert={setGuestToConvert} setShowNewPatientModal={(val) => handleOpenModal(() => setShowNewPatientModal(val))} openConfirm={openConfirm} setData={setData} activeDoctorId={activeDoctorId} isSecretary={!!activeSecretaryId} />}
             {currentView === 'memos' && <MemosView t={currentT} data={data} setSelectedMemo={setSelectedMemo} setShowMemoModal={(val) => handleOpenModal(() => setShowMemoModal(val))} setMemoType={setMemoType} setTempTodos={setTempTodos} handleDeleteMemo={handleDeleteMemoAsync} currentLang={deviceLang} openConfirm={openConfirm} />}
             {currentView === 'purchases' && <PurchasesView t={currentT} data={data} setSelectedSupply={setSelectedSupply} setShowSupplyModal={(val) => handleOpenModal(() => setShowSupplyModal(val))} handleConvertToExpense={(s) => updateAndSync(p => ({...p, expenses: [{...s, date: new Date().toISOString(), updatedAt: Date.now()}, ...p.expenses], supplies: p.supplies.filter(x=>x.id!==s.id)}))} handleDeleteSupply={handleDeleteSupplyAsync} openConfirm={openConfirm} />}
             {currentView === 'inventory' && <InventoryView t={currentT} data={data} setSelectedInventoryItem={setSelectedInventoryItem} setShowInventoryModal={(val) => handleOpenModal(() => setShowInventoryModal(val))} handleDeleteInventoryItem={handleDeleteInventoryItemAsync} openConfirm={openConfirm} />}
             {currentView === 'expenses' && <ExpensesView t={currentT} data={data} setData={setData} setSelectedExpense={setSelectedExpense} setShowExpenseModal={(val) => handleOpenModal(() => setShowExpenseModal(val))} handleDeleteExpense={handleDeleteExpenseAsync} openConfirm={openConfirm} />}
             {currentView === 'labOrders' && <LabOrdersView t={currentT} data={data} setData={setData} setSelectedLabOrder={setSelectedLabOrder} setShowLabOrderModal={(val) => handleOpenModal(() => setShowLabOrderModal(val))} handleDeleteLabOrder={handleDeleteLabOrderAsync} handleUpdateLabOrderStatus={(id, s) => updateAndSync(p => ({...p, labOrders: p.labOrders.map(o => o.id === id ? {...o, status: s, updatedAt: Date.now()} : o)}))} openConfirm={confirmState.isOpen ? closeConfirm : openConfirm} currentLang={deviceLang} />}
             {currentView === 'settings' && <SettingsView t={currentT} data={data} setData={setData} 
                handleAddDoctor={(n,u,p) => updateAndSync(prev => ({...prev, doctors: [...prev.doctors, {id: generateId(), name: n, username: u, password: p||'123456', updatedAt: Date.now()}]}))} 
                handleUpdateDoctor={(id, u, f) => { if(f) { localStorage.clear(); window.location.reload(); } else updateAndSync(prev => ({...prev, doctors: prev.doctors.map(d => d.id === id ? {...d, ...u, updatedAt: Date.now()} : d)})); }} 
                handleDeleteDoctor={handleDeleteDoctorAsync} 
                handleAddSecretary={(n,u,p) => updateAndSync(prev => ({...prev, secretaries: [...(prev.secretaries||[]), {id: generateId(), name: n, username: u, password: p||'123456', updatedAt: Date.now()}]}))} 
                handleDeleteSecretary={handleDeleteSecretaryAsync} 
                handleRxFileUpload={handleRxFileUpload} handleRemoveRxBg={handleRemoveRxBg} 
                handleImportData={async (e, m) => { const imp = await storageService.importBackup(e.target.files![0]); if(imp) { if(m==='replace') setData(mergeDataWithLocalPrefs({...imp, settings: {...imp.settings, isLoggedIn: true}})); else setData(p => ({...p, patients: [...p.patients, ...imp.patients], lastUpdated: Date.now()})); alert('Done'); } }} 
                syncStatus={syncStatus} deferredPrompt={deferredPrompt} handleInstallApp={handleInstallApp} openConfirm={openConfirm} currentLang={deviceLang} setDeviceLang={setDeviceLang} 
                currentTheme={activeThemeId === 'classic' ? 'light' : 'dark'} 
                setLocalTheme={(t) => setActiveThemeId(t === 'dark' ? 'dark-pro' : 'classic')} 
                activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId} activeDoctorId={activeDoctorId} activeSecretaryId={activeSecretaryId} deviceScale={deviceScale} setDeviceScale={setDeviceScale} 
                onLinkDrive={handleLinkDrive} onUpdateSettings={handleUpdateSettings}
             />}
         </div>
      </main>

      <PrintLayouts t={currentT} data={data} activePatient={activePatient} printingRx={printingRx} setPrintingRx={setPrintingRx} printingPayment={printingPayment} setPrintingPayment={setPrintingPayment} printingAppointment={printingAppointment} setPrintingAppointment={setPrintingAppointment} printingExamination={printingExamination} setPrintingExamination={setPrintingExamination} printingDocument={printingDocument} setPrintingDocument={setPrintingDocument} currentLang={deviceLang} isRTL={isRTL} />
      
      <PatientModal 
        show={showNewPatientModal || showEditPatientModal} 
        onClose={() => { if(!isProcessingPatient) { setShowNewPatientModal(false); setShowEditPatientModal(false); } }} 
        t={currentT} 
        isRTL={isRTL} 
        currentLang={deviceLang} 
        data={data} 
        handleAddPatient={handleAddPatientAsync} 
        updatePatient={updatePatientAsync} 
        guestToConvert={guestToConvert} 
        activePatient={showEditPatientModal ? activePatient : null} 
        setSelectedPatientId={handleOpenPatient} 
        setCurrentView={setCurrentView} 
        setPatientTab={setPatientTab} 
        activeDoctorId={activeDoctorId} 
        isSaving={isProcessingPatient}
        error={opError}
      />
      
      <PaymentModal 
        show={showPaymentModal} 
        onClose={() => { if(!isProcessingFinance) setShowPaymentModal(false); }} 
        t={currentT} 
        activePatient={activePatient} 
        paymentType={paymentType} 
        data={data} 
        selectedPayment={selectedPayment}
        handleSavePayment={(p: any, isEdit: boolean) => handleSavePaymentAsync(activePatient!.id, p, isEdit)} 
        currentLang={deviceLang} 
        isSaving={isProcessingFinance} 
        error={opError} 
      />

      <AppointmentModal show={showAppointmentModal} onClose={() => { if(!isProcessingAppt) { setShowAppointmentModal(false); setApptPatientId(null); } }} t={currentT} selectedAppointment={selectedAppointment} appointmentMode={appointmentMode} setAppointmentMode={setAppointmentMode} selectedPatientId={apptPatientId || (selectedPatientId && currentView === 'patients' ? selectedPatientId : null)} data={data} currentDate={currentDate} handleAddAppointment={handleSaveAppointmentAsync} isRTL={isRTL} currentLang={deviceLang} isSaving={isProcessingAppt} error={opError} />
      <AddMasterDrugModal show={showAddMasterDrugModal} onClose={() => setShowAddMasterDrugModal(false)} t={currentT} data={data} setData={setData} handleManageMedications={(m: any, a: any) => updateAndSync(p => ({...p, medications: a === 'add' ? [...p.medications, {...m, id: generateId(), updatedAt: Date.now()}] : p.medications.map(x=>x.id===m.id?{...m,updatedAt:Date.now()}:x)}))} handleDeleteMasterDrug={(id) => updateAndSync(p => ({...p, medications: p.medications.filter(x => x.id !== id), deletedIds: [...(p.deletedIds || []), id]}))} currentLang={deviceLang} openConfirm={openConfirm} />
      <MemoModal show={showMemoModal} onClose={() => setShowMemoModal(false)} t={currentT} selectedMemo={selectedMemo} memoType={memoType} setMemoType={setMemoType} tempTodos={tempTodos} setTempTodos={setTempTodos} handleSaveMemo={handleSaveMemo} currentLang={deviceLang} />
      <SupplyModal show={showSupplyModal} onClose={() => setShowSupplyModal(false)} t={currentT} selectedSupply={selectedSupply} handleSaveSupply={async (n: any, q: any, pr: any) => { const ts = Date.now(); await updateAndSync(p => ({...p, supplies: selectedSupply ? p.supplies.map(x=>x.id===selectedSupply.id?{...x,name:n,quantity:q,price:pr,updatedAt:ts}:x) : [{id:generateId(),name:n,quantity:q,price:pr,updatedAt:ts},...p.supplies]})); }} currentLang={deviceLang} />
      <InventoryModal show={showInventoryModal} onClose={() => setShowInventoryModal(false)} t={currentT} selectedItem={selectedInventoryItem} handleSaveItem={async (i: any) => { const ts = Date.now(); await updateAndSync(p => ({...p, inventory: selectedInventoryItem ? p.inventory.map(x=>x.id===selectedInventoryItem.id?{...x,...i,updatedAt:ts}:x) : [{...i,id:generateId(),updatedAt:ts},...p.inventory]})); }} currentLang={deviceLang} />
      <ExpenseModal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} t={currentT} selectedExpense={selectedExpense} handleSaveExpense={async (n: any, q: any, pr: any, d: any) => { const ts = Date.now(); await updateAndSync(p => ({...p, expenses: selectedExpense ? p.expenses.map(x=>x.id===selectedExpense.id?{...x,name:n,quantity:q,price:pr,date:d,updatedAt:ts}:x) : [{id:generateId(),name:n,quantity:q,price:pr,date:d,updatedAt:ts},...p.expenses]})); }} currentLang={deviceLang} />
      <LabOrderModal show={showLabOrderModal} onClose={() => setShowLabOrderModal(false)} t={currentT} data={data} selectedLabOrder={selectedLabOrder} handleSaveLabOrder={async (o: any) => { const ts = Date.now(); await updateAndSync(p => ({...p, labOrders: selectedLabOrder ? p.labOrders.map(x=>x.id===selectedLabOrder.id?{...x,...o,updatedAt:ts}:x) : [{...o,id:generateId(),updatedAt:ts},...p.labOrders]})); }} currentLang={deviceLang} />
      
      <PrescriptionModal 
        show={showRxModal} 
        onClose={() => { if(!isProcessingRx) setShowRxModal(false); }} 
        t={currentT} 
        data={data} 
        patient={activePatient} 
        currentLang={deviceLang} 
        isRTL={isRTL} 
        handleSave={handleSaveRxAsync} 
        isSaving={isProcessingRx}
      />
    </div>
  );
}
