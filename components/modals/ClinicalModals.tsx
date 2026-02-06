
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Save, ArrowLeft, Settings, Image, Layout, ClipboardList, Edit2, Trash2, Printer, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type as TypeIcon, HelpCircle, Stethoscope, Eye, Upload, Pill, PlusCircle, FileText, Maximize, FileStack, Minus, Hash, Search, LayoutGrid, Folder, Plus, ChevronRight, CheckCircle2, Loader2, AlertCircle, FileType } from 'lucide-react';
import { MEDICAL_CONDITIONS_LIST, PATIENT_QUESTIONS_LIST } from '../../constants';
import { ClinicData, DocumentTemplate, MedicalConditionItem, PatientQueryAnswer, TextStyleConfig, DocumentSettings, LineStyleConfig, Medication, Patient } from '../../types';
import { generateId } from '../../utils';

const StyleEditor = ({ config, onChange, label, t }: { config: TextStyleConfig, onChange: (c: TextStyleConfig) => void, label: string, t: any }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm uppercase flex items-center gap-2">
                <TypeIcon size={16} /> {label}
            </h4>
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.fontSize}</label>
                    <input type="number" value={config.fontSize} onChange={(e) => onChange({...config, fontSize: parseInt(e.target.value)})} className="w-16 p-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none text-center" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.textColor}</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={config.color} onChange={(e) => onChange({...config, color: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                        <span className="text-xs font-mono text-gray-500">{config.color}</span>
                    </div>
                </div>
                <div className="flex gap-2 mt-auto">
                    <button type="button" onClick={() => onChange({...config, isBold: !config.isBold})} className={`p-2 rounded-lg border flex items-center gap-1 ${config.isBold ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}> <Bold size={16} /> <span className="text-xs font-bold">{t.bold}</span> </button>
                    <button type="button" onClick={() => onChange({...config, isItalic: !config.isItalic})} className={`p-2 rounded-lg border flex items-center gap-1 ${config.isItalic ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}> <Italic size={16} /> <span className="text-xs font-bold">{t.italic}</span> </button>
                </div>
            </div>
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex justify-center items-center h-16 overflow-hidden">
                <span style={{ fontSize: `${config.fontSize}px`, color: config.color, fontWeight: config.isBold ? 'bold' : 'normal', fontStyle: config.isItalic ? 'italic' : 'normal' }}> Preview Text </span>
            </div>
        </div>
    )
}

const LineStyleEditor = ({ config, onChange, label, t }: { config: LineStyleConfig, onChange: (c: LineStyleConfig) => void, label: string, t: any }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm uppercase flex items-center gap-2">
                <Minus size={16} /> {label}
            </h4>
            <div className="flex flex-wrap gap-6 items-center">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.textColor}</label>
                    <div className="flex items-center gap-2">
                        <input type="color" value={config.color} onChange={(e) => onChange({...config, color: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                        <span className="text-xs font-mono text-gray-500">{config.color}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.lineThickness}</label>
                    <div className="flex items-center gap-3">
                        <input type="range" min="0.5" max="10" step="0.5" value={config.thickness} onChange={(e) => onChange({...config, thickness: parseFloat(e.target.value)})} className="w-24 accent-primary-600" />
                        <span className="text-xs font-bold text-gray-700 dark:text-white">{config.thickness} pt</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.lineStyle}</label>
                    <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-600">
                        <button onClick={() => onChange({...config, style: 'solid'})} className={`px-3 py-1 text-xs font-bold rounded ${config.style === 'solid' ? 'bg-primary-600 text-white shadow' : 'text-gray-500'}`}>{t.solid}</button>
                        <button onClick={() => onChange({...config, style: 'dashed'})} className={`px-3 py-1 text-xs font-bold rounded ${config.style === 'dashed' ? 'bg-primary-600 text-white shadow' : 'text-gray-500'}`}>{t.dashed}</button>
                    </div>
                </div>
            </div>
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col justify-center gap-2">
                <div style={{ height: config.thickness, backgroundColor: config.color, width: '100%', borderBottom: config.style === 'dashed' ? `${config.thickness}px dashed ${config.color}` : 'none', background: config.style === 'dashed' ? 'transparent' : config.color }}></div>
                <span className="text-[9px] text-gray-400 text-center uppercase tracking-widest">Line Preview</span>
            </div>
        </div>
    )
}

/**
 * دالة مساعدة لعرض المعاينة سواء كانت صورة أو PDF
 * تم تحديثها لاستخدام URL.createObjectURL لملفات PDF لضمان العرض الصحيح
 */
const BackgroundPreview = ({ src, isRTL }: { src: string, isRTL: boolean }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (src && src.startsWith('data:application/pdf')) {
            // تحويل Data URL إلى Blob لضمان استقرار العرض في المتصفحات
            const base64 = src.split(',')[1];
            const binary = atob(base64);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                array[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([array], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            
            return () => URL.revokeObjectURL(url);
        } else {
            setPdfUrl(null);
        }
    }, [src]);

    if (!src) return null;
    
    if (src.startsWith('data:application/pdf')) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                {pdfUrl ? (
                    <iframe 
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                        className="w-full h-full border-none" 
                        title="PDF Preview"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-xs font-bold">جاري تحميل المعاينة...</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-lg">
                    PDF Preview
                </div>
            </div>
        );
    }
    
    return <img src={src} alt="Preview" className="w-full h-full object-contain" />;
};

export const DocumentSettingsModal = ({ show, onClose, t, data, setData, currentLang, type }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    type SettingsView = 'menu' | 'edit_text' | 'upload_bg' | 'spacing' | 'templates';
    const [currentView, setCurrentView] = useState<SettingsView>('menu');
    const [isManagingTemplate, setIsManagingTemplate] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [tmplForm, setTmplForm] = useState({ title: '', text: '' });
    const [showQuickTemplates, setShowQuickTemplates] = useState(false);
    const [settings, setSettings] = useState<DocumentSettings>({ text: '', fontSize: 14, align: 'right', topMargin: 130 });

    useEffect(() => {
        if (show && data && data.settings) {
            const saved = type === 'consent' ? data.settings.consentSettings : data.settings.instructionSettings;
            if (saved) setSettings(saved);
            setCurrentView('menu'); 
            setIsManagingTemplate(false); 
            setEditingTemplateId(null); 
            setShowQuickTemplates(false);
        }
    }, [show, type]);

    const handleSave = () => { setData((prev: ClinicData) => ({ ...prev, lastUpdated: Date.now(), settings: { ...prev.settings, [type === 'consent' ? 'consentSettings' : 'instructionSettings']: settings } })); setCurrentView('menu'); };
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setData((prev: ClinicData) => ({ ...prev, lastUpdated: Date.now(), settings: { ...prev.settings, [type === 'consent' ? 'consentBackgroundImage' : 'instructionsBackgroundImage']: base64String } }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemoveBg = () => { setData((prev: ClinicData) => ({ ...prev, lastUpdated: Date.now(), settings: { ...prev.settings, [type === 'consent' ? 'consentBackgroundImage' : 'instructionsBackgroundImage']: '' } })); };
    const handleApplyTemplate = (tmpl: DocumentTemplate) => { setSettings(prev => ({ ...prev, text: tmpl.text })); setShowQuickTemplates(false); if (currentView === 'templates') setCurrentView('edit_text'); };
    const handleSaveTemplate = () => {
        if (!tmplForm.title.trim() || !tmplForm.text.trim()) return;
        setData((prev: ClinicData) => {
            const templates = prev.documentTemplates || [];
            if (editingTemplateId) { return { ...prev, lastUpdated: Date.now(), documentTemplates: templates.map(t => t.id === editingTemplateId ? { ...t, ...tmplForm } : t) }; }
            else { const newTmpl = { id: Date.now().toString(), ...tmplForm }; return { ...prev, lastUpdated: Date.now(), documentTemplates: [newTmpl, ...templates] }; }
        });
        setIsManagingTemplate(false); setEditingTemplateId(null); setTmplForm({ title: '', text: '' });
    };
    const handleDeleteTemplate = (id: string) => { setData((prev: ClinicData) => ({ ...prev, lastUpdated: Date.now(), documentTemplates: (prev.documentTemplates || []).filter(t => t.id !== id) })); };
    if (!show) return null;
    const currentBg = type === 'consent' ? data.settings.consentBackgroundImage : data.settings.instructionsBackgroundImage;
    const MenuCard = ({ title, icon: Icon, onClick, colorClass }: any) => (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-700/50 shadow-sm group ${colorClass}`}>
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <Icon size={32} className="opacity-80" /> </div>
            <span className="font-bold text-gray-800 dark:text-white text-center">{title}</span>
        </button>
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-gray-50 dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center p-6 md:p-8 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        {currentView !== 'menu' && ( <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"> <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300 rtl:rotate-180" /> </button> )}
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            {currentView === 'menu' ? ( <><Settings className="text-primary-600" />{type === 'consent' ? t.consentForm : t.patientInstructions} - {t.settings}</> ) : currentView === 'edit_text' ? t.editText : currentView === 'upload_bg' ? t.uploadBg : currentView === 'spacing' ? t.headerSpacing : currentView === 'templates' ? t.loadTemplate : '' }
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X size={24} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-2">
                    {currentView === 'menu' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
                            <MenuCard title={t.editText} icon={Edit2} onClick={() => setCurrentView('edit_text')} colorClass="hover:border-blue-200 text-blue-600" />
                            <MenuCard title={t.uploadBg} icon={Image} onClick={() => setCurrentView('upload_bg')} colorClass="hover:border-purple-200 text-purple-600" />
                            <MenuCard title={t.headerSpacing} icon={Layout} onClick={() => setCurrentView('spacing')} colorClass="hover:border-indigo-200 text-indigo-600" />
                            <MenuCard title={t.loadTemplate} icon={ClipboardList} onClick={() => setCurrentView('templates')} colorClass="hover:border-green-200 text-green-600" />
                        </div>
                    )}
                    {currentView === 'edit_text' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-700 p-3 rounded-2xl border dark:border-gray-600 shadow-sm">
                                <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                                    <button onClick={() => setSettings({...settings, align: 'left'})} className={`p-2 rounded-lg ${settings.align === 'left' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-400'}`}><AlignLeft size={20}/></button>
                                    <button onClick={() => setSettings({...settings, align: 'center'})} className={`p-2 rounded-lg ${settings.align === 'center' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-400'}`}><AlignCenter size={20}/></button>
                                    <button onClick={() => setSettings({...settings, align: 'right'})} className={`p-2 rounded-lg ${settings.align === 'right' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-400'}`}><AlignRight size={20}/></button>
                                </div>
                                <div className="flex items-center gap-2"> <span className="text-xs font-bold text-gray-500 uppercase">{t.fontSize}</span> <input type="number" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})} className="w-16 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white border-none outline-none font-bold text-center" /> </div>
                                <div className="ms-auto relative">
                                    <button onClick={() => setShowQuickTemplates(!showQuickTemplates)} className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl font-bold text-sm border border-green-100 dark:border-green-800 flex items-center gap-2"> <ClipboardList size={16} /> {t.applyTemplate} </button>
                                    {showQuickTemplates && ( <div className="absolute top-full end-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[110] overflow-hidden animate-scale-up"> {(data.documentTemplates || []).length === 0 ? ( <div className="p-4 text-xs text-gray-400 italic text-center">No templates</div> ) : ( data.documentTemplates.map((tmpl: any) => ( <button key={tmpl.id} onClick={() => handleApplyTemplate(tmpl)} className="w-full text-start px-4 py-3 text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-0 border-gray-50 dark:border-gray-700"> {tmpl.title} </button> )) )} </div> )}
                                </div>
                            </div>
                            <textarea value={settings.text} onChange={(e) => setSettings({...settings, text: e.target.value})} style={{ textAlign: settings.align, fontSize: `${settings.fontSize}px` }} className="w-full p-6 rounded-3xl bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 min-h-[300px] outline-none focus:border-primary-500 transition-all dark:text-white shadow-inner" placeholder={t.writeTextHere} />
                            <button onClick={handleSave} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-primary-700 transition transform hover:-translate-y-1">{t.save}</button>
                        </div>
                    )}
                    {currentView === 'upload_bg' && (
                        <div className="flex flex-col h-full space-y-6">
                            {currentBg ? ( <div className="bg-white dark:bg-gray-700 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-600 shadow-sm relative group animate-fade-in"> <div className="flex justify-between items-center mb-4"> <h4 className="font-bold text-gray-700 dark:text-white flex items-center gap-2"> <Eye size={18} className="text-primary-500" /> {isRTL ? "الخلفية الحالية" : "Current Background"} </h4> <button onClick={handleRemoveBg} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm" title={t.removeBg}> <Trash2 size={16} /> </button> </div> <div className="aspect-[3/4] max-h-64 mx-auto overflow-hidden rounded-xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-inner relative"> <BackgroundPreview src={currentBg} isRTL={isRTL} /> </div> </div> ) : ( <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center opacity-60"> <Image size={40} className="mx-auto mb-2 text-gray-400" /> <p className="text-sm font-bold">{isRTL ? "لا توجد خلفية حالياً" : "No background set"}</p> </div> )}
                            <div className="p-8 bg-white dark:bg-gray-700 rounded-[2.5rem] border-2 border-dashed border-purple-200 dark:border-purple-800 text-center"> <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"> <Upload size={32} /> </div> <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.uploadBg}</h4> <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed font-bold">{t.recSize}</p> <label className="inline-flex cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-black transition shadow-xl shadow-purple-500/30 transform hover:-translate-y-1"> {t.upload} <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} /> </label> </div>
                        </div>
                    )}
                    {currentView === 'spacing' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-white dark:bg-gray-700 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex justify-between items-center mb-6"> <h4 className="font-black text-gray-800 dark:text-white uppercase tracking-tighter">{t.topMargin}</h4> <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full font-mono font-black text-lg">{settings.topMargin} pt</span> </div>
                                <input type="range" min="50" max="400" step="5" value={settings.topMargin} onChange={(e) => setSettings({...settings, topMargin: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-10" />
                                <div className="border-4 border-dashed border-gray-100 dark:border-gray-600 rounded-[2rem] p-4 relative min-h-[300px] bg-gray-50 dark:bg-gray-900/50 overflow-hidden"> <div className="bg-indigo-500/10 border-b-4 border-indigo-500/20 flex items-center justify-center transition-all duration-500" style={{ height: `${settings.topMargin / 1.5}px` }}> <div className="flex flex-col items-center gap-1 opacity-40"> <Layout size={24} className="text-indigo-600" /> <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{t.headerSpacing}</span> </div> </div> <div className="p-6 space-y-4 opacity-20"> <div className="h-6 w-3/4 bg-gray-400 dark:bg-gray-600 rounded-full"></div> <div className="h-10 w-full bg-indigo-400 dark:bg-indigo-700 rounded-2xl"></div> <div className="space-y-2"> <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded-full"></div> <div className="h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded-full"></div> </div> </div> </div>
                            </div>
                            <button onClick={handleSave} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-primary-700 transition transform hover:-translate-y-1">{t.save}</button>
                        </div>
                    )}
                    {currentView === 'templates' && (
                        <div className="space-y-6 animate-fade-in">
                            {!isManagingTemplate ? ( <><button onClick={() => { setIsManagingTemplate(true); setEditingTemplateId(null); setTmplForm({ title: '', text: '' }); }} className="w-full mb-4 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-500/30 hover:bg-green-700 transition flex items-center justify-center gap-2 transform hover:-translate-y-1"> <PlusCircle size={20} /> {t.addTemplate} </button> {(data.documentTemplates || []).length === 0 ? ( <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-3xl"> <ClipboardList size={48} className="mx-auto mb-4 opacity-20" /> <p>{isRTL ? "لا توجد قوالب محفوظة حالياً" : "No templates saved yet."}</p> </div> ) : ( <div className="grid grid-cols-1 gap-4"> {data.documentTemplates.map((tmpl: any) => ( <div key={tmpl.id} className="p-5 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-primary-200 transition group flex items-center justify-between shadow-sm"> <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleApplyTemplate(tmpl)}> <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center shadow-inner"><FileText size={24}/></div> <div> <span className="font-black text-gray-800 dark:text-white text-lg block">{tmpl.title}</span> <span className="text-xs text-gray-400 truncate max-w-[200px] block">{tmpl.text.slice(0, 50)}...</span> </div> </div> <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"> <button onClick={() => { setEditingTemplateId(tmpl.id); setTmplForm({ title: tmpl.title, text: tmpl.text }); setIsManagingTemplate(true); }} className="p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-transparent hover:border-blue-100 transition"> <Edit2 size={18}/> </button> <button onClick={() => handleDeleteTemplate(tmpl.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-100 transition"> <Trash2 size={18}/> </button> </div> </div> ))} </div> )}</> ) : ( <div className="space-y-5 animate-fade-in bg-white dark:bg-gray-700 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl"> <div className="flex justify-between items-center mb-2"> <h4 className="font-black text-gray-800 dark:text-white uppercase tracking-tight">{editingTemplateId ? t.editTemplate : t.addTemplate}</h4> <button onClick={() => setIsManagingTemplate(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20}/></button> </div> <div className="space-y-4"> <div> <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.templateName}</label> <input value={tmplForm.title} onChange={e => setTmplForm({...tmplForm, title: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 font-bold border-none shadow-inner" placeholder={t.templateName} /> </div> <div> <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.documentText}</label> <textarea value={tmplForm.text} onChange={e => setTmplForm({...tmplForm, text: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 font-medium min-h-[200px] border-none shadow-inner" placeholder={t.writeTextHere} /> </div> </div> <div className="flex gap-3"> <button onClick={() => setIsManagingTemplate(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 transition">{t.cancel}</button> <button onClick={handleSaveTemplate} className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition">{t.save}</button> </div> </div> )}
                        </div>
                    )}
                </div>
            </div>
        </div>, document.body
    );
};

export const RxSettingsModal = ({ show, onClose, t, data, setData, handleRxFileUpload, handleRemoveRxBg, setShowAddMasterDrugModal, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    type RxSettingsView = 'menu' | 'manage_meds' | 'upload_bg' | 'style_meds' | 'style_rx' | 'style_header_info' | 'style_header_line' | 'spacing' | 'paper_size';
    const [currentView, setCurrentView] = useState<RxSettingsView>('menu');
    
    const defaultRxSymbol = { fontSize: 30, color: '#000000', isBold: true, isItalic: true };
    const defaultMeds = { fontSize: 14, color: '#000000', isBold: true, isItalic: false };
    const defaultHeaderInfo = { fontSize: 12, color: '#000000', isBold: true, isItalic: false };
    const defaultHeaderLine = { color: '#000000', thickness: 1, style: 'solid' as 'solid' | 'dashed' };

    const [rxSymbolConfig, setRxSymbolConfig] = useState<TextStyleConfig>(defaultRxSymbol);
    const [medsConfig, setMedsConfig] = useState<TextStyleConfig>(defaultMeds);
    const [headerInfoConfig, setHeaderInfoConfig] = useState<TextStyleConfig>(defaultHeaderInfo);
    const [headerLineConfig, setHeaderLineConfig] = useState<LineStyleConfig>(defaultHeaderLine);
    const [topMargin, setTopMargin] = useState<number>(100);
    const [paperSize, setPaperSize] = useState<'A4' | 'A5'>('A5');

    useEffect(() => {
        if (show && data && data.settings) {
            const s = data.settings.rxTemplate;
            setRxSymbolConfig(s?.rxSymbol || defaultRxSymbol);
            setMedsConfig(s?.medications || defaultMeds);
            setHeaderInfoConfig(s?.headerInfo || defaultHeaderInfo);
            setHeaderLineConfig(s?.headerLine || defaultHeaderLine);
            setTopMargin(s?.topMargin ?? 100);
            setPaperSize(s?.paperSize || 'A5');
            if (currentView === 'menu') {
                setCurrentView('menu');
            }
        }
    }, [show]);

    const handleSaveStyle = () => { 
        setData((prev: ClinicData) => ({ 
            ...prev, 
            lastUpdated: Date.now(), 
            settings: { 
                ...prev.settings, 
                rxTemplate: { 
                    rxSymbol: rxSymbolConfig, 
                    medications: medsConfig, 
                    headerInfo: headerInfoConfig,
                    headerLine: headerLineConfig,
                    topMargin: topMargin, 
                    paperSize: paperSize 
                } 
            } 
        })); 
        if (currentView !== 'menu') setCurrentView('menu');
    };
    
    if (!show) return null;
    const currentBg = data.settings.rxBackgroundImage;
    const MenuCard = ({ title, icon: Icon, onClick, colorClass }: any) => (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-700/50 shadow-sm group ${colorClass}`}> <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"> <Icon size={28} className="opacity-80" /> </div> <span className="font-bold text-gray-800 dark:text-white text-center text-xs leading-tight">{title}</span> </button>
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-gray-50 dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center p-6 md:p-8 pb-4 shrink-0">
                    <div className="flex items-center gap-3"> {currentView !== 'menu' && ( <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"> <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300 rtl:rotate-180" /> </button> )} <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> {currentView === 'menu' ? ( <><Settings className="text-primary-600" />{t.rxSettings}</> ) : currentView === 'manage_meds' ? t.manageMedications : currentView === 'upload_bg' ? t.uploadRxBg : currentView === 'style_meds' ? t.medsTextStyle : currentView === 'style_header_info' ? t.headerInfoStyle : currentView === 'style_header_line' ? t.headerLineStyle : currentView === 'spacing' ? t.headerSpacing : currentView === 'paper_size' ? (isRTL ? 'حجم الورق' : 'Paper Size') : t.rxSymbolStyle } </h3> </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X size={24} className="text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-2">
                    {currentView === 'menu' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full content-center">
                            <MenuCard title={t.manageMedications} icon={Pill} onClick={() => { setShowAddMasterDrugModal(true); onClose(); }} colorClass="hover:border-purple-200 text-purple-600" />
                            <MenuCard title={t.uploadRxBg} icon={Image} onClick={() => setCurrentView('upload_bg')} colorClass="hover:border-blue-200 text-blue-600" />
                            <MenuCard title={isRTL ? 'حجم الورق' : 'Paper Size'} icon={FileStack} onClick={() => setCurrentView('paper_size')} colorClass="hover:border-rose-200 text-rose-600" />
                            <MenuCard title={t.headerSpacing} icon={Layout} onClick={() => setCurrentView('spacing')} colorClass="hover:border-indigo-200 text-indigo-600" />
                            <MenuCard title={t.headerInfoStyle} icon={Hash} onClick={() => setCurrentView('style_header_info')} colorClass="hover:border-amber-200 text-amber-600" />
                            <MenuCard title={t.headerLineStyle} icon={Minus} onClick={() => setCurrentView('style_header_line')} colorClass="hover:border-gray-200 text-gray-500" />
                            <MenuCard title={t.medsTextStyle} icon={AlignLeft} onClick={() => setCurrentView('style_meds')} colorClass="hover:border-green-200 text-green-600" />
                            <MenuCard title={t.rxSymbolStyle} icon={Italic} onClick={() => setCurrentView('style_rx')} colorClass="hover:border-orange-200 text-orange-600" />
                        </div>
                    )}
                    {currentView === 'paper_size' && (
                        <div className="space-y-8 animate-fade-in py-4 flex flex-col items-center">
                            <div className="bg-white dark:bg-gray-700 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm w-full">
                                <h4 className="text-center font-black text-gray-400 uppercase tracking-widest mb-8">{isRTL ? 'اختر الحجم المناسب' : 'Choose paper format'}</h4>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-2 rounded-[2rem] gap-2">
                                    <button 
                                        onClick={() => setPaperSize('A5')}
                                        className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[1.5rem] transition-all duration-300 border-2 ${paperSize === 'A5' ? 'bg-white dark:bg-gray-600 border-primary-500 shadow-xl scale-[1.02]' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                                    >
                                        <div className="w-10 h-14 border-2 border-current rounded mb-3 opacity-80 flex items-center justify-center font-black text-xs">A5</div>
                                        <span className="font-black text-lg">A5</span>
                                        <span className="text-[10px] opacity-60 mt-1 uppercase font-bold tracking-tighter">Small Format</span>
                                    </button>
                                    <button 
                                        onClick={() => setPaperSize('A4')}
                                        className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[1.5rem] transition-all duration-300 border-2 ${paperSize === 'A4' ? 'bg-white dark:bg-gray-600 border-primary-500 shadow-xl scale-[1.02]' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                                    >
                                        <div className="w-12 h-16 border-2 border-current rounded mb-3 opacity-80 flex items-center justify-center font-black text-xs">A4</div>
                                        <span className="font-black text-lg">A4</span>
                                        <span className="text-[10px] opacity-60 mt-1 uppercase font-bold tracking-tighter">Standard Format</span>
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1"> {t.save} </button>
                        </div>
                    )}
                    {currentView === 'upload_bg' && (
                        <div className="flex flex-col h-full space-y-6">
                            {currentBg ? ( <div className="bg-white dark:bg-gray-700 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative animate-fade-in"> <div className="flex justify-between items-center mb-4"> <h4 className="font-bold text-gray-700 dark:text-white flex items-center gap-2"> <Eye size={18} className="text-primary-500" /> {isRTL ? "خلفية الوصفة الحالية" : "Current Rx Background"} </h4> <button onClick={() => { handleRemoveRxBg?.(); }} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm" title={t.removeBg}> <Trash2 size={16} /> </button> </div> <div className="aspect-[1/1.4] max-h-64 mx-auto overflow-hidden rounded-xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-inner relative"> <BackgroundPreview src={currentBg} isRTL={isRTL} /> </div> </div> ) : ( <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center opacity-60"> <Image size={40} className="mx-auto mb-2 text-gray-400" /> <p className="text-sm font-bold">{isRTL ? "لا توجد خلفية للوصفة" : "No Rx background set"}</p> </div> )}
                            <div className="p-8 bg-white dark:bg-gray-700 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-center"> <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"> <Upload size={32} /> </div> <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.uploadRxBg}</h4> <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed font-bold">{t.recSize}</p> <div className="flex flex-wrap justify-center gap-3 mb-6"> <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-tighter"> <FileType size={12}/> Images (JPG, PNG) </div> <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-tighter"> <FileText size={12}/> PDF Files </div> </div> <label className="inline-flex cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 transform hover:-translate-y-1"> {t.upload} <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { handleRxFileUpload(e); }} /> </label> </div>
                        </div>
                    )}
                    {currentView === 'spacing' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-3xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex justify-between items-center mb-6"> <h4 className="font-bold text-gray-800 dark:text-white">{t.topMargin}</h4> <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-mono font-bold">{topMargin} pt</span> </div>
                                <input type="range" min="50" max="300" step="5" value={topMargin} onChange={(e) => setTopMargin(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-8" />
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl p-4 relative min-h-[250px] bg-gray-50 dark:bg-gray-800 overflow-hidden"> <div className="bg-indigo-100 dark:bg-indigo-900/40 border-b-2 border-indigo-300 dark:border-indigo-700 flex items-center justify-center transition-all duration-300" style={{ height: `${topMargin / 2}px` }}> <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{t.headerSpacing}</span> </div> </div>
                            </div>
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1"> {t.save} </button>
                        </div>
                    )}
                    {currentView === 'style_meds' && (
                        <div className="space-y-6">
                            <StyleEditor config={medsConfig} onChange={setMedsConfig} label={t.medsTextStyle} t={t} />
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1"> {t.save} </button>
                        </div>
                    )}
                    {currentView === 'style_header_info' && (
                        <div className="space-y-6">
                            <StyleEditor config={headerInfoConfig} onChange={setHeaderInfoConfig} label={t.headerInfoStyle} t={t} />
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1"> {t.save} </button>
                        </div>
                    )}
                    {currentView === 'style_header_line' && (
                        <div className="space-y-6">
                            <LineStyleEditor config={headerLineConfig} onChange={setHeaderLineConfig} label={t.headerLineStyle} t={t} />
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1"> {t.save} </button>
                        </div>
                    )}
                    {currentView === 'style_rx' && (
                        <div className="space-y-6">
                            <StyleEditor config={rxSymbolConfig} onChange={setRxSymbolConfig} label="RX/" t={t} />
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1"> {t.save} </button>
                        </div>
                    )}
                </div>
            </div>
        </div>, document.body
    );
};

export const MedicalHistoryModal = ({ show, onClose, t, currentLang, initialData, onSave }: any) => {
    const [conditions, setConditions] = useState<Record<string, boolean>>({});
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    useEffect(() => {
        if (show) {
            const initialMap: Record<string, boolean> = {};
            if (initialData && initialData.length > 0) { initialData.forEach((item: MedicalConditionItem) => { initialMap[item.id] = item.active; }); }
            setConditions(initialMap);
        }
    }, [show, initialData]);
    if (!show) return null;
    const handleToggle = (id: string, value: boolean) => { setConditions(prev => ({ ...prev, [id]: value })); };
    const handleSave = () => { const result: MedicalConditionItem[] = Object.entries(conditions).map(([id, active]) => ({ id, active: active as boolean })); onSave(result); onClose(); };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6 shrink-0"> <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> <Stethoscope className="text-red-500" /> {t.medicalHistory} </h3> <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button> </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <div className="grid grid-cols-1 gap-3">
                        {MEDICAL_CONDITIONS_LIST.map((condition) => {
                            const label = currentLang === 'ar' ? condition.ar : currentLang === 'ku' ? condition.ku : condition.en;
                            const status = conditions[condition.id];
                            return (
                                <div key={condition.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600"> <span className="font-bold text-gray-800 dark:text-white text-lg">{label}</span> <div className="flex gap-2"> <button onClick={() => handleToggle(condition.id, true)} className={`p-2 rounded-lg border-2 transition ${status === true ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-red-300'}`}> <Check size={20} /> </button> <button onClick={() => handleToggle(condition.id, false)} className={`p-2 rounded-lg border-2 transition ${status === false ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-green-300'}`}> <X size={20} /> </button> </div> </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0"> <button onClick={handleSave} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition"> {t.save} </button> </div>
            </div>
        </div>, document.body
    );
};

export const PatientQueriesModal = ({ show, onClose, t, currentLang, initialData, onSave }: any) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    useEffect(() => {
        if (show) {
            const initialMap: Record<string, string> = {};
            if (initialData && initialData.length > 0) { initialData.forEach((item: PatientQueryAnswer) => { initialMap[item.questionId] = item.answerId; }); }
            setAnswers(initialMap);
        }
    }, [show, initialData]);
    if (!show) return null;
    const handleSelect = (questionId: string, answerId: string) => { setAnswers(prev => ({ ...prev, [questionId]: answerId })); };
    const handleSave = () => { const result: PatientQueryAnswer[] = Object.entries(answers).map(([questionId, answerId]) => ({ questionId, answerId: answerId as string })); onSave(result); onClose(); };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className={`bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl p-8 max-h-[85vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-8 shrink-0"> <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3"> <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"> <HelpCircle className="text-blue-600 dark:text-blue-400" size={24} /> </div> {t.dentalHistory} </h3> <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button> </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-8">
                    {PATIENT_QUESTIONS_LIST.map((q) => {
                        const questionText = currentLang === 'ar' ? q.ar : currentLang === 'ku' ? q.ku : q.en;
                        return ( <div key={q.id} className="space-y-4"> <h4 className="font-bold text-gray-700 dark:text-gray-200 text-lg leading-relaxed">{questionText}</h4> <div className="flex flex-wrap gap-3"> {q.options.map(opt => { const optText = currentLang === 'ar' ? opt.ar : currentLang === 'ku' ? opt.ku : opt.en; const isSelected = answers[q.id] === opt.id; return ( <button key={opt.id} onClick={() => handleSelect(q.id, opt.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${isSelected ? 'bg-blue-600 text-white shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}> {optText} </button> ); })} </div> </div> );
                    })}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 shrink-0"> <button onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"> {t.save} </button> </div>
            </div>
        </div>, document.body
    );
};

export const PrescriptionModal = ({ show, onClose, t, data, patient, currentLang, isRTL, handleSave, isSaving }: any) => {
    const [medSearch, setMedSearch] = useState('');
    const [rxMode, setRxMode] = useState<'write' | 'select'>('select');
    const [addedMeds, setAddedMeds] = useState<Medication[]>([]);
    const [medForm, setMedForm] = useState<Partial<Medication>>({ name: '', dose: '', form: '', frequency: '', notes: '' });
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [groupView, setGroupView] = useState<'groups' | 'meds'>('groups');
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (show) {
            setAddedMeds([]);
            setMedSearch('');
            setRxMode('select');
            setGroupView('groups');
            setActiveGroupId(null);
            setMedForm({ name: '', dose: '', form: '', frequency: '', notes: '' });
        }
    }, [show]);

    if (!show) return null;

    const filteredMedsForSearch = medSearch.trim() 
        ? data.medications.filter((m: Medication) => m.name.toLowerCase().includes(medSearch.toLowerCase())) 
        : [];

    const handleAddFromSearch = (med: Medication) => {
        setAddedMeds([...addedMeds, { ...med, id: generateId() }]);
        setMedSearch('');
    };

    const handleAddManual = () => {
        if (!medForm.name?.trim()) return;
        setAddedMeds([...addedMeds, { ...medForm, id: generateId() } as Medication]);
        setMedForm({ name: '', dose: '', form: '', frequency: '', notes: '' });
    };

    const handleSavePrescription = async () => {
        if (addedMeds.length === 0) return;
        const rx = {
            id: generateId(),
            date: new Date().toISOString(),
            medications: addedMeds,
            updatedAt: Date.now()
        };
        await handleSave(patient.id, { prescriptions: [rx, ...patient.prescriptions] });
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col h-[85vh] overflow-hidden ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Compact Header */}
                <div className="px-5 py-4 shrink-0 bg-gradient-to-br from-primary-600 to-indigo-700 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-md">
                            <Pill size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight leading-tight">{t.newPrescription}</h3>
                            <p className="text-[9px] uppercase font-black tracking-widest opacity-70 leading-none">{patient.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isSaving} className="p-1.5 hover:bg-white/10 rounded-full transition-all active:scale-90 disabled:opacity-50">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-800">
                    {/* 1. Global Search (Now inside scroll area) */}
                    <div className="relative shrink-0">
                        <div className="relative group">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400 group-focus-within:text-primary-500 transition-colors`} size={20} />
                            <input 
                                value={medSearch} 
                                onChange={(e) => setMedSearch(e.target.value)} 
                                autoComplete="off" 
                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 rounded-2xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 dark:text-white outline-none font-bold text-base shadow-sm transition-all`} 
                                placeholder={t.searchMedications} 
                            />
                        </div>
                        {medSearch.trim().length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-[160] mt-1 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-56 overflow-y-auto custom-scrollbar animate-scale-up">
                                {filteredMedsForSearch.length > 0 ? (
                                    filteredMedsForSearch.map(med => (
                                        <button key={med.id} onClick={() => handleAddFromSearch(med)} className="w-full text-start p-4 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-b last:border-0 border-gray-50 dark:border-gray-700 flex items-center justify-between group transition-all">
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white text-base group-hover:text-primary-600">{med.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{med.dose} • {med.form} • {med.frequency}</div>
                                            </div>
                                            <Plus size={18} className="text-primary-200 group-hover:text-primary-600 transition-transform group-hover:rotate-90" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-400 font-bold italic text-sm">{t.noMedicationsFound}</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Mode Toggle Buttons (Select is first and default) */}
                    <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 shrink-0">
                        <button 
                            onClick={() => setRxMode('select')} 
                            className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${rxMode === 'select' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={16} /> {t.selectMedication}
                        </button>
                        <button 
                            onClick={() => setRxMode('write')} 
                            className={`flex-1 py-2.5 rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${rxMode === 'write' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Edit2 size={16} /> {t.writeMedication}
                        </button>
                    </div>

                    {/* 3. Conditional Area (Form or Select) */}
                    <div className="animate-fade-in">
                        {rxMode === 'write' ? (
                            <div className="flex flex-col space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase ms-2 tracking-widest">{t.drugName} *</label>
                                        <input value={medForm.name} onChange={e => setMedForm({...medForm, name: e.target.value})} className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none font-bold shadow-sm text-sm" placeholder={t.drugName} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase ms-2 tracking-widest">{t.dose}</label>
                                        <input value={medForm.dose} onChange={e => setMedForm({...medForm, dose: e.target.value})} className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none font-bold shadow-sm text-sm text-end" dir="ltr" placeholder="500mg" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase ms-2 tracking-widest">{t.form}</label>
                                        <input value={medForm.form} onChange={e => setMedForm({...medForm, form: e.target.value})} className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none font-bold shadow-sm text-sm" placeholder="Tab, Cap, Syrup..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase ms-2 tracking-widest">{t.frequency}</label>
                                        <input value={medForm.frequency} onChange={e => setMedForm({...medForm, frequency: e.target.value})} className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none font-bold shadow-sm text-sm text-end" dir="ltr" placeholder="1 x 3" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ms-2 tracking-widest">{t.medNotes}</label>
                                    <input value={medForm.notes} onChange={e => setMedForm({...medForm, notes: e.target.value})} className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none font-medium shadow-sm text-sm" placeholder={t.medNotes} />
                                </div>
                                <button 
                                    onClick={handleAddManual}
                                    disabled={!medForm.name?.trim()}
                                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    <PlusCircle size={18} /> {t.addMedication}
                                </button>
                            </div>
                        ) : (
                            <div className="p-1">
                                {groupView === 'groups' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {(data.medicationCategories || []).map(cat => (
                                            <button 
                                                key={cat.id} 
                                                onClick={() => { setActiveGroupId(cat.id); setGroupView('meds'); }} 
                                                className="p-5 bg-white dark:bg-gray-700 rounded-2xl border-2 border-transparent hover:border-primary-400 shadow-sm transition-all flex flex-col items-center gap-2 text-center group"
                                            >
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Folder size={24}/></div>
                                                <span className="font-black text-gray-800 dark:text-white text-xs leading-tight">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <button onClick={() => setGroupView('groups')} className="mb-4 flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest hover:underline">
                                            <ArrowLeft size={14} className="rtl:rotate-180" /> {t.back}
                                        </button>
                                        <div className="grid grid-cols-1 gap-2">
                                            {data.medications.filter((m: Medication) => m.categoryId === activeGroupId).map(med => (
                                                <button 
                                                    key={med.id} 
                                                    onClick={() => setAddedMeds([...addedMeds, { ...med, id: generateId() }])}
                                                    className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-gray-700 rounded-xl border border-transparent hover:border-primary-300 transition-all group shadow-sm text-start"
                                                >
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-white text-sm">{med.name}</div>
                                                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-tight" dir="ltr">{med.dose} • {med.form} • {med.frequency}</div>
                                                    </div>
                                                    <Plus size={18} className="text-primary-300 group-hover:text-primary-600" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Added Meds Summary & Footer Save Button (Fixed) */}
                <div className="shrink-0 flex flex-col">
                    {addedMeds.length > 0 && (
                        <div className="bg-white dark:bg-gray-700 px-5 py-3 border-t border-gray-100 dark:border-gray-800 shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.rxList}</span>
                                <span className="bg-primary-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{addedMeds.length}</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {addedMeds.map((med, idx) => (
                                    <div key={med.id} className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-xl border border-primary-100 dark:border-primary-800 animate-scale-up shrink-0">
                                        <div className="text-start">
                                            <div className="font-black text-primary-900 dark:text-primary-100 text-[11px] leading-none mb-0.5">{med.name}</div>
                                            <div className="text-[8px] text-primary-600/80 font-bold leading-none">{med.dose} • {med.frequency}</div>
                                        </div>
                                        <button onClick={() => setAddedMeds(addedMeds.filter((_, i) => i !== idx))} className="p-1 text-red-500 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:scale-110 transition-transform">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-5 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <button 
                            onClick={handleSavePrescription}
                            disabled={isSaving || addedMeds.length === 0}
                            className="w-full py-4 bg-primary-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary-500/40 hover:bg-primary-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    <span>{t.save}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
