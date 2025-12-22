
import React from 'react';
import { Activity, X, Users, LayoutDashboard, StickyNote, Calendar, ShoppingBag, Banknote, Settings, LogOut, FlaskConical, Package, RefreshCw, CloudOff } from 'lucide-react';
import { NavButton } from './Shared';
import { Logo } from './Logo';

interface SidebarProps {
  t: any;
  data: any;
  currentView: string;
  setCurrentView: (view: any) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSelectedPatientId: (id: string | null) => void;
  handleLogout: () => void;
  isRTL: boolean;
  isSecretary?: boolean;
  handleManualSync?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'error' | 'offline';
}

export const Sidebar: React.FC<SidebarProps> = ({
  t, data, currentView, setCurrentView, isSidebarOpen, setSidebarOpen, setSelectedPatientId, handleLogout, isRTL, isSecretary, handleManualSync, syncStatus
}) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Sidebar */}
      <div className={`fixed inset-y-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:relative lg:translate-x-0 flex flex-col border-e dark:border-gray-700 no-print`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[140px] leading-tight">{data.clinicName}</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          <NavButton icon={Users} label={t.patients} active={currentView === 'patients'} onClick={() => { setCurrentView('patients'); setSidebarOpen(false); setSelectedPatientId(null); }} />
          <NavButton icon={Calendar} label={t.calendar} active={currentView === 'calendar'} onClick={() => { setCurrentView('calendar'); setSidebarOpen(false); }} />
          
          {/* Hide Dashboard for Secretary */}
          {!isSecretary && (
              <NavButton icon={LayoutDashboard} label={t.dashboard} active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }} />
          )}
          
          <NavButton icon={FlaskConical} label={t.labOrders} active={currentView === 'labOrders'} onClick={() => { setCurrentView('labOrders'); setSidebarOpen(false); }} />
          <NavButton icon={StickyNote} label={t.memos} active={currentView === 'memos'} onClick={() => { setCurrentView('memos'); setSidebarOpen(false); }} />
          <NavButton icon={Package} label={t.inventory} active={currentView === 'inventory'} onClick={() => { setCurrentView('inventory'); setSidebarOpen(false); }} />
          <NavButton icon={ShoppingBag} label={t.purchases} active={currentView === 'purchases'} onClick={() => { setCurrentView('purchases'); setSidebarOpen(false); }} />
          <NavButton icon={Banknote} label={t.expenses} active={currentView === 'expenses'} onClick={() => { setCurrentView('expenses'); setSidebarOpen(false); }} />
          <NavButton icon={Settings} label={t.settings} active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setSidebarOpen(false); }} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-2">
          {handleManualSync && (
              <button 
                onClick={handleManualSync}
                disabled={syncStatus === 'syncing' || syncStatus === 'offline'} 
                className={`flex items-center gap-2 w-full p-3 rounded-xl transition font-medium ${syncStatus === 'syncing' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <RefreshCw size={20} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                <span>{syncStatus === 'syncing' ? t.syncing : (syncStatus === 'offline' ? 'Offline' : 'Refresh Data')}</span>
              </button>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full p-3 rounded-xl transition font-medium">
            <LogOut size={20} />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>
    </>
  );
};
