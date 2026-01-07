
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, Search, Trash2, Pill, WifiOff, LayoutDashboard, RefreshCw, AlertCircle, CloudCheck, Cloud, LayoutGrid, Folder, ChevronLeft, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
import { SupplyModal, MemoModal, PatientModal, PaymentModal, AppointmentModal, AddMasterDrugModal, ExpenseModal, LabOrderModal, InventoryModal } from './components/AppModals';
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
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
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

  const [rxBrowseView, setRxBrowseView] = useState<'search' | 'groups' | 'group_meds'>('search');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const checkOnlineStatus = () => {
    if (!navigator.onLine) {
        throw new Error(deviceLang === 'ar' ? 'يجب أن تكون متصلاً بالإنترنت لتنفيذ هذه العملية لضمان الحفظ السحابي.' : 'You must be online to perform this operation to ensure cloud synchronization.');
    }
  };

  const syncToCloud = async (newData: ClinicData) => {
    await supabaseService.saveData(newData);
    setData(newData);
    storageService.saveData(newData);
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

      const user = await supabaseService.getUser();
      if (!user) { 
          setAppState('landing'); 
          setIsInitialLoading(false); 
          return; 
      }

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
      } catch (e) { console.warn("Initial sync failed, using local."); }
      
      const savedProfileType = localStorage.getItem('dentro_profile_type');
      if (savedProfileType === 'doctor') setActiveDoctorId(localStorage.getItem('dentro_active_profile'));
      else if (savedProfileType === 'secretary') { setActiveSecretaryId(localStorage.getItem('dentro_active_secretary')); setCurrentView('patients'); }
      
      setAppState('app');
      setIsInitialLoading(false);
    };
    initApp();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setAuthLoading(true); 
    setAuthError('');
    try {
        const result = await supabaseService.signIn(loginEmail, loginPassword);
        if (result.error) {
            setAuthError(result.error.message);
        } else {
            // تحميل البيانات فور نجاح تسجيل الدخول
            const cloudData = await supabaseService.loadData();
            if (cloudData) {
                const finalData = mergeDataWithLocalPrefs(cloudData);
                finalData.settings.isLoggedIn = true;
                setData(finalData);
                storageService.saveData(finalData);
                
                // التوجيه للبروفايلات إذا كانت العيادة معرفة، وإلا للتهيئة
                setAppState(cloudData.clinicName ? 'profile_select' : 'app');
            }
        }
    } catch (err: any) { 
        setAuthError(err.message || 'Auth failed'); 
    } finally { 
        setAuthLoading(false); 
    }
  };

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

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)
    }));
  };

  const handleUpdateTooth = (patientId: string, toothId: number, status: Tooth['status']) => {
    const ts = Date.now();
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
            return { ...p, updatedAt: ts, teeth: { ...p.teeth, [toothId]: { ...tooth, status, updatedAt: ts } } };
        })
    }));
  };

  const handleUpdateToothSurface = (patientId: string, toothId: number, surface: keyof ToothSurfaces | 'all', status: string) => {
    const ts = Date.now();
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy', surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } };
            let newSurfaces = { ...(tooth.surfaces || { top:'none', bottom:'none', left:'none', right:'none', center:'none' }) };
            if (surface === 'all') { const val = newSurfaces.center === status ? 'none' : status; newSurfaces = { top: val, bottom: val, left: val, right: val, center: val }; }
            else { newSurfaces[surface] = newSurfaces[surface] === status ? 'none' : status; }
            return { ...p, updatedAt: ts, teeth: { ...p.teeth, [toothId]: { ...tooth, surfaces: newSurfaces, updatedAt: ts } } };
        })
    }));
  };

  const handleUpdateToothNote = (patientId: string, toothId: number, note: ToothNote) => {
    const ts = Date.now();
    updateLocalData(prev => ({
        ...prev,
        patients: prev.patients.map(p => {
            if (p.id !== patientId) return p;
            const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
            return { ...p, updatedAt: ts, teeth: { ...p.teeth, [toothId]: { ...tooth, specialNote: { ...note, updatedAt: ts }, updatedAt: ts } } };
        })
    }));
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
          await syncToCloud(newData);
          return true;
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
          await syncToCloud(newData);
          setShowPaymentModal(false);
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
          await syncToCloud(newData);
          setShowAppointmentModal(false); setSelectedAppointment(null);
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingAppt(false); }
  };

  const updatePatientAsync = async (id: string, updates: Partial<Patient>) => {
      setIsProcessingPatient(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newData = { ...data, lastUpdated: ts, patients: data.patients.map(p => p.id === id ? { ...p, ...updates, updatedAt: ts } : p) };
          await syncToCloud(newData);
          setShowEditPatientModal(false);
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingPatient(false); }
  };

  const handleAddPatientAsync = async (pData: any) => {
      setIsProcessingPatient(true); setOpError(null);
      try {
          checkOnlineStatus();
          const ts = Date.now();
          const newP = { ...pData, status: 'active', id: generateId(), createdAt: new Date().toISOString(), updatedAt: ts, teeth: {}, appointments: [], payments: [], examinations: [], notes: '', rootCanals: [], treatmentSessions: [], prescriptions: [], structuredMedicalHistory: [], patientQueries: [] };
          const newData = { ...data, lastUpdated: ts, patients: [newP, ...data.patients] };
          await syncToCloud(newData);
          setShowNewPatientModal(false);
          return newP;
      } catch (err: any) { setOpError(err.message || 'Sync failed'); } finally { setIsProcessingPatient(false); }
  };

  // ... باقي الدوال بدون تغيير ...

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
        <div className="h-full bg-primary-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse text-sm">
        {deviceLang === 'ar' ? 'جاري المزامنة، يرجى الانتظار قليلاً...' : deviceLang === 'ku' ? 'خەریکی هاوکاتکردنە، تکایە کەمێک چاوەڕوان بن...' : 'Syncing, please wait a moment...'}
      </p>
    </div>
  );

  if (appState === 'landing') return <LandingPage setAppState={setAppState} landingLang={landingLang} setLandingLang={setLandingLang} isRTL={isRTL} />;
  if (appState === 'auth') return <AuthScreen t={currentT} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} authLoading={authLoading} authError={authError} handleAuth={handleAuth} setAppState={setAppState} />;
  if (appState === 'profile_select') return <ProfileSelector t={currentT} data={data} loginPassword={loginPassword} currentLang={deviceLang} isRTL={isRTL} onSelectAdmin={() => { localStorage.setItem('dentro_profile_type', 'admin'); setAppState('app'); }} onSelectDoctor={(id) => { setActiveDoctorId(id); localStorage.setItem('dentro_profile_type', 'doctor'); localStorage.setItem('dentro_active_profile', id); setAppState('app'); }} onSelectSecretary={(id) => { setActiveSecretaryId(id); localStorage.setItem('dentro_profile_type', 'secretary'); localStorage.setItem('dentro_active_secretary', id); setAppState('app'); setCurrentView('patients'); }} onLogout={() => { supabaseService.signOut(); localStorage.clear(); setAppState('landing'); }} />;

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
      <Sidebar t={currentT} data={data} currentView={currentView} setCurrentView={(view) => { setCurrentView(view); }} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} setSelectedPatientId={setSelectedPatientId} handleLogout={() => { setActiveDoctorId(null); setActiveSecretaryId(null); setAppState('profile_select'); }} isRTL={isRTL} isSecretary={!!activeSecretaryId} handleManualSync={() => {}} syncStatus={syncStatus} />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
         <div className="lg:hidden p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300"><Menu /></button>
            <div className="font-bold dark:text-white flex items-center gap-2"> {data.clinicName} {isOffline && <WifiOff size={14} className="text-red-500" />} </div>
         </div>
         
         <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto">
             {currentView === 'dashboard' && !activeSecretaryId && <DashboardView t={currentT} data={data} allAppointments={allAppointments} setData={setData} activeDoctorId={activeDoctorId} setSelectedPatientId={setSelectedPatientId} setCurrentView={setCurrentView} setPatientTab={setPatientTab} />}
             {currentView === 'patients' && !selectedPatientId && <PatientsView t={currentT} data={filteredData} isRTL={isRTL} currentLang={deviceLang} setSelectedPatientId={setSelectedPatientId} setPatientTab={setPatientTab} setCurrentView={setCurrentView} setShowNewPatientModal={setShowNewPatientModal} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAddAppointment={(pid) => { setApptPatientId(pid); setShowAppointmentModal(true); }} />}
             {currentView === 'patients' && selectedPatientId && activePatient && <PatientDetails t={currentT} data={data} setData={setData} activePatient={activePatient} patientTab={patientTab} setPatientTab={setPatientTab} setSelectedPatientId={setSelectedPatientId} currentLang={deviceLang} isRTL={isRTL} updatePatient={updatePatient} handleDeletePatient={()=>{}} handleUpdateTooth={handleUpdateTooth} handleUpdateToothSurface={handleUpdateToothSurface} handleUpdateToothNote={handleUpdateToothNote} handleUpdateHead={()=>{}} handleUpdateBody={()=>{}} handleAddRCT={(pid, rct) => updatePatient(pid, { rootCanals: [...(activePatient.rootCanals || []), { ...rct, id: generateId(), updatedAt: Date.now() }] })} handleDeleteRCT={()=>{}} handleDeleteAppointment={()=>{}} handleUpdateAppointmentStatus={()=>{}} handleDeleteRx={(rxid) => {}} setPrintingRx={setPrintingRx} setPrintingPayment={setPrintingPayment} setPrintingAppointment={setPrintingAppointment} setPrintingExamination={setPrintingExamination} handleRxFileUpload={()=>{}} handleRemoveRxBg={()=>{}} setShowEditPatientModal={setShowEditPatientModal} setShowAppointmentModal={setShowAppointmentModal} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} 
                setShowPaymentModal={setShowPaymentModal} 
                setPaymentType={setPaymentType} 
                setSelectedPayment={setSelectedPayment}
                setShowRxModal={setShowRxModal} 
                setShowAddMasterDrugModal={setShowAddMasterDrugModal} 
                openConfirm={openConfirm} 
                setPrintingDocument={setPrintingDocument} 
                isSecretary={!!activeSecretaryId} 
                handleSaveExamination={handleSaveExaminationAsync} 
                handleDeleteExamination={async ()=>{}} 
                handleDeletePayment={async ()=>{}}
                isProcessingExam={isProcessingExam} 
                isProcessingFinance={isProcessingFinance} 
                isProcessingAppt={isProcessingAppt} 
                opError={opError} 
                setOpError={setOpError} 
              />}
             {/* باقي العروض ... */}
         </div>
      </main>

      {/* المودالات ... */}
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
        setSelectedPatientId={setSelectedPatientId} 
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
    </div>
  );
}
