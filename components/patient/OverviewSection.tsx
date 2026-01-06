
import React from 'react';
import { User, Smile, ClipboardList, StickyNote, Activity } from 'lucide-react';
import { InfoItem } from '../Shared';
import { STATUS_COLORS, CATEGORIES, MEDICAL_CONDITIONS_LIST, PATIENT_QUESTIONS_LIST } from '../../constants';
import { getLocalizedDate } from '../../utils';
import { Patient, ClinicData, Language } from '../../types';

interface OverviewSectionProps {
  activePatient: Patient;
  data: ClinicData;
  t: any;
  currentLang: Language;
  isRTL: boolean;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  setShowPatientQueriesModal: (show: boolean) => void;
  setShowMedicalHistoryModal: (show: boolean) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  activePatient, data, t, currentLang, isRTL, updatePatient, setShowPatientQueriesModal, setShowMedicalHistoryModal
}) => {
  const getAnswerLabel = (questionId: string, answerId: string) => {
      const question = PATIENT_QUESTIONS_LIST.find(q => q.id === questionId);
      if (!question) return '-';
      const option = question.options.find(o => o.id === answerId);
      if (!option) return '-';
      return currentLang === 'ar' ? option.ar : currentLang === 'ku' ? option.ku : option.en;
  };

  return (
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
           <InfoItem label={t.phone} value={<span dir="ltr" className={`block ${isRTL ? 'text-right' : 'text-left'}`}>{activePatient.phoneCode || ''} {activePatient.phone || ''}</span>} />
           <InfoItem label={t.age} value={(activePatient.age ?? 0).toString()} />
           <InfoItem label={t.gender} value={activePatient.gender === 'male' ? t.male : t.female} />
           <InfoItem label={t.treatingDoctor} value={data.doctors.find(d => d.id === activePatient.doctorId)?.name} />
           <InfoItem label={t.category} value={(() => {
              const cat = CATEGORIES.find(c => c.id === activePatient.category);
              return isRTL ? (currentLang === 'ku' ? cat?.labelKu : cat?.labelAr) : cat?.label || 'Other';
           })()} />
           <InfoItem label={t.registrationDate} value={getLocalizedDate(new Date(activePatient.createdAt || Date.now()), 'full', currentLang)} className="md:col-span-2" />
           <InfoItem label={t.address} value={activePatient.address || '-'} className="md:col-span-2" />
         </div>
       </div>

       <div>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Smile size={20} className="text-blue-500" />
                  {t.dentalHistory}
              </h3>
              <button onClick={() => setShowPatientQueriesModal(true)} className="text-sm font-bold text-blue-600 hover:underline">
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
                              <div className="text-xs text-blue-500 dark:text-blue-400 font-bold mb-1 uppercase tracking-wide">{currentLang === 'ar' ? q.ar : currentLang === 'ku' ? q.ku : q.en}</div>
                              <div className="font-bold text-gray-800 dark:text-white text-lg">{getAnswerLabel(q.id, answerId)}</div>
                          </div>
                      );
                  })}
              </div>
          ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl text-center text-gray-400 text-sm italic border border-dashed border-gray-200 dark:border-gray-600 mb-4">{t.noMedicalHistory}</div>
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
              <button onClick={() => setShowMedicalHistoryModal(true)} className="text-sm font-bold text-primary-600 hover:underline">
                  {(activePatient.structuredMedicalHistory && activePatient.structuredMedicalHistory.length > 0) ? t.viewMedicalHistory : t.addMedicalHistory}
              </button>
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
             value={activePatient.medicalHistory || ''}
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
             value={activePatient.notes || ''}
             onChange={(e) => updatePatient(activePatient.id, { notes: e.target.value })}
             placeholder={t.addNotesPlaceholder}
         />
       </div>
    </div>
  );
};
