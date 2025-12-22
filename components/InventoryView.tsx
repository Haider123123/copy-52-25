
import React from 'react';
import { Package, Plus, AlertTriangle, Calendar, Edit2, Trash2 } from 'lucide-react';
import { ClinicData, InventoryItem } from '../types';
import { MEMO_COLORS } from '../constants';

interface InventoryViewProps {
  t: any;
  data: ClinicData;
  setSelectedInventoryItem: (item: InventoryItem | null) => void;
  setShowInventoryModal: (show: boolean) => void;
  handleDeleteInventoryItem: (id: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  t, data, setSelectedInventoryItem, setShowInventoryModal, handleDeleteInventoryItem, openConfirm
}) => {
  const inventory = data.inventory || [];
  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity).length;
  // const totalValue = inventory.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

  return (
    <div className="w-full animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Package className="text-primary-600" size={32} />
              {t.inventory}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.manageInventory}</p>
        </div>
        <button 
          onClick={() => { setSelectedInventoryItem(null); setShowInventoryModal(true); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition"
        >
          <Plus size={20} />
          <span>{t.addInventoryItem}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
              <span className="text-gray-500 font-bold text-sm uppercase mb-1">{t.materials}</span>
              <span className="text-3xl font-extrabold text-gray-800 dark:text-white">{inventory.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
              <span className="text-gray-500 font-bold text-sm uppercase mb-1">{t.lowStock}</span>
              <span className={`text-3xl font-extrabold ${lowStockItems > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockItems}</span>
          </div>
      </div>

      {/* Inventory Grid */}
      {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
            <Package size={64} className="mb-4 opacity-20" />
            <p>{t.noItems}</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventory.map(item => {
                  const colorStyle = MEMO_COLORS.find(c => c.id === item.color) || MEMO_COLORS[1]; // Default blue
                  const isLowStock = item.quantity <= item.minQuantity;
                  const isExpired = item.expiryDate ? new Date(item.expiryDate) < new Date() : false;
                  
                  return (
                      <div 
                        key={item.id}
                        className={`relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${colorStyle.class} ${isLowStock ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
                      >
                          {isLowStock && (
                              <div className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-md animate-bounce">
                                  <AlertTriangle size={20} />
                              </div>
                          )}

                          <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-xl text-gray-900 leading-tight pr-6 break-words">{item.name}</h3>
                          </div>

                          <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-4xl font-extrabold text-gray-800 opacity-80">{item.quantity}</span>
                              <span className="text-sm font-bold opacity-60">/ {t.minQty} {item.minQuantity}</span>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-black/5">
                              {item.price && (
                                  <div className="flex justify-between items-center text-sm font-medium text-gray-800 opacity-80">
                                      <span>{t.price}</span>
                                      <span>{data.settings.currency} {item.price}</span>
                                  </div>
                              )}
                              
                              <div className={`flex justify-between items-center text-sm font-medium ${isExpired ? 'text-red-600 font-bold' : 'text-gray-800 opacity-80'}`}>
                                  <span className="flex items-center gap-1"><Calendar size={14}/> {t.expiryDate}</span>
                                  <span>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</span>
                              </div>
                          </div>

                          {/* Action Buttons - Always Visible */}
                          <div className="flex gap-2 mt-4 pt-2 border-t border-black/5 justify-end">
                              <button 
                                onClick={() => { setSelectedInventoryItem(item); setShowInventoryModal(true); }}
                                className="p-2 bg-white/50 hover:bg-blue-500 hover:text-white rounded-xl text-gray-600 transition"
                                title={t.editItem}
                              >
                                  <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openConfirm(t.itemName, t.deleteItem, () => handleDeleteInventoryItem(item.id)); }}
                                className="p-2 bg-white/50 hover:bg-red-500 hover:text-white rounded-xl text-gray-600 transition"
                                title={t.deleteItem}
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};
