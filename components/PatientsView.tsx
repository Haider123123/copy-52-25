
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageCircle, Phone, ArrowUpDown, ChevronLeft, ChevronRight, CalendarPlus, LayoutGrid, List } from 'lucide-react';
import { CATEGORIES, STATUS_COLORS } from '../constants';
import { getLocalizedDate, openWhatsApp } from '../utils';
import { ClinicData, Patient } from '../types';

interface PatientsViewProps {
  t: any;
  data: ClinicData;
  isRTL: boolean;
  currentLang: any;
  setSelectedPatientId: (id: string) => void;
  setPatientTab: (tab: any) => void;
  setCurrentView: (view: any) => void;
  setShowNewPatientModal: (show: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddAppointment?: (patientId: string) => void;
}

const ITEMS_PER_PAGE = 100;

export const PatientsView: React.FC<PatientsViewProps> = ({
  t, data, isRTL, currentLang, setSelectedPatientId, setPatientTab, setCurrentView, setShowNewPatientModal,
  selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, onAddAppointment
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('dentro_patients_view') as 'list' | 'grid') || 'list');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [filterDoctor, setFilterDoctor] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAge, setFilterAge] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  useEffect(() => {
      localStorage.setItem('dentro_patients_view', viewMode);
  }, [viewMode]);

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterDoctor, filterGender, filterStatus, filterAge, filterStartDate, filterEndDate, sortBy]);

  const resetFilters = () => {
    setFilterDoctor('');
    setFilterGender('');
    setFilterStatus('');
    setFilterAge('');
    setFilterStartDate('');
    setFilterEndDate('');
    setShowFilter(false);
  };

  const filteredPatients = data.patients.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery);
    
    const matchDoctor = !filterDoctor || p.doctorId === filterDoctor;
    const matchGender = !filterGender || p.gender === filterGender;
    const matchStatus = !filterStatus || p.status === filterStatus;
    
    let matchAge = true;
    if (filterAge === 'under18') matchAge = p.age < 18;
    else if (filterAge === '18-35') matchAge = p.age >= 18 && p.age <= 35;
    else if (filterAge === 'over35') matchAge = p.age > 35;

    let matchDate = true;
    if (filterStartDate) {
        matchDate = matchDate && new Date(p.createdAt) >= new Date(filterStartDate);
    }
    if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(p.createdAt) <= end;
    }

    return matchCategory && matchSearch && matchDoctor && matchGender && matchStatus && matchAge && matchDate;
  }).sort((a, b) => {
      if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else { // oldest
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
  });

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const displayedPatients = filteredPatients.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const PatientCardActions = ({ patient }: { patient: Patient }) => (
    <div className="flex items-center gap-2">
        <button 
            onClick={(e) => { e.stopPropagation(); onAddAppointment?.(patient.id); }}
            className="p-2.5 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition shadow-sm"
            title={t.addAppointment}
        >
            <CalendarPlus size={18} />
        </button>
        <button 
            onClick={(e) => { e.stopPropagation(); openWhatsApp(patient.phoneCode, patient.phone); }}
            className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition shadow-sm"
            title={t.contactWhatsapp}
        >
            <MessageCircle size={18} />
        </button>
        <a 
            href={`tel:${patient.phoneCode?.replace('+','')}${patient.phone.replace(/\s/g, '')}`}
            className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition shadow-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <Phone size={18} />
        </a>
    </div>
  );

  const getCategoryLabel = (patient: Patient) => {
      if (!patient.category) return 'Other';
      const cat = CATEGORIES.find(c => c.id === patient.category);
      return isRTL ? (currentLang === 'ku' ? cat?.labelKu : cat?.labelAr) : cat?.label || patient.category;
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
         <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.patients}</h1>
           <p className="text-sm text-gray-500">
               {filteredPatients.length} {t.registeredPatients} 
               {filteredPatients.length > ITEMS_PER_PAGE && ` (${t.page || 'Page'} ${currentPage} / ${totalPages})`}
           </p>
         </div>
         
         <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* View Mode Toggle */}
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    title={t.listView}
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    title={t.gridView}
                >
                    <LayoutGrid size={20} />
                </button>
             </div>

             <button 
              onClick={() => setShowNewPatientModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 font-bold"
            >
              <Plus size={20} />
              <span>{t.newPatient}</span>
            </button>
         </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition ${
                    selectedCategory === cat.id 
                    ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
                }`}
              >
                  {isRTL ? (currentLang === 'ku' ? cat.labelKu : cat.labelAr) : cat.label}
              </button>
          ))}
      </div>

      <div className="mb-6 relative flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
           <Search className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400" size={20} />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder={t.searchPatients}
             className="w-full ps-12 pe-4 py-4 rounded-xl border-none shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 transition font-medium"
           />
        </div>
        
        <div className="relative">
             <div className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-500 pointer-events-none">
                 <ArrowUpDown size={18} />
             </div>
             <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-full ps-10 pe-8 py-4 rounded-xl shadow-sm border-none bg-white dark:bg-gray-800 text-gray-700 dark:text-300 font-bold outline-none cursor-pointer appearance-none"
             >
                 <option value="name">{t.sortName}</option>
                 <option value="newest">{t.sortNewest}</option>
                 <option value="oldest">{t.sortOldest}</option>
             </select>
        </div>

        <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`px-4 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 font-bold transition ${showFilter ? 'bg-primary-50 text-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
            <Filter size={20} />
            <span className="hidden sm:inline">{t.filter}</span>
        </button>
      </div>

      {showFilter && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.doctors}</label>
                  <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none">
                      <option value="">{t.selectDoctor}</option>
                      {data.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.gender}</label>
                  <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none">
                      <option value="">{t.selectGender}</option>
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.ageGroup}</label>
                  <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none">
                      <option value="">{t.selectAge}</option>
                      <option value="under18">{t.under18}</option>
                      <option value="18-35">{t.from18to35}</option>
                      <option value="over35">{t.over35}</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.status}</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none capitalize">
                      <option value="">{t.selectStatus}</option>
                      <option value="active">{t.active}</option>
                      <option value="finished">{t.finished}</option>
                      <option value="pending">{t.pending}</option>
                      <option value="discontinued">{t.discontinued}</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.startDate}</label>
                  <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.endDate}</label>
                  <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none" />
              </div>

              <div className="sm:col-span-2 md:col-span-2 flex justify-end items-end">
                   <button onClick={resetFilters} className="text-sm text-red-500 hover:underline">{t.clearFilters}</button>
              </div>
          </div>
      )}

      {/* Patients Display Area */}
      {filteredPatients.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 animate-fade-in">
              {searchQuery || showFilter ? t.noPatientsFilter : t.noPatientsCategory}
          </div>
      ) : (
          viewMode === 'list' ? (
              <div className="flex flex-col gap-3">
                {displayedPatients.map(patient => {
                const statusColor = (STATUS_COLORS[patient.status] || STATUS_COLORS.active).split(' ')[0];
                return (
                <div 
                    key={patient.id} 
                    className="group bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
                    onClick={() => { setSelectedPatientId(patient.id); setPatientTab('overview'); setCurrentView('patients'); }}
                >
                    <div className="flex items-center gap-4 cursor-pointer flex-1">
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl overflow-hidden shrink-0 border-2 border-white dark:border-gray-600 shadow-sm ${statusColor}`}>
                                {patient.profilePicture ? (
                                    <img src={patient.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{patient.gender === 'male' ? '👨' : '👩'}</span>
                                )}
                            </div>
                            <div className={`absolute bottom-0 end-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${statusColor.replace('bg-', 'bg-')}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-primary-600 transition-colors">{patient.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <span dir="ltr" className="font-medium">{patient.phoneCode} {patient.phone}</span>
                                <span className="hidden sm:inline opacity-30">•</span>
                                <span className="uppercase text-[10px] font-black tracking-tighter bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md leading-none">{t[patient.status] || patient.status}</span>
                                <span className="hidden sm:inline opacity-30">•</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md leading-none">
                                    {getCategoryLabel(patient)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="self-end sm:self-center">
                        <PatientCardActions patient={patient} />
                    </div>
                </div>
                );
                })}
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                  {displayedPatients.map(patient => {
                      const statusClass = (STATUS_COLORS[patient.status] || STATUS_COLORS.active);
                      return (
                      <div 
                        key={patient.id} 
                        onClick={() => { setSelectedPatientId(patient.id); setPatientTab('overview'); setCurrentView('patients'); }}
                        className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 hover:border-primary-100 dark:hover:border-primary-900 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
                      >
                          {/* Top Status Badge */}
                          <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${statusClass}`}>
                              {t[patient.status] || patient.status}
                          </div>

                          <div className="mb-5 relative">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl transition-transform duration-500 group-hover:scale-110 ${statusClass.split(' ')[0]}`}>
                                    {patient.profilePicture ? (
                                        <img src={patient.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{patient.gender === 'male' ? '👨' : '👩'}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <ArrowUpDown size={14} className="rotate-90" />
                                </div>
                          </div>

                          <h3 className="font-black text-xl text-gray-800 dark:text-white mb-2 leading-tight group-hover:text-primary-600 transition-colors">{patient.name}</h3>
                          
                          <div dir="ltr" className="text-gray-500 dark:text-gray-400 font-mono font-bold text-sm mb-4">
                              {patient.phoneCode} {patient.phone}
                          </div>

                          <div className="mt-auto w-full space-y-4">
                              <div className="flex justify-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                                      {getCategoryLabel(patient)}
                                  </span>
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                      {patient.age} {t.age}
                                  </span>
                              </div>

                              <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-center">
                                  <PatientCardActions patient={patient} />
                              </div>
                          </div>
                      </div>
                  );
                  })}
              </div>
          )
      )}

      {/* Pagination Controls */}
      {filteredPatients.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition shadow-sm"
              >
                  <ChevronLeft size={18} className={isRTL ? "rotate-180" : ""} />
                  {isRTL ? (currentLang === 'ku' ? 'پێشوو' : 'السابق') : 'Previous'}
              </button>
              
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  {currentPage} / {totalPages}
              </span>

              <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition shadow-sm"
              >
                  {isRTL ? (currentLang === 'ku' ? 'دواتر' : 'التالي') : 'Next'}
                  <ChevronRight size={18} className={isRTL ? "rotate-180" : ""} />
              </button>
          </div>
      )}
    </div>
  );
};
