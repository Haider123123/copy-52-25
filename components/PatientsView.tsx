
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageCircle, Phone, ArrowUpDown, ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react';
import { CATEGORIES, STATUS_COLORS } from '../constants';
import { getLocalizedDate } from '../utils';
import { ClinicData } from '../types';

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
  onAddAppointment?: (patientId: string) => void; // إضافة Prop جديد
}

const ITEMS_PER_PAGE = 100;

export const PatientsView: React.FC<PatientsViewProps> = ({
  t, data, isRTL, currentLang, setSelectedPatientId, setPatientTab, setCurrentView, setShowNewPatientModal,
  selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, onAddAppointment
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'oldest'>('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [filterDoctor, setFilterDoctor] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAge, setFilterAge] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

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

  // 1. First, Filter ALL data
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

  // 2. Then, Pagination Logic (Slice the filtered data)
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const displayedPatients = filteredPatients.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

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
         <button 
          onClick={() => setShowNewPatientModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          <span>{t.newPatient}</span>
        </button>
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
             className="w-full ps-12 pe-4 py-4 rounded-xl border-none shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
           />
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
             <div className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-500 pointer-events-none">
                 <ArrowUpDown size={18} />
             </div>
             <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-full ps-10 pe-8 py-4 rounded-xl shadow-sm border-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold outline-none cursor-pointer appearance-none"
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

      <div className="flex flex-col gap-3">
        {filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                {searchQuery || showFilter ? t.noPatientsFilter : t.noPatientsCategory}
            </div>
        ) : (
            displayedPatients.map(patient => (
            <div key={patient.id} className="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                
                <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => { setSelectedPatientId(patient.id); setPatientTab('overview'); setCurrentView('patients'); }}
                >
                <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shrink-0 border-2 border-white dark:border-gray-600 shadow-sm">
                        <span>{patient.gender === 'male' ? '👨' : '👩'}</span>
                    </div>
                    <div className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${STATUS_COLORS[patient.status].split(' ')[0].replace('bg-', 'bg-')}`} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-primary-600 transition">{patient.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span dir="ltr">{patient.phoneCode} {patient.phone}</span>
                    <span>•</span>
                    <span className="uppercase text-xs font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{t[patient.status] || patient.status}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                        {patient.category ? (CATEGORIES.find(c => c.id === patient.category)?.[isRTL ? (currentLang === 'ku' ? 'labelKu' : 'labelAr') : 'label'] || patient.category) : 'Other'}
                    </span>
                     <span className="hidden sm:inline">•</span>
                     <span className="hidden sm:inline text-xs opacity-70">
                        {getLocalizedDate(new Date(patient.createdAt), 'full', currentLang)}
                     </span>
                    </div>
                </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* زر حجز الموعد الجديد */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddAppointment?.(patient.id); }}
                        className="p-3 bg-primary-100 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition shadow-sm"
                        title={t.addAppointment}
                    >
                        <CalendarPlus size={20} />
                    </button>

                    <a 
                        href={`https://wa.me/${patient.phoneCode?.replace('+','')}${patient.phone.replace(/\s/g, '')}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition shadow-sm"
                        title={t.contactWhatsapp}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MessageCircle size={20} />
                    </a>
                    
                    <a 
                        href={`tel:${patient.phoneCode?.replace('+','')}${patient.phone.replace(/\s/g, '')}`}
                        className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Phone size={20} />
                    </a>
                </div>

            </div>
            ))
        )}
      </div>

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
