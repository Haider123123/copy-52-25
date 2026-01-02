import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, X, Mail, Lock, Loader2, Instagram, LayoutDashboard, MessageCircle, Send, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { LABELS } from '../locales';
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
  const [showContactOptions, setShowContactOptions] = useState(false);

  const handleContact = (platform: 'whatsapp' | 'telegram' | 'instagram') => {
    let url = '';
    if (platform === 'whatsapp') url = 'https://wa.me/9647782605545';
    else if (platform === 'telegram') url = 'https://t.me/Dentro_co';
    else if (platform === 'instagram') url = 'https://instagram.com/dentro_app';
    
    window.open(url, '_blank');
    setShowContactOptions(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-cairo" dir="rtl">
        {/* Contact Modal for Auth Screen */}
        {showContactOptions && createPortal(
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 relative border border-gray-100 dark:border-gray-700 animate-scale-up">
                    <button 
                        onClick={() => setShowContactOptions(false)}
                        className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Sparkles size={32} />
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                            {t.requestTrial}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-2 font-bold text-sm">
                            اختر المنصة التي تفضلها للتواصل معنا وطلب نسختك التجريبية أو الاشتراك.
                        </p>
                        
                        <div className="flex flex-col gap-3 w-full">
                            <button 
                                onClick={() => handleContact('whatsapp')}
                                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black shadow-lg shadow-green-500/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <MessageCircle size={22} />
                                <span>واتساب - WhatsApp</span>
                            </button>

                            <button 
                                onClick={() => handleContact('telegram')}
                                className="w-full py-4 bg-[#0088cc] text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Send size={22} />
                                <span>تليجرام - Telegram</span>
                            </button>

                            <button 
                                onClick={() => handleContact('instagram')}
                                className="w-full py-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Instagram size={22} />
                                <span>إنستقرام - Instagram</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )}

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
                    onClick={() => setShowContactOptions(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition transform active:scale-95"
                >
                    <Sparkles size={18} className="text-amber-300" />
                    {t.requestTrial}
                </button>
            </div>
        </div>
    </div>
  );
};