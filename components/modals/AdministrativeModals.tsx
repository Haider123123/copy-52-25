
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Search, User, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { COUNTRY_CODES, CATEGORIES, TREATMENT_TYPES, DURATIONS, STATUS_COLORS } from '../../constants';
import { Patient, Appointment } from '../../types';

export const PatientModal = ({ show, onClose, t, isRTL, currentLang, data, handleAddPatient, updatePatient, guestToConvert, activePatient, activeDoctorId, isSaving, error }: any) => {
    if (!show) return null;
    const isEdit = !!activePatient;
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    
    const canChangeDoctor = !activeDoctorId;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{isEdit ? t.editPatient : (guestToConvert ? t.convertGuestTitle : t.newPatient)}</h3>
                <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-30"><X size={20} className="text-gray-500" /></button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const rawPhone = fd.get('phone') as string || '';
              const doctorIdToSave = activeDoctorId || (fd.get('doctorId') as string) || (data.doctors[0]?.id || '');

              const formValues: any = {
                 name: fd.get('name') as string,
                 age: parseInt(fd.get('age') as string) || 0,
                 gender: fd.get('gender') as any,
                 phone: rawPhone.replace(/\s/g, ''),
                 phoneCode: fd.get('phoneCode') as string,
                 address: fd.get('address') as string,
                 category: fd.get('category') as any,
                 doctorId: doctorIdToSave
              };
              
              if (isEdit) {
                  await updatePatient(activePatient.id, formValues);
              } else {
                  await handleAddPatient(formValues);
              }
            }} className="space-y-4">
              <fieldset disabled={isSaving} className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
                      <input name="name" defaultValue={isEdit ? activePatient.name : guestToConvert?.patientName} required autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50" placeholder={t.fullNamePlaceholder} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.age}</label>
                          <input name="age" type="number" defaultValue={isEdit ? activePatient.age : ''} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.gender}</label>
                          <select name="gender" defaultValue={isEdit ? activePatient.gender : 'male'} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50">
                            <option value="male">{t.male}</option>
                            <option value="female">{t.female}</option>
                          </select>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                      <div className="flex gap-2">
                          <select name="phoneCode" defaultValue={isEdit ? activePatient.phoneCode : data.settings.defaultCountryCode} className="w-24 px-2 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm transition disabled:opacity-50">
                              {COUNTRY_CODES.map(c => ( <option key={c.code} value={c.code}>{c.flag} {c.code}</option> ))}
                          </select>
                          <input name="phone" type="tel" defaultValue={isEdit ? activePatient.phone : ''} autoComplete="off" className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50" placeholder="750 000 0000" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
                      <select name="category" defaultValue={isEdit ? activePatient.category : "diagnosis"} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50">
                          {CATEGORIES.filter(c => c.id !== 'all').map(cat => ( <option key={cat.id} value={cat.id}>{isRTL ? (currentLang === 'ku' ? cat.labelKu : cat.labelAr) : cat.label}</option> ))}
                      </select>
                  </div>

                  {canChangeDoctor && data.doctors.length > 1 && (
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.treatingDoctor}</label>
                          <select name="doctorId" defaultValue={isEdit ? activePatient.doctorId : ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50">
                              {data.doctors.map((doc: any) => ( <option key={doc.id} value={doc.id}>{doc.name}</option> ))}
                          </select>
                      </div>
                  )}

                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                      <input name="address" defaultValue={isEdit ? activePatient.address : ''} autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition disabled:opacity-50" placeholder={t.cityStreetPlaceholder} />
                  </div>
              </fieldset>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isSaving && <Loader2 size={20} className="animate-spin" />}
                {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t.save}
              </button>
            </form>
          </div>
        </div>, document.body
    );
};

