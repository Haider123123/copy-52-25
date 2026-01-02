
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, Search, Trash2, Pill, WifiOff, LayoutDashboard, RefreshCw, AlertCircle, CloudCheck, Cloud } from 'lucide-react';
import { ClinicData, Doctor, Secretary, Patient, Appointment, Payment, Tooth, RootCanalEntry, Memo, Prescription, Medication, SupplyItem, ExpenseItem, TodoItem, ToothSurfaces, LabOrder, InventoryItem, ToothNote, Language, MemoStyle, Examination } from './types';
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
import { SupplyModal, MemoModal, PatientModal, PaymentModal, AppointmentModal, AddMasterDrugModal, ExpenseModal, LabOrderModal, InventoryModal } from './components/AppModals';
import { ProfileSelector } from './components/ProfileSelector';
import { isSameDay, isSameWeek, isSameMonth, addDays } from 'date-fns';
import { Logo } from './components/Logo';
import { THEMES } from './constants';
import { hexToRgb } from './utils';

export default function App() {
  const [data, setData] = useState<ClinicData>(INITIAL_DATA);
  const [appState, setAppState] = useState<'landing' | 'auth' | 'profile_select' | 'app' | 'loading'>('loading');
  const [onboardingStep, setOnboardingStep] = useState(0); 
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
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  const [apptPatientId, setApptPatientId] = useState<string | null>(null);

  const [patientTab, setPatientTab] = useState<'overview' | 'chart' | 'visits' | 'finance' | 'prescriptions' | 'documents'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'payment' | 'charge'>('payment'); 
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
  const [newRxMeds, setNewRxMeds] = useState<Medication[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [medForm, setMedForm] = useState<Partial<Medication>>({});
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

  // PWA Install logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      // Log install to analytics or clear the deferred prompt
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    const currentT = LABELS[deviceLang];
    if (!deferredPrompt) {
        // If app is already installed or prompt is not ready, give manual info
        alert(currentT.installManualInfo);
        return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  // Improved Updater that commits to LocalStorage immediately
  const updateLocalData = (updater: (prev: ClinicData) => ClinicData) => {
      setData(prev => {
          const next = updater(prev);
          const updatedNext = { ...next, lastUpdated: isInitialLoading ? prev.lastUpdated : Date.now() };
          // Persist to disk instantly to prevent race conditions during cloud polling
          storageService.saveData(updatedNext);
          return updatedNext;
      });
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

  // Initial Boot Logic
  useEffect(() => {
    const initApp = async () => {
      const localData = storageService.loadData();
      if (localData && localData.clinicName) {
        setData(mergeDataWithLocalPrefs(localData));
      }

      const user = await supabaseService.getUser();
      if (!user) {
        setAppState('landing');
        setIsInitialLoading(false);
        return;
      }

      const syncWithCloud = async () => {
        try {
          const cloudData = await Promise.race([
            supabaseService.loadData(),
            new Promise((_, reject) => setTimeout(() => reject('Sync Timeout'), 6000))
          ]) as ClinicData | null;

          if (cloudData) {
            const currentLocal = storageService.loadData();
            // Only merge if cloud is strictly newer than what we have on disk
            if (!currentLocal || (cloudData.lastUpdated || 0) > (currentLocal.lastUpdated || 0)) {
                const merged = mergeDataWithLocalPrefs(cloudData);
                setData(merged);
                storageService.saveData(merged);
            }
          }
        } catch (e) {
          console.warn("Initial sync failed or timed out, proceeding with local data.", e);
        } finally {
          const currentData = storageService.loadData();
          if (currentData && currentData.clinicName) {
            const savedProfileType = localStorage.getItem('dentro_profile_type');
            const savedDocId = localStorage.getItem('dentro_active_profile');
            const savedSecId = localStorage.getItem('dentro_active_secretary');

            if (savedProfileType === 'doctor' && savedDocId) {
                setActiveDoctorId(savedDocId);
                setAppState('app');
            } else if (savedProfileType === 'secretary' && savedSecId) {
                setActiveSecretaryId(savedSecId);
                setAppState('app');
                setCurrentView('patients');
            } else if (savedProfileType === 'admin') {
                setActiveDoctorId(null);
                setActiveSecretaryId(null);
                setAppState('app');
            } else {
                setAppState('profile_select');
            }
          } else {
            setAppState('app');
          }
          setIsInitialLoading(false);
        }
      };

      syncWithCloud();
    };

    initApp();
  }, []);

  useEffect(() => {
    if (appState !== 'app' && appState !== 'profile_select') return;
    if (!navigator.onLine) return;

    const checkSecurity = async () => {
      const lastCheck = localStorage.getItem('dentro_last_security_check');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (!lastCheck || (now - parseInt(lastCheck)) > oneDay) {
        const { exists, error } = await supabaseService.checkAccountStatus();
        if (!exists && !error) {
          performFullLogout();
        } else if (!error) {
          localStorage.setItem('dentro_last_security_check', now.toString());
        }
      }
    };

    checkSecurity();
  }, [appState]);

  useEffect(() => {
    googleDriveService.init(() => console.log("Google Drive System Ready"));
  }, []);

  useEffect(() => {
      const applyTheme = (themeId: string) => {
          const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
          const root = document.documentElement;
          root.style.setProperty('--primary-rgb', hexToRgb(theme.colors.primary));
          root.style.setProperty('--secondary-rgb', hexToRgb(theme.colors.secondary));
          root.style.setProperty('--bg-color', theme.colors.bg);
          if (theme.type === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
          localStorage.setItem('dentro_theme_id', themeId);
          setData(prev => ({ ...prev, settings: { ...prev.settings, theme: theme.type } }));
      };
      applyTheme(activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    (document.body.style as any).zoom = `${deviceScale}%`;
    localStorage.setItem('dentro_device_scale', deviceScale.toString());
  }, [deviceScale]);

  const toggleLocalTheme = (mode: 'light' | 'dark') => {
      if (mode === 'dark') setActiveThemeId('dark-pro'); else setActiveThemeId('classic');
  };

  const currentThemeMode = THEMES.find(t => t.id === activeThemeId)?.type || 'light';
  const isBackNav = useRef(false);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; confirmLabel?: string; cancelLabel?: string;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const openConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => {
    setConfirmState({ isOpen: true, title, message, onConfirm, confirmLabel, cancelLabel });
  };

  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));
  const currentLang = appState === 'landing' ? landingLang : deviceLang;
  const t = LABELS[currentLang];
  const isRTL = currentLang === 'ar' || currentLang === 'ku';

  const filteredData = React.useMemo(() => {
      if (activeDoctorId) return { ...data, patients: data.patients.filter(p => p.doctorId === activeDoctorId) };
      return data;
  }, [data, activeDoctorId]);

  const isSecretary = !!activeSecretaryId;

  useEffect(() => {
      if (appState === 'app' || appState === 'profile_select' || appState === 'auth') {
          localStorage.setItem('dentro_device_lang', deviceLang);
          setData(prev => ({ ...prev, settings: { ...prev.settings, language: deviceLang } }));
      }
  }, [deviceLang, appState]);

  useEffect(() => {
    if (appState !== 'app') return;
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        isBackNav.current = true;
        if (event.state.view) setCurrentView(event.state.view);
        if (event.state.calendarView) setCalendarView(event.state.calendarView);
        if (event.state.date) setCurrentDate(new Date(event.state.date));
        setSelectedPatientId(event.state.patientId);
        if (event.state.patientTab) setPatientTab(event.state.patientTab);
        if (event.state.category) setSelectedCategory(event.state.category);
        setShowNewPatientModal(false); setShowEditPatientModal(false); setShowAppointmentModal(false); setShowPaymentModal(false); setShowMemoModal(false); setShowRxModal(false); setShowSupplyModal(false); setShowExpenseModal(false); setShowAddMasterDrugModal(false); setShowLabOrderModal(false); setShowInventoryModal(false); setSidebarOpen(false); setConfirmState(prev => ({ ...prev, isOpen: false })); setGuestToConvert(null); setSelectedAppointment(null); setSelectedMemo(null); setSelectedSupply(null); setSelectedExpense(null); setSelectedLabOrder(null); setSelectedInventoryItem(null); setPrintingRx(null); setPrintingPayment(null); setPrintingAppointment(null); setPrintingDocument(null); setPrintingExamination(null);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [appState]);

  useEffect(() => {
    if (appState !== 'app' || isBackNav.current) { isBackNav.current = false; return; }
    window.history.pushState({ view: currentView, patientId: selectedPatientId, patientTab: patientTab, category: selectedCategory, calendarView: calendarView, date: currentDate.toISOString() }, '');
  }, [currentView, selectedPatientId, patientTab, selectedCategory, calendarView, currentDate, appState]);

  const handleManualSync = async (force: boolean = false) => {
      if (!navigator.onLine || !data.settings.isLoggedIn || (syncStatus === 'syncing' && !force)) return;
      setSyncStatus('syncing');
      try {
          const cloudData = await supabaseService.loadData();
          if (cloudData) {
              const localData = storageService.loadData();
              if ((cloudData.lastUpdated || 0) > (localData?.lastUpdated || 0)) {
                  const merged = mergeDataWithLocalPrefs(cloudData);
                  setData(merged); storageService.saveData(merged); setSyncStatus('synced'); return true;
              } else { setSyncStatus('synced'); return true; }
          }
          setSyncStatus('syncing'); return true;
      } catch (e) { setSyncStatus('error'); return false; }
  };

  const forceSyncToCloud = async (overrideData?: ClinicData) => {
      const dataToSave = overrideData || data;
      if (!navigator.onLine || !dataToSave.settings.isLoggedIn) return;
      setSyncStatus('syncing');
      try {
          await supabaseService.saveData(dataToSave); setSyncStatus('synced');
          setData(prev => ({ ...prev, lastSynced: new Date().toISOString() }));
      } catch (e) { setSyncStatus('error'); }
  };

  useEffect(() => {
      if (!data.settings.isLoggedIn || !navigator.onLine || isInitialLoading) return;
      const pollInterval = setInterval(() => handleManualSync(), 60000); 
      const onFocus = () => handleManualSync();
      window.addEventListener('focus', onFocus);
      return () => { clearInterval(pollInterval); window.removeEventListener('focus', onFocus); };
  }, [data.settings.isLoggedIn, data.lastUpdated, isInitialLoading]);

  // Cloud pushing with debounce. (Redundant localStorage call removed as it's now immediate)
  useEffect(() => {
    if (!data.settings.isLoggedIn || isInitialLoading) return;
    const timer = setTimeout(async () => {
        if (navigator.onLine) {
            setSyncStatus('syncing');
            try { await supabaseService.saveData(data); setSyncStatus('synced'); } catch (e) { setSyncStatus('error'); }
        } else setSyncStatus('offline');
    }, 2000); 
    return () => clearTimeout(timer);
  }, [data, isInitialLoading]);

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault(); setAuthLoading(true); setAuthError('');
      try {
          const result = await supabaseService.signIn(loginEmail, loginPassword);
          if (result.error) setAuthError(result.error.message); else {
              const cloudData = await supabaseService.loadData();
              if (cloudData) {
                const newData = mergeDataWithLocalPrefs(cloudData); newData.settings.isLoggedIn = true;
                setData(newData); storageService.saveData(newData); setIsInitialLoading(false); 
                const existingLang = localStorage.getItem('dentro_device_lang'); if (!existingLang) { setDeviceLang(landingLang); localStorage.setItem('dentro_device_lang', landingLang); } else setDeviceLang(existingLang as Language);
                if (cloudData.clinicName) setAppState('profile_select'); else { setOnboardingStep(0); setAppState('app'); }
              }
          }
      } catch (err: any) { setAuthError(err.message || 'Authentication failed'); } finally { setAuthLoading(false); }
  };

  const handleProfileSelection = (type: 'admin' | 'doctor' | 'secretary', id?: string) => {
      if (type === 'admin') { 
          setActiveDoctorId(null); setActiveSecretaryId(null); 
          localStorage.setItem('dentro_profile_type', 'admin'); localStorage.removeItem('dentro_active_profile'); localStorage.removeItem('dentro_active_secretary'); 
          setAppState('app'); 
      }
      else if (type === 'doctor' && id) { 
          setActiveDoctorId(id); setActiveSecretaryId(null); 
          localStorage.setItem('dentro_profile_type', 'doctor'); localStorage.setItem('dentro_active_profile', id); localStorage.removeItem('dentro_active_secretary'); 
          setAppState('app'); 
      }
      else if (type === 'secretary' && id) { 
          setActiveSecretaryId(id); setActiveDoctorId(null); 
          localStorage.setItem('dentro_profile_type', 'secretary'); localStorage.setItem('dentro_active_secretary', id); localStorage.removeItem('dentro_active_profile'); 
          setAppState('app'); setCurrentView('patients'); 
      }
  };

  const handleClinicNameSubmit = (name: string) => { updateLocalData(prev => ({ ...prev, clinicName: name })); setAppState('profile_select'); };
  const handleAddDoctorSetup = (name: string) => { if(!name.trim()) return; const newDoc: Doctor = { id: Date.now().toString(), name }; updateLocalData(prev => ({ ...prev, doctors: [...prev.doctors, newDoc] })); };
  const handleAddDoctorFull = (name: string, username?: string, password?: string) => { if(!name.trim()) return; const newDoc: Doctor = { id: Date.now().toString(), name, username, password }; updateLocalData(prev => ({ ...prev, doctors: [...prev.doctors, newDoc] })); };
  
  const handleUpdateDoctor = (id: string, updates: Partial<Doctor>, forceLogout: boolean = false) => {
    updateLocalData(prev => ({ 
        ...prev, 
        doctors: prev.doctors.map(d => d.id === id ? { ...d, ...updates } : d) 
    }));
    
    // Logic to jump to profile selector if forceLogout is requested AND this doctor is the current profile
    if (forceLogout && (activeDoctorId === id)) {
        setActiveDoctorId(null);
        localStorage.removeItem('dentro_profile_type');
        localStorage.removeItem('dentro_active_profile');
        setAppState('profile_select');
    }
  };

  const handleDeleteDoctor = (id: string, deletePatients: boolean = false) => updateLocalData(prev => ({ ...prev, doctors: prev.doctors.filter(d => d.id !== id), patients: deletePatients ? prev.patients.filter(p => p.doctorId !== id) : prev.patients }));
  const handleAddSecretary = (name: string, username: string, password?: string) => { if (!name.trim()) return; if (data.secretaries.length >= 4) { alert(t.maxSecretaries); return; } const newSec: Secretary = { id: Date.now().toString(), name, username, password: password || '123456' }; updateLocalData(prev => ({ ...prev, secretaries: [...(prev.secretaries || []), newSec] })); };
  const handleDeleteSecretary = (id: string) => updateLocalData(prev => ({ ...prev, secretaries: (prev.secretaries || []).filter(s => s.id !== id) }));
  const handleFinishSetup = () => setAppState('app');
  const performFullLogout = async () => { 
    await supabaseService.signOut(); 
    const newData = { ...data, settings: { ...data.settings, isLoggedIn: false }, lastUpdated: Date.now() }; 
    setData(newData); storageService.saveData(newData); 
    setLoginEmail(''); setLoginPassword(''); localStorage.clear();
    setAppState('landing'); 
  };

  const handleLogout = async () => { 
      if (activeDoctorId || activeSecretaryId || (!activeDoctorId && !activeSecretaryId && data.clinicName)) { 
          setActiveDoctorId(null); setActiveSecretaryId(null); 
          localStorage.removeItem('dentro_profile_type'); localStorage.removeItem('dentro_active_profile'); localStorage.removeItem('dentro_active_secretary'); 
          setAppState('profile_select'); return; 
      } await performFullLogout(); 
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    if (e.target.files?.[0]) {
      const imported = await storageService.importBackup(e.target.files[0]);
      if (imported) {
        if (mode === 'replace') { imported.settings.isLoggedIn = true; imported.lastUpdated = Date.now(); const merged = mergeDataWithLocalPrefs(imported); setData(merged); storageService.saveData(merged); }
        else { setData(prev => { const existingPatientIds = new Set(prev.patients.map(p => p.id)); const newPatients = imported.patients.filter(p => !existingPatientIds.has(p.id)); const next = { ...prev, patients: [...prev.patients, ...newPatients], lastUpdated: Date.now() }; storageService.saveData(next); return next; }); }
        alert(isRTL ? "تمت العملية بنجاح" : "Process completed successfully!"); setActiveDoctorId(null); setActiveSecretaryId(null); setAppState('profile_select'); 
      }
    }
  };

  const handleAddPatient = (patientData: any) => {
    const newPatient: Patient = { id: Date.now().toString(), name: patientData.name || 'New Patient', phone: patientData.phone || '', phoneCode: patientData.phoneCode || data.settings.defaultCountryCode, age: parseInt(patientData.age) || 0, gender: patientData.gender || 'male', category: patientData.category || 'other', medicalHistory: patientData.medicalHistory || '', status: 'pending', doctorId: activeDoctorId || patientData.doctorId || (data.doctors[0]?.id || ''), createdAt: new Date().toISOString(), teeth: {}, appointments: [], payments: [], examinations: [], notes: '', address: patientData.address, rootCanals: [], treatmentSessions: [], prescriptions: [], images: [] };
    if (guestToConvert) { newPatient.appointments.push({ ...guestToConvert, patientId: newPatient.id, patientName: newPatient.name }); updateLocalData(prev => ({ ...prev, patients: [newPatient, ...prev.patients], guestAppointments: (prev.guestAppointments || []).filter(a => a.id !== guestToConvert.id), settings: { ...prev.settings, defaultCountryCode: newPatient.phoneCode || prev.settings.defaultCountryCode } })); setGuestToConvert(null); }
    else updateLocalData(prev => ({ ...prev, patients: [newPatient, ...prev.patients], settings: { ...prev.settings, defaultCountryCode: newPatient.phoneCode || prev.settings.defaultCountryCode } }));
    setShowNewPatientModal(false); return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>, immediateSave: boolean = false) => {
    setData(prev => {
        const nextPatients = prev.patients.map(p => {
            if (p.id === id) {
                const updatedPatient = { ...p, ...updates };
                // If name changed, update it in all nested appointments too for data integrity
                if (updates.name && updates.name !== p.name) {
                    updatedPatient.appointments = updatedPatient.appointments.map(a => ({
                        ...a,
                        patientName: updates.name as string
                    }));
                }
                return updatedPatient;
            }
            return p;
        });

        const next = { 
            ...prev, 
            lastUpdated: isInitialLoading ? prev.lastUpdated : Date.now(), 
            patients: nextPatients 
        };
        // Commit to disk immediately
        storageService.saveData(next);
        if (immediateSave && !isInitialLoading) forceSyncToCloud(next);
        return next;
    });
  };

  const handleDeletePatient = (id: string) => { updateLocalData(prev => ({ ...prev, patients: prev.patients.filter(p => p.id !== id) })); setSelectedPatientId(null); };
  const handleUpdateTooth = (patientId: string, toothId: number, status: Tooth['status']) => { const patient = data.patients.find(p => p.id === patientId); if (!patient) return; const currentTooth = patient.teeth[toothId] || { id: toothId, status: 'healthy', surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } }; const newTeeth = { ...patient.teeth, [toothId]: { ...currentTooth, status } }; updatePatient(patientId, { teeth: newTeeth }); };
  const handleUpdateToothSurface = (patientId: string, toothId: number, surface: keyof ToothSurfaces | 'all', status: string) => { const patient = data.patients.find(p => p.id === patientId); if (!patient) return; const currentTooth = patient.teeth[toothId] || { id: toothId, status: 'healthy', surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } }; let newSurfaces = { ...(currentTooth.surfaces || { top:'none', bottom:'none', left:'none', right:'none', center:'none' }) }; if (surface === 'all') { const newColor = newSurfaces.center === status ? 'none' : status; newSurfaces = { top: newColor, bottom: newColor, left: newColor, right: newColor, center: newColor }; } else newSurfaces[surface] = newSurfaces[surface] === status ? 'none' : status; const newTeeth = { ...patient.teeth, [toothId]: { ...currentTooth, surfaces: newSurfaces } }; updatePatient(patientId, { teeth: newTeeth }); };
  const handleUpdateToothNote = (patientId: string, toothId: number, note: ToothNote) => { const patient = data.patients.find(p => p.id === patientId); if (!patient) return; const currentTooth = patient.teeth[toothId] || { id: toothId, status: 'healthy', surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } }; const newTeeth = { ...patient.teeth, [toothId]: { ...currentTooth, specialNote: note } }; updatePatient(patientId, { teeth: newTeeth }); };
  const handleUpdateHead = (patientId: string, region: string, status: string) => { const patient = patientId ? data.patients.find(p => p.id === patientId) : null; if (!patient) return; const newHeadMap = { ...(patient.headMap || {}), [region]: status }; updatePatient(patientId, { headMap: newHeadMap }); };
  const handleUpdateBody = (patientId: string, region: string, status: string) => { const patient = patientId ? data.patients.find(p => p.id === patientId) : null; if (!patient) return; const newBodyMap = { ...(patient.bodyMap || {}), [region]: status }; updatePatient(patientId, { bodyMap: newBodyMap }); };
  const handleAddPayment = (patientId: string, amount: number, type: 'payment' | 'charge', description: string) => { const patient = data.patients.find(p => p.id === patientId); if (!patient) return; const newPayment: Payment = { id: Date.now().toString(), date: new Date().toISOString(), amount, type, description }; updatePatient(patientId, { payments: [newPayment, ...patient.payments] }); setShowPaymentModal(false); };
  const handleAddAppointment = (patientId: string | null, apptData: Partial<Appointment>) => { const newApptId = selectedAppointment ? selectedAppointment.id : Date.now().toString(); if (patientId) { const patient = data.patients.find(p => p.id === patientId); if (patient) { if (selectedAppointment) { const updatedApps = patient.appointments.map(a => a.id === selectedAppointment.id ? { ...a, ...apptData } : a); updatePatient(patientId, { appointments: updatedApps }); } else { const newAppt: Appointment = { id: newApptId, patientId, patientName: patient.name, date: apptData.date!, time: apptData.time!, duration: apptData.duration, treatmentType: apptData.treatmentType, sessionNumber: apptData.sessionNumber, notes: apptData.notes, status: 'scheduled' }; updatePatient(patientId, { appointments: [...patient.appointments, newAppt] }); } } } else { if (selectedAppointment && selectedAppointment.patientId) return; const guestAppt: Appointment = { id: newApptId, patientId: '', patientName: apptData.patientName || 'Guest', date: apptData.date!, time: apptData.time!, duration: apptData.duration, treatmentType: apptData.treatmentType, sessionNumber: apptData.sessionNumber, notes: apptData.notes, status: 'scheduled' }; if (selectedAppointment) updateLocalData(prev => ({ ...prev, guestAppointments: prev.guestAppointments.map(a => a.id === selectedAppointment.id ? { ...a, ...apptData } : a) })); else updateLocalData(prev => ({ ...prev, guestAppointments: [...(prev.guestAppointments || []), guestAppt] })); } setShowAppointmentModal(false); setSelectedAppointment(null); setApptPatientId(null); };
  const handleDeleteAppointment = (patientId: string, appId: string) => { if (patientId) { const patient = data.patients.find(p => p.id === selectedPatientId); if(!patient) return; updatePatient(selectedPatientId!, { appointments: patient.appointments.filter(a => a.id !== appId) }); } else updateLocalData(prev => ({ ...prev, guestAppointments: prev.guestAppointments.filter(a => a.id !== appId) })); };
  const handleUpdateAppointmentStatus = (patientId: string, appId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'noshow') => { if (patientId) { const actualPatient = data.patients.find(p => p.id === patientId); if (!actualPatient) return; const updatedApps = actualPatient.appointments.map(a => a.id === appId ? { ...a, status } : a); updatePatient(patientId, { appointments: updatedApps }); } else updateLocalData(prev => ({ ...prev, guestAppointments: prev.guestAppointments.map(a => a.id === appId ? { ...a, status } : a) })); };
  const handleManageMedications = (medication: Medication, action: 'add' | 'update') => { if (action === 'add') { const newMed = { ...medication, id: Date.now().toString() }; updateLocalData(prev => ({ ...prev, medications: [...prev.medications, newMed] })); } else updateLocalData(prev => ({ ...prev, medications: prev.medications.map(m => m.id === medication.id ? medication : m) })); };
  const handleDeleteMasterDrug = (id: string) => updateLocalData(prev => ({ ...prev, medications: prev.medications.filter(m => m.id !== id) }));
  const handleDeleteRx = (rxId: string) => { const patient = data.patients.find(p => p.id === selectedPatientId); if(patient) updatePatient(selectedPatientId!, { prescriptions: patient.prescriptions.filter(r => r.id !== rxId) }); };
  const handleRxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { const base64String = reader.result as string; if (activeDoctorId) updateLocalData(prev => ({ ...prev, doctors: prev.doctors.map(d => d.id === activeDoctorId ? { ...d, rxBackgroundImage: base64String } : d) })); else updateLocalData(prev => ({ ...prev, settings: { ...prev.settings, rxBackgroundImage: base64String } })); }; reader.readAsDataURL(file); } };
  const handleAddRCT = (patientId: string, rct: Omit<RootCanalEntry, 'id'>) => { const patient = data.patients.find(p => p.id === patientId); if(!patient) return; const newRCT = { ...rct, id: Date.now().toString() }; updatePatient(patientId, { rootCanals: [...(patient.rootCanals || []), newRCT] }); };
  const handleDeleteRCT = (patientId: string, rctId: string) => { const patient = patientId ? data.patients.find(p => p.id === patientId) : null; if(!patient) return; updatePatient(patientId, { rootCanals: patient.rootCanals.filter(r => r.id !== rctId) }); };
  const handleSaveMemo = (title: string, content: string, color: string, type: 'text'|'todo' = 'text', todos: TodoItem[], style?: MemoStyle) => { if (selectedMemo) updateLocalData(prev => ({ ...prev, memos: prev.memos.map(m => m.id === selectedMemo.id ? { ...m, title, content, color, type, todos, style } : m) })); else { const newMemo: Memo = { id: Date.now().toString(), title, content, color, type, todos, date: new Date().toISOString(), style }; updateLocalData(prev => ({ ...prev, memos: [newMemo, ...(prev.memos || [])] })); } setShowMemoModal(false); setSelectedMemo(null); setMemoType(null); };
  const handleDeleteMemo = (id: string) => updateLocalData(prev => ({ ...prev, memos: prev.memos.filter(m => m.id !== id) }));
  const handleSaveSupply = (name: string, quantity: number, price: number) => { if (selectedSupply) updateLocalData(prev => ({ ...prev, supplies: prev.supplies.map(s => s.id === selectedSupply.id ? { ...s, name, quantity, price } : s) })); else { const newItem: SupplyItem = { id: Date.now().toString(), name, quantity, price }; updateLocalData(prev => ({ ...prev, supplies: [newItem, ...(prev.supplies || [])] })); } setShowSupplyModal(false); setSelectedSupply(null); };
  const handleDeleteSupply = (id: string) => updateLocalData(prev => ({ ...prev, supplies: prev.supplies.filter(s => s.id !== id) }));
  const handleSaveInventoryItem = (item: Partial<InventoryItem>) => { if (selectedInventoryItem) updateLocalData(prev => ({ ...prev, inventory: (prev.inventory || []).map(i => i.id === selectedInventoryItem.id ? { ...i, ...item } as InventoryItem : i) })); else { const newItem: InventoryItem = { id: Date.now().toString(), name: item.name!, quantity: item.quantity!, minQuantity: item.minQuantity!, price: item.price, expiryDate: item.expiryDate, color: item.color || 'blue' }; updateLocalData(prev => ({ ...prev, inventory: [newItem, ...(prev.inventory || [])] })); } setShowInventoryModal(false); setSelectedInventoryItem(null); };
  const handleDeleteInventoryItem = (id: string) => updateLocalData(prev => ({ ...prev, inventory: (prev.inventory || []).filter(i => i.id !== id) }));
  const handleConvertToExpense = (item: SupplyItem) => { const expense: ExpenseItem = { id: Date.now().toString(), name: item.name, quantity: item.quantity, price: item.price || 0, date: new Date().toISOString() }; updateLocalData(prev => ({ ...prev, expenses: [expense, ...(prev.expenses || [])], supplies: prev.supplies.filter(s => s.id !== item.id) })); };
  const handleSaveExpense = (name: string, quantity: number, price: number, date: string) => { if (selectedExpense) updateLocalData(prev => ({ ...prev, expenses: (prev.expenses || []).map(e => e.id === selectedExpense.id ? { ...e, name, quantity, price, date } : e) })); else { const newItem: ExpenseItem = { id: Date.now().toString(), name, quantity, price, date }; updateLocalData(prev => ({ ...prev, expenses: [newItem, ...(prev.expenses || [])] })); } setShowExpenseModal(false); setSelectedExpense(null); };
  const handleDeleteExpense = (id: string) => updateLocalData(prev => ({ ...prev, expenses: (prev.expenses || []).filter(e => e.id !== id) }));
  const handleSaveLabOrder = (order: Partial<LabOrder>) => { if (selectedLabOrder) updateLocalData(prev => ({ ...prev, labOrders: (prev.labOrders || []).map(o => o.id === selectedLabOrder.id ? { ...o, ...order, patientName: order.patientName || o.patientName, patientId: order.patientId || o.patientId } as LabOrder : o), labs: order.labName && !prev.labs.includes(order.labName) ? [...prev.labs, order.labName] : prev.labs })); else { const newOrder: LabOrder = { id: Date.now().toString(), patientId: order.patientId!, patientName: order.patientName!, labName: order.labName!, workType: order.workType!, toothCount: order.toothCount, toothNumbers: order.toothNumbers, shade: order.shade, price: order.price, sentDate: order.sentDate || new Date().toISOString(), status: order.status || 'in_progress' as any, notes: order.notes }; updateLocalData(prev => ({ ...prev, labOrders: [newOrder, ...(prev.labOrders || [])], labs: order.labName && !prev.labs.includes(order.labName) ? [...prev.labs, order.labName] : prev.labs })); } setShowLabOrderModal(false); setSelectedLabOrder(null); };
  const handleDeleteLabOrder = (id: string) => updateLocalData(prev => ({ ...prev, labOrders: (prev.labOrders || []).filter(o => o.id !== id) }));
  const handleUpdateLabOrderStatus = (id: string, status: LabOrder['status']) => updateLocalData(prev => ({ ...prev, labOrders: (prev.labOrders || []).map(o => o.id === id ? { ...o, status } : o) }));
  const handleAddMedToRx = () => { const nameToUse = medSearch || medForm.name; if(!nameToUse) return; const newMed: Medication = { id: Date.now().toString(), name: nameToUse, dose: medForm.dose || '', frequency: medForm.frequency || '', form: medForm.form || '', notes: medForm.notes || '' }; setNewRxMeds([...newRxMeds, newMed]); setMedForm({}); setMedSearch(''); };
  const handleRemoveMedFromRx = (index: number) => { const list = [...newRxMeds]; list.splice(index, 1); setNewRxMeds(list); };
  const handleSaveRx = () => { if (newRxMeds.length === 0) return; const patient = data.patients.find(p => p.id === selectedPatientId); if(patient) { const newRx: Prescription = { id: Date.now().toString(), date: new Date().toISOString(), medications: newRxMeds }; updatePatient(selectedPatientId!, { prescriptions: [newRx, ...patient.prescriptions] }); } setShowRxModal(false); setNewRxMeds([]); };
  const handleGoogleDriveLink = async () => { try { const accessToken = await googleDriveService.login(); if (accessToken) { const rootId = await googleDriveService.ensureRootFolder(); updateLocalData(prev => ({ ...prev, settings: { ...prev.settings, googleDriveLinked: true, googleDriveRootId: rootId } })); alert(isRTL ? "تم ربط جوجل درايف بنجاح" : "Google Drive linked successfully!"); } } catch (e: any) { alert(t.errorDrive || "Failed to connect. Please try again."); } };
  
  const handleQuickBook = (patientId: string) => { setApptPatientId(patientId); setSelectedAppointment(null); setAppointmentMode('existing'); setShowAppointmentModal(true); };

  const allAppointments = [ 
    ...data.patients.flatMap(p => p.appointments.map(a => ({
        ...a, 
        patientName: p.name, // Force always using the current patient name from the main record
        patient: p
    }))), 
    ...(data.guestAppointments || []).map(a => ({...a, patient: null as Patient | null})) 
  ];
  const activePatient = selectedPatientId ? data.patients.find(p => p.id === selectedPatientId) : null;

  if (appState === 'loading' || isInitialLoading) { return ( <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 animate-fade-in"> <div className="flex items-center justify-center mb-6 animate-scale-up"> <Logo className="w-24 h-24" /> </div> <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-white dark:to-gray-300 mb-2">Dentro</h1> <p className="text-gray-400 dark:text-gray-500 text-sm font-medium tracking-wide uppercase mb-8">Clinic Management System</p> {isInitialLoading && data.settings.isLoggedIn && ( <div className="flex flex-col items-center gap-4 mb-6"> <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in"> <RefreshCw size={18} className="animate-spin text-primary-600" /> <span className="text-sm font-bold text-gray-700 dark:text-gray-300 font-cairo"> {t.syncOnLoad} </span> </div> </div> )} <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"> <div className="h-full bg-primary-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full"></div> </div> </div> ) }
  if (appState === 'landing') return <LandingPage setAppState={setAppState} landingLang={landingLang} setLandingLang={setLandingLang} isRTL={isRTL} />;
  if (appState === 'auth') return <AuthScreen t={t} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} authLoading={authLoading} authError={authError} handleAuth={handleAuth} setAppState={setAppState} />;
  if (appState === 'profile_select') return <ProfileSelector t={t} data={data} loginPassword={loginPassword} currentLang={currentLang} isRTL={isRTL} onSelectAdmin={(pass) => { handleProfileSelection('admin'); }} onSelectDoctor={(id, pass) => { handleProfileSelection('doctor', id); }} onSelectSecretary={(id, pass) => { handleProfileSelection('secretary', id); }} onLogout={performFullLogout} syncStatus={syncStatus} />;
  if (!data.settings.isLoggedIn || !data.clinicName) return ( <> <ConfirmationModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={() => { confirmState.onConfirm(); closeConfirm(); }} onCancel={closeConfirm} lang={currentLang} confirmLabel={confirmState.confirmLabel} cancelLabel={confirmState.cancelLabel} /> <ClinicSetup t={t} data={data} setData={setData} onboardingStep={onboardingStep} setOnboardingStep={setOnboardingStep} handleClinicNameSubmit={handleClinicNameSubmit} handleAddDoctor={handleAddDoctorSetup} handleDeleteDoctor={handleDeleteDoctor} handleFinishSetup={handleFinishSetup} isRTL={isRTL} openConfirm={openConfirm} /> </> );

  return (
    <div className={`min-h-screen flex bg-page-bg font-${isRTL ? 'cairo' : 'sans'} leading-relaxed overflow-hidden transition-colors duration-300`} dir={isRTL ? 'rtl' : 'ltr'}>
      <ConfirmationModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={() => { confirmState.onConfirm(); closeConfirm(); }} onCancel={closeConfirm} lang={currentLang} confirmLabel={confirmState.confirmLabel} cancelLabel={confirmState.cancelLabel} />
      <Sidebar t={t} data={data} currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} setSelectedPatientId={setSelectedPatientId} handleLogout={handleLogout} isRTL={isRTL} isSecretary={isSecretary} handleManualSync={handleManualSync} syncStatus={syncStatus} />
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
         {syncStatus === 'error' && navigator.onLine && ( <div className="bg-orange-50 text-white p-2 text-center text-xs font-bold animate-fade-in flex items-center justify-center gap-2"> <AlertCircle size={14} /> <span>{isRTL ? 'هناك تعديلات لم تُرفع بعد، سنحاول رفعها قريباً' : 'Some changes are not synced yet, retrying...'}</span> </div> )}
         <div className="lg:hidden p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30"> <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300"> <Menu /> </button> <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2"> {data.clinicName} {activeDoctorId && ( <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full"> {data.doctors.find(d => d.id === activeDoctorId)?.name} </span> )} {activeSecretaryId && ( <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full"> {t.secretaryProfile} </span> )} {isOffline && ( <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1"> <WifiOff size={10} /> Offline </span> )} </div> </div>
         <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto">
             {currentView === 'dashboard' && !isSecretary && ( <DashboardView t={t} data={data} allAppointments={allAppointments} setData={setData} activeDoctorId={activeDoctorId} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} /> )}
             {currentView === 'patients' && !selectedPatientId && ( <PatientsView t={t} data={filteredData} isRTL={isRTL} currentLang={currentLang} setSelectedPatientId={setSelectedPatientId} setPatientTab={setPatientTab} setCurrentView={setCurrentView} setShowNewPatientModal={setShowNewPatientModal} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddAppointment={handleQuickBook} /> )}
             {currentView === 'patients' && selectedPatientId && activePatient && ( <PatientDetails t={t} data={data} setData={setData} activePatient={activePatient} patientTab={patientTab} setPatientTab={setPatientTab} setSelectedPatientId={setSelectedPatientId} currentLang={currentLang} isRTL={isRTL} updatePatient={updatePatient} handleDeletePatient={handleDeletePatient} handleUpdateTooth={handleUpdateTooth} handleUpdateToothSurface={handleUpdateToothSurface} handleUpdateToothNote={handleUpdateToothNote} handleUpdateHead={handleUpdateHead} handleUpdateBody={handleUpdateBody} handleAddRCT={handleAddRCT} handleDeleteRCT={handleDeleteRCT} handleDeleteAppointment={handleDeleteAppointment} handleUpdateAppointmentStatus={handleUpdateAppointmentStatus} handleDeleteRx={handleDeleteRx} setPrintingRx={setPrintingRx} setPrintingPayment={setPrintingPayment} setPrintingAppointment={setPrintingAppointment} setPrintingExamination={setPrintingExamination} handleRxFileUpload={handleRxFileUpload} setShowEditPatientModal={setShowEditPatientModal} setShowAppointmentModal={setShowAppointmentModal} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} setShowPaymentModal={setShowPaymentModal} setPaymentType={setPaymentType} setShowRxModal={setShowRxModal} setShowAddMasterDrugModal={setShowAddMasterDrugModal} openConfirm={openConfirm} setPrintingDocument={setPrintingDocument} isSecretary={isSecretary} /> )}
             {currentView === 'calendar' && ( <CalendarView t={t} data={data} currentLang={currentLang} isRTL={isRTL} calendarView={calendarView} setCalendarView={setCalendarView} currentDate={currentDate} setCurrentDate={setCurrentDate} filteredAppointments={allAppointments} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} setShowAppointmentModal={setShowAppointmentModal} handleUpdateAppointmentStatus={handleUpdateAppointmentStatus} handleDeleteAppointment={handleDeleteAppointment} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} setGuestToConvert={setGuestToConvert} setShowNewPatientModal={setShowNewPatientModal} openConfirm={openConfirm} setData={setData} activeDoctorId={activeDoctorId} isSecretary={isSecretary} /> )}
             {currentView === 'memos' && ( <MemosView t={t} data={data} setSelectedMemo={setSelectedMemo} setShowMemoModal={setShowMemoModal} setMemoType={setMemoType} setTempTodos={setTempTodos} handleDeleteMemo={handleDeleteMemo} currentLang={currentLang} openConfirm={openConfirm} /> )}
             {currentView === 'purchases' && ( <PurchasesView t={t} data={data} setSelectedSupply={setSelectedSupply} setShowSupplyModal={setShowSupplyModal} handleConvertToExpense={handleConvertToExpense} handleDeleteSupply={handleDeleteSupply} openConfirm={openConfirm} /> )}
             {currentView === 'inventory' && ( <InventoryView t={t} data={data} setSelectedInventoryItem={setSelectedInventoryItem} setShowInventoryModal={setShowInventoryModal} handleDeleteInventoryItem={handleDeleteInventoryItem} openConfirm={openConfirm} /> )}
             {currentView === 'expenses' && ( <ExpensesView t={t} data={data} setData={setData} setSelectedExpense={setSelectedExpense} setShowExpenseModal={setShowExpenseModal} handleDeleteExpense={handleDeleteExpense} openConfirm={openConfirm} /> )}
             {currentView === 'labOrders' && ( <LabOrdersView t={t} data={data} setData={setData} setSelectedLabOrder={setSelectedLabOrder} setShowLabOrderModal={setShowLabOrderModal} handleDeleteLabOrder={handleDeleteLabOrder} handleUpdateLabOrderStatus={handleUpdateLabOrderStatus} openConfirm={openConfirm} currentLang={currentLang} /> )}
             {currentView === 'settings' && ( <SettingsView t={t} data={data} setData={setData} handleAddDoctor={handleAddDoctorFull} handleUpdateDoctor={handleUpdateDoctor} handleDeleteDoctor={handleDeleteDoctor} handleAddSecretary={handleAddSecretary} handleDeleteSecretary={handleDeleteSecretary} handleRxFileUpload={handleRxFileUpload} handleImportData={handleImportData} syncStatus={syncStatus} deferredPrompt={deferredPrompt} handleInstallApp={handleInstallApp} openConfirm={openConfirm} currentLang={currentLang} setDeviceLang={setDeviceLang} currentTheme={currentThemeMode} setLocalTheme={toggleLocalTheme} activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId} activeDoctorId={activeDoctorId} activeSecretaryId={activeSecretaryId} deviceScale={deviceScale} setDeviceScale={setDeviceScale} onLinkDrive={handleGoogleDriveLink} /> )}
         </div>
      </main>
      <PrintLayouts t={t} data={data} activePatient={activePatient} printingRx={printingRx} setPrintingRx={setPrintingRx} printingPayment={printingPayment} setPrintingPayment={setPrintingPayment} printingAppointment={printingAppointment} setPrintingAppointment={setPrintingAppointment} printingDocument={printingDocument} setPrintingDocument={setPrintingDocument} printingExamination={printingExamination} setPrintingExamination={setPrintingExamination} currentLang={currentLang} isRTL={isRTL} />
      <PatientModal show={showNewPatientModal || showEditPatientModal} onClose={() => { setShowNewPatientModal(false); setShowEditPatientModal(false); }} t={t} isRTL={isRTL} currentLang={currentLang} data={activeDoctorId ? filteredData : data} handleAddPatient={handleAddPatient} updatePatient={updatePatient} guestToConvert={guestToConvert} activePatient={showEditPatientModal ? activePatient : null} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} activeDoctorId={activeDoctorId} />
      <PaymentModal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} t={t} activePatient={activePatient} paymentType={paymentType} data={data} handleAddPatient={handleAddPatient} currentLang={currentLang} />
      <AppointmentModal show={showAppointmentModal} onClose={() => { setShowAppointmentModal(false); setApptPatientId(null); }} t={t} selectedAppointment={selectedAppointment} appointmentMode={appointmentMode} setAppointmentMode={setAppointmentMode} selectedPatientId={apptPatientId || (selectedPatientId && currentView === 'patients' ? selectedPatientId : null)} data={activeDoctorId ? filteredData : data} currentDate={currentDate} handleAddAppointment={handleAddAppointment} isRTL={isRTL} currentLang={currentLang} />
      <AddMasterDrugModal show={showAddMasterDrugModal} onClose={() => setShowAddMasterDrugModal(false)} t={t} data={data} handleManageMedications={handleManageMedications} handleDeleteMasterDrug={handleDeleteMasterDrug} currentLang={currentLang} openConfirm={openConfirm} />
      <MemoModal show={showMemoModal} onClose={() => setShowMemoModal(false)} t={t} selectedMemo={selectedMemo} memoType={memoType} setMemoType={setMemoType} tempTodos={tempTodos} setTempTodos={setTempTodos} handleSaveMemo={handleSaveMemo} currentLang={currentLang} />
      <SupplyModal show={showSupplyModal} onClose={() => setShowSupplyModal(false)} t={t} selectedSupply={selectedSupply} handleSaveSupply={handleSaveSupply} currentLang={currentLang} />
      <InventoryModal show={showInventoryModal} onClose={() => setShowInventoryModal(false)} t={t} selectedItem={selectedInventoryItem} handleSaveItem={handleSaveInventoryItem} currentLang={currentLang} />
      <ExpenseModal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} t={t} selectedExpense={selectedExpense} handleSaveExpense={handleSaveExpense} currentLang={currentLang} />
      <LabOrderModal show={showLabOrderModal} onClose={() => setShowLabOrderModal(false)} t={t} data={data} selectedLabOrder={selectedLabOrder} handleSaveLabOrder={handleSaveLabOrder} currentLang={currentLang} />
      {showRxModal && ( <div className="fixed inset-0 bg-black/50 z={50} flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"> <div className={`bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 h-[80vh] flex flex-col font-${isRTL ? 'cairo' : 'sans'}`} dir={isRTL ? 'rtl' : 'ltr'}> <div className="flex justify-between items-center mb-6"> <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> <Pill className="text-primary-600" /> {t.newPrescription} </h3> <button onClick={() => setShowRxModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button> </div> <div className="flex-1 overflow-y-auto custom-scrollbar px-1"> <div className="space-y-4 mb-6"> <div className="relative"> <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={20} /> <input value={medSearch} onChange={(e) => { setMedSearch(e.target.value); if(e.target.value === '') setMedForm({}); }} autoComplete="off" className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none`} placeholder={t.drugName} /> {medSearch && ( <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl rounded-xl mt-1 border border-gray-100 dark:border-gray-700 max-h-40 overflow-y-auto z-10"> {data.medications.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())).map(m => ( <div key={m.id} onClick={() => { const medToAdd = { ...m, id: Date.now().toString() }; setNewRxMeds([...newRxMeds, medToAdd]); setMedSearch(''); setMedForm({}); }} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white border-b last:border-0 border-gray-50 dark:border-gray-700" > <div className="font-bold">{m.name}</div> <div className="text-xs text-gray-400" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>{m.dose} - {m.frequency}</div> </div> ))} </div> )} </div> <div className="grid grid-cols-2 md:grid-cols-4 gap-3"> <input value={medForm.dose || ''} onChange={e => setMedForm({...medForm, dose: e.target.value})} dir="ltr" placeholder={t.dose} autoComplete="off" className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none text-end" /> <input value={medForm.frequency || ''} onChange={e => setMedForm({...medForm, frequency: e.target.value})} dir="ltr" placeholder={t.frequency} autoComplete="off" className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none text-end" /> <input value={medForm.form || ''} onChange={e => setMedForm({...medForm, form: e.target.value})} placeholder={t.form} autoComplete="off" className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" /> <input value={medForm.notes || ''} onChange={e => setMedForm({...medForm, notes: e.target.value})} placeholder={t.medNotes} autoComplete="off" className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" /> </div> <button onClick={handleAddMedToRx} disabled={!medSearch && !medForm.name} className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded-xl transition flex items-center justify-center gap-2" > <Plus size={18} /> {t.addMedication} </button> </div> <div className="space-y-3"> <h4 className="font-bold text-gray-500 text-sm uppercase">{t.rxList}</h4> {newRxMeds.length === 0 ? ( <p className="text-center text-gray-400 italic py-4">{t.rxPlaceholder}</p> ) : ( newRxMeds.map((med, idx) => ( <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800"> <div> <div className="font-bold text-blue-900 dark:text-blue-100">{med.name}</div> <div className="text-xs text-blue-700 dark:text-blue-300" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>{med.dose} • {med.frequency} • {med.form}</div> {med.notes && <div className="text-xs text-blue-500 italic">({med.notes})</div>} </div> <button onClick={() => handleRemoveMedFromRx(idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button> </div> )) )} </div> </div> <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-2"> <button onClick={handleSaveRx} disabled={newRxMeds.length === 0} className="w-full bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 transition"> {t.save} </button> </div> </div> </div> )}
    </div>
  );
}
