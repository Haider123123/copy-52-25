
import React, { useState, useRef } from 'react';
import { User, Activity, Calendar, CreditCard, Pill, FileText, Image as ImageIcon, Sparkles, BrainCircuit } from 'lucide-react';
import { TabButton } from './Shared';
import { ClinicData, Patient, Appointment, MedicalConditionItem, PatientQueryAnswer, ToothNote, Payment, Examination } from '../types';
import { DocumentSettingsModal, MedicalHistoryModal, PatientQueriesModal, PaymentModal, RxSettingsModal } from './AppModals';
import { PatientImages } from './PatientImages';
import { AIAssistant } from './patient/AIAssistant';
import { ExaminationSection } from './patient/ExaminationSection';
import { ExaminationModal } from './modals/ExaminationModal';

// Sub-components imports
import { PatientHeader } from './patient/PatientHeader';
import { OverviewSection } from './patient/OverviewSection';
import { TreatmentSection } from './patient/TreatmentSection';
import { VisitsSection } from './patient/VisitsSection';
import { FinancialsSection } from './patient/FinancialsSection';
import { PrescriptionsSection } from './patient/PrescriptionsSection';
import { DocumentsSection } from './patient/DocumentsSection';

interface PatientDetailsProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  activePatient: Patient | null | undefined;
  patientTab: string;
  setPatientTab: (tab: any) => void;
  setSelectedPatientId: (id: string | null) => void;
  currentLang: any;
  isRTL: boolean;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  handleDeletePatient: (id: string) => void;
  handleUpdateTooth: (patientId: string, toothId: number, status: any) => void;
  handleUpdateToothSurface: (patientId: string, toothId: number, surface: any, status: any) => void;
  handleUpdateToothNote: (patientId: string, toothId: number, note: ToothNote) => void;
  handleUpdateHead: (patientId: string, region: string, status: string) => void;
  handleUpdateBody: (patientId: string, region: string, status: string) => void;
  handleAddRCT: (patientId: string, rct: any) => void;
  handleDeleteRCT: (patientId: string, rctId: string) => void;
  handleDeleteAppointment: (patientId: string, appId: string) => void;
  handleUpdateAppointmentStatus: (patientId: string, appId: string, status: any) => void;
  handleDeleteRx: (rxId: string) => void;
  setPrintingRx: (rx: any) => void;
  setPrintingPayment: (p: any) => void;
  setPrintingAppointment: (appt: any) => void;
  setPrintingExamination: (e: any) => void;
  handleRxFileUpload: (e: any) => void;
  handleRemoveRxBg?: () => void;
  setShowEditPatientModal: (show: boolean) => void;
  setShowAppointmentModal: (show: boolean) => void;
  setSelectedAppointment: (appt: Appointment | null) => void;
  setAppointmentMode: (mode: 'existing' | 'new') => void;
  setShowPaymentModal: (show: boolean) => void;
  setPaymentType: (type: 'payment' | 'charge') => void;
  setSelectedPayment: (p: Payment | null) => void;
  setShowRxModal: (show: boolean) => void;
  setShowAddMasterDrugModal: (show: boolean) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  setPrintingDocument: (doc: { type: 'consent' | 'instructions', text: string, align: 'left'|'center'|'right', fontSize: number, topMargin: number } | null) => void;
  isSecretary?: boolean;
  handleSaveExamination: (patientId: string, exam: Examination, isEdit: boolean) => Promise<boolean>;
  handleDeleteExamination: (patientId: string, id: string) => Promise<void>;
  handleDeletePayment: (patientId: string, paymentId: string) => Promise<void>;
  handleProfilePicUpload: (patientId: string, file: File) => Promise<void>;
  isProcessingExam: boolean;
  isProcessingFinance: boolean;
  isProcessingAppt: boolean;
  isProcessingProfilePic: boolean;
  opError: string | null;
  setOpError: (err: string | null) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  t, data, setData, activePatient, patientTab, setPatientTab, setSelectedPatientId, currentLang, isRTL,
  updatePatient, handleDeletePatient, handleUpdateTooth, handleUpdateToothSurface, handleUpdateToothNote, handleUpdateHead, handleUpdateBody,
  handleAddRCT, handleDeleteRCT,
  handleDeleteAppointment, handleUpdateAppointmentStatus, handleDeleteRx, setPrintingRx,
  setPrintingPayment, setPrintingAppointment, setPrintingExamination, handleRxFileUpload, handleRemoveRxBg, setShowEditPatientModal,
  setShowAppointmentModal, setSelectedAppointment, setAppointmentMode, setShowPaymentModal,
  setPaymentType, setSelectedPayment, setShowRxModal, setShowAddMasterDrugModal, openConfirm, setPrintingDocument,
  isSecretary, handleSaveExamination, handleDeleteExamination, handleDeletePayment, handleProfilePicUpload, isProcessingExam, isProcessingFinance, isProcessingAppt, isProcessingProfilePic, opError, setOpError
}) => {
  const [rctInput, setRctInput] = useState({ tooth: '', canal: '', length: '' });
  const [showDocSettingsModal, setShowDocSettingsModal] = useState(false);
  const [docSettingsType, setDocSettingsType] = useState<'consent' | 'instructions'>('consent');
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [showPatientQueriesModal, setShowPatientQueriesModal] = useState(false);
  const [showRxSettingsModal, setShowRxSettingsModal] = useState(false);
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const [showExaminationModal, setShowExaminationModal] = useState(false);
  const [editingExamination, setEditingExamination] = useState<Examination | undefined>();

  if (!activePatient) return null;

  const openDocSettings = (type: 'consent' | 'instructions') => { setDocSettingsType(type); setShowDocSettingsModal(true); };
  const handleQuickPrint = (type: 'consent' | 'instructions') => {
      const settings = type === 'consent' ? data.settings.consentSettings : data.settings.instructionSettings;
      if (!settings || !settings.text) { alert(isRTL ? "يرجى كتابة نص المطبوع في الإعدادات أولاً" : "Please write the document text in settings first."); return; }
      setPrintingDocument({ type, text: settings.text, align: settings.align, fontSize: settings.fontSize, topMargin: settings.topMargin });
  };
  const handleSaveMedicalHistory = (conditions: MedicalConditionItem[]) => { updatePatient(activePatient.id, { structuredMedicalHistory: conditions }); };
  const handleSavePatientQueries = (answers: PatientQueryAnswer[]) => { updatePatient(activePatient.id, { patientQueries: answers }); };
  
  const handleSaveExamInternal = async (examData: Examination) => {
      const success = await handleSaveExamination(activePatient.id, examData, !!editingExamination);
      if (success) setShowExaminationModal(false);
  };

  const onProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          handleProfilePicUpload(activePatient.id, file);
      }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10 relative">
      
      {showAIAssistant && (
        <AIAssistant patient={activePatient} data={data} setData={setData} t={t} onClose={() => setShowAIAssistant(false)} />
      )}

      <DocumentSettingsModal show={showDocSettingsModal} onClose={() => setShowDocSettingsModal(false)} t={t} data={data} setData={setData} currentLang={currentLang} type={docSettingsType} />
      <MedicalHistoryModal show={showMedicalHistoryModal} onClose={() => setShowMedicalHistoryModal(false)} t={t} currentLang={currentLang} initialData={activePatient.structuredMedicalHistory} onSave={handleSaveMedicalHistory} />
      <PatientQueriesModal show={showPatientQueriesModal} onClose={() => setShowPatientQueriesModal(false)} t={t} currentLang={currentLang} initialData={activePatient.patientQueries} onSave={handleSavePatientQueries} />
      <RxSettingsModal show={showRxSettingsModal} onClose={() => setShowRxSettingsModal(false)} t={t} data={data} setData={setData} handleRxFileUpload={handleRxFileUpload} handleRemoveRxBg={handleRemoveRxBg} setShowAddMasterDrugModal={setShowAddMasterDrugModal} currentLang={currentLang} />
      
      <ExaminationModal 
        show={showExaminationModal} 
        onClose={() => { if(!isProcessingExam) setShowExaminationModal(false); }} 
        t={t} 
        data={data} 
        currentLang={currentLang} 
        selectedItem={editingExamination} 
        handleSave={handleSaveExamInternal}
        isSaving={isProcessingExam}
        error={opError}
      />

      <div className="shrink-0 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
        <PatientHeader 
          activePatient={activePatient} 
          t={t} 
          isRTL={isRTL} 
          currentLang={currentLang} 
          setSelectedPatientId={setSelectedPatientId} 
          setShowEditPatientModal={setShowEditPatientModal} 
          openConfirm={openConfirm} 
          handleDeletePatient={handleDeletePatient} 
          profilePicInputRef={profilePicInputRef} 
          handleProfilePicUpload={onProfilePicChange}
          isProcessingProfilePic={isProcessingProfilePic}
          onOpenAI={() => !isSecretary && setShowAIAssistant(true)}
        />

        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-100 dark:border-gray-700 pt-4">
          <TabButton icon={User} label={t.overview} active={patientTab === 'overview'} onClick={() => setPatientTab('overview')} />
          <TabButton icon={Activity} label={t.treatment} active={patientTab === 'chart'} onClick={() => setPatientTab('chart')} />
          <TabButton icon={Pill} label={t.prescriptions} active={patientTab === 'prescriptions'} onClick={() => setPatientTab('prescriptions')} />
          <TabButton icon={Calendar} label={t.visitHistory} active={patientTab === 'visits'} onClick={() => setPatientTab('visits')} />
          <TabButton icon={Activity} label={t.examination} active={patientTab === 'examination'} onClick={() => setPatientTab('examination')} />
          {!isSecretary && <TabButton icon={CreditCard} label={t.financials} active={patientTab === 'finance'} onClick={() => setPatientTab('finance')} />}
          <TabButton icon={FileText} label={t.documents} active={patientTab === 'documents'} onClick={() => setPatientTab('documents')} />
          <TabButton icon={ImageIcon} label={t.images} active={patientTab === 'images'} onClick={() => setPatientTab('images')} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 lg:p-8">
        {patientTab === 'overview' && <OverviewSection activePatient={activePatient} data={data} t={t} currentLang={currentLang} isRTL={isRTL} updatePatient={updatePatient} setShowPatientQueriesModal={setShowPatientQueriesModal} setShowMedicalHistoryModal={setShowMedicalHistoryModal} />}
        {patientTab === 'chart' && <TreatmentSection activePatient={activePatient} data={data} t={t} currentLang={currentLang} isRTL={isRTL} updatePatient={updatePatient} handleUpdateTooth={handleUpdateTooth} handleUpdateToothSurface={handleUpdateToothSurface} handleUpdateToothNote={handleUpdateToothNote} handleUpdateHead={handleUpdateHead} handleUpdateBody={handleUpdateBody} handleAddRCT={handleAddRCT} handleDeleteRCT={handleDeleteRCT} rctInput={rctInput} setRctInput={setRctInput} openConfirm={openConfirm} />}
        {patientTab === 'images' && <PatientImages t={t} patient={activePatient} onUpdatePatient={updatePatient} googleDriveLinked={data.settings.googleDriveLinked} googleDriveRootId={data.settings.googleDriveRootId} openConfirm={openConfirm} />}
        {patientTab === 'visits' && <VisitsSection activePatient={activePatient} t={t} currentLang={currentLang} isRTL={isRTL} setShowAppointmentModal={setShowAppointmentModal} setSelectedAppointment={setSelectedAppointment} setAppointmentMode={setAppointmentMode} setPrintingAppointment={setPrintingAppointment} handleDeleteAppointment={handleDeleteAppointment} openConfirm={openConfirm} />}
        {patientTab === 'examination' && (
          <ExaminationSection 
            activePatient={activePatient} 
            data={data} 
            setData={setData} 
            t={t} 
            openExaminationModal={(exam) => { setEditingExamination(exam); setShowExaminationModal(true); }}
            setPrintingExamination={setPrintingExamination}
            openConfirm={openConfirm}
            handleDeleteExamination={(id) => handleDeleteExamination(activePatient.id, id)}
          />
        )}
        {patientTab === 'finance' && !isSecretary && (
          <FinancialsSection 
            activePatient={activePatient} 
            data={data} 
            setData={setData} 
            t={t} 
            openLocalPaymentModal={(type, p) => { 
                setOpError(null);
                setPaymentType(type); 
                setSelectedPayment(p || null); 
                setShowPaymentModal(true); 
            }} 
            setPrintingPayment={setPrintingPayment} 
            openConfirm={openConfirm} 
            handleDeletePaymentTransaction={(id) => handleDeletePayment(activePatient.id, id)} 
          />
        )}
        {patientTab === 'prescriptions' && <PrescriptionsSection activePatient={activePatient} t={t} currentLang={currentLang} setShowRxModal={setShowRxModal} setShowRxSettingsModal={setShowRxSettingsModal} setPrintingRx={setPrintingRx} handleDeleteRx={handleDeleteRx} openConfirm={openConfirm} />}
        {patientTab === 'documents' && <DocumentsSection t={t} data={data} openDocSettings={openDocSettings} handleQuickPrint={handleQuickPrint} />}
      </div>
    </div>
  );
};
