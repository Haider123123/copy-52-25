import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Globe, ArrowRight, Instagram, CheckCircle2, ChevronDown, User, Grid, Calendar, DollarSign, FlaskConical, FileText, BarChart3, Cloud, LayoutDashboard, StickyNote, ShoppingBag, PlusCircle, Sparkles, MonitorSmartphone, Palette, UsersRound, X, Database, Paintbrush, ShieldCheck, UserCog, Contact, Image as ImageIcon, Shield, BrainCircuit, MessageCircle, Send } from 'lucide-react';
import { PRICING_PLANS } from '../constants';
import { LABELS } from '../locales';
import { Logo } from './Logo';

interface LandingPageProps {
  setAppState: (state: 'landing' | 'auth' | 'app') => void;
  landingLang: 'en' | 'ar' | 'ku';
  setLandingLang: (lang: 'en' | 'ar' | 'ku') => void;
  isRTL: boolean;
}

const LegalModal = ({ isOpen, onClose, title, content, isRTL }: any) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 relative border border-gray-100 dark:border-gray-700 animate-scale-up overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Shield className="text-primary-600" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 text-gray-600 dark:text-gray-300 pr-2 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                    <p className="font-bold text-lg">{content.intro}</p>
                    <div className="space-y-4">
                        <p>{content.section1}</p>
                        <p>{content.section2}</p>
                        <p>{content.section3}</p>
                        <p>{content.section4}</p>
                        <p>{content.section5}</p>
                    </div>
                </div>

                <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                    <button onClick={onClose} className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-lg hover:bg-primary-700 transition">
                        {isRTL ? "فهمت ذلك" : "I Understand"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ setAppState, landingLang, setLandingLang, isRTL }) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = LABELS[landingLang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContact = (platform: 'whatsapp' | 'telegram' | 'instagram') => {
    let url = '';
    if (platform === 'whatsapp') url = 'https://wa.me/9647782605545';
    else if (platform === 'telegram') url = 'https://t.me/Dentro_co';
    else if (platform === 'instagram') url = 'https://instagram.com/dentro_app';
    
    window.open(url, '_blank');
    setShowSubscribeModal(false);
  };

  const handleSubscribeClick = () => {
    setShowSubscribeModal(true);
  };

  const modalTexts = {
      en: {
          title: "Subscription & Trial",
          message: "Contact us via your preferred platform to request a trial or subscribe.",
          cancel: "Close",
      },
      ar: {
          title: "الاشتراك والنسخة التجريبية",
          message: "يمكنك التواصل معنا مباشرة عبر المنصة التي تفضلها لطلب النسخة التجريبية أو الاشتراك.",
          cancel: "إغلاق",
      },
      ku: {
          title: "بەشداریکردن و تاقیکردنەوە",
          message: "دەتوانیت لە ڕێگەی ئەو پلاتفۆرمەی کە پێت باشە پەیوەندیمان پێوە بکەیت بۆ داواکردنی وەشانی تاقیکردنەوە یان بەشداریکردن.",
          cancel: "داخستن",
      }
  };

  const currentModalText = modalTexts[landingLang];

  const FEATURES = [
      { icon: BrainCircuit, title: t.featureAI, desc: t.featureAIDesc, color: 'text-indigo-700', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
      { icon: ShieldCheck, title: t.featureMainAccount, desc: t.featureMainAccountDesc, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
      { icon: UserCog, title: t.featureDoctorProfile, desc: t.featureDoctorProfileDesc, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { icon: Contact, title: t.featureSecretaryAccount, desc: t.featureSecretaryAccountDesc, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      
      { icon: User, title: t.featurePatientMgmt, desc: t.featurePatientMgmtDesc, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { icon: Grid, title: t.featureTeethChart, desc: t.featureTeethChartDesc, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      { icon: ImageIcon, title: t.featureCloudImages, desc: t.featureCloudImagesDesc, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
      { icon: Calendar, title: t.featureAppointments, desc: t.featureAppointmentsDesc, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
      { icon: DollarSign, title: t.featureFinancials, desc: t.featureFinancialsDesc, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
      { icon: FlaskConical, title: t.featureLabOrders, desc: t.featureLabOrdersDesc, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
      { icon: FileText, title: t.featureDocs, desc: t.featureDocsDesc, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
      { icon: StickyNote, title: t.featureMemos, desc: t.featureMemosDesc, color: 'text-lime-500', bg: 'bg-lime-100 dark:bg-lime-900/30' },
      { icon: ShoppingBag, title: t.featureInventory, desc: t.featureInventoryDesc, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
      { icon: BarChart3, title: t.featureDashboard, desc: t.featureDashboardDesc, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
      { icon: Cloud, title: t.featureCloud, desc: t.featureCloudDesc, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
      
      { icon: UsersRound, title: t.featureMultiDoctor, desc: t.featureMultiDoctorDesc, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
      { icon: MonitorSmartphone, title: t.featureMultiDevice, desc: t.featureMultiDeviceDesc, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
      { icon: Palette, title: t.featureProDesigns, desc: t.featureProDesignsDesc, color: 'text-fuchsia-500', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30' },
      { icon: Database, title: t.featureBackup, desc: t.featureBackupDesc, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
      { icon: Paintbrush, title: t.featureThemes, desc: t.featureThemesDesc, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },

      { icon: Sparkles, title: t.featureUpdates, desc: t.featureUpdatesDesc, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
      { icon: PlusCircle, title: t.featureMore, desc: t.featureMoreDesc, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 font-${isRTL ? 'cairo' : 'sans'} overflow-x-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
        <style>{`
          @keyframes border-rotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-border-gradient {
            background-size: 300% 300%;
            animation: border-rotate 4s ease infinite;
          }
        `}</style>

        {/* Legal Modals */}
        <LegalModal 
            isOpen={activeLegalModal === 'privacy'} 
            onClose={() => setActiveLegalModal(null)} 
            title={t.privacyPolicy}
            content={t.legalContent.privacy}
            isRTL={isRTL}
        />
        <LegalModal 
            isOpen={activeLegalModal === 'terms'} 
            onClose={() => setActiveLegalModal(null)} 
            title={t.termsOfService}
            content={t.legalContent.terms}
            isRTL={isRTL}
        />

        {/* Subscription Choice Modal */}
        {showSubscribeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 relative border border-gray-100 dark:border-gray-700 animate-scale-up">
                    <button 
                        onClick={() => setShowSubscribeModal(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Sparkles size={32} />
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                            {currentModalText.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-2 font-bold text-sm">
                            {currentModalText.message}
                        </p>
                        
                        <div className="flex flex-col gap-3 w-full">
                            <button 
                                onClick={() => handleContact('whatsapp')}
                                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black shadow-lg shadow-green-500/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <MessageCircle size={22} />
                                <span>WhatsApp</span>
                            </button>

                            <button 
                                onClick={() => handleContact('telegram')}
                                className="w-full py-4 bg-[#0088cc] text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Send size={22} />
                                <span>Telegram</span>
                            </button>

                            <button 
                                onClick={() => handleContact('instagram')}
                                className="w-full py-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Instagram size={22} />
                                <span>Instagram</span>
                            </button>
                            
                            <button 
                                onClick={() => setShowSubscribeModal(false)}
                                className="w-full mt-2 py-3 text-gray-400 font-bold hover:text-gray-600 transition"
                            >
                                {currentModalText.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Navigation */}
        <nav className="container mx-auto px-4 py-4 md:px-6 md:py-6 flex justify-between items-center relative">
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                <Logo className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Dentro</span>
            </div>
            <div className="flex gap-2 md:gap-4 items-center shrink-0">
                <div className="relative group" ref={langMenuRef}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLangMenuOpen(!isLangMenuOpen);
                        }}
                        className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-white/50 backdrop-blur dark:bg-gray-700 text-gray-700 dark:text-white text-xs md:text-sm font-bold active:scale-95 transition hover:bg-white border border-transparent hover:border-gray-200 dark:hover:border-gray-600 whitespace-nowrap"
                    >
                        <Globe size={14} className="md:w-4 md:h-4" />
                        <span>{landingLang === 'en' ? 'English' : landingLang === 'ar' ? 'العربية' : 'Kurdî'}</span>
                        <ChevronDown size={12} className={`transition-transform duration-200 md:w-3.5 md:h-3.5 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangMenuOpen && (
                        <div className="absolute top-full end-0 mt-2 w-28 md:w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                            <button onClick={() => { setLandingLang('en'); setIsLangMenuOpen(false); }} className="block w-full text-start px-4 py-2.5 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs md:text-sm border-b border-gray-50 dark:border-gray-700/50">English</button>
                            <button onClick={() => { setLandingLang('ar'); setIsLangMenuOpen(false); }} className="block w-full text-start px-4 py-2.5 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs md:text-sm border-b border-gray-50 dark:border-gray-700/50">العربية</button>
                            <button onClick={() => { setLandingLang('ku'); setIsLangMenuOpen(false); }} className="block w-full text-start px-4 py-2.5 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs md:text-sm">Kurdî</button>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={() => setAppState('auth')}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-base font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                    {t.login}
                </button>
            </div>
        </nav>

        {/* Hero Section */}
        <header className="container mx-auto px-4 md:px-6 py-10 md:py-24 flex flex-col items-center text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-full text-xs md:text-sm font-bold mb-6 shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>{t.landingTitle} v3.7</span>
            </div>
            <h1 className="text-3xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-secondary-600 dark:from-white dark:to-gray-300 mb-6 !leading-tight md:!leading-relaxed max-w-4xl py-2">
                {t.manageClinicSlogan}
            </h1>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                {t.landingSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4 md:px-0">
                <button 
                    onClick={() => setAppState('auth')}
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    {t.login} <ArrowRight className="rtl:rotate-180" />
                </button>
                <button 
                    onClick={handleSubscribeClick}
                    className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <Sparkles size={20} className="text-amber-500" />
                    {t.requestTrial}
                </button>
            </div>
        </header>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t.featuresTitle}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                 {FEATURES.map((feature, idx) => (
                     <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition border border-gray-100 dark:border-gray-700 group">
                         <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                             <feature.icon size={28} />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                         <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                             {feature.desc}
                         </p>
                     </div>
                 ))}
             </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-16 bg-white dark:bg-gray-800/50 rounded-t-[3rem]">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t.pricing}</h2>
                
                <div className="flex flex-col gap-2 mb-6">
                    <span className="text-secondary-600 dark:text-secondary-400 font-bold text-lg animate-pulse">
                        {landingLang === 'ar' ? "نسخة تجريبية مجانية لمدة اسبوع" : landingLang === 'ku' ? "تاقیکردنەوەی بێ بەرامبەر بۆ ماوەی هەفتەیەک" : "Free trial for one week"}
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {landingLang === 'ar' ? "اول شهر مجانا للاعضاء الجدد" : landingLang === 'ku' ? "مانگی یەکەم بەخۆڕایی بۆ ئەندامە نوێیەکان" : "First month free for new members"}
                    </span>
                </div>

                <div className="w-20 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {PRICING_PLANS.map((plan) => {
                    const isBestValue = plan.id === '1yr';
                    
                    if (isBestValue) {
                        return (
                            <div key={plan.id} className="relative group z-10 transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="absolute -inset-[4px] bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-3xl animate-border-gradient opacity-100 shadow-xl shadow-purple-500/30"></div>
                                
                                <div className="relative h-full bg-black rounded-[22px] p-6 flex flex-col overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg z-20">
                                        {t.bestValue}
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 text-white">
                                        {landingLang === 'ar' ? plan.labelAr : landingLang === 'ku' ? plan.labelKu : plan.labelEn}
                                    </h3>
                                    
                                    <div className="flex items-end gap-2 mb-6 flex-wrap">
                                        <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                                        {plan.originalPrice && (
                                            <span className="text-xl font-bold text-gray-500 line-through decoration-red-500 decoration-2 mb-1.5">${plan.originalPrice}</span>
                                        )}
                                        <span className="text-gray-400 text-sm font-bold w-full mt-1 block">
                                            {landingLang === 'ar' ? plan.durationAr : landingLang === 'ku' ? plan.durationKu : plan.durationEn}
                                        </span>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-white leading-tight">
                                                <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" /> 
                                                <span>{landingLang === 'ar' ? feature.ar : landingLang === 'ku' ? feature.ku : feature.en}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button onClick={handleSubscribeClick} className="w-full py-3 rounded-xl font-bold transition shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                                        {t.subscribe}
                                    </button>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div 
                                key={plan.id} 
                                className="relative group transform hover:-translate-y-2 transition-transform duration-300 h-full"
                            >
                                <div className="h-full bg-black rounded-[22px] p-6 flex flex-col overflow-hidden border-4 border-blue-500/50 shadow-lg shadow-blue-500/10">
                                    <h3 className="text-xl font-bold mb-2 text-white">
                                        {landingLang === 'ar' ? plan.labelAr : landingLang === 'ku' ? plan.labelKu : plan.labelEn}
                                    </h3>
                                    
                                    <div className="flex items-end gap-2 mb-6 flex-wrap">
                                        <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                                        {plan.originalPrice && (
                                            <span className="text-xl font-bold text-gray-600 line-through decoration-red-500 decoration-2 mb-1.5">${plan.originalPrice}</span>
                                        )}
                                        <span className="text-gray-300 text-sm font-bold w-full mt-1 block">
                                            {landingLang === 'ar' ? plan.durationAr : landingLang === 'ku' ? plan.durationKu : plan.durationEn}
                                        </span>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-100 leading-tight">
                                                <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" /> 
                                                <span>{landingLang === 'ar' ? feature.ar : landingLang === 'ku' ? feature.ku : feature.en}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button onClick={handleSubscribeClick} className="w-full py-3 rounded-xl font-bold transition shadow-md bg-gray-900 border border-gray-700 text-white hover:bg-gray-800">
                                        {t.subscribe}
                                    </button>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </section>

        <footer className="bg-gray-50 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <button 
                        onClick={() => setActiveLegalModal('privacy')}
                        className="hover:text-primary-600 transition flex items-center gap-1.5"
                    >
                        <Shield size={16} />
                        {t.privacyPolicy}
                    </button>
                    <span className="hidden md:inline opacity-20">|</span>
                    <button 
                        onClick={() => setActiveLegalModal('terms')}
                        className="hover:text-primary-600 transition flex items-center gap-1.5"
                    >
                        <FileText size={16} />
                        {t.termsOfService}
                    </button>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-xs tracking-widest uppercase font-bold">{t.copyright}</p>
            </div>
        </footer>
      </div>
  );
};