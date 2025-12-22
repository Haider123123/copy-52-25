
import React from 'react';
import { Stethoscope, ChevronRight, Trash2, Plus, LayoutDashboard, Check } from 'lucide-react';
import { ClinicData } from '../types';
import { Logo } from './Logo';

interface ClinicSetupProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  handleClinicNameSubmit: (name: string) => void;
  handleAddDoctor: (name: string) => void;
  handleDeleteDoctor: (id: string) => void;
  handleFinishSetup: () => void;
  isRTL: boolean;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const ClinicSetup: React.FC<ClinicSetupProps> = ({
  t,
  data,
  setData,
  onboardingStep,
  setOnboardingStep,
  handleClinicNameSubmit,
  handleAddDoctor,
  handleDeleteDoctor,
  handleFinishSetup,
  isRTL,
  openConfirm
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <Logo className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 font-cairo">Dentro</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.clinicSetup}</p>
        </div>
        
        <div className="space-y-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleClinicNameSubmit(fd.get('clinicName') as string);
            }}>
               <p className="text-center text-gray-600 dark:text-gray-300 mb-4">{t.setupStep1}</p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-start">
                {t.enterClinicName}
              </label>
              <input 
                name="clinicName"
                type="text" 
                defaultValue={data.clinicName}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
                placeholder="My Dental Clinic"
              />
              <button 
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 rounded-xl transition shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
              >
                {t.startApp} <Check size={18} />
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};
