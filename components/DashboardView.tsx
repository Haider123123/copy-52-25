
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Activity, UserPlus, CreditCard, Lock, Unlock, ShieldCheck, FlaskConical, X, Filter, Stethoscope, Users, Calendar, AlertCircle, ChevronRight, Search, UserCircle, ToggleLeft, ToggleRight, Percent, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, addMonths, isSameMonth, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, isWithinInterval } from 'date-fns';
import { ClinicData, Patient } from '../types';

interface DashboardViewProps {
  t: any;
  data: ClinicData;
  allAppointments: any[];
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  activeDoctorId?: string | null;
  setSelectedPatientId: (id: string | null) => void;
  setCurrentView: (view: 'patients' | 'dashboard' | 'memos' | 'calendar' | 'settings' | 'purchases' | 'expenses' | 'labOrders' | 'inventory') => void;
  setPatientTab: (tab: 'overview' | 'chart' | 'visits' | 'finance' | 'prescriptions' | 'documents' | 'examination') => void;
}

type TimeRange = 'today' | 'week' | 'month' | '30days';

const DebtorsModal = ({ isOpen, onClose, t, debtors, onSelectPatient, currency, isRTL }: any) => {
    const [search, setSearch] = useState('');
    if (!isOpen) return null;

    const filtered = debtors.filter((d: any) => d.name.toLowerCase().includes(search.toLowerCase()));
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    return createPortal(
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up border border-gray-100 dark:border-gray-700">
                <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.debtorsList}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                    <div className="relative">
                        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={18} />
                        <input 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 dark:text-white outline-none font-bold text-sm`}
                            placeholder={t.searchPatients}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <Users size={48} className="mx-auto mb-4" />
                            <p className="font-bold">{t.noDebtors}</p>
                        </div>
                    ) : (
                        filtered.map((d: any) => (
                            <button 
                                key={d.id}
                                onClick={() => onSelectPatient(d.id)}
                                className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 hover:shadow-md transition-all group"
                            >
                                <div className="text-start">
                                    <div className="font-black text-gray-800 dark:text-white text-lg group-hover:text-primary-600 transition-colors">{d.name}</div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{d.doctorName}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-end">
                                        <div className="text-red-600 font-black text-xl">{currency} {d.debt.toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{t.remaining}</div>
                                    </div>
                                    <ChevronRight size={18} className={`text-gray-300 group-hover:text-primary-400 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const ExaminationsListModal = ({ isOpen, onClose, t, exams, onSelectPatient, currency, isRTL, filterDoctorId }: any) => {
    const [search, setSearch] = useState('');
    if (!isOpen) return null;

    const filtered = exams.filter((e: any) => {
        const matchSearch = e.patientName.toLowerCase().includes(search.toLowerCase());
        const matchDoctor = !filterDoctorId || e.doctorId === filterDoctorId;
        return matchSearch && matchDoctor;
    });

    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    return createPortal(
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up border border-gray-100 dark:border-gray-700">
                <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.examination}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                    <div className="relative">
                        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={18} />
                        <input 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 dark:text-white outline-none font-bold text-sm`}
                            placeholder={t.searchPatients}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <Activity size={48} className="mx-auto mb-4" />
                            <p className="font-bold">{t.noTransactions}</p>
                        </div>
                    ) : (
                        filtered.map((e: any, idx: number) => (
                            <button 
                                key={idx}
                                onClick={() => onSelectPatient(e.patientId)}
                                className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md transition-all group text-start"
                            >
                                <div className="flex-1">
                                    <div className="font-black text-gray-800 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">{e.patientName}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{e.doctorName}</span>
                                        <span className="text-[10px] text-gray-300">•</span>
                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(e.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium mt-1">{e.description || t.checkup}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-end">
                                        <div className="text-indigo-600 font-black text-xl">{currency} {e.amount.toLocaleString()}</div>
                                    </div>
                                    <ChevronRight size={18} className={`text-gray-300 group-hover:text-indigo-400 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ t, data, allAppointments, setData, activeDoctorId, setSelectedPatientId, setCurrentView, setPatientTab }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showDebtorsModal, setShowDebtorsModal] = useState(false);
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [examFilterDoctorId, setExamFilterDoctorId] = useState<string | null>(null);
  
  // خيار دمج الكشفيات للأطباء فقط
  const [includeExamsInFinance, setIncludeExamsInFinance] = useState(() => {
      const saved = localStorage.getItem('dentro_include_exams_finance');
      return saved !== null ? saved === 'true' : true;
  });

  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isRTL = data.settings.language === 'ar' || data.settings.language === 'ku';
  const isAdmin = !activeDoctorId;
  const currentDoctor = activeDoctorId ? data.doctors.find(d => d.id === activeDoctorId) : null;

  useEffect(() => {
      localStorage.setItem('dentro_include_exams_finance', includeExamsInFinance.toString());
  }, [includeExamsInFinance]);

  // Determine current active PIN
  const getCurrentPin = () => {
      if (activeDoctorId) {
          const doc = data.doctors.find(d => d.id === activeDoctorId);
          return doc?.dashboardPin || '';
      }
      return data.settings.dashboardPin || '';
  };

  const currentPinValue = getCurrentPin();

  useEffect(() => {
     if (!currentPinValue) {
         setIsUnlocked(true);
     }
  }, [activeDoctorId, currentPinValue]);
  
  const calculateDashboardStats = (range: TimeRange) => {
    const today = new Date();
    let currentStart: Date, currentEnd: Date;
    let prevStart: Date, prevEnd: Date;
    let comparisonLabel = t.vsLastMonth;

    switch (range) {
        case 'today':
            currentStart = startOfDay(today);
            currentEnd = endOfDay(today);
            prevStart = startOfDay(subDays(today, 1));
            prevEnd = endOfDay(subDays(today, 1));
            comparisonLabel = t.vsYesterday;
            break;
        case 'week':
            currentStart = startOfWeek(today, { weekStartsOn: 6 }); 
            currentEnd = endOfWeek(today, { weekStartsOn: 6 });
            prevStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 6 });
            prevEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 6 });
            comparisonLabel = t.vsLastWeek;
            break;
        case 'month':
            currentStart = startOfMonth(today);
            currentEnd = endOfMonth(today);
            prevStart = startOfMonth(subMonths(today, 1));
            prevEnd = endOfMonth(subMonths(today, 1));
            comparisonLabel = t.vsLastMonth;
            break;
        case '30days':
            currentStart = subDays(today, 30);
            currentEnd = today;
            prevStart = subDays(today, 60);
            prevEnd = subDays(today, 31);
            comparisonLabel = t.vsPreviousPeriod;
            break;
    }

    const isInRange = (dateStr: string, start: Date, end: Date) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return isWithinInterval(d, { start, end });
    };

    const basePatients = activeDoctorId 
        ? data.patients.filter(p => p.doctorId === activeDoctorId)
        : data.patients;

    const getIncome = (start: Date, end: Date) => {
        return basePatients.reduce((total, p) => {
            const paymentsIncome = p.payments.filter(pay => pay.type === 'payment' && isInRange(pay.date, start, end)).reduce((sum, pay) => sum + pay.amount, 0);
            
            // إضافة مبالغ الكشفيات بناءً على خيار الدمج
            let examsIncome = 0;
            if (isAdmin || includeExamsInFinance) {
                examsIncome = (p.examinations || []).filter(ex => isInRange(ex.date, start, end)).reduce((sum, ex) => sum + ex.amount, 0);
            }
            
            return total + paymentsIncome + examsIncome;
        }, 0);
    };

    const getExamsTotal = (start: Date, end: Date) => {
        return basePatients.reduce((total, p) => {
            return total + (p.examinations || []).filter(ex => isInRange(ex.date, start, end)).reduce((sum, ex) => sum + ex.amount, 0);
        }, 0);
    };

    const getExamsList = (start: Date, end: Date) => {
        return basePatients.flatMap(p => 
            (p.examinations || [])
            .filter(ex => isInRange(ex.date, start, end))
            .map(ex => ({
                ...ex,
                patientId: p.id,
                patientName: p.name,
                doctorId: p.doctorId,
                doctorName: data.doctors.find(d => d.id === p.doctorId)?.name || 'Unknown'
            }))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const getExpenses = (start: Date, end: Date) => {
        return (data.expenses || []).filter(e => isInRange(e.date, start, end)).reduce((sum, e) => sum + (e.price * e.quantity), 0);
    };

    const getNewPatients = (start: Date, end: Date) => {
        return basePatients.filter(p => isInRange(p.createdAt, start, end)).length;
    };

    const incomeCurrent = getIncome(currentStart, currentEnd);
    const incomePrev = getIncome(prevStart, prevEnd);
    const examsTotalCurrent = getExamsTotal(currentStart, currentEnd);
    const examsListCurrent = getExamsList(currentStart, currentEnd);

    const expensesCurrent = getExpenses(currentStart, currentEnd);
    const expensesPrev = getExpenses(prevStart, prevEnd);
    const profitCurrent = incomeCurrent - expensesCurrent;
    const profitPrev = incomePrev - expensesPrev;
    const patientsCurrent = getNewPatients(currentStart, currentEnd);
    const patientsPrev = getNewPatients(prevStart, prevEnd);

    const doctorsToMap = activeDoctorId 
        ? data.doctors.filter(d => d.id === activeDoctorId)
        : data.doctors;

    const doctorStats = doctorsToMap.map(doc => {
        const docPatients = data.patients.filter(p => p.doctorId === doc.id);
        const docPatientIds = docPatients.map(p => p.id);
        const newPatientsCount = docPatients.filter(p => isInRange(p.createdAt, currentStart, currentEnd)).length;
        
        const paymentsIncome = docPatients.reduce((total, p) => {
            return total + p.payments.filter(pay => pay.type === 'payment' && isInRange(pay.date, currentStart, currentEnd)).reduce((sum, pay) => sum + pay.amount, 0);
        }, 0);
        
        const docExamsIncome = docPatients.reduce((total, p) => {
            return total + (p.examinations || []).filter(ex => isInRange(ex.date, currentStart, currentEnd)).reduce((sum, ex) => sum + ex.amount, 0);
        }, 0);

        const appointments = allAppointments.filter(a => docPatientIds.includes(a.patientId) && isInRange(a.date, currentStart, currentEnd)).length;

        const docDebt = docPatients.reduce((total, p) => {
            const paid = p.payments.filter(pay => pay.type === 'payment').reduce((s, pay) => s + pay.amount, 0);
            const cost = p.payments.filter(pay => pay.type === 'charge').reduce((s, pay) => s + pay.amount, 0);
            return total + Math.max(0, cost - paid);
        }, 0);

        // تعديل الدخل للطبيب بناءً على خيار الدمج
        const finalDocIncome = isAdmin || includeExamsInFinance 
            ? paymentsIncome + docExamsIncome 
            : paymentsIncome;

        return { 
            id: doc.id, 
            name: doc.name, 
            totalPatients: newPatientsCount, 
            income: finalDocIncome, 
            examIncome: docExamsIncome,
            appointments, 
            debt: docDebt 
        };
    });

    const debtors = basePatients.map(p => {
        const totalPaid = p.payments.filter(pay => pay.type === 'payment').reduce((s, pay) => s + pay.amount, 0);
        const totalCost = p.payments.filter(pay => pay.type === 'charge').reduce((s, pay) => s + pay.amount, 0);
        const debt = totalCost - totalPaid;
        return { 
            id: p.id, 
            name: p.name, 
            debt, 
            doctorId: p.doctorId,
            doctorName: data.doctors.find(d => d.id === p.doctorId)?.name || 'Unknown'
        };
    }).filter(d => d.debt > 0).sort((a,b) => b.debt - a.debt);

    const totalOutstanding = debtors.reduce((sum, d) => sum + d.debt, 0);

    let chartData: any[] = [];
    if (range === 'today' || range === 'week') {
         const daysToShow = 7;
         chartData = Array.from({length: daysToShow}, (_, i) => {
             const d = subDays(today, (daysToShow - 1) - i);
             const dayIncome = basePatients.reduce((total, p) => {
                const pay = p.payments.filter(py => py.type === 'payment' && isInRange(py.date, startOfDay(d), endOfDay(d))).reduce((s, py) => s + py.amount, 0);
                const ex = (isAdmin || includeExamsInFinance) ? (p.examinations || []).filter(e => isInRange(e.date, startOfDay(d), endOfDay(d))).reduce((s, e) => s + e.amount, 0) : 0;
                return total + pay + ex;
             }, 0);
             return { name: format(d, 'EEE'), income: dayIncome, expenses: getExpenses(startOfDay(d), endOfDay(d)) };
         });
    } else if (range === 'month') {
        const weeksToShow = 4;
        chartData = Array.from({length: weeksToShow}, (_, i) => {
             const wStart = subWeeks(today, (weeksToShow - 1) - i);
             const wEnd = endOfWeek(wStart, { weekStartsOn: 6 });
             const weekIncome = basePatients.reduce((total, p) => {
                const pay = p.payments.filter(py => py.type === 'payment' && isInRange(py.date, startOfWeek(wStart, { weekStartsOn: 6 }), wEnd)).reduce((s, py) => s + py.amount, 0);
                const ex = (isAdmin || includeExamsInFinance) ? (p.examinations || []).filter(e => isInRange(e.date, startOfWeek(wStart, { weekStartsOn: 6 }), wEnd)).reduce((s, e) => s + e.amount, 0) : 0;
                return total + pay + ex;
             }, 0);
             return { name: `W${i+1}`, income: weekIncome, expenses: getExpenses(startOfWeek(wStart, { weekStartsOn: 6 }), wEnd) };
         });
    } else {
        chartData = Array.from({length: 6}, (_, i) => {
             const dEnd = subDays(today, (5 - i) * 5);
             const dStart = subDays(dEnd, 4);
             const periodIncome = basePatients.reduce((total, p) => {
                const pay = p.payments.filter(py => py.type === 'payment' && isInRange(py.date, dStart, dEnd)).reduce((s, py) => s + py.amount, 0);
                const ex = (isAdmin || includeExamsInFinance) ? (p.examinations || []).filter(e => isInRange(e.date, dStart, dEnd)).reduce((s, e) => s + e.amount, 0) : 0;
                return total + pay + ex;
             }, 0);
             return { name: format(dEnd, 'dd/MM'), income: periodIncome, expenses: getExpenses(dStart, dEnd) };
        });
    }

    const relevantAppts = activeDoctorId 
        ? allAppointments.filter(a => a.patient?.doctorId === activeDoctorId)
        : allAppointments;

    const apptStatusCounts = relevantAppts.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const apptStatusData = Object.keys(apptStatusCounts).map(status => ({ name: t[status] || status, value: apptStatusCounts[status] }));

    const genderCounts = basePatients.reduce((acc, curr) => {
        acc[curr.gender] = (acc[curr.gender] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const genderData = [
        { name: t.male, value: genderCounts.male || 0, fill: '#6366f1' },
        { name: t.female, value: genderCounts.female || 0, fill: '#ec4899' }
    ];

    const recentActivity = basePatients.flatMap(p => {
        const payments = p.payments.map(pay => ({...pay, patientName: p.name}));
        const exams = (p.examinations || []).map(ex => ({...ex, patientName: p.name, type: 'payment', description: ex.description || t.checkup}));
        return [...payments, ...exams];
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    const baseLabOrders = activeDoctorId 
        ? (data.labOrders || []).filter(o => {
            const p = data.patients.find(pt => pt.id === o.patientId);
            return p?.doctorId === activeDoctorId;
        })
        : (data.labOrders || []);

    const totalLabOrders = baseLabOrders.filter(o => o.status === 'in_progress').length;
    const readyLabOrders = baseLabOrders.filter(o => o.status === 'ready').length;
    const totalLabCost = baseLabOrders.reduce((acc, o) => acc + (o.price || 0), 0);

    return {
        income: { current: incomeCurrent, prev: incomePrev },
        exams: { total: examsTotalCurrent, list: examsListCurrent },
        expenses: { current: expensesCurrent, prev: expensesPrev },
        profit: { current: profitCurrent, prev: profitPrev },
        patients: { current: patientsCurrent, prev: patientsPrev },
        comparisonLabel, chartData, apptStatusData, genderData, recentActivity,
        labStats: { active: totalLabOrders, ready: readyLabOrders, cost: totalLabCost },
        doctorStats,
        outstanding: { total: totalOutstanding, list: debtors }
    };
  };

  const stats = calculateDashboardStats(timeRange);
  
  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (pinInput === getCurrentPin()) {
          setIsUnlocked(true);
          setPinInput('');
          setErrorMsg('');
      } else {
          setErrorMsg(t.wrongPin);
      }
  };

  const updateDashboardPin = (newPin: string) => {
      const timestamp = Date.now();
      if (activeDoctorId) {
          setData(prev => ({
              ...prev,
              lastUpdated: timestamp,
              doctors: prev.doctors.map(d => d.id === activeDoctorId ? { ...d, dashboardPin: newPin } : d)
          }));
      } else {
          setData(prev => ({
              ...prev,
              lastUpdated: timestamp,
              settings: { ...prev.settings, dashboardPin: newPin }
          }));
      }
  };

  const handleSetPin = () => {
      if (pinInput.length !== 6 || isNaN(Number(pinInput))) {
          setErrorMsg('PIN must be 6 digits');
          return;
      }
      updateDashboardPin(pinInput);
      setShowSetPinModal(false);
      setIsUnlocked(true);
      setPinInput('');
  };

  const handleChangePin = () => {
      if (oldPinInput !== getCurrentPin()) {
          setErrorMsg(t.wrongPin);
          return;
      }
      if (pinInput.length !== 6 || isNaN(Number(pinInput))) {
          setErrorMsg('New PIN must be 6 digits');
          return;
      }
      updateDashboardPin(pinInput);
      setShowSetPinModal(false);
      setPinInput('');
      setOldPinInput('');
  };

  const handleRemovePin = () => {
      if (oldPinInput !== getCurrentPin()) {
          setErrorMsg(t.wrongPin);
          return;
      }
      updateDashboardPin('');
      setShowSetPinModal(false);
      setIsUnlocked(true);
      setOldPinInput('');
  };

  const handleSelectPatientFromDebtList = (id: string) => {
      setSelectedPatientId(id);
      setCurrentView('patients');
      setPatientTab('finance');
      setShowDebtorsModal(false);
  };

  const handleSelectPatientFromExamList = (id: string) => {
      setSelectedPatientId(id);
      setCurrentView('patients');
      setPatientTab('examination');
      setShowExamsModal(false);
  };

  const updateDoctorPercentage = (val: number) => {
      if (!activeDoctorId) return;
      setData(prev => ({
          ...prev,
          lastUpdated: Date.now(),
          doctors: prev.doctors.map(d => d.id === activeDoctorId ? { ...d, incomePercentage: val } : d)
      }));
  };

  // Dynamic Card Title Helper
  const getDynamicTitle = (type: 'income' | 'expenses' | 'profit' | 'patients' | 'percentage' | 'share') => {
      if (type === 'income') {
          return timeRange === 'today' ? t.incomeToday : timeRange === 'week' ? t.incomeWeekly : timeRange === 'month' ? t.monthlyIncome : t.incomeThirtyDays;
      }
      if (type === 'expenses') {
          return timeRange === 'today' ? t.expensesToday : timeRange === 'week' ? t.expensesWeekly : timeRange === 'month' ? t.monthlyExpenses : t.expensesThirtyDays;
      }
      if (type === 'profit') {
          return timeRange === 'today' ? t.profitToday : timeRange === 'week' ? t.profitWeekly : timeRange === 'month' ? t.netProfit : t.profitThirtyDays;
      }
      if (type === 'patients') {
          return timeRange === 'today' ? t.newPatientsToday : timeRange === 'week' ? t.newPatientsWeekly : timeRange === 'month' ? t.newPatientsThisMonth : t.newPatientsThirtyDays;
      }
      if (type === 'percentage') {
          return isRTL ? "نسبة الطبيب" : "Doctor Share %";
      }
      if (type === 'share') {
          return isRTL ? "حصتك الصافية" : "Your Net Share";
      }
      return '';
  };

  if (!isUnlocked && currentPinValue) {
      return (
         <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-sm w-full text-center">
                 <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Lock size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.locked}</h3>
                 <p className="text-gray-500 text-sm mb-6">{t.unlockToView}</p>
                 <form onSubmit={handleUnlock}>
                     <input 
                        type="text" maxLength={6} value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="• • • • • •"
                        className="w-full text-center text-2xl tracking-[0.5em] font-bold p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 mb-4 secure-input-field"
                        autoFocus
                        autoComplete="off"
                     />
                     {errorMsg && <p className="text-red-500 text-sm font-bold mb-4">{errorMsg}</p>}
                     <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg transition">{t.done}</button>
                 </form>
             </div>
         </div>
      );
  }

  const doctorSharePercent = currentDoctor?.incomePercentage || 100;
  const doctorShareAmount = (stats.income.current * doctorSharePercent) / 100;

  return (
    <>
        {showSetPinModal && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-scale-up">
                    <button onClick={() => setShowSetPinModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
                        {getCurrentPin() ? t.managePin : t.protectWithPin}
                    </h3>
                    {getCurrentPin() ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">{t.oldPin}</label>
                                <input type="text" maxLength={6} value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none secure-input-field" autoComplete="off" />
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <label className="block text-xs font-bold text-gray-500 mb-1">{t.newPin} (Optional for remove)</label>
                                <input type="text" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none secure-input-field" autoComplete="off" />
                            </div>
                            {errorMsg && <p className="text-red-500 text-sm font-bold">{errorMsg}</p>}
                            <div className="flex gap-2">
                                <button onClick={handleRemovePin} className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition">{t.removePin}</button>
                                <button onClick={handleChangePin} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition">{t.changePin}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">{t.setPin}</label>
                                <input type="text" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none text-center text-xl tracking-widest secure-input-field" placeholder="######" autoComplete="off" />
                            </div>
                            {errorMsg && <p className="text-red-500 text-sm font-bold">{errorMsg}</p>}
                            <button onClick={handleSetPin} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition">{t.save}</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        <DebtorsModal 
            isOpen={showDebtorsModal} 
            onClose={() => setShowDebtorsModal(false)} 
            t={t} 
            debtors={stats.outstanding.list} 
            onSelectPatient={handleSelectPatientFromDebtList}
            currency={data.settings.currency}
            isRTL={isRTL}
        />

        <ExaminationsListModal
            isOpen={showExamsModal}
            onClose={() => setShowExamsModal(false)}
            t={t}
            exams={stats.exams.list}
            onSelectPatient={handleSelectPatientFromExamList}
            currency={data.settings.currency}
            isRTL={isRTL}
            filterDoctorId={examFilterDoctorId}
        />

        <div className="w-full animate-fade-in pb-10 space-y-8 relative min-h-screen">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.dashboardTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* زر دمج الكشفيات للأطباء فقط */}
                    {!isAdmin && (
                        <button 
                            onClick={() => setIncludeExamsInFinance(!includeExamsInFinance)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${includeExamsInFinance ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                        >
                            {includeExamsInFinance ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            <span className="text-xs uppercase tracking-tight">
                                {isRTL ? "دمج الكشفيات ماليًا" : "Merge Exams in Finance"}
                            </span>
                        </button>
                    )}

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
                        {(['today', 'week', 'month', '30days'] as const).map(range => (
                            <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition whitespace-nowrap ${timeRange === range ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {range === 'today' ? t.today : range === 'week' ? t.thisWeek : range === 'month' ? t.month : t.last30Days}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setPinInput(''); setOldPinInput(''); setErrorMsg(''); setShowSetPinModal(true); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition shadow-sm ${getCurrentPin() ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'bg-primary-50 text-primary-600'}`}>
                        {getCurrentPin() ? <Lock size={18} /> : <ShieldCheck size={18} />}
                        <span className="hidden sm:inline">{getCurrentPin() ? t.managePin : t.protectWithPin}</span>
                    </button>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl text-green-600 dark:text-green-400"><DollarSign size={24} /></div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.income.current >= stats.income.prev ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stats.income.current >= stats.income.prev ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stats.income.prev > 0 ? Math.round(((stats.income.current - stats.income.prev) / stats.income.prev) * 100) : 100}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{getDynamicTitle('income')}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.settings.currency} {stats.income.current.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.income.prev.toLocaleString()})</p>
                    </div>

                    {isAdmin ? (
                        <>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 dark:text-red-400"><Wallet size={24} /></div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.expenses.current <= stats.expenses.prev ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {stats.expenses.current > stats.expenses.prev ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {stats.expenses.prev > 0 ? Math.round(((stats.expenses.current - stats.expenses.prev) / stats.expenses.prev) * 100) : (stats.expenses.current > 0 ? 100 : 0)}%
                                    </div>
                                </div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{getDynamicTitle('expenses')}</h3>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.settings.currency} {stats.expenses.current.toLocaleString()}</div>
                                <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.expenses.prev.toLocaleString()})</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400"><Activity size={24} /></div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.profit.current >= stats.profit.prev ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {stats.profit.current >= stats.profit.prev ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {stats.profit.prev > 0 ? Math.round(((stats.profit.current - stats.profit.prev) / stats.profit.prev) * 100) : 100}%
                                    </div>
                                </div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{getDynamicTitle('profit')}</h3>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.settings.currency} {stats.profit.current.toLocaleString()}</div>
                                <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.profit.prev.toLocaleString()})</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400"><Percent size={24} /></div>
                                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                                        <input 
                                            type="number" 
                                            min="0" max="100" 
                                            value={doctorSharePercent} 
                                            onChange={(e) => updateDoctorPercentage(parseInt(e.target.value) || 0)}
                                            className="w-10 bg-transparent text-center font-black text-xs outline-none"
                                        />
                                        <span className="text-[10px] font-black opacity-40">%</span>
                                    </div>
                                </div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{getDynamicTitle('percentage')}</h3>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{doctorSharePercent}%</div>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold leading-tight">{isRTL ? "حدد نسبتك من الدخل الكلي ليتم حساب حصتك" : "Set your share % of the total income"}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600 dark:text-blue-400"><Briefcase size={24} /></div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm animate-pulse">Net Share</div>
                                </div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{getDynamicTitle('share')}</h3>
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{data.settings.currency} {doctorShareAmount.toLocaleString()}</div>
                                <p className="text-xs text-gray-400 mt-2">{isRTL ? "المبلغ المتبقي لك بعد احتساب النسبة" : "Total amount based on your %"}</p>
                            </div>
                        </>
                    )}

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl text-orange-600 dark:text-orange-400"><UserPlus size={24} /></div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.patients.current >= stats.patients.prev ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stats.patients.current >= stats.patients.prev ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stats.patients.prev > 0 ? Math.round(((stats.patients.current - stats.patients.prev) / stats.patients.prev) * 100) : (stats.patients.current > 0 ? 100 : 0)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{getDynamicTitle('patients')}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.patients.current}</div>
                        <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.patients.prev})</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Debtors Card */}
                    <button 
                        onClick={() => setShowDebtorsModal(true)}
                        className="bg-gradient-to-br from-rose-600 to-red-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-500/20 flex flex-col text-start relative overflow-hidden group transition-all hover:-translate-y-1"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform"><CreditCard size={32} /></div>
                                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"><AlertCircle size={18} /></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2 block">{t.totalOutstanding}</span>
                            <div className="text-4xl md:text-5xl font-black mb-6">{data.settings.currency} {stats.outstanding.total.toLocaleString()}</div>
                            <div className="flex items-center gap-2 font-bold text-sm bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                <span>{t.debtorsList}</span>
                                <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                            </div>
                        </div>
                        <CreditCard className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.05] group-hover:scale-110 transition-transform duration-700" />
                    </button>

                    {/* Total Examinations Card */}
                    <button 
                        onClick={() => { setExamFilterDoctorId(activeDoctorId || null); setShowExamsModal(true); }}
                        className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 flex flex-col text-start relative overflow-hidden group transition-all hover:-translate-y-1"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform"><Activity size={32} /></div>
                                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm"><ShieldCheck size={18} /></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2 block">
                                {!isAdmin ? (isRTL ? "مجموع كشفيات مرضاك" : "Your Patients Total Exams") : t.totalExaminations}
                            </span>
                            <div className="text-4xl md:text-5xl font-black mb-6">{data.settings.currency} {stats.exams.total.toLocaleString()}</div>
                            <div className="flex items-center gap-2 font-bold text-sm bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                <span>{t.examination}</span>
                                <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                            </div>
                        </div>
                        <Activity className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.05] group-hover:scale-110 transition-transform duration-700" />
                    </button>

                    {/* Lab Orders Stats Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-white/20 rounded-2xl shadow-inner"><FlaskConical size={28} className="text-white" /></div><h3 className="font-black text-xl tracking-tight">{t.labOrdersStats}</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-sm border border-white/10 shadow-inner"><div className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">{t.totalLabOrders}</div><div className="text-3xl font-black">{stats.labStats.active}</div></div>
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-sm border border-white/10 shadow-inner"><div className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">{t.readyLabOrders}</div><div className="text-3xl font-black">{stats.labStats.ready}</div></div>
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-sm border border-white/10 shadow-inner"><div className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">{t.totalLabCost}</div><div className="text-2xl font-black">{data.settings.currency} {stats.labStats.cost.toLocaleString()}</div></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">{t.financialOverview}</h3>
                    <div className="h-[300px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorExpense" x1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: data.settings.theme === 'dark' ? '#1f2937' : '#fff' }} itemStyle={{ color: data.settings.theme === 'dark' ? '#fff' : '#1f2937', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="income" name={t.income} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                {isAdmin && <Area type="monotone" dataKey="expenses" name={t.expenses} stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />}
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.appointmentStats}</h3>
                        <div className="flex-1 min-h-[250px]" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart><Pie data={stats.apptStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{stats.apptStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#ef4444', '#f59e0b'][index % 4]} />))}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: data.settings.theme === 'dark' ? '#1f2937' : '#fff' }} itemStyle={{ color: data.settings.theme === 'dark' ? '#fff' : '#1f2937' }} /><Legend iconType="circle" /></PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.genderDistribution}</h3>
                        <div className="flex-1 min-h-[250px]" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.genderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: data.settings.theme === 'dark' ? '#1f2937' : '#fff' }} itemStyle={{ color: data.settings.theme === 'dark' ? '#fff' : '#1f2937' }} /><Bar dataKey="value" radius={[10, 10, 0, 0]}>{stats.genderData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.recentActivity}</h3>
                        <div className="space-y-4">
                            {stats.recentActivity.length === 0 ? (<p className="text-gray-400 text-center text-sm py-4">{t.noTransactions}</p>) : (stats.recentActivity.map((act, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${act.type === 'payment' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>{act.type === 'payment' ? <DollarSign size={16} /> : <CreditCard size={16} />}</div><div><div className="font-bold text-sm text-gray-800 dark:text-white">{act.patientName}</div><div className="text-xs text-gray-400">{new Date(act.date).toLocaleDateString()}</div></div></div>
                                    <div className={`font-bold text-sm ${act.type === 'payment' ? 'text-green-600' : 'text-blue-600'}`}>{act.type === 'payment' ? '+' : '-'}{act.amount}</div>
                                </div>
                            )))}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Stethoscope size={24} className="text-primary-600" />{t.doctors} - {t.dashboard}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.doctorStats.map(doc => (
                            <div key={doc.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-5 transition-all hover:shadow-lg">
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-3"><div className="font-black text-xl text-gray-800 dark:text-white truncate">{doc.name}</div><div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">Doctor</div></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"><Users size={20} className="mx-auto mb-1 text-gray-400" /><div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{t.patients}</div><div className="font-black text-gray-800 dark:text-white text-lg">{doc.totalPatients}</div></div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"><DollarSign size={20} className="mx-auto mb-1 text-green-500" /><div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{t.income}</div><div className="font-black text-gray-800 dark:text-white text-sm">{data.settings.currency} {doc.income.toLocaleString()}</div></div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"><Calendar size={20} className="mx-auto mb-1 text-blue-500" /><div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{t.appointments}</div><div className="font-black text-gray-800 dark:text-white text-lg">{doc.appointments}</div></div>
                                    
                                    {/* زر الكشفية للطبيب (يظهر للجميع) ويكون تفاعلي */}
                                    <button 
                                        onClick={() => { setExamFilterDoctorId(doc.id); setShowExamsModal(true); }}
                                        className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 hover:shadow-md transition-all active:scale-95"
                                    >
                                        <Activity size={20} className="mx-auto mb-1 text-indigo-500" />
                                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest">{t.examination}</div>
                                        <div className="font-black text-indigo-700 dark:text-indigo-300 text-sm">{data.settings.currency} {doc.examIncome.toLocaleString()}</div>
                                    </button>
                                </div>
                                <div className="mt-auto pt-2 border-t border-gray-50 dark:border-gray-700">
                                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                                        <div className="text-[10px] text-red-600 dark:text-red-400 uppercase font-black tracking-widest">{t.totalOutstanding}</div>
                                        <div className="font-black text-red-700 dark:text-red-300 text-sm">{data.settings.currency} {doc.debt.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};
