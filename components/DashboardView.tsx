
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Activity, UserPlus, CreditCard, Lock, Unlock, ShieldCheck, FlaskConical, X, Filter, Stethoscope, Users, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, addMonths, isSameMonth, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, isWithinInterval } from 'date-fns';
import { ClinicData } from '../types';

interface DashboardViewProps {
  t: any;
  data: ClinicData;
  allAppointments: any[];
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  activeDoctorId?: string | null;
}

type TimeRange = 'today' | 'week' | 'month' | '30days';

export const DashboardView: React.FC<DashboardViewProps> = ({ t, data, allAppointments, setData, activeDoctorId }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Determine current active PIN
  const getCurrentPin = () => {
      if (activeDoctorId) {
          const doc = data.doctors.find(d => d.id === activeDoctorId);
          return doc?.dashboardPin || '';
      }
      return data.settings.dashboardPin || '';
  };

  const currentPinValue = getCurrentPin();

  // التحقق من حالة القفل فقط عند فتح الشاشة أو مسح الرمز
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
            return total + p.payments.filter(pay => pay.type === 'payment' && isInRange(pay.date, start, end)).reduce((sum, pay) => sum + pay.amount, 0);
        }, 0);
    };

    const getExpenses = (start: Date, end: Date) => {
        return (data.expenses || []).filter(e => isInRange(e.date, start, end)).reduce((sum, e) => sum + (e.price * e.quantity), 0);
    };

    const getNewPatients = (start: Date, end: Date) => {
        return basePatients.filter(p => isInRange(p.createdAt, start, end)).length;
    };

    const incomeCurrent = getIncome(currentStart, currentEnd);
    const incomePrev = getIncome(prevStart, prevEnd);
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
        const income = docPatients.reduce((total, p) => {
            return total + p.payments.filter(pay => pay.type === 'payment' && isInRange(pay.date, currentStart, currentEnd)).reduce((sum, pay) => sum + pay.amount, 0);
        }, 0);
        const appointments = allAppointments.filter(a => docPatientIds.includes(a.patientId) && isInRange(a.date, currentStart, currentEnd)).length;

        return { id: doc.id, name: doc.name, totalPatients: newPatientsCount, income, appointments };
    });

    let chartData: any[] = [];
    if (range === 'today' || range === 'week') {
         const daysToShow = 7;
         chartData = Array.from({length: daysToShow}, (_, i) => {
             const d = subDays(today, (daysToShow - 1) - i);
             return { name: format(d, 'EEE'), income: getIncome(startOfDay(d), endOfDay(d)), expenses: getExpenses(startOfDay(d), endOfDay(d)) };
         });
    } else if (range === 'month') {
        const weeksToShow = 4;
        chartData = Array.from({length: weeksToShow}, (_, i) => {
             const wStart = subWeeks(today, (weeksToShow - 1) - i);
             const wEnd = endOfWeek(wStart, { weekStartsOn: 6 });
             return { name: `W${i+1}`, income: getIncome(startOfWeek(wStart, { weekStartsOn: 6 }), wEnd), expenses: getExpenses(startOfWeek(wStart, { weekStartsOn: 6 }), wEnd) };
         });
    } else {
        chartData = Array.from({length: 6}, (_, i) => {
             const dEnd = subDays(today, (5 - i) * 5);
             const dStart = subDays(dEnd, 4);
             return { name: format(dEnd, 'dd/MM'), income: getIncome(dStart, dEnd), expenses: getExpenses(dStart, dEnd) };
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

    const recentActivity = basePatients.flatMap(p => 
        p.payments.map(pay => ({...pay, patientName: p.name}))
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

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
        expenses: { current: expensesCurrent, prev: expensesPrev },
        profit: { current: profitCurrent, prev: profitPrev },
        patients: { current: patientsCurrent, prev: patientsPrev },
        comparisonLabel, chartData, apptStatusData, genderData, recentActivity,
        labStats: { active: totalLabOrders, ready: readyLabOrders, cost: totalLabCost },
        doctorStats
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
      // نضمن تحديث طابع الوقت فوراً لضمان فوز التغيير في عملية المزامنة
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
      setIsUnlocked(true); // نضمن البقاء في حالة الفتح
      setOldPinInput('');
  };

  if (!isUnlocked && currentPinValue) {
      return (
         <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-sm w-full text-center">
                 <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Lock size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.locked}</h3>
                 <p className="text-gray-500 text-sm mb-6">{t.unlockToView}</p>
                 <form onSubmit={handleUnlock}>
                     <input 
                        type="password" maxLength={6} value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="• • • • • •"
                        className="w-full text-center text-2xl tracking-[0.5em] font-bold p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 mb-4"
                        autoFocus
                     />
                     {errorMsg && <p className="text-red-500 text-sm font-bold mb-4">{errorMsg}</p>}
                     <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg transition">{t.done}</button>
                 </form>
             </div>
         </div>
      );
  }

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
                                <input type="password" maxLength={6} value={oldPinInput} onChange={(e) => setOldPinInput(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <label className="block text-xs font-bold text-gray-500 mb-1">{t.newPin} (Optional for remove)</label>
                                <input type="password" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
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
                                <input type="password" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none text-center text-xl tracking-widest" placeholder="######" />
                            </div>
                            {errorMsg && <p className="text-red-500 text-sm font-bold">{errorMsg}</p>}
                            <button onClick={handleSetPin} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition">{t.save}</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="w-full animate-fade-in pb-10 space-y-8 relative min-h-screen">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.dashboardTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{t.monthlyIncome}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.settings.currency} {stats.income.current.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.income.prev.toLocaleString()})</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 dark:text-red-400"><Wallet size={24} /></div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.expenses.current <= stats.expenses.prev ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stats.expenses.current > stats.expenses.prev ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stats.expenses.prev > 0 ? Math.round(((stats.expenses.current - stats.expenses.prev) / stats.expenses.prev) * 100) : (stats.expenses.current > 0 ? 100 : 0)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{t.monthlyExpenses}</h3>
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
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{t.netProfit}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.settings.currency} {stats.profit.current.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.profit.prev.toLocaleString()})</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl text-orange-600 dark:text-orange-400"><UserPlus size={24} /></div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.patients.current >= stats.patients.prev ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stats.patients.current >= stats.patients.prev ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stats.patients.prev > 0 ? Math.round(((stats.patients.current - stats.patients.prev) / stats.patients.prev) * 100) : (stats.patients.current > 0 ? 100 : 0)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">{t.newPatientsThisMonth}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.patients.current}</div>
                        <p className="text-xs text-gray-400 mt-2">{stats.comparisonLabel} ({stats.patients.prev})</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg mt-6">
                    <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-white/20 rounded-xl"><FlaskConical size={24} className="text-white" /></div><h3 className="font-bold text-lg">{t.labOrdersStats}</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10"><div className="text-blue-100 text-xs font-bold uppercase mb-1">{t.totalLabOrders}</div><div className="text-2xl font-bold">{stats.labStats.active}</div></div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10"><div className="text-blue-100 text-xs font-bold uppercase mb-1">{t.readyLabOrders}</div><div className="text-2xl font-bold">{stats.labStats.ready}</div></div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10"><div className="text-blue-100 text-xs font-bold uppercase mb-1">{t.totalLabCost}</div><div className="text-2xl font-bold">{data.settings.currency} {stats.labStats.cost.toLocaleString()}</div></div>
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
                                <Area type="monotone" dataKey="income" name={t.income} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" /><Area type="monotone" dataKey="expenses" name={t.expenses} stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" /><Legend verticalAlign="top" height={36} iconType="circle" />
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
                            <div key={doc.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-3"><div className="font-bold text-lg text-gray-800 dark:text-white truncate">{doc.name}</div><div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">Dr.</div></div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><Users size={16} className="mx-auto mb-1 text-gray-400" /><div className="text-xs text-gray-500 uppercase">{t.patients}</div><div className="font-bold text-gray-800 dark:text-white">{doc.totalPatients}</div></div>
                                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><DollarSign size={16} className="mx-auto mb-1 text-green-500" /><div className="text-xs text-gray-500 uppercase">{t.income}</div><div className="font-bold text-gray-800 dark:text-white text-xs md:text-sm">{data.settings.currency} {doc.income.toLocaleString()}</div></div>
                                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><Calendar size={16} className="mx-auto mb-1 text-blue-500" /><div className="text-xs text-gray-500 uppercase">{t.appointments}</div><div className="font-bold text-gray-800 dark:text-white">{doc.appointments}</div></div>
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
