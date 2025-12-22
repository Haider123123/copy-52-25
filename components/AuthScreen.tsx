import React from 'react';
import { Activity, X, Mail, Lock, Loader2, Instagram, LayoutDashboard } from 'lucide-react';
import { LABELS, Language } from '../types';
import { Logo } from './Logo';

interface AuthScreenProps {
  t: any;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  authLoading: boolean;
  authError: string;
  handleAuth: (e: React.FormEvent) => void;
  setAppState: (state: 'landing' | 'auth' | 'app') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  t,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  authLoading,
  authError,
  handleAuth,
  setAppState
}) => {
  const goToInstagram = () => window.open('https://instagram.com/dentro_app', '_blank');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-cairo" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-scale-up relative">
            <button onClick={() => setAppState('landing')} className="absolute top-4 start-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <Logo className="w-20 h-20" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {t.login}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Dentro Management System</p>
            </div>
            
            {authError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm border border-red-200">
                    {authError}
                </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                        <Mail className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="example@mail.com"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
                    <div className="relative">
                        <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                    {authLoading && <Loader2 className="animate-spin" size={20} />}
                    {t.login}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <button 
                    onClick={goToInstagram}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:opacity-90 transition transform active:scale-95"
                >
                    <Instagram size={18} />
                    {t.requestTrial}
                </button>
            </div>
        </div>
    </div>
  );
};