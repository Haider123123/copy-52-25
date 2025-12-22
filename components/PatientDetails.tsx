
import React, { useState } from 'react';
import { User, Activity, Calendar, CreditCard, Pill, ArrowLeft, Edit2, Trash2, Phone, Copy, MessageCircle, ClipboardList, StickyNote, Plus, Printer, Check, X as XIcon, History, DollarSign, Upload, FileText, HelpCircle, Stethoscope, ChevronDown, Smile, AlertCircle, Settings, Image as ImageIcon } from 'lucide-react';
import { TabButton, InfoItem } from './Shared';
import { TeethChart } from './TeethChart';
import { CATEGORIES, STATUS_COLORS, CURRENCY_LIST, MEDICAL_CONDITIONS_LIST, PATIENT_QUESTIONS_LIST } from '../constants';
import { getLocalizedDate, formatTime12, getTreatmentLabel } from '../utils';
import { ClinicData, Patient, Appointment, DocumentTemplate, MedicalConditionItem, PatientQueryAnswer, ToothNote, Payment } from '../types';
import { DocumentModal, MedicalHistoryModal, PatientQueriesModal, PaymentModal, RxSettingsModal } from './AppModals';
import { PatientImages } from './PatientImages';
import { RCTDrawingBoard } from './RCTDrawingBoard';

