
import React, { useState, useEffect } from 'react';
import { Layout, Minus, Plus, Moon, Sun, Globe, Palette, CheckCircle, BrainCircuit, ExternalLink, Key, Eye, EyeOff, Save, Sparkles, Copy, CloudCheck, CheckCircle2, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { THEMES } from '../../constants';
import { ClinicData, Language } from '../../types';
import { GoogleGenAI } from "@google/genai";

interface PreferencesSectionProps {
  t: any;
  data: ClinicData;
  setData: React.Dispatch<React.SetStateAction<ClinicData>>;
  deviceScale: number;
  setDeviceScale: (val: number) => void;
  adjustScale: (delta: number) => void;
  currentTheme: 'light' | 'dark';
  setLocalTheme: (theme: 'light' | 'dark') => void;
  currentLang: Language;
  setDeviceLang: (lang: Language) => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  isRTL: boolean;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  t, data, setData, deviceScale, setDeviceScale, adjustScale, currentTheme, setLocalTheme, currentLang, setDeviceLang, activeThemeId, setActiveThemeId, isRTL
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(data.settings.geminiApiKey || '');
  const [isEditingKey, setIsEditingKey] = useState(false);
  
  // States for Activation Feedback
  const [isVerifying, setIsVerifying] = useState(false);
  const [activationStatus, setActivationStatus] = useState<'none' | 'success' | 'error'>('none');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleActivateKey = async () => {
      const key = apiKeyInput.trim();
      if (!key) return;

      setIsVerifying(true);
      setActivationStatus('none');
      setVerificationError(null);

      try {
          // Actual Validation Call to Gemini API
          const ai = new GoogleGenAI({ apiKey: key });
          
          // Test with a tiny token generation
          await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: 'hi',
          });

          // If successful, save to global state
          setData(prev => ({
              ...prev,
              settings: { ...prev.settings, geminiApiKey: key },
              lastUpdated: Date.now()
          }));
          
          setActivationStatus('success');
          setIsEditingKey(false);
      } catch (error: any) {
          console.error("API Key Verification Failed:", error);
          setActivationStatus('error');
          
          let errorMsg = isRTL ? "فشل التفعيل: المفتاح غير صحيح أو غير مفعل." : "Activation failed: Key is invalid or not active.";
          if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('403')) {
              errorMsg = isRTL ? "عذراً، مفتاح الـ API هذا غير صالح." : "Invalid API Key provided.";
          } else if (!navigator.onLine) {
              errorMsg = isRTL ? "لا يوجد اتصال بالإنترنت للتحقق من المفتاح." : "No internet connection to verify the key.";
          }
          setVerificationError(errorMsg);
      } finally {
          setIsVerifying(false);
      }
  };

  return (
    <div className="space-y-8 relative">
       {/* 1. App Preferences Section */}
       <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 className="font-black text-gray-900 dark:text-white mb-6 text-xl border-b border-gray-100 dark:border-gray-700 pb-3 uppercase tracking-tight">{t.preferences}</h3>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Layout size={20} /></div>
                  <span className="font-black text-gray-800 dark:text-white text-lg">{t.appScale}</span>
                  <span className="ms-auto font-mono text-primary-600 font-black text-xl">{deviceScale}%</span>
              </div>
              <div className="flex items-center gap-6">
                  <button onClick={() => adjustScale(-5)} className="p-4 bg-white dark:bg-gray-600 rounded-2xl shadow-sm hover:bg-red-50 text-gray-600 dark:text-white transition active:scale-90"><Minus size={24} /></button>
                  <input type="range" min="80" max="150" step="5" value={deviceScale} onChange={(e) => setDeviceScale(parseInt(e.target.value))} className="flex-1 accent-primary-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                  <button onClick={() => adjustScale(5)} className="p-4 bg-white dark:bg-gray-600 rounded-2xl shadow-sm hover:bg-green-50 text-gray-600 dark:text-white transition active:scale-90"><Plus size={24} /></button>
              </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl shadow-inner"><Moon size={20} /></div>
                      <span className="font-black text-gray-700 dark:text-gray-300 text-lg">{t.darkMode}</span>
                  </div>
                  <button onClick={() => setLocalTheme(currentTheme === 'light' ? 'dark' : 'light')} className={`w-16 h-10 rounded-full p-1.5 transition-all duration-500 flex items-center ${currentTheme === 'dark' ? 'bg-primary-600 justify-end' : 'bg-gray-200 justify-start shadow-inner'}`}><div className="w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700 transform transition-transform duration-500">{currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</div></button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 dark:border-gray-600 pt-6 gap-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-inner"><Globe size={20} /></div>
                      <span className="font-black text-gray-700 dark:text-gray-300 text-lg">{t.language}</span>
                  </div>
                  <div className="flex bg-white dark:bg-gray-700 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-600 shadow-inner">{(['en', 'ar', 'ku'] as const).map(lang => (<button key={lang} onClick={() => setDeviceLang(lang)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${currentLang === lang ? 'bg-primary-600 shadow-lg text-white' : 'text-gray-500 hover:text-gray-900'}`}>{lang.toUpperCase()}</button>))}</div>
              </div>
          </div>
       </div>

       {/* AI Section Anchor */}
       <div id="ai-section-anchor" className="scroll-mt-20"></div>

       {/* 2. AI Setup Section - MODIFIED FOR PERMANENT FEEDBACK */}
       <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-8 relative overflow-hidden">
          <Sparkles className="absolute top-8 end-8 text-indigo-100 dark:text-indigo-900 opacity-50" size={80} />
          
          <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg"><BrainCircuit size={28} /></div>
              <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.aiAssistant}</h3>
          </div>

          <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black shrink-0 shadow-lg">1</div>
                      <div className="flex-1">
                          <p className="font-black text-indigo-900 dark:text-indigo-100 text-sm mb-1">{isRTL ? "احصل على رمز التفعيل المجاني" : "Get your free API Key"}</p>
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline">
                             {isRTL ? "اضغط لفتح صفحة Google AI Studio" : "Click to open Google AI Studio"} <ExternalLink size={12} />
                          </a>
                      </div>
                  </div>

                  <div className="flex gap-4 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-3xl border border-purple-100 dark:border-purple-800">
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black shrink-0 shadow-lg">2</div>
                      <div className="flex-1">
                          <p className="font-black text-purple-900 dark:text-purple-100 text-sm mb-1">{isRTL ? "أنشئ مفتاح (Create API Key)" : "Click 'Create API Key'"}</p>
                          <p className="text-[10px] text-purple-600/70 dark:text-purple-400 font-bold">{isRTL ? "انسخ الرمز الذي يبدأ بـ AIza..." : "Copy the code starting with AIza..."}</p>
                      </div>
                  </div>

                  {/* Step 3 - Interactive Key Input with Save Button */}
                  <div className="flex gap-4 p-5 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-3xl border border-fuchsia-100 dark:border-fuchsia-800 min-h-[120px] items-center">
                      <div className="w-10 h-10 bg-fuchsia-600 text-white rounded-full flex items-center justify-center font-black shrink-0 shadow-lg">3</div>
                      <div className="flex-1">
                          <p className="font-black text-fuchsia-900 dark:text-fuchsia-100 text-sm mb-3">
                            {isRTL ? "الصق الرمز في الأسفل واضغط تفعيل" : "Paste below and activate"}
                          </p>
                          
                          {!isEditingKey ? (
                              <button 
                                onClick={() => setIsEditingKey(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-fuchsia-600 dark:text-fuchsia-400 rounded-2xl font-black text-sm border-2 border-fuchsia-100 dark:border-fuchsia-900 shadow-sm hover:shadow-md transition-all active:scale-95"
                              >
                                <Key size={16} />
                                {isRTL ? "كتابة الرمز" : "Write Key"}
                                {data.settings.geminiApiKey && <CheckCircle size={14} className="text-green-500" />}
                              </button>
                          ) : (
                              <div className="relative group animate-scale-up flex flex-col gap-2">
                                  <div className="relative flex items-center gap-2">
                                      <div className="relative flex-1">
                                          <div className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400 group-focus-within:text-fuchsia-500 transition-colors">
                                            <Key size={18} />
                                          </div>
                                          <input 
                                            type={showApiKey ? "text" : "password"}
                                            value={apiKeyInput}
                                            autoFocus
                                            onChange={(e) => { setApiKeyInput(e.target.value); setActivationStatus('none'); }}
                                            placeholder="AIzaSy..."
                                            className="w-full ps-12 pe-12 py-4 rounded-2xl bg-white dark:bg-gray-700 border-2 border-fuchsia-200 dark:border-fuchsia-900 focus:border-fuchsia-500 dark:text-white outline-none font-mono text-xs shadow-sm transition-all"
                                          />
                                          <button 
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute top-1/2 -translate-y-1/2 end-4 text-gray-400 hover:text-gray-600 transition"
                                          >
                                            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                          </button>
                                      </div>
                                      
                                      {/* New Confirm Button next to input */}
                                      <button 
                                        type="button"
                                        onClick={() => setIsEditingKey(false)}
                                        className="p-4 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition active:scale-90"
                                        title={isRTL ? "تأكيد" : "Confirm"}
                                      >
                                        <Check size={20} />
                                      </button>

                                      <button 
                                        type="button"
                                        onClick={() => setIsEditingKey(false)}
                                        className="p-4 bg-gray-100 dark:bg-gray-600 text-gray-400 rounded-xl hover:text-gray-600 transition"
                                      >
                                        <X size={20} />
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Main Activation Button Area */}
              <div className="space-y-4">
                  <button 
                    onClick={handleActivateKey}
                    disabled={isVerifying || !apiKeyInput.trim()}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-500/20 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isVerifying ? (
                        <>
                            <Loader2 size={26} className="animate-spin" />
                            <span>{isRTL ? "جاري التحقق..." : "Verifying..."}</span>
                        </>
                    ) : (
                        <>
                            <CloudCheck size={26} />
                            <span>{isRTL ? "تفعيل المفتاح الآن" : "Activate Key Now"}</span>
                        </>
                    )}
                  </button>

                  {/* PERMANENT FEEDBACK MESSAGE UNDER THE BUTTON */}
                  <div className="min-h-[60px] animate-fade-in">
                      {activationStatus === 'success' && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-300">
                              <CheckCircle2 size={24} className="shrink-0" />
                              <div className="text-sm font-black">
                                  {isRTL ? "تم تفعيل الذكاء الاصطناعي بنجاح!" : "AI Activated Successfully!"}
                              </div>
                          </div>
                      )}

                      {activationStatus === 'error' && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300">
                              <AlertCircle size={24} className="shrink-0" />
                              <div className="text-sm font-black">
                                  {verificationError}
                              </div>
                          </div>
                      )}

                      {activationStatus === 'none' && !isVerifying && (
                          <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                             {isRTL ? "سيتم اختبار المفتاح قبل الحفظ" : "Key will be tested before saving"}
                          </p>
                      )}
                  </div>
              </div>
          </div>
       </div>

       {/* 3. Themes Grid Section */}
       <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shadow-inner"><Palette size={20} /></div>
              <h3 className="font-black text-gray-800 dark:text-white text-lg uppercase tracking-tight">{t.appTheme}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {THEMES.map(theme => (
                  <button key={theme.id} onClick={() => setActiveThemeId(theme.id)} className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${activeThemeId === theme.id ? 'border-primary-500 bg-white dark:bg-gray-600 shadow-xl scale-105' : 'border-transparent bg-gray-100/50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'}`}>
                      <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.primary }}></div>
                          <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: theme.colors.secondary }}></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest leading-none">
                          {isRTL ? (currentLang === 'ku' ? theme.nameKu : theme.nameAr) : theme.nameEn}
                      </span>
                      {activeThemeId === theme.id && <div className="absolute -top-2 -right-2 bg-primary-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800"><CheckCircle size={14} /></div>}
                  </button>
              ))}
          </div>
       </div>
    </div>
  );
};