export const AppointmentModal = ({ show, onClose, t, selectedAppointment, appointmentMode, setAppointmentMode, selectedPatientId, data, currentDate, handleAddAppointment, isRTL, currentLang, isSaving, error }: any) => {
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatientIdForm, setSelectedPatientIdForm] = useState('');
    const [showPatientList, setShowPatientList] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (!show) { 
          setPatientSearch(''); 
          setSelectedPatientIdForm(''); 
          setShowPatientList(false); 
        } else { 
          if(selectedAppointment) { 
            setSelectedPatientIdForm(selectedAppointment.patientId); 
            setPatientSearch(selectedAppointment.patientName); 
          } else if (selectedPatientId) {
            const p = data.patients.find((p: any) => p.id === selectedPatientId);
            if (p) {
              setSelectedPatientIdForm(p.id);
              setPatientSearch(p.name);
            }
          }
        }
    }, [show, selectedAppointment, selectedPatientId, data.patients]);

    useEffect(() => { 
      if (show && !selectedAppointment && !selectedPatientId) { 
        setPatientSearch(''); 
        setSelectedPatientIdForm(''); 
        setShowPatientList(false); 
      } 
    }, [appointmentMode, show, selectedAppointment, selectedPatientId]);

    if (!show) return null;
    const filteredPatients = data.patients.filter((p: Patient) => 
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
        p.phone.includes(patientSearch) 
    );

    const isFixedContext = !!selectedAppointment || (!!selectedPatientId && appointmentMode === 'existing');

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedAppointment ? t.editAppointment : t.addAppointment}</h3>
                      <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-30"><X size={20} className="text-gray-400" /></button>
                  </div>

                  {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
                          <AlertCircle size={20} className="shrink-0" />
                          <p className="text-sm font-bold">{error}</p>
                      </div>
                  )}

                  {!selectedAppointment && !selectedPatientId && (
                      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-4 shadow-inner">
                          <button type="button" disabled={isSaving} onClick={() => setAppointmentMode('existing')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${appointmentMode === 'existing' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>{t.existingPatient}</button>
                          <button type="button" disabled={isSaving} onClick={() => setAppointmentMode('new')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${appointmentMode === 'new' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600' : 'text-gray-500'}`}>{t.quickNewPatient}</button>
                      </div>
                  )}

                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const apptData: Partial<Appointment> = {
                          date: fd.get('date') as string,
                          time: fd.get('time') as string,
                          duration: parseInt(fd.get('duration') as string),
                          treatmentType: fd.get('treatmentType') as string,
                          sessionNumber: parseInt(fd.get('sessionNumber') as string) || 1,
                          notes: fd.get('notes') as string
                      };
                      if (appointmentMode === 'new') { 
                          apptData.patientName = fd.get('guestName') as string; 
                          handleAddAppointment(null, apptData); 
                      } else { 
                          let pId = selectedPatientId || selectedPatientIdForm; 
                          if (!pId) { 
                              alert(isRTL ? "يرجى اختيار مريض من القائمة" : "Please select a patient from the list"); 
                              return; 
                          } 
                          handleAddAppointment(pId, apptData); 
                      }
                  }} className="space-y-4">
                      
                      <fieldset disabled={isSaving} className="space-y-4">
                        {appointmentMode === 'existing' ? (
                            <div className="relative" ref={searchRef}>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.patients}</label>
                                
                                {selectedPatientIdForm ? (
                                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-200 dark:border-primary-800 rounded-xl animate-scale-up">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-md"><User size={20} /></div>
                                            <div>
                                                <div className="font-bold text-primary-900 dark:text-primary-100 leading-tight">{patientSearch}</div>
                                                <div className="text-[10px] text-primary-600/70 font-bold uppercase">{t.selected}</div>
                                            </div>
                                        </div>
                                        {!isFixedContext && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setSelectedPatientIdForm(''); setPatientSearch(''); setShowPatientList(false); }}
                                                className="p-2 text-primary-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={20} />
                                        <input 
                                            type="text" 
                                            value={patientSearch} 
                                            onChange={(e) => { setPatientSearch(e.target.value); setShowPatientList(true); }} 
                                            onFocus={() => setShowPatientList(true)} 
                                            autoComplete="off"
                                            className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 transition-all font-bold`} 
                                            placeholder={t.searchPatients} 
                                            required 
                                        />
                                        {showPatientList && patientSearch && (
                                           <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 z-[110] max-h-48 overflow-y-auto rounded-xl shadow-2xl mt-2 animate-fade-in custom-scrollbar">
                                               {filteredPatients.length > 0 ? ( 
                                                  filteredPatients.map((p: Patient) => (
                                                      <div 
                                                          key={p.id} 
                                                          className="p-4 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer text-sm dark:text-white border-b last:border-0 border-gray-50 dark:border-gray-700 flex justify-between items-center group" 
                                                          onMouseDown={(e) => { 
                                                              e.preventDefault(); 
                                                              setPatientSearch(p.name); 
                                                              setSelectedPatientIdForm(p.id); 
                                                              setShowPatientList(false); 
                                                          }}
                                                      >
                                                          <div>
                                                              <div className="font-black text-gray-800 dark:text-white group-hover:text-primary-600 transition-colors">{p.name}</div>
                                                              <div className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">{p.phone}</div>
                                                          </div>
                                                          <ChevronDown size={14} className="text-gray-300 group-hover:text-primary-400 -rotate-90" />
                                                      </div> 
                                                  ))
                                               ) : ( 
                                                  <div className="p-6 text-sm text-gray-400 italic text-center font-bold">{t.noPatientsFilter}</div> 
                                               )}
                                           </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.guestNamePlaceholder}</label>
                                <input name="guestName" defaultValue={selectedAppointment?.patientName} autoComplete="off" className="w-full p-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 font-bold" required placeholder={t.guestNamePlaceholder} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.date}</label>
                                <input name="date" type="date" defaultValue={selectedAppointment?.date || format(currentDate, 'yyyy-MM-dd')} required className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white outline-none font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.time}</label>
                                <input name="time" type="time" defaultValue={selectedAppointment?.time || '09:00'} required className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white outline-none font-bold text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.treatmentType}</label>
                                <select name="treatmentType" defaultValue={selectedAppointment?.treatmentType || 'diagnosis'} className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white outline-none font-bold text-sm">
                                    {TREATMENT_TYPES.map(type => ( <option key={type.id} value={type.id}>{currentLang === 'ku' ? type.ku : (currentLang === 'ar' ? type.ar : type.en)}</option> ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.duration}</label>
                                <select name="duration" defaultValue={selectedAppointment?.duration || 30} className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white outline-none font-bold text-sm">
                                    {DURATIONS.map(d => <option key={d} value={d}>{d} {t.min}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.sessionNumber}</label>
                                <input name="sessionNumber" type="number" min="1" defaultValue={selectedAppointment?.sessionNumber || 1} className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white outline-none font-bold text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">{t.notes}</label>
                            <textarea name="notes" defaultValue={selectedAppointment?.notes} autoComplete="off" className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none font-medium text-sm shadow-inner" placeholder={t.optionalNotesPlaceholder} rows={2} />
                        </div>
                      </fieldset>

                      <div className="flex gap-3 pt-4">
                          <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 py-4 text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-30">{t.cancel}</button>
                          <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
                             {isSaving && <Loader2 size={16} className="animate-spin" />}
                             {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t.save}
                          </button>
                      </div>
                  </form>
              </div>
          </div>, document.body
    );
};