interface PatientDetailsProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  activePatient: Patient;
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
  handleRxFileUpload: (e: any) => void;
  setShowEditPatientModal: (show: boolean) => void;
  setShowAppointmentModal: (show: boolean) => void;
  setSelectedAppointment: (appt: Appointment | null) => void;
  setAppointmentMode: (mode: 'existing' | 'new') => void;
  setShowPaymentModal: (show: boolean) => void;
  setPaymentType: (type: 'payment' | 'charge') => void;
  setShowRxModal: (show: boolean) => void;
  setShowAddMasterDrugModal: (show: boolean) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  setPrintingDocument: (doc: { type: 'consent' | 'instructions', text: string, align: 'left'|'center'|'right', fontSize: number } | null) => void;
  isSecretary?: boolean;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  t, data, setData, activePatient, patientTab, setPatientTab, setSelectedPatientId, currentLang, isRTL,
  updatePatient, handleDeletePatient, handleUpdateTooth, handleUpdateToothSurface, handleUpdateToothNote, handleUpdateHead, handleUpdateBody,
  handleAddRCT, handleDeleteRCT,
  handleDeleteAppointment, handleUpdateAppointmentStatus, handleDeleteRx, setPrintingRx,
  setPrintingPayment, setPrintingAppointment, handleRxFileUpload, setShowEditPatientModal,
  setShowAppointmentModal, setSelectedAppointment, setAppointmentMode, setShowPaymentModal,
  setPaymentType, setShowRxModal, setShowAddMasterDrugModal, openConfirm, setPrintingDocument,
  isSecretary
}) => {
  const [rctInput, setRctInput] = useState({ tooth: '', canal: '', length: '' });
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentType, setDocumentType] = useState<'consent' | 'instructions'>('consent');
  
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [showPatientQueriesModal, setShowPatientQueriesModal] = useState(false);
  const [showRxSettingsModal, setShowRxSettingsModal] = useState(false);
  const [selectedPaymentTransaction, setSelectedPaymentTransaction] = useState<Payment | null>(null);
  
  const [localPaymentModalOpen, setLocalPaymentModalOpen] = useState(false);
  const [localPaymentType, setLocalPaymentType] = useState<'payment' | 'charge'>('payment');
  
  const handleDocumentFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'consent' | 'instructions') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              setData(prev => ({
                  ...prev,
                  settings: {
                      ...prev.settings,
                      consentBackgroundImage: type === 'consent' ? base64String : prev.settings.consentBackgroundImage,
                      instructionsBackgroundImage: type === 'instructions' ? base64String : prev.settings.instructionsBackgroundImage
                  }
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const openDocumentModal = (type: 'consent' | 'instructions') => {
      setDocumentType(type);
      setShowDocumentModal(true);
  };

  const handlePrintDocument = (docData: { text: string, align: 'left'|'center'|'right', fontSize: number }) => {
      setPrintingDocument({ type: documentType, ...docData });
      setShowDocumentModal(false);
  };

  const handleSaveTemplate = (template: DocumentTemplate) => {
      setData(prev => ({
          ...prev,
          documentTemplates: [...(prev.documentTemplates || []), template]
      }));
  };

  const handleSaveMedicalHistory = (conditions: MedicalConditionItem[]) => {
      updatePatient(activePatient.id, { structuredMedicalHistory: conditions });
  };

  const handleSavePatientQueries = (answers: PatientQueryAnswer[]) => {
      updatePatient(activePatient.id, { patientQueries: answers });
  };

  const handleSavePaymentTransaction = (paymentData: { amount: number, description: string, date: string, type: 'payment' | 'charge' }) => {
      if (selectedPaymentTransaction) {
          const updatedPayments = activePatient.payments.map(p => 
              p.id === selectedPaymentTransaction.id 
              ? { ...p, ...paymentData }
              : p
          );
          updatePatient(activePatient.id, { payments: updatedPayments });
      } else {
          const newPayment: Payment = {
              id: Date.now().toString(),
              date: paymentData.date || new Date().toISOString(),
              amount: paymentData.amount,
              type: paymentData.type,
              description: paymentData.description
          };
          updatePatient(activePatient.id, { payments: [newPayment, ...activePatient.payments] });
      }
      setLocalPaymentModalOpen(false);
      setSelectedPaymentTransaction(null);
  };

  const handleDeletePaymentTransaction = (id: string) => {
      const updatedPayments = activePatient.payments.filter(p => p.id !== id);
      updatePatient(activePatient.id, { payments: updatedPayments });
  };

  const getAnswerLabel = (questionId: string, answerId: string) => {
      const question = PATIENT_QUESTIONS_LIST.find(q => q.id === questionId);
      if (!question) return '-';
      const option = question.options.find(o => o.id === answerId);
      if (!option) return '-';
      return currentLang === 'ar' ? option.ar : currentLang === 'ku' ? option.ku : option.en;
  };

  const openLocalPaymentModal = (type: 'payment' | 'charge', payment?: Payment) => {
      setLocalPaymentType(type);
      if (payment) {
          setSelectedPaymentTransaction(payment);
      } else {
          setSelectedPaymentTransaction(null);
      }
      setLocalPaymentModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full pb-10">
      
      <DocumentModal 
        show={showDocumentModal} 
        onClose={() => setShowDocumentModal(false)}
        t={t}
        type={documentType}
        data={data}
        onPrint={handlePrintDocument}
        onSaveTemplate={handleSaveTemplate}
      />

      <MedicalHistoryModal
        show={showMedicalHistoryModal}
        onClose={() => setShowMedicalHistoryModal(false)}
        t={t}
        currentLang={currentLang}
        initialData={activePatient.structuredMedicalHistory}
        onSave={handleSaveMedicalHistory}
      />

      <PatientQueriesModal
        show={showPatientQueriesModal}
        onClose={() => setShowPatientQueriesModal(false)}
        t={t}
        currentLang={currentLang}
        initialData={activePatient.patientQueries}
        onSave={handleSavePatientQueries}
      />

      <RxSettingsModal 
        show={showRxSettingsModal}
        onClose={() => setShowRxSettingsModal(false)}
        t={t}
        data={data}
        setData={setData}
        handleRxFileUpload={handleRxFileUpload}
        setShowAddMasterDrugModal={setShowAddMasterDrugModal}
        currentLang={currentLang}
      />

      <PaymentModal 
        show={localPaymentModalOpen} 
        onClose={() => setLocalPaymentModalOpen(false)}
        t={t} 
        activePatient={activePatient} 
        paymentType={selectedPaymentTransaction ? selectedPaymentTransaction.type : localPaymentType} 
        data={data} 
        handleSavePayment={handleSavePaymentTransaction}
        selectedPayment={selectedPaymentTransaction}
        currentLang={currentLang}
      />

      <div className="shrink-0 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            
            <button onClick={() => setSelectedPatientId(null)} className="md:hidden mb-2 flex items-center gap-2 text-gray-500">
                <ArrowLeft size={20} className="rtl:rotate-180" /> {t.back}
            </button>

            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl relative shadow-inner overflow-hidden group shrink-0 mx-auto md:mx-0">
                <span>{activePatient.gender === 'male' ? '👨' : '👩'}</span>
            </div>

            <div className="flex-1 text-center md:text-start w-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{activePatient.name}</h2>
                    <div className="flex gap-2 mt-3 md:mt-0">
                        <button onClick={() => setSelectedPatientId(null)} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <ArrowLeft size={20} className="rtl:rotate-180" /> {t.backToPatients}
                        </button>
                        <button onClick={() => setShowEditPatientModal(true)} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"><Edit2 size={20} /></button>
                        <button onClick={() => openConfirm(t.deletePatient, t.confirmDelete, () => handleDeletePatient(activePatient.id))} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 size={20} /></button>
                    </div>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span dir="ltr">{activePatient.phoneCode} {activePatient.phone}</span>
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(`${activePatient.phoneCode}${activePatient.phone}`)}
                            className="text-gray-400 hover:text-primary-500 transition"
                            title={t.copyPhone}
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {(() => {
                                const cat = CATEGORIES.find(c => c.id === activePatient.category);
                                return isRTL ? (currentLang === 'ku' ? cat?.labelKu : cat?.labelAr) : cat?.label || 'Other';
                            })()}
                        </span>
                    </div>
                        <span className="hidden md:inline">•</span>
                    <a 
                        href={`https://wa.me/${activePatient.phoneCode?.replace('+','')}${activePatient.phone.replace(/\s/g, '')}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:underline"
                    >
                        <MessageCircle size={14} /> {t.whatsapp}
                    </a>
                    <span className="hidden md:inline">•</span>
                    <a 
                        href={`tel:${activePatient.phoneCode?.replace('+','')}${activePatient.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                        <Phone size={14} /> {t.call}
                    </a>
                </div>
            </div>
        </div>

        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-100 dark:border-gray-700 pt-4">
          <TabButton icon={User} label={t.overview} active={patientTab === 'overview'} onClick={() => setPatientTab('overview')} />
          <TabButton icon={Activity} label={t.treatment} active={patientTab === 'chart'} onClick={() => setPatientTab('chart')} />
          <TabButton icon={ImageIcon} label={t.images} active={patientTab === 'images'} onClick={() => setPatientTab('images')} />
          <TabButton icon={Calendar} label={t.visitHistory} active={patientTab === 'visits'} onClick={() => setPatientTab('visits')} />
          
          {!isSecretary && (
              <TabButton icon={CreditCard} label={t.financials} active={patientTab === 'finance'} onClick={() => setPatientTab('finance')} />
          )}
          
          <TabButton icon={Pill} label={t.prescriptions} active={patientTab === 'prescriptions'} onClick={() => setPatientTab('prescriptions')} />
          <TabButton icon={FileText} label={t.documents} active={patientTab === 'documents'} onClick={() => setPatientTab('documents')} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 lg:p-8">
        {patientTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
              <div>
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     <User size={20} className="text-primary-500" />
                     {t.patientDetails}
                   </h3>
                   <div className="flex gap-2">
                       <select 
                           value={activePatient.status}
                           onChange={(e) => updatePatient(activePatient.id, { status: e.target.value as any })}
                           className={`px-3 py-1.5 rounded-lg border text-sm font-bold outline-none capitalize ${STATUS_COLORS[activePatient.status]}`}
                        >
                           <option value="active">{t.active}</option>
                           <option value="finished">{t.finished}</option>
                           <option value="pending">{t.pending}</option>
                           <option value="discontinued">{t.discontinued}</option>
                       </select>
                   </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">
                 <InfoItem label={t.name} value={activePatient.name} />
                 <InfoItem 
                    label={t.phone} 
                    value={<span dir="ltr" className={`block ${isRTL ? 'text-right' : 'text-left'}`}>{activePatient.phoneCode || ''} {activePatient.phone}</span>} 
                 />
                 <InfoItem label={t.age} value={activePatient.age.toString()} />
                 <InfoItem label={t.gender} value={activePatient.gender === 'male' ? t.male : t.female} />
                 <InfoItem label={t.treatingDoctor} value={data.doctors.find(d => d.id === activePatient.doctorId)?.name} />
                 <InfoItem label={t.category} value={(() => {
                    const cat = CATEGORIES.find(c => c.id === activePatient.category);
                    return isRTL ? (currentLang === 'ku' ? cat?.labelKu : cat?.labelAr) : cat?.label || 'Other';
                 })()} />
                 <InfoItem label={t.registrationDate} value={getLocalizedDate(new Date(activePatient.createdAt), 'full', currentLang)} className="md:col-span-2" />
                 <InfoItem label={t.address} value={activePatient.address || '-'} className="md:col-span-2" />
               </div>
             </div>

             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Smile size={20} className="text-blue-500" />
                        {t.dentalHistory}
                    </h3>
                    <button 
                        onClick={() => setShowPatientQueriesModal(true)}
                        className="text-sm font-bold text-blue-600 hover:underline"
                    >
                        {(activePatient.patientQueries && activePatient.patientQueries.length > 0) ? t.editDentalHistory : t.addDentalHistory}
                    </button>
                </div>

                {(activePatient.patientQueries && activePatient.patientQueries.length > 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {PATIENT_QUESTIONS_LIST.map(q => {
                            const answerId = activePatient.patientQueries?.find(a => a.questionId === q.id)?.answerId;
                            if (!answerId) return null;
                            
                            return (
                                <div key={q.id} className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                    <div className="text-xs text-blue-500 dark:text-blue-400 font-bold mb-1 uppercase tracking-wide">
                                        {currentLang === 'ar' ? q.ar : currentLang === 'ku' ? q.ku : q.en}
                                    </div>
                                    <div className="font-bold text-gray-800 dark:text-white text-lg">
                                        {getAnswerLabel(q.id, answerId)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl text-center text-gray-400 text-sm italic border border-dashed border-gray-200 dark:border-gray-600 mb-4">
                        {t.noMedicalHistory}
                    </div>
                )}

                <textarea 
                   className="w-full p-4 rounded-2xl bg-blue-50/50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:text-white min-h-[80px] placeholder-gray-400 text-sm"
                   value={activePatient.dentalHistoryNotes || ''}
                   onChange={(e) => updatePatient(activePatient.id, { dentalHistoryNotes: e.target.value })}
                   placeholder={t.addNotesPlaceholder}
                />
             </div>

             <div>
               <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ClipboardList size={20} className="text-primary-500" />
                        {t.medicalHistory}
                    </h3>
                    
                    {(activePatient.structuredMedicalHistory && activePatient.structuredMedicalHistory.length > 0) ? (
                        <button 
                            onClick={() => setShowMedicalHistoryModal(true)}
                            className="text-sm font-bold text-primary-600 hover:underline"
                        >
                            {t.viewMedicalHistory}
                        </button>
                    ) : (
                         <button 
                            onClick={() => setShowMedicalHistoryModal(true)}
                            className="text-sm font-bold text-primary-600 hover:underline"
                        >
                            {t.addMedicalHistory}
                        </button>
                    )}
               </div>

               {(activePatient.structuredMedicalHistory && activePatient.structuredMedicalHistory.some(c => c.active)) && (
                   <div className="flex flex-wrap gap-2 mb-4">
                       {activePatient.structuredMedicalHistory.filter(c => c.active).map(c => {
                           const condition = MEDICAL_CONDITIONS_LIST.find(mc => mc.id === c.id);
                           const label = condition ? (currentLang === 'ar' ? condition.ar : currentLang === 'ku' ? condition.ku : condition.en) : c.id;
                           return (
                               <span key={c.id} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold border border-red-200 flex items-center gap-1">
                                   <Activity size={14} /> {label}
                               </span>
                           );
                       })}
                   </div>
               )}

               <textarea 
                   className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-primary-500 dark:text-white min-h-[100px]"
                   value={activePatient.medicalHistory}
                   onChange={(e) => updatePatient(activePatient.id, { medicalHistory: e.target.value })}
                   placeholder={t.addNotesPlaceholder}
               />
             </div>
             
             <div>
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                 <StickyNote size={20} className="text-primary-500" />
                 {t.notes}
               </h3>
               <textarea 
                   className="w-full p-4 rounded-2xl bg-yellow-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white min-h-[120px]"
                   value={activePatient.notes}
                   onChange={(e) => updatePatient(activePatient.id, { notes: e.target.value })}
                   placeholder={t.addNotesPlaceholder}
               />
             </div>
          </div>
        )}
        
        {patientTab === 'chart' && (
          <div className="space-y-10 animate-fade-in">
            <TeethChart 
              teeth={activePatient.teeth}
              headMap={activePatient.headMap}
              bodyMap={activePatient.bodyMap}
              onToothClick={(id, status) => handleUpdateTooth(activePatient.id, id, status)} 
              onToothSurfaceClick={(id, surface, status) => handleUpdateToothSurface(activePatient.id, id, surface, status)}
              onToothNoteUpdate={(id, note) => handleUpdateToothNote(activePatient.id, id, note)}
              onHeadClick={(region, status) => handleUpdateHead(activePatient.id, region, status)}
              onBodyClick={(region, status) => handleUpdateBody(activePatient.id, region, status)}
              language={currentLang}
              t={t}
            />

            <RCTDrawingBoard 
                t={t} 
                initialDrawing={activePatient.rctDrawing} 
                onSave={(base64) => updatePatient(activePatient.id, { rctDrawing: base64 })}
                googleDriveLinked={data.settings.googleDriveLinked}
                patient={activePatient}
                isRTL={isRTL}
            />

            <div className="mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.rct}</h3>
                </div>

                <div className="flex flex-wrap items-end gap-2 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                     <div>
                         <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.tooth}</label>
                         <input 
                            className="w-16 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" 
                            placeholder="#"
                            value={rctInput.tooth}
                            onChange={e => setRctInput({...rctInput, tooth: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.canal}</label>
                         <input 
                            className="w-24 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" 
                            placeholder="MB/DB/P"
                            value={rctInput.canal}
                            onChange={e => setRctInput({...rctInput, canal: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.length}</label>
                         <input 
                            className="w-24 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" 
                            placeholder="mm"
                            value={rctInput.length}
                            onChange={e => setRctInput({...rctInput, length: e.target.value})}
                         />
                     </div>
                     <button 
                        onClick={() => {
                            if(rctInput.tooth && rctInput.canal && rctInput.length) {
                                handleAddRCT(activePatient.id, { 
                                    toothNumber: rctInput.tooth, 
                                    canalName: rctInput.canal, 
                                    length: rctInput.length, 
                                    date: new Date().toISOString() 
                                });
                            }
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary-700 transition"
                     >
                         + {t.addRCT}
                     </button>
                </div>
                
                {(activePatient.rootCanals || []).length > 0 ? (
                   <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-gray-500 text-start">
                                  <th className="pb-2 px-2">{t.tooth}</th>
                                  <th className="pb-2 px-2">{t.canal}</th>
                                  <th className="pb-2 px-2">{t.length}</th>
                                  <th className="pb-2 px-2">{t.date}</th>
                                  <th className="pb-2 px-2">{t.action}</th>
                              </tr>
                          </thead>
                          <tbody>
                              {activePatient.rootCanals.map((r) => (
                                  <tr key={r.id} className="border-t border-gray-200 dark:border-gray-600">
                                      <td className="py-2 px-2 font-bold">{r.toothNumber}</td>
                                      <td className="py-2 px-2">{r.canalName}</td>
                                      <td className="py-2 px-2">{r.length}</td>
                                      <td className="py-2 px-2 text-xs opacity-70">{new Date(r.date).toLocaleDateString()}</td>
                                      <td className="py-2 px-2">
                                          <button onClick={() => openConfirm('Delete RCT', 'Remove this entry?', () => handleDeleteRCT(activePatient.id, r.id))} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                   </div>
                ) : (
                    <p className="text-gray-400 text-sm italic text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">No RCT data.</p>
                )}
            </div>
            
             <div className="mt-8">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                     <StickyNote size={20} className="text-primary-500" />
                     {t.notes}
                 </h3>
                 <textarea 
                     className="w-full p-4 rounded-2xl bg-yellow-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white min-h-[120px]"
                     value={activePatient.notes}
                     onChange={(e) => updatePatient(activePatient.id, { notes: e.target.value })}
                     placeholder={t.addNotesPlaceholder}
                 />
            </div>
          </div>
        )}

        {patientTab === 'images' && (
            <PatientImages 
                t={t} 
                patient={activePatient} 
                onUpdatePatient={updatePatient}
                googleDriveLinked={data.settings.googleDriveLinked}
                googleDriveRootId={data.settings.googleDriveRootId}
                openConfirm={openConfirm}
            />
        )}
        
        {patientTab === 'visits' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.appointmentHistory}</h3>
              <button 
                onClick={() => { setSelectedAppointment(null); setShowAppointmentModal(true); setAppointmentMode('existing'); }}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-700"
              >
                <Plus size={16} /> {t.addAppointment}
              </button>
            </div>

            <div className="space-y-3">
              {activePatient.appointments.length === 0 ? (
                 <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                     {t.noVisits}
                 </div>
              ) : (
                 [...activePatient.appointments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
                  <div key={appt.id} className="flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 items-start sm:items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-gray-800 dark:text-white">
                                {getLocalizedDate(new Date(appt.date), 'full', currentLang)} {t.at} {formatTime12(appt.time, currentLang)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded uppercase font-bold ${
                                appt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                'bg-blue-100 text-blue-700'
                            }`}>{t[appt.status] || appt.status}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {getTreatmentLabel(appt.treatmentType, currentLang, isRTL) || t.checkup} • {appt.duration || 30} {t.min}
                            {appt.sessionNumber && ` • ${t.session} ${appt.sessionNumber}`}
                        </div>
                        {appt.notes && <div className="text-sm text-gray-400 mt-1 italic">"{appt.notes}"</div>}
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                        <button 
                          onClick={() => setPrintingAppointment(appt)}
                          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                          title={t.printTicket}
                        >
                          <Printer size={16} />
                        </button>
                        <button onClick={() => { setSelectedAppointment(appt); setShowAppointmentModal(true); setAppointmentMode('existing'); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => openConfirm(t.deleteAppointment, t.deleteAppointmentConfirm, () => handleDeleteAppointment(activePatient.id, appt.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {patientTab === 'finance' && !isSecretary && (
          <div className="animate-fade-in space-y-8">
              <div className="flex justify-end mb-2">
                <select
                  value={data.settings.currency}
                  onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, currency: e.target.value } }))}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-sm font-bold cursor-pointer"
                >
                  {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{t.totalCost}</span>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {data.settings.currency} {activePatient.payments.filter(p => p.type === 'charge').reduce((acc, curr) => acc + curr.amount, 0)}
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">{t.totalPaid}</span>
                    <div className="text-2xl font-bold text-green-700 dark:text-blue-300">
                        {data.settings.currency} {activePatient.payments.filter(p => p.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0)}
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-blue-800">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">{t.remaining}</span>
                    <div className="text-2xl font-bold text-orange-700 dark:text-blue-300">
                        {data.settings.currency} {
                            activePatient.payments.filter(p => p.type === 'charge').reduce((acc, curr) => acc + curr.amount, 0) - 
                            activePatient.payments.filter(p => p.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0)
                        }
                    </div>
                </div>
              </div>

              <div className="flex gap-4">
                  <button 
                    onClick={() => openLocalPaymentModal('charge')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition flex justify-center items-center gap-2"
                  >
                     <Plus size={18} /> {t.addCharge}
                  </button>
                  <button 
                    onClick={() => openLocalPaymentModal('payment')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 transition flex justify-center items-center gap-2"
                  >
                     <DollarSign size={18} /> {t.addPayment}
                  </button>
              </div>

              <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 dark:text-white mt-4 flex items-center justify-between">
                      {t.transactionHistory}
                  </h3>
                  {activePatient.payments.length === 0 ? (
                      <p className="text-center text-gray-400 italic py-4">{t.noTransactions}</p>
                  ) : (
                      activePatient.payments.map(p => (
                          <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 group">
                              <div className="flex-1">
                                  <div className={`text-sm font-bold uppercase mb-1 ${p.type === 'payment' ? 'text-green-600' : 'text-blue-600'}`}>
                                      {p.type === 'payment' ? t.paymentReceived : t.treatmentCost}
                                  </div>
                                  <div className="text-gray-800 dark:text-white font-medium">{p.description}</div>
                                  <div className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="text-xl font-bold text-gray-800 dark:text-white">
                                    {p.type === 'payment' ? '+' : '-'}{p.amount}
                                 </div>
                                 {p.type === 'payment' && (
                                    <button 
                                        onClick={() => setPrintingPayment(p)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                        title={t.print}
                                    >
                                        <Printer size={18} />
                                    </button>
                                 )}
                                 <button 
                                    onClick={() => openLocalPaymentModal(p.type, p)}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                    title="Edit"
                                 >
                                     <Edit2 size={18} />
                                 </button>
                                 <button 
                                    onClick={() => openConfirm('Delete Transaction', 'Remove this payment record?', () => handleDeletePaymentTransaction(p.id))}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    title="Delete"
                                 >
                                     <Trash2 size={18} />
                                 </button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
        )}

        {patientTab === 'prescriptions' && (
            <div className="animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Pill className="text-primary-500" /> {t.prescriptions}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => setShowRxModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary-700 transition whitespace-nowrap transform hover:-translate-y-0.5"
                        >
                            <Plus size={18} /> {t.newPrescription}
                        </button>
                        <button 
                            onClick={() => setShowRxSettingsModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap transform hover:-translate-y-0.5"
                        >
                            <Settings size={18} /> {t.settings}
                        </button>
                    </div>
                </div>

                {(!activePatient.prescriptions || activePatient.prescriptions.length === 0) ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                        <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">{t.noRx}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {activePatient.prescriptions.map((rx) => (
                            <div key={rx.id} className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 border-b border-gray-100 dark:border-gray-600 pb-3 w-full">
                                    <div>
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">{t.date}</div>
                                        <div className="font-bold text-lg text-gray-800 dark:text-white">
                                            {getLocalizedDate(new Date(rx.date), 'full', currentLang)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                                         <button 
                                            onClick={() => openConfirm(t.deleteRx, t.deleteRxConfirm, () => handleDeleteRx(rx.id))}
                                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setPrintingRx(rx)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg font-bold text-sm hover:bg-gray-200 transition"
                                        >
                                            <Printer size={16} /> {t.print}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3" dir="ltr">
                                    {rx.medications.map((med, idx) => (
                                        <div key={idx} className="flex flex-wrap items-baseline gap-2 break-words">
                                            <span className="font-bold text-gray-800 dark:text-white min-w-[20px]">{idx + 1}.</span>
                                            <span className="font-bold text-primary-700 dark:text-primary-300 text-lg">{med.name}</span>
                                            <span className="text-gray-600 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-md">{med.dose}</span>
                                            <span className="text-gray-500 dark:text-gray-400 italic text-sm">- {med.form} {med.frequency}</span>
                                            {med.notes && <span className="text-xs text-gray-400 ml-2">({med.notes})</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {patientTab === 'documents' && (
          <div className="animate-fade-in space-y-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <FileText className="text-primary-500" /> {t.documents}
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-bl-xl">
                       {t.paperSizeA4}
                   </div>
                   <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.consentForm}</h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <label className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer transition gap-2 group">
                            <Upload size={24} className="text-gray-400 group-hover:text-primary-500" />
                            <span className="text-sm font-bold text-gray-500 group-hover:text-primary-500">{t.uploadBg}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDocumentFileUpload(e, 'consent')} />
                       </label>
                       
                       <div className="flex flex-col gap-2">
                           <button onClick={() => openDocumentModal('consent')} className="flex-1 flex flex-col items-center justify-center p-4 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition gap-2">
                                <Printer size={24} />
                                <span className="text-sm font-bold">{t.printDocument}</span>
                           </button>
                       </div>
                   </div>
                   
                   {data.settings.consentBackgroundImage && (
                       <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                           <Check size={12} /> {t.bgImageSet}
                       </div>
                   )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-bl-xl">
                       {t.paperSizeA5}
                   </div>
                   <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.patientInstructions}</h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <label className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer transition gap-2 group">
                            <Upload size={24} className="text-gray-400 group-hover:text-primary-500" />
                            <span className="text-sm font-bold text-gray-500 group-hover:text-primary-500">{t.uploadBg}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleDocumentFileUpload(e, 'instructions')} />
                       </label>
                       
                       <div className="flex flex-col gap-2">
                           <button onClick={() => openDocumentModal('instructions')} className="flex-1 flex flex-col items-center justify-center p-4 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition gap-2">
                                <Printer size={24} />
                                <span className="text-sm font-bold">{t.printDocument}</span>
                           </button>
                       </div>
                   </div>
                   
                   {data.settings.instructionsBackgroundImage && (
                       <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                           <Check size={12} /> {t.bgImageSet}
                       </div>
                   )}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};
