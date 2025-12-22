
import React, { useState } from 'react';
import { Filter, ChevronLeft, ChevronRight, Users, Plus, Check, X as XIcon, History, Trash2 } from 'lucide-react';
import { addMonths, addWeeks, addDays, endOfWeek, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, format } from 'date-fns';
import { getLocalizedDate, formatTime12, getTreatmentLabel } from '../utils';
import { DAY_COLORS } from '../constants';
import { ClinicData } from '../types';

interface CalendarViewProps {
  t: any;
  data: ClinicData;
  currentLang: any;
  isRTL: boolean;
  calendarView: 'month' | 'week' | 'day';
  setCalendarView: (v: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  filteredAppointments: any[];
  setSelectedAppointment: (appt: any) => void;
  setAppointmentMode: (mode: 'existing' | 'new') => void;
  setShowAppointmentModal: (show: boolean) => void;
  handleUpdateAppointmentStatus: (patientId: string, appId: string, status: any) => void;
  handleDeleteAppointment: (patientId: string, appId: string) => void;
  setSelectedPatientId: (id: string) => void;
  setCurrentView: (view: any) => void;
  setPatientTab: (tab: any) => void;
  setGuestToConvert: (appt: any) => void;
  setShowNewPatientModal: (show: boolean) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  t, data, currentLang, isRTL, calendarView, setCalendarView, currentDate, setCurrentDate,
  filteredAppointments, setSelectedAppointment, setAppointmentMode, setShowAppointmentModal,
  handleUpdateAppointmentStatus, handleDeleteAppointment, setSelectedPatientId, setCurrentView,
  setPatientTab, setGuestToConvert, setShowNewPatientModal, openConfirm
}) => {
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);
  const [calendarFilterDoctor, setCalendarFilterDoctor] = useState<string>('');
  const [calendarFilterGender, setCalendarFilterGender] = useState<string>('');

  const displayedAppointments = filteredAppointments.filter(appt => {
      const p = appt.patient;
      if (calendarFilterDoctor) {
          if (!p || p.doctorId !== calendarFilterDoctor) return false;
      }
      if (calendarFilterGender) {
          if (!p || p.gender !== calendarFilterGender) return false;
      }
      return true;
  });

  return (
    <div className="w-full animate-fade-in pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
         <div className="shrink-0">
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.calendar}</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">{t.manageCalendar}</p>
         </div>
         
         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button 
                onClick={() => setShowCalendarFilter(!showCalendarFilter)}
                className={`p-2 rounded-lg border transition ${showCalendarFilter ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-white text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                title={t.filter}
            >
                <Filter size={20} />
            </button>

            {showCalendarFilter && (
                <>
                    <select 
                        value={calendarFilterDoctor}
                        onChange={(e) => setCalendarFilterDoctor(e.target.value)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-bold outline-none flex-1 lg:flex-none min-w-[140px] animate-scale-up"
                    >
                        <option value="">{t.selectDoctor}</option>
                        {data.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select 
                        value={calendarFilterGender}
                        onChange={(e) => setCalendarFilterGender(e.target.value)}
                        className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-bold outline-none flex-1 lg:flex-none min-w-[120px] animate-scale-up"
                    >
                        <option value="">{t.selectGender}</option>
                        <option value="male">{t.male}</option>
                        <option value="female">{t.female}</option>
                    </select>
                </>
            )}

            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl shrink-0">
                {(['month', 'week', 'day'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setCalendarView(v)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${calendarView === v ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                    >
                        {t[v]}
                    </button>
                ))}
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(calendarView === 'month' ? addMonths(currentDate, -1) : calendarView === 'week' ? addWeeks(currentDate, -1) : addDays(currentDate, -1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="rtl:rotate-180" /></button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white min-w-[140px] text-center">
                  {getLocalizedDate(currentDate, 'month', currentLang)}
              </h2>
              <button onClick={() => setCurrentDate(calendarView === 'month' ? addMonths(currentDate, 1) : calendarView === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="rtl:rotate-180" /></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-primary-600 font-bold hover:bg-primary-50 px-3 py-1.5 rounded-lg transition">{t.today}</button>
      </div>

      {calendarView === 'month' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="overflow-auto custom-scrollbar">
                <div className="min-w-[1000px]">
                    <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const d = addDays(new Date(2024, 0, 7), i);
                            return (
                                <div key={i} className="py-3 text-center text-sm font-bold text-gray-500">
                                    {getLocalizedDate(d, 'weekday', currentLang)}
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-7">
                        {eachDayOfInterval({ 
                            start: addDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), -new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()), 
                            end: endOfWeek(endOfMonth(currentDate)) 
                        }).map((day, idx) => {
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const dayAppointments = displayedAppointments.filter(a => isSameDay(new Date(a.date), day));
                            
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => { setCurrentDate(day); setCalendarView('day'); }}
                                    className={`border-b border-r border-gray-100 dark:border-gray-700 p-2 transition hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer flex flex-col items-start gap-1 min-h-[140px] ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''}`}
                                >
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-600 text-white' : isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    <div className="flex flex-col gap-0.5 w-full">
                                        {dayAppointments.map((appt, i) => (
                                            <div key={i} className="text-[10px] text-gray-600 dark:text-gray-300 truncate w-full px-1 leading-tight bg-blue-50/50 dark:bg-blue-900/20 rounded-sm border-l-2 border-blue-400">
                                                {appt.patientName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
              </div>
          </div>
      )}

      {calendarView === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {eachDayOfInterval({ start: addDays(currentDate, -currentDate.getDay()), end: endOfWeek(currentDate, { weekStartsOn: 0 }) }).map((day, idx) => {
                  const isToday = isSameDay(day, new Date());
                  const dayAppointments = displayedAppointments
                    .filter(a => isSameDay(new Date(a.date), day))
                    .sort((a,b) => a.time.localeCompare(b.time));

                  const colorClass = DAY_COLORS[idx % DAY_COLORS.length];
                  
                  return (
                      <div 
                          key={idx} 
                          onClick={() => { setCurrentDate(day); setCalendarView('day'); }}
                          className={`p-4 rounded-3xl border-2 shadow-sm cursor-pointer hover:shadow-md transition min-h-[160px] flex flex-col ${colorClass} ${idx === 6 ? 'md:col-span-2' : ''}`}
                      >
                          <div className="flex justify-between items-center mb-3 border-b border-black/10 pb-2">
                              <div>
                                  <div className="text-lg font-bold opacity-90">{getLocalizedDate(day, 'weekday', currentLang)}</div>
                                  <div className="text-sm opacity-70">{getLocalizedDate(day, 'full', currentLang)}</div>
                              </div>
                              {isToday && <span className="bg-white/50 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{t.today.toUpperCase()}</span>}
                          </div>

                          <div className="flex-1 space-y-2">
                              {dayAppointments.length === 0 ? (
                                  <div className="flex-1 flex items-center justify-center opacity-40 text-sm font-medium italic">
                                      {t.noAppsDay}
                                  </div>
                              ) : (
                                  dayAppointments.map(appt => (
                                      <div key={appt.id} className="flex items-center justify-between bg-white/60 dark:bg-black/20 p-2 rounded-xl">
                                          <span className="font-bold text-sm truncate max-w-[120px]">{appt.patientName}</span>
                                          <span className="text-xs font-mono bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded">{formatTime12(appt.time, currentLang)}</span>
                                      </div>
                                  ))
                              )}
                          </div>
                          
                          {dayAppointments.length > 0 && (
                             <div className="mt-2 text-xs opacity-75 font-bold text-end">
                                 {dayAppointments.length} {isRTL ? (currentLang === 'ku' ? 'دانیشتن' : 'جلسات') : 'Sessions'}
                             </div>
                          )}
                      </div>
                  );
              })}
          </div>
      )}

      {calendarView === 'day' && (
          <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {getLocalizedDate(currentDate, 'weekday', currentLang)}, {getLocalizedDate(currentDate, 'full', currentLang)}
                  </h2>
                  
                  <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2">
                      <Users size={18} />
                      <span>
                        {displayedAppointments.filter(a => isSameDay(new Date(a.date), currentDate)).length} {currentLang === 'ar' ? 'جلسات' : currentLang === 'ku' ? 'دانیشتن' : 'Sessions'}
                      </span>
                  </div>
              </div>
              
              <button 
                onClick={() => {
                    setSelectedAppointment(null);
                    setAppointmentMode('existing'); // Default to existing but modal shows toggle
                    setShowAppointmentModal(true);
                }}
                className="w-full py-4 bg-primary-50 dark:bg-gray-700 border-2 border-dashed border-primary-200 dark:border-gray-600 rounded-2xl text-primary-600 dark:text-primary-300 font-bold hover:bg-primary-100 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
              >
                  <Plus size={20} /> {t.addAppointment}
              </button>

              <div className="space-y-3">
                  {(() => {
                      const dayApps = displayedAppointments
                        .filter(a => isSameDay(new Date(a.date), currentDate))
                        .sort((a,b) => a.time.localeCompare(b.time));

                      return dayApps.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">{t.noAppsDay}</div>
                      ) : (
                        dayApps.map((appt, idx) => (
                         <div key={appt.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center animate-fade-in group">
                             
                             <div className="w-20 text-center border-r border-gray-100 dark:border-gray-700 pr-4">
                                 <div className="text-lg font-bold text-gray-800 dark:text-white">{formatTime12(appt.time, currentLang)}</div>
                                 <div className="text-xs text-gray-500">{appt.duration} {t.min}</div>
                             </div>
                             <div className="flex-1 min-w-[200px]">
                                 <div className="flex items-center gap-2 mb-1">
                                     <h3 className="font-bold text-lg text-gray-800 dark:text-white">{appt.patientName}</h3>
                                     {!appt.patientId && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Guest</span>}
                                 </div>
                                 <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                     {getTreatmentLabel(appt.treatmentType, currentLang, isRTL) || t.checkup}
                                     {appt.sessionNumber && <span>• {t.session} {appt.sessionNumber}</span>}
                                 </div>
                             </div>
                             
                             <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                 <button 
                                    onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'completed')}
                                    className={`p-2 rounded-md transition ${appt.status === 'completed' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-green-500'}`}
                                    title={t.markCompleted}
                                 >
                                     <Check size={18} />
                                 </button>
                                 <button 
                                    onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'noshow')}
                                    className={`p-2 rounded-md transition ${appt.status === 'noshow' ? 'bg-red-500 text-white shadow' : 'text-gray-400 hover:text-red-500'}`}
                                    title={t.markNoShow}
                                 >
                                     <XIcon size={18} />
                                 </button>
                                 {(appt.status === 'completed' || appt.status === 'noshow') && (
                                    <button 
                                        onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'scheduled')}
                                        className="p-2 ml-1 text-gray-400 hover:text-blue-500"
                                        title={t.resetStatus}
                                    >
                                        <History size={16} />
                                    </button>
                                 )}
                             </div>

                             <div className="flex gap-2">
                                 {appt.patientId ? (
                                     <button 
                                        onClick={() => { setSelectedPatientId(appt.patientId); setCurrentView('patients'); setPatientTab('overview'); }}
                                        className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg font-bold text-sm hover:bg-primary-100 transition"
                                     >
                                         {t.profile}
                                     </button>
                                 ) : (
                                     <button 
                                        onClick={() => { setGuestToConvert(appt); setShowNewPatientModal(true); }}
                                        className="px-3 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100 transition"
                                     >
                                         {t.addToPatients}
                                     </button>
                                 )}
                                 <button onClick={() => openConfirm(t.deleteAppointment, t.deleteAppointmentConfirm, () => handleDeleteAppointment(appt.patientId, appt.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                             </div>
                         </div>
                     ))
                    );
                  })()}
              </div>
          </div>
      )}
    </div>
  );
};
