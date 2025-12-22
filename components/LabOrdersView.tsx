

import React, { useState } from 'react';
import { Plus, FlaskConical, Filter, Edit2, Trash2, CheckCircle2, Search } from 'lucide-react';
import { ClinicData, LabOrder } from '../types';
import { getLocalizedDate } from '../utils';

interface LabOrdersViewProps {
  t: any;
  data: ClinicData;
  setSelectedLabOrder: (order: LabOrder | null) => void;
  setShowLabOrderModal: (show: boolean) => void;
  handleDeleteLabOrder: (id: string) => void;
  handleUpdateLabOrderStatus: (id: string, status: LabOrder['status']) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  currentLang: any;
}

export const LabOrdersView: React.FC<LabOrdersViewProps> = ({
  t, data, setSelectedLabOrder, setShowLabOrderModal, handleDeleteLabOrder, handleUpdateLabOrderStatus, openConfirm, currentLang
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = (data.labOrders || []).filter(order => {
      const matchStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchSearch = order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.labName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.workType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
  }).sort((a,b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'ready': return 'bg-orange-100 text-orange-700 border-orange-200';
          case 'received': return 'bg-green-100 text-green-700 border-green-200';
          case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'in_progress': return t.inProgress;
          case 'ready': return t.ready;
          case 'received': return t.received;
          case 'cancelled': return t.cancelled;
          default: return status;
      }
  };

  return (
    <div className="w-full animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.labOrders}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.manageLabOrders}</p>
        </div>
        <button 
          onClick={() => { setSelectedLabOrder(null); setShowLabOrderModal(true); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition"
        >
          <Plus size={20} />
          <span>{t.newLabOrder}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
             <Search className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400" size={20} />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t.searchPatients} // Reusing search placeholder or generic
               className="w-full ps-12 pe-4 py-3 rounded-xl border-none shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
             />
          </div>
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
              {['all', 'in_progress', 'ready', 'received', 'cancelled'].map(status => (
                  <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                          filterStatus === status 
                          ? 'bg-primary-600 text-white shadow' 
                          : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                      {status === 'all' ? t.all : getStatusLabel(status)}
                  </button>
              ))}
          </div>
      </div>

      {/* Grid */}
      {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
              <FlaskConical size={48} className="mb-4 opacity-30" />
              <p>{t.noItems}</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <div className="font-bold text-lg text-gray-800 dark:text-white mb-1">{order.patientName}</div>
                              <div className="text-sm text-primary-600 dark:text-primary-400 font-bold">{order.workType}</div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                          </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                          <div className="flex justify-between">
                              <span className="text-gray-400">{t.labName}:</span>
                              <span className="font-medium">{order.labName}</span>
                          </div>
                          {order.toothNumbers && (
                              <div className="flex justify-between">
                                  <span className="text-gray-400">{t.toothNumbers}:</span>
                                  <span className="font-medium">{order.toothNumbers}</span>
                              </div>
                          )}
                          {order.shade && (
                              <div className="flex justify-between">
                                  <span className="text-gray-400">{t.shade}:</span>
                                  <span className="font-medium">{order.shade}</span>
                              </div>
                          )}
                          {order.sentDate && (
                              <div className="flex justify-between">
                                  <span className="text-gray-400">{t.sentDate}:</span>
                                  <span className="font-medium">{getLocalizedDate(new Date(order.sentDate), 'day', currentLang)}</span>
                              </div>
                          )}
                          {order.price && (
                              <div className="flex justify-between">
                                  <span className="text-gray-400">{t.price}:</span>
                                  <span className="font-bold text-gray-800 dark:text-white">{data.settings.currency} {order.price}</span>
                              </div>
                          )}
                      </div>
                      
                      {order.notes && (
                          <div className="text-xs text-gray-500 italic mb-4 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                              "{order.notes}"
                          </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          {/* Quick Status Change */}
                          {order.status === 'in_progress' && (
                              <button 
                                  onClick={() => handleUpdateLabOrderStatus(order.id, 'ready')}
                                  className="flex-1 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold transition"
                              >
                                  {t.ready} ?
                              </button>
                          )}
                           {order.status === 'ready' && (
                              <button 
                                  onClick={() => handleUpdateLabOrderStatus(order.id, 'received')}
                                  className="flex-1 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold transition"
                              >
                                  {t.received} ?
                              </button>
                          )}

                          <button 
                              onClick={() => { setSelectedLabOrder(order); setShowLabOrderModal(true); }}
                              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Edit"
                          >
                              <Edit2 size={18} />
                          </button>
                          <button 
                              onClick={() => openConfirm(t.labOrders, t.deleteItem, () => handleDeleteLabOrder(order.id))}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              title="Delete"
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