
import React from 'react';
import { Plus, ShoppingBag, CheckCircle, Edit2, Trash2, Box, DollarSign, Tag } from 'lucide-react';
import { ClinicData, SupplyItem } from '../types';

interface PurchasesViewProps {
  t: any;
  data: ClinicData;
  setSelectedSupply: (item: SupplyItem | null) => void;
  setShowSupplyModal: (show: boolean) => void;
  handleConvertToExpense: (item: SupplyItem) => void;
  handleDeleteSupply: (id: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  t, data, setSelectedSupply, setShowSupplyModal, handleConvertToExpense, handleDeleteSupply, openConfirm
}) => {
  const supplies = data.supplies || [];
  const totalPurchases = supplies.reduce((acc, s) => acc + (s.price || 0) * s.quantity, 0);

  return (
    <div className="w-full animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/30">
              <ShoppingBag size={28} />
            </div>
            {t.purchases}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{t.managePurchases}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.totalPurchases}</span>
            <span className="text-xl font-black text-primary-600 dark:text-primary-400">
              {data.settings.currency} {totalPurchases.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={() => { setSelectedSupply(null); setShowSupplyModal(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl shadow-xl shadow-primary-500/40 transition-all transform hover:-translate-y-1 active:scale-95 font-bold"
          >
            <Plus size={20} />
            <span>{t.addItem}</span>
          </button>
        </div>
      </div>

      {supplies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={48} className="opacity-20" />
          </div>
          <p className="text-lg font-bold">{t.noItems}</p>
          <p className="text-sm opacity-60 mt-1">ابدأ بإضافة مستلزمات العيادة من الزر أعلاه</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supplies.map(item => (
            <div key={item.id} className="group relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-900 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    <Box size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 dark:text-white text-lg leading-tight mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-[10px] font-black uppercase tracking-tighter">ID: {item.id.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.quantity}</span>
                  <span className="text-xl font-black text-gray-700 dark:text-gray-200">x {item.quantity}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.price}</span>
                  <span className="text-xl font-black text-gray-700 dark:text-gray-200">{item.price || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{t.total}</span>
                  <span className="text-lg font-black text-primary-600 dark:text-primary-400">{data.settings.currency} {((item.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => openConfirm(t.convertToExpense, t.confirmConvert, () => handleConvertToExpense(item))}
                    className="p-3 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                    title={t.convertToExpense}
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button 
                    onClick={() => { setSelectedSupply(item); setShowSupplyModal(true); }} 
                    className="p-3 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => openConfirm(item.name, t.deleteItem, () => handleDeleteSupply(item.id))} 
                    className="p-3 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
