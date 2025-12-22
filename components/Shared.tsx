import React from 'react';
import { ChevronRight } from 'lucide-react';

export const NavButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 font-medium' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    <Icon size={22} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
    <span className="text-base">{label}</span>
    {active && <ChevronRight size={16} className="ms-auto opacity-50 rtl:rotate-180" />}
  </button>
);

export const TabButton = ({ icon: Icon, label, active, onClick, colorClass = "text-primary-500" }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
      active 
        ? 'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-white ring-1 ring-primary-100 dark:ring-gray-600 font-bold shadow-sm' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700'
    }`}
  >
    <Icon size={18} className={active ? colorClass : 'currentColor'} />
    <span className="text-sm">{label}</span>
  </button>
);

export const InfoItem = ({ label, value, className = '' }: { label: string, value?: string | React.ReactNode, className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</span>
    <span className="font-medium text-gray-800 dark:text-white text-lg">{value || '-'}</span>
  </div>
);