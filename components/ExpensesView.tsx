
import React, { useState } from 'react';
import { Plus, Banknote, Edit2, Trash2, Calendar, Tag, DollarSign, Wallet } from 'lucide-react';
import { CURRENCY_LIST } from '../constants';
import { isSameDay, isSameWeek, isSameMonth, addDays } from 'date-fns';
import { ClinicData, ExpenseItem } from '../types';

interface ExpensesViewProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  setSelectedExpense: (item: ExpenseItem | null) => void;
  setShowExpenseModal: (show: boolean) => void;
  handleDeleteExpense: (id: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  t, data, setData, setSelectedExpense, setShowExpenseModal, handleDeleteExpense, openConfirm
}) => {
  const [expenseFilter, setExpenseFilter] = useState<'day' | 'week' | 'month' | 'custom' | 'all'>('day');

  const getFilteredExpenses = () => {
      const now = new Date();
      return (data.expenses || []).filter(item => {
          const itemDate = new Date(item.date);
          if (expenseFilter === 'all') return true;
          if (expenseFilter === 'day') return isSameDay(itemDate, now);
          if (expenseFilter === 'week') return isSameWeek(itemDate, now, { weekStartsOn: 6 });
          if (expenseFilter === 'month') return isSameMonth(itemDate, now);
          if (expenseFilter === 'custom') return itemDate >= addDays(now, -30);
          return true;
      }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="w-full animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/30">
              <Banknote size={28} />
            </div>
            {t.expenses}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t.manageExpenses}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex overflow-x-auto no-scrollbar">
                {(['day', 'week', 'month', 'custom', 'all'] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setExpenseFilter(filter)}
                        className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${expenseFilter === filter ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        {filter === 'custom' ? t.thirtyDays : t[filter] || filter}
                    </button>
                ))}
            </div>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <select
                  value={data.settings.currency}
                  onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, currency: e.target.value } }))}
                  className="bg-transparent font-black text-gray-700 dark:text-white outline-none cursor-pointer text-sm"
                >
                  {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <button 
              onClick={() => { setSelectedExpense(null); setShowExpenseModal(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-red-500/30 transition-all font-bold"
            >
              <Plus size={20} />
              <span>{t.addExpense}</span>
            </button>
        </div>
      </div>

      {/* Summary Highlight */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl mb-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                  <span className="text-gray-400 font-black uppercase text-xs tracking-[0.2em] mb-2 block">{t.totalExpenses}</span>
                  <div className="text-5xl font-black flex items-baseline gap-2">
                      <span className="text-red-500 text-2xl">{data.settings.currency}</span>
                      {totalAmount.toLocaleString()}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-bold">
                      <Calendar size={12} />
                      {expenseFilter === 'day' ? t.today : expenseFilter === 'week' ? t.week : expenseFilter === 'month' ? t.month : 'تصفية مخصصة'}
                  </div>
              </div>
              <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center border border-red-500/30 backdrop-blur-md">
                  <Wallet size={40} className="text-red-500" />
              </div>
          </div>
          <DollarSign className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.03]" />
      </div>

       {filteredExpenses.length === 0 ? (
           <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 p-20 text-center text-gray-400 flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Banknote size={40} className="opacity-20" />
               </div>
               <p className="text-lg font-bold">{t.noExpenses}</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredExpenses.map(item => (
                   <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-300 group">
                       <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                   <Tag size={24} />
                               </div>
                               <div>
                                   <h3 className="font-black text-gray-800 dark:text-white text-lg leading-tight">{item.name}</h3>
                                   <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                                       <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                                   </span>
                               </div>
                           </div>
                           <div className="flex flex-col items-end">
                               <span className="text-[10px] font-bold text-gray-400 uppercase">{t.price}</span>
                               <span className="font-black text-gray-700 dark:text-gray-200">{item.price}</span>
                           </div>
                       </div>

                       <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{t.quantity}</span>
                                <span className="font-black text-gray-800 dark:text-white">x {item.quantity}</span>
                            </div>
                            <div className="text-end">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{t.total}</span>
                                <div className="text-xl font-black text-red-600 dark:text-red-400">
                                    {data.settings.currency} {(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                       </div>

                       <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                                onClick={() => { setSelectedExpense(item); setShowExpenseModal(true); }} 
                                className="p-3 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                title={t.editItem}
                           >
                               <Edit2 size={18} />
                           </button>
                           <button 
                                onClick={() => openConfirm(item.name, t.deleteExpenseConfirm, () => handleDeleteExpense(item.id))} 
                                className="p-3 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                title={t.deleteExpense}
                           >
                               <Trash2 size={18} />
                           </button>
                       </div>
                   </div>
               ))}
           </div>
       )}
     </div>
  );
};
