
import React, { useState } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, LayoutDashboard, Contact, Info, LogOut, RefreshCw } from 'lucide-react';
import { ClinicData, Doctor } from '../types';
import { Logo } from './Logo';

interface ProfileSelectorProps {
  t: any;
  data: ClinicData;
  loginPassword: string; // The main account password for re-verification
  onSelectAdmin: (password: string) => void;
  onSelectDoctor: (doctorId: string, password: string) => void;
  onSelectSecretary: (id: string, password: string) => void;
  onLogout: () => void;
  currentLang: string;
  isRTL: boolean;
  syncStatus?: string;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  t, data, loginPassword, onSelectAdmin, onSelectDoctor, onSelectSecretary, onLogout, currentLang, isRTL, syncStatus
}) => {
  const [selectedProfile, setSelectedProfile] = useState<'admin' | string | null>(null);
  const [profileType, setProfileType] = useState<'admin' | 'doctor' | 'secretary'>('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      if (selectedProfile === 'admin') {
          // Compare against stored admin password, default to '123456' if not set
          const adminPass = data.settings.adminPassword || '123456';
          if (passwordInput === adminPass) {
              onSelectAdmin(passwordInput);
          } else {
              setError(t.wrongPin || 'Incorrect Password');
          }
      } else if (profileType === 'doctor') {
          const doctor = data.doctors.find(d => d.id === selectedProfile);
          if (doctor && doctor.password === passwordInput) {
              onSelectDoctor(doctor.id, passwordInput);
          } else {
              setError(t.wrongPin || 'Incorrect Password');
          }
      } else if (profileType === 'secretary') {
          const secretary = data.secretaries?.find(s => s.id === selectedProfile);
          if (secretary && secretary.password === passwordInput) {
              onSelectSecretary(secretary.id, passwordInput);
          } else {
              setError(t.wrongPin || 'Incorrect Password');
          }
      }
  };

  const getProfileName = () => {
      if (selectedProfile === 'admin') return t.adminAccount;
      if (profileType === 'doctor') return data.doctors.find(d => d.id === selectedProfile)?.name;
      if (profileType === 'secretary') return data.secretaries?.find(s => s.id === selectedProfile)?.name;
      return '';
  };

  const hasProfiles = data.doctors.length > 0 || (data.secretaries && data.secretaries.length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-cairo animate-fade-in relative" dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Sync Status Overlay (Subtle) */}
        {syncStatus === 'syncing' && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold z-50 animate-fade-in">
                <RefreshCw size={14} className="animate-spin" />
                <span>{isRTL ? 'جاري تحديث البيانات من السيرفر...' : 'Syncing latest data...'}</span>
            </div>
        )}

        {/* Logout Button */}
        <button 
            onClick={onLogout}
            className="absolute top-6 left-6 rtl:left-auto rtl:right-6 flex items-center gap-2 text-gray-500 hover:text-red-600 transition font-bold"
        >
            <LogOut size={20} className="rtl:rotate-180" />
            <span>{t.logout}</span>
        </button>

        <div className="max-w-4xl w-full">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <Logo className="w-20 h-20" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.selectProfile}</h1>
                <p className="text-gray-500 dark:text-gray-400">{data.clinicName}</p>
            </div>

            {!selectedProfile ? (
                <div className={`grid gap-6 ${hasProfiles ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 flex flex-col items-center'}`}>
                    {/* Admin Card */}
                    <button 
                        onClick={() => { setSelectedProfile('admin'); setProfileType('admin'); }}
                        className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary-500 transition-all group flex flex-col items-center gap-4 ${!hasProfiles ? 'w-full max-w-sm' : ''}`}
                    >
                        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck size={40} />
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 dark:text-white">{t.adminAccount}</h3>
                        <p className="text-sm text-gray-500 text-center">Full Access</p>
                    </button>

                    {/* Hint Note if no profiles exist */}
                    {!hasProfiles && (
                        <div className="max-w-md w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 text-center shadow-sm animate-scale-up">
                            <Info className="w-8 h-8 mx-auto mb-3 opacity-80" />
                            <p className="font-bold text-sm md:text-base leading-relaxed">
                                {t.addProfilesHint}
                            </p>
                        </div>
                    )}

                    {/* Doctor Cards */}
                    {hasProfiles && data.doctors.map(doc => (
                        <button 
                            key={doc.id}
                            onClick={() => { setSelectedProfile(doc.id); setProfileType('doctor'); }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all group flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User size={40} />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{doc.name}</h3>
                            <p className="text-sm text-gray-500 text-center">{t.doctorProfile}</p>
                        </button>
                    ))}

                    {/* Secretary Cards */}
                    {hasProfiles && (data.secretaries || []).map(sec => (
                        <button 
                            key={sec.id}
                            onClick={() => { setSelectedProfile(sec.id); setProfileType('secretary'); }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-purple-500 transition-all group flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Contact size={40} />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{sec.name}</h3>
                            <p className="text-sm text-gray-500 text-center">{t.secretaryProfile}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md mx-auto animate-scale-up border border-gray-100 dark:border-gray-700">
                    <button onClick={() => { setSelectedProfile(null); setError(''); setPasswordInput(''); }} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 flex items-center gap-1">
                        <ArrowRight className="rtl:rotate-180" size={16} /> {t.back}
                    </button>
                    
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center mb-3">
                            {profileType === 'admin' ? <ShieldCheck size={32} className="text-primary-600"/> : 
                             profileType === 'doctor' ? <User size={32} className="text-blue-600"/> : 
                             <Contact size={32} className="text-purple-600" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {getProfileName()}
                        </h3>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {profileType === 'admin' ? t.enterAdminPass : 
                                 profileType === 'secretary' ? t.enterSecretaryPass : 
                                 t.enterDocPass}
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                                <input 
                                    type="password" 
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="••••••••"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                        <button 
                            type="submit" 
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-500/20"
                        >
                            {t.login}
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};
