
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, Search, Trash2, Pill, WifiOff, LayoutDashboard, RefreshCw, AlertCircle, CloudCheck, Cloud } from 'lucide-react';
import { ClinicData, Doctor, Secretary, Patient, Appointment, Payment, Tooth, RootCanalEntry, Memo, Prescription, Medication, SupplyItem, ExpenseItem, TodoItem, ToothSurfaces, LabOrder, InventoryItem, ToothNote, Language, MemoStyle, Examination, MedicalConditionItem, PatientQueryAnswer } from './types';
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
import { hexToRgb, granularMerge } from './utils';

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

  // Unified State Update Helper with Global Timestamping
  const updateLocalData = (updater: (prev: ClinicData) => ClinicData) => {
      setData(prev => {
          const next = updater(prev);
          const timestamp = Date.now();
          const updatedNext = { 
            ...next, 
            lastUpdated: timestamp 
          };
          storageService.saveData(updatedNext);
          return updatedNext;
      });
  };

  const handleManualSync = async (force: boolean = false) => {
      if (!navigator.onLine || !data.settings.isLoggedIn || (syncStatus === 'syncing' && !force)) return;
      setSyncStatus('syncing');
      try {
          const cloudData = await supabaseService.loadData();
          if (cloudData) {
              const localData = storageService.loadData();
              const merged = granularMerge(localData, cloudData);
              const final = mergeDataWithLocalPrefs(merged);
              setData(final); 
              storageService.saveData(final); 
              setSyncStatus('synced'); 
              return true;
          }
      } catch (e) { 
        setSyncStatus('error'); 
        return false; 
      }
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
          const cloudData = await supabaseService.loadData();
          if (cloudData) {
            const currentLocal = storageService.loadData();
            const mergedData = granularMerge(currentLocal, cloudData);
            const finalData = mergeDataWithLocalPrefs(mergedData);
            setData(finalData);
            storageService.saveData(finalData);
          }
        } catch (e) {
          console.warn("Initial sync failed, using local.");
        } finally {
          const currentData = storageService.loadData();
          if (currentData && currentData.clinicName) {
            const savedProfileType = localStorage.getItem('dentro_profile_type');
            if (savedProfileType === 'doctor') {
              setActiveDoctorId(localStorage.getItem('dentro_active_profile'));
            } else if (savedProfileType === 'secretary') {
              setActiveSecretaryId(localStorage.getItem('dentro_active_secretary'));
              setCurrentView('patients');
            }
            setAppState('app');
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

  // Periodic Granular Auto-Sync
  useEffect(() => {
    if (!data.settings.isLoggedIn || isInitialLoading) return;
    const timer = setTimeout(async () => {
        if (navigator.onLine) {
            setSyncStatus('syncing');
            try { 
                const latestCloud = await supabaseService.loadData();
                let dataToSave = data;
                if (latestCloud) {
                    dataToSave = granularMerge(data, latestCloud);
                    setData(mergeDataWithLocalPrefs(dataToSave));
                }
                await supabaseService.saveData(dataToSave); 
                setSyncStatus('synced'); 
            } catch (e) { setSyncStatus('error'); }
        } else setSyncStatus('offline');
    }, 10000); // 10s debounce for background sync
    return () => clearTimeout(timer);
  }, [data, isInitialLoading]);

  // Auth Handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('');
    try {
        const result = await supabaseService.signIn(loginEmail, loginPassword);
        if (result.error) setAuthError(result.error.message); else {
            const cloudData = await supabaseService.loadData();
            if (cloudData) {
                const newData = mergeDataWithLocalPrefs(cloudData); newData.settings.isLoggedIn = true;
                setData(newData); storageService.saveData(newData); setIsInitialLoading(false); 
                setAppState(cloudData.clinicName ? 'profile_select' : 'app');
            }
        }
    } catch (err: any) { setAuthError(err.message || 'Auth failed'); } finally { setAuthLoading(false); }
  };

  const handleClinicNameSubmit = (name: string) => { updateLocalData(prev => ({ ...prev, clinicName: name })); setAppState('profile_select'); };

  // --- GRANULAR ATOMIC UPDATERS ---

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)
    }));
  };

  const handleUpdateTooth = (patientId: string, toothId: number, status: Tooth['status']) => {
    const timestamp = Date.now();
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const currentTooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
            const updatedTooth = { ...currentTooth, status, updatedAt: timestamp };
            return { ...p, teeth: { ...p.teeth, [toothId]: updatedTooth }, updatedAt: timestamp };
        })
    }));
  };

  const handleUpdateToothSurface = (patientId: string, toothId: number, surface: keyof ToothSurfaces | 'all', status: string) => {
    const timestamp = Date.now();
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const currentTooth = p.teeth[toothId] || { id: toothId, status: 'healthy', surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } };
            let newSurfaces = { ...(currentTooth.surfaces || { top:'none', bottom:'none', left:'none', right:'none', center:'none' }) };
            if (surface === 'all') {
                const val = newSurfaces.center === status ? 'none' : status;
                newSurfaces = { top: val, bottom: val, left: val, right: val, center: val };
            } else {
                newSurfaces[surface] = newSurfaces[surface] === status ? 'none' : status;
            }
            const updatedTooth = { ...currentTooth, surfaces: newSurfaces, updatedAt: timestamp };
            return { ...p, teeth: { ...p.teeth, [toothId]: updatedTooth }, updatedAt: timestamp };
        })
    }));
  };

  const handleUpdateToothNote = (patientId: string, toothId: number, note: ToothNote) => {
    const timestamp = Date.now();
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const currentTooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
            const updatedTooth = { ...currentTooth, specialNote: { ...note, updatedAt: timestamp }, updatedAt: timestamp };
            return { ...p, teeth: { ...p.teeth, [toothId]: updatedTooth }, updatedAt: timestamp };
        })
    }));
  };

  const handleAddPayment = (patientId: string, amount: number, type: 'payment' | 'charge', description: string) => {
    const timestamp = Date.now();
    const newPayment: Payment = { id: timestamp.toString(), date: new Date().toISOString(), amount, type, description, updatedAt: timestamp };
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => p.id === patientId ? { ...p, payments: [newPayment, ...p.payments], updatedAt: timestamp } : p)
    }));
    setShowPaymentModal(false);
  };

  const handleAddAppointment = (patientId: string | null, apptData: Partial<Appointment>) => {
    const timestamp = Date.now();
    const newApptId = selectedAppointment ? selectedAppointment.id : timestamp.toString();
    
    if (patientId) {
        updateLocalData(prev => ({
            ...prev,
            patients: prev.patients.map(p => {
                if (p.id !== patientId) return p;
                const appts = selectedAppointment 
                    ? p.appointments.map(a => a.id === selectedAppointment.id ? { ...a, ...apptData, updatedAt: timestamp } : a)
                    : [...p.appointments, { ...apptData, id: newApptId, patientId, patientName: p.name, status: 'scheduled', updatedAt: timestamp } as Appointment];
                return { ...p, appointments: appts, updatedAt: timestamp };
            })
        }));
    } else {
        updateLocalData(prev => ({
            ...prev,
            guestAppointments: selectedAppointment 
                ? (prev.guestAppointments || []).map(a => a.id === selectedAppointment.id ? { ...a, ...apptData, updatedAt: timestamp } : a)
                : [...(prev.guestAppointments || []), { ...apptData, id: newApptId, patientId: '', patientName: apptData.patientName || 'Guest', status: 'scheduled', updatedAt: timestamp } as Appointment]
        }));
    }
    setShowAppointmentModal(false); setSelectedAppointment(null);
  };

  const handleSaveMemo = (title: string, content: string, color: string, type: 'text'|'todo' = 'text', todos: TodoItem[], style?: MemoStyle) => {
    const timestamp = Date.now();
    updateLocalData(prev => ({
        ...prev,
        memos: selectedMemo 
            ? (prev.memos || []).map(m => m.id === selectedMemo.id ? { ...m, title, content, color, type, todos, style, updatedAt: timestamp } : m)
            : [{ id: timestamp.toString(), title, content, color, type, todos, date: new Date().toISOString(), style, updatedAt: timestamp }, ...(prev.memos || [])]
    }));
    setShowMemoModal(false); setSelectedMemo(null);
  };

  // --- GENERAL HANDLERS ---
  useEffect(() => {
      const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
      const root = document.documentElement;
      root.style.setProperty('--primary-rgb', hexToRgb(theme.colors.primary));
      root.style.setProperty('--secondary-rgb', hexToRgb(theme.colors.secondary));
      root.style.setProperty('--bg-color', theme.colors.bg);
      if (theme.type === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
      localStorage.setItem('dentro_theme_id', activeThemeId);
  }, [activeThemeId]);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const openConfirm = (title: string, message: string, onConfirm: () => void) => setConfirmState({ isOpen: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

  const allAppointments = [
    ...data.patients.flatMap(p => p.appointments.map(a => ({ ...a, patientName: p.name, patient: p }))),
    ...(data.guestAppointments || []).map(a => ({ ...a, patient: null }))
  ];

  const filteredData = activeDoctorId ? { ...data, patients: data.patients.filter(p => p.doctorId === activeDoctorId) } : data;
  const activePatient = selectedPatientId ? data.patients.find(p => p.id === selectedPatientId) : null;
  const currentT = LABELS[deviceLang];
  const isRTL = deviceLang === 'ar' || deviceLang === 'ku';

  if (appState === 'loading' || isInitialLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Logo className="w-24 h-24 mb-6 animate-pulse" />
      <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );

  if (appState === 'landing') return <LandingPage setAppState={setAppState} landingLang={landingLang} setLandingLang={setLandingLang} isRTL={isRTL} />;
  if (appState === 'auth') return <AuthScreen t={currentT} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} authLoading={authLoading} authError={authError} handleAuth={handleAuth} setAppState={setAppState} />;
  if (appState === 'profile_select') return <ProfileSelector t={currentT} data={data} loginPassword={loginPassword} currentLang={deviceLang} isRTL={isRTL} onSelectAdmin={() => { localStorage.setItem('dentro_profile_type', 'admin'); setAppState('app'); }} onSelectDoctor={(id) => { setActiveDoctorId(id); localStorage.setItem('dentro_profile_type', 'doctor'); localStorage.setItem('dentro_active_profile', id); setAppState('app'); }} onSelectSecretary={(id) => { setActiveSecretaryId(id); localStorage.setItem('dentro_profile_type', 'secretary'); localStorage.setItem('dentro_active_secretary', id); setAppState('app'); setCurrentView('patients'); }} onLogout={() => { supabaseService.signOut(); localStorage.clear(); setAppState('landing'); }} />;

  return (
    <div className={`min-h-screen flex bg-page-bg font-${isRTL ? 'cairo' : 'sans'} leading-relaxed overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
      <ConfirmationModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={() => { confirmState.onConfirm(); closeConfirm(); }} onCancel={closeConfirm} lang={deviceLang} />
      <Sidebar t={currentT} data={data} currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} setSelectedPatientId={setSelectedPatientId} handleLogout={() => { setActiveDoctorId(null); setActiveSecretaryId(null); setAppState('profile_select'); }} isRTL={isRTL} isSecretary={!!activeSecretaryId} handleManualSync={handleManualSync} syncStatus={syncStatus} />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
         <div className="lg:hidden p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300"><Menu /></button>
            <div className="font-bold dark:text-white flex items-center gap-2">
                {data.clinicName} {isOffline && <WifiOff size={14} className="text-red-500" />}
            </div>
         </div>
         
         <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto">
             {currentView === 'dashboard' && !activeSecretaryId && <DashboardView t={currentT} data={data} allAppointments={allAppointments} setData={setData} activeDoctorId={activeDoctorId} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} />}
             {currentView === 'patients' && !selectedPatientId && <PatientsView t={currentT} data={filteredData} isRTL={isRTL} currentLang={deviceLang} setSelectedPatientId={setSelectedPatientId} setPatientTab={setPatientTab} setCurrentView={setCurrentView} setShowNewPatientModal={setShowNewPatientModal} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddAppointment={(pid) => { setApptPatientId(pid); setShowAppointmentModal(true); }} />}
             {currentView === 'patients' && selectedPatientId && activePatient && <PatientDetails t={currentT} data={data} setData={setData} activePatient={activePatient} patientTab={patientTab} setPatientTab={setPatientTab} setSelectedPatientId={setSelectedPatientId} currentLang={deviceLang} isRTL={isRTL} updatePatient={updatePatient} handleDeletePatient={(id) => updateLocalData(p => ({...p, patients: p.patients.filter(x => x.id !== id)}))} handleUpdateTooth={handleUpdateTooth} handleUpdateToothSurface={handleUpdateToothSurface} handleUpdateToothNote={handleUpdateToothNote} handleUpdateHead={()=>{}} handleUpdateBody={()=>{}} handleAddRCT={(pid, rct) => updatePatient(pid, { rootCanals: [...(activePatient.rootCanals || []), { ...rct, id: Date.now().toString(), updatedAt: Date.now() }] })} handleDeleteRCT={(pid, rid) => updatePatient(pid, { rootCanals: (activePatient.rootCanals || []).filter(x => x.id !== rid) })} handleDeleteAppointment={(pid, aid) => updatePatient(pid, { appointments: activePatient.appointments.filter(x => x.id !== aid) })} handleUpdateAppointmentStatus={(pid, aid, s) => updatePatient(pid, { appointments: activePatient.appointments.map(x => x.id === aid ? { ...x, status: s, updatedAt: Date.now() } : x) })} handleDeleteRx={(rxid) => updatePatient(activePatient.id, { prescriptions: activePatient.prescriptions.filter(x => x.id !== rxid) })} setPrintingRx={setPrintingRx} setPrintingPayment={setPrintingPayment} setPrintingAppointment={setPrintingAppointment} setPrintingExamination={setPrintingExamination} handleRxFileUpload={()=>{}} setShowEditPatientModal={setShowEditPatientModal} setShowAppointmentModal={setShowAppointmentModal} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} setShowPaymentModal={setShowPaymentModal} setPaymentType={setPaymentType} setShowRxModal={setShowRxModal} setShowAddMasterDrugModal={setShowAddMasterDrugModal} openConfirm={openConfirm} setPrintingDocument={setPrintingDocument} isSecretary={!!activeSecretaryId} />}
             {currentView === 'calendar' && <CalendarView t={currentT} data={data} currentLang={deviceLang} isRTL={isRTL} calendarView={calendarView} setCalendarView={setCalendarView} currentDate={currentDate} setCurrentDate={setCurrentDate} filteredAppointments={allAppointments} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} setShowAppointmentModal={setShowAppointmentModal} handleUpdateAppointmentStatus={(pid, aid, s) => updatePatient(pid, { appointments: data.patients.find(p=>p.id===pid)!.appointments.map(x=>x.id===aid?{...x,status:s,updatedAt:Date.now()}:x) })} handleDeleteAppointment={(pid, aid) => updatePatient(pid, { appointments: data.patients.find(p=>p.id===pid)!.appointments.filter(x=>x.id!==aid) })} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} setGuestToConvert={setGuestToConvert} setShowNewPatientModal={setShowNewPatientModal} openConfirm={openConfirm} setData={setData} activeDoctorId={activeDoctorId} isSecretary={!!activeSecretaryId} />}
             {currentView === 'memos' && <MemosView t={currentT} data={data} setSelectedMemo={setSelectedMemo} setShowMemoModal={setShowMemoModal} setMemoType={setMemoType} setTempTodos={setTempTodos} handleDeleteMemo={(id) => updateLocalData(p => ({...p, memos: p.memos.filter(x => x.id !== id)}))} currentLang={deviceLang} openConfirm={openConfirm} />}
             {currentView === 'purchases' && <PurchasesView t={currentT} data={data} setSelectedSupply={setSelectedSupply} setShowSupplyModal={setShowSupplyModal} handleConvertToExpense={(s) => updateLocalData(p => ({...p, expenses: [{...s, date: new Date().toISOString(), updatedAt: Date.now()}, ...p.expenses], supplies: p.supplies.filter(x=>x.id!==s.id)}))} handleDeleteSupply={(id) => updateLocalData(p => ({...p, supplies: p.supplies.filter(x=>x.id!==id)}))} openConfirm={openConfirm} />}
             {currentView === 'inventory' && <InventoryView t={currentT} data={data} setSelectedInventoryItem={setSelectedInventoryItem} setShowInventoryModal={setShowInventoryModal} handleDeleteInventoryItem={(id) => updateLocalData(p => ({...p, inventory: p.inventory.filter(x => x.id !== id)}))} openConfirm={openConfirm} />}
             {currentView === 'expenses' && <ExpensesView t={currentT} data={data} setData={setData} setSelectedExpense={setSelectedExpense} setShowExpenseModal={setShowExpenseModal} handleDeleteExpense={(id) => updateLocalData(p => ({...p, expenses: p.expenses.filter(x => x.id !== id)}))} openConfirm={openConfirm} />}
             {currentView === 'labOrders' && <LabOrdersView t={currentT} data={data} setData={setData} setSelectedLabOrder={setSelectedLabOrder} setShowLabOrderModal={setShowLabOrderModal} handleDeleteLabOrder={(id) => updateLocalData(p => ({...p, labOrders: p.labOrders.filter(x => x.id !== id)}))} handleUpdateLabOrderStatus={(id, s) => updateLocalData(p => ({...p, labOrders: p.labOrders.map(o => o.id === id ? {...o, status: s, updatedAt: Date.now()} : o)}))} openConfirm={openConfirm} currentLang={deviceLang} />}
             {currentView === 'settings' && <SettingsView t={currentT} data={data} setData={setData} handleAddDoctor={(n,u,p) => updateLocalData(prev => ({...prev, doctors: [...prev.doctors, {id: Date.now().toString(), name: n, username: u, password: p, updatedAt: Date.now()}]}))} handleUpdateDoctor={(id, u) => updateLocalData(prev => ({...prev, doctors: prev.doctors.map(d => d.id === id ? {...d, ...u, updatedAt: Date.now()} : d)}))} handleDeleteDoctor={(id) => updateLocalData(prev => ({...prev, doctors: prev.doctors.filter(d => d.id !== id)}))} handleAddSecretary={(n,u,p) => updateLocalData(prev => ({...prev, secretaries: [...(prev.secretaries||[]), {id: Date.now().toString(), name: n, username: u, password: p||'123456', updatedAt: Date.now()}]}))} handleDeleteSecretary={(id) => updateLocalData(prev => ({...prev, secretaries: prev.secretaries.filter(s => s.id !== id)}))} handleRxFileUpload={()=>{}} handleImportData={async (e, m) => { const imp = await storageService.importBackup(e.target.files![0]); if(imp) { if(m==='replace') setData(mergeDataWithLocalPrefs({...imp, settings: {...imp.settings, isLoggedIn: true}})); else setData(p => ({...p, patients: [...p.patients, ...imp.patients], lastUpdated: Date.now()})); alert('Done'); } }} syncStatus={syncStatus} deferredPrompt={deferredPrompt} handleInstallApp={()=>{}} openConfirm={openConfirm} currentLang={deviceLang} setDeviceLang={setDeviceLang} currentTheme={activeThemeId==='classic'?'light':'dark'} setLocalTheme={(t) => setActiveThemeId(t==='dark'?'dark-pro':'classic')} activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId} activeDoctorId={activeDoctorId} activeSecretaryId={activeSecretaryId} deviceScale={deviceScale} setDeviceScale={setDeviceScale} onLinkDrive={()=>{}} />}
         </div>
      </main>

      <PrintLayouts t={currentT} data={data} activePatient={activePatient} printingRx={printingRx} setPrintingRx={setPrintingRx} printingPayment={printingPayment} setPrintingPayment={setPrintingPayment} printingAppointment={printingAppointment} setPrintingAppointment={setPrintingAppointment} printingDocument={printingDocument} setPrintingDocument={setPrintingDocument} printingExamination={printingExamination} setPrintingExamination={setPrintingExamination} currentLang={deviceLang} isRTL={isRTL} />
      <PatientModal show={showNewPatientModal || showEditPatientModal} onClose={() => { setShowNewPatientModal(false); setShowEditPatientModal(false); }} t={currentT} isRTL={isRTL} currentLang={deviceLang} data={data} handleAddPatient={(pData: any) => { const timestamp = Date.now(); const newP = { ...pData, id: timestamp.toString(), createdAt: new Date().toISOString(), updatedAt: timestamp, teeth: {}, appointments: [], payments: [], notes: '', rootCanals: [], treatmentSessions: [], prescriptions: [] }; updateLocalData(p => ({...p, patients: [newP, ...p.patients]})); return newP; }} updatePatient={updatePatient} guestToConvert={guestToConvert} activePatient={showEditPatientModal ? activePatient : null} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} activeDoctorId={activeDoctorId} />
      <PaymentModal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} t={currentT} activePatient={activePatient} paymentType={paymentType} data={data} handleSavePayment={(p: any) => handleAddPayment(activePatient!.id, p.amount, p.type, p.description)} currentLang={deviceLang} />
      <AppointmentModal show={showAppointmentModal} onClose={() => { setShowAppointmentModal(false); setApptPatientId(null); }} t={currentT} selectedAppointment={selectedAppointment} appointmentMode={appointmentMode} setAppointmentMode={setAppointmentMode} selectedPatientId={apptPatientId || (selectedPatientId && currentView === 'patients' ? selectedPatientId : null)} data={data} currentDate={currentDate} handleAddAppointment={handleAddAppointment} isRTL={isRTL} currentLang={deviceLang} />
      <AddMasterDrugModal show={showAddMasterDrugModal} onClose={() => setShowAddMasterDrugModal(false)} t={currentT} data={data} handleManageMedications={(m: any, a: any) => updateLocalData(p => ({...p, medications: a === 'add' ? [...p.medications, {...m, id: Date.now().toString(), updatedAt: Date.now()}] : p.medications.map(x=>x.id===m.id?{...m,updatedAt:Date.now()}:x)}))} handleDeleteMasterDrug={(id) => updateLocalData(p => ({...p, medications: p.medications.filter(x => x.id !== id)}))} currentLang={deviceLang} openConfirm={openConfirm} />
      <MemoModal show={showMemoModal} onClose={() => setShowMemoModal(false)} t={currentT} selectedMemo={selectedMemo} memoType={memoType} setMemoType={setMemoType} tempTodos={tempTodos} setTempTodos={setTempTodos} handleSaveMemo={handleSaveMemo} currentLang={deviceLang} />
      <SupplyModal show={showSupplyModal} onClose={() => setShowSupplyModal(false)} t={currentT} selectedSupply={selectedSupply} handleSaveSupply={(n: any, q: any, pr: any) => { const timestamp = Date.now(); updateLocalData(p => ({...p, supplies: selectedSupply ? p.supplies.map(x=>x.id===selectedSupply.id?{...x,name:n,quantity:q,price:pr,updatedAt:timestamp}:x) : [{id:timestamp.toString(),name:n,quantity:q,price:pr,updatedAt:timestamp},...p.supplies]})); }} currentLang={deviceLang} />
      <InventoryModal show={showInventoryModal} onClose={() => setShowInventoryModal(false)} t={currentT} selectedItem={selectedInventoryItem} handleSaveItem={(i: any) => { const timestamp = Date.now(); updateLocalData(p => ({...p, inventory: selectedInventoryItem ? p.inventory.map(x=>x.id===selectedInventoryItem.id?{...x,...i,updatedAt:timestamp}:x) : [{...i,id:timestamp.toString(),updatedAt:timestamp},...p.inventory]})); }} currentLang={deviceLang} />
      <ExpenseModal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} t={currentT} selectedExpense={selectedExpense} handleSaveExpense={(n: any, q: any, pr: any, d: any) => { const timestamp = Date.now(); updateLocalData(p => ({...p, expenses: selectedExpense ? p.expenses.map(x=>x.id===selectedExpense.id?{...x,name:n,quantity:q,price:pr,date:d,updatedAt:timestamp}:x) : [{id:timestamp.toString(),name:n,quantity:q,price:pr,date:d,updatedAt:timestamp},...p.expenses]})); }} currentLang={deviceLang} />
      <LabOrderModal show={showLabOrderModal} onClose={() => setShowLabOrderModal(false)} t={currentT} data={data} selectedLabOrder={selectedLabOrder} handleSaveLabOrder={(o: any) => { const timestamp = Date.now(); updateLocalData(p => ({...p, labOrders: selectedLabOrder ? p.labOrders.map(x=>x.id===selectedLabOrder.id?{...x,...o,updatedAt:timestamp}:x) : [{...o,id:timestamp.toString(),updatedAt:timestamp},...p.labOrders]})); }} currentLang={deviceLang} />
      
      {showRxModal && (
        <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className={`bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 h-[80vh] flex flex-col`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold dark:text-white flex items-center gap-2"><Pill className="text-primary-600" /> {currentT.newPrescription}</h3>
                  <button onClick={() => setShowRxModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4 mb-6">
                      <div className="relative">
                          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={20} />
                          <input value={medSearch} onChange={(e) => setMedSearch(e.target.value)} autoComplete="off" className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} py-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none`} placeholder={currentT.drugName} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <input value={medForm.dose || ''} onChange={e => setMedForm({...medForm, dose: e.target.value})} dir="ltr" placeholder={currentT.dose} className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none text-end" />
                          <input value={medForm.frequency || ''} onChange={e => setMedForm({...medForm, frequency: e.target.value})} dir="ltr" placeholder={currentT.frequency} className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none text-end" />
                          <input value={medForm.form || ''} onChange={e => setMedForm({...medForm, form: e.target.value})} placeholder={currentT.form} className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          <input value={medForm.notes || ''} onChange={e => setMedForm({...medForm, notes: e.target.value})} placeholder={currentT.medNotes} className="p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      </div>
                      <button onClick={() => { if(!medSearch && !medForm.name) return; setNewRxMeds([...newRxMeds, {id: Date.now().toString(), name: medSearch || medForm.name!, dose: medForm.dose||'', frequency: medForm.frequency||'', form: medForm.form||'', notes: medForm.notes}]); setMedSearch(''); setMedForm({}); }} className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-md">+ {currentT.addMedication}</button>
                  </div>
                  <div className="space-y-3">
                      {newRxMeds.map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100">
                          <div><div className="font-bold dark:text-white">{m.name}</div><div className="text-xs text-blue-600" dir="ltr">{m.dose} • {m.frequency}</div></div>
                          <button onClick={() => setNewRxMeds(newRxMeds.filter((_, idx)=>idx!==i))} className="text-red-500"><Trash2 size={18}/></button>
                        </div>
                      ))}
                  </div>
              </div>
              <div className="pt-4 border-t mt-4">
                  <button onClick={() => { if(!activePatient) return; const timestamp = Date.now(); const rx = {id: timestamp.toString(), date: new Date().toISOString(), medications: newRxMeds, updatedAt: timestamp}; updatePatient(activePatient.id, { prescriptions: [rx, ...activePatient.prescriptions] }); setShowRxModal(false); setNewRxMeds([]); }} disabled={newRxMeds.length===0} className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50">{currentT.save}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
