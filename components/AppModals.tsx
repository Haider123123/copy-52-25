
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Plus, X as XIcon, ListTodo, FileText, Printer, AlignLeft, AlignCenter, AlignRight, Save, Download, FlaskConical, Search, ChevronDown, Stethoscope, HelpCircle, Minus, Package, Italic, AlignJustify, Heading, Type, Trash2, Edit2, Pill, ArrowLeft, Settings, Image, Bold, Type as TypeIcon } from 'lucide-react';
import { format } from 'date-fns';
import { COUNTRY_CODES, CATEGORIES, TREATMENT_TYPES, DURATIONS, MEMO_COLORS, MEDICAL_CONDITIONS_LIST, PATIENT_QUESTIONS_LIST } from '../constants';
import { ClinicData, Patient, SupplyItem, Memo, TodoItem, Appointment, ExpenseItem, Medication, DocumentTemplate, LabOrder, MedicalConditionItem, PatientQueryAnswer, InventoryItem, MemoStyle, TextStyleConfig } from '../types';

/* --- SUB COMPONENTS --- */
const TodoListBuilder = ({ initialTodos, onChange, t }: { initialTodos: TodoItem[], onChange: (todos: TodoItem[]) => void, t: any }) => {
    const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
    const [newTodo, setNewTodo] = useState('');
  
    useEffect(() => {
      onChange(todos);
    }, [todos, onChange]);
  
    const handleAdd = () => {
      if (!newTodo.trim()) return;
      const item: TodoItem = { id: Date.now().toString(), text: newTodo, done: false };
      setTodos([...todos, item]);
      setNewTodo('');
    };
  
    const handleToggle = (id: string) => {
      setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };
  
    const handleDelete = (id: string) => {
      setTodos(todos.filter(t => t.id !== id));
    };
  
    return (
      <div className="space-y-3">
          <div className="flex gap-2">
              <input 
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                  placeholder={t.addTodo}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
              />
              <button type="button" onClick={handleAdd} className="bg-primary-600 text-white p-2 rounded-xl"><Plus size={20} /></button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
              {todos.map(todo => (
                  <div key={todo.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg group">
                      <button type="button" onClick={() => handleToggle(todo.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${todo.done ? 'bg-green-500 border-transparent text-white' : 'border-gray-300 dark:border-gray-500'}`}>
                          {todo.done && <Check size={12} />}
                      </button>
                      <span className={`flex-1 text-sm ${todo.done ? 'line-through opacity-50' : 'dark:text-white'}`}>{todo.text}</span>
                      <button type="button" onClick={() => handleDelete(todo.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><XIcon size={16} /></button>
                  </div>
              ))}
              {todos.length === 0 && <p className="text-center text-xs text-gray-400 italic py-2">{t.items}...</p>}
          </div>
      </div>
    );
};

const StyleEditor = ({ config, onChange, label, t }: { config: TextStyleConfig, onChange: (c: TextStyleConfig) => void, label: string, t: any }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm uppercase flex items-center gap-2">
                <TypeIcon size={16} /> {label}
            </h4>
            <div className="flex flex-wrap gap-4 items-center">
                {/* Font Size */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.fontSize}</label>
                    <input 
                        type="number" 
                        value={config.fontSize} 
                        onChange={(e) => onChange({...config, fontSize: parseInt(e.target.value)})} 
                        className="w-16 p-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none text-center"
                    />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">{t.textColor}</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={config.color} 
                            onChange={(e) => onChange({...config, color: e.target.value})} 
                            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-500">{config.color}</span>
                    </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-2 mt-auto">
                    <button 
                        type="button"
                        onClick={() => onChange({...config, isBold: !config.isBold})} 
                        className={`p-2 rounded-lg border flex items-center gap-1 ${config.isBold ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                    >
                        <Bold size={16} />
                        <span className="text-xs font-bold">{t.bold}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => onChange({...config, isItalic: !config.isItalic})} 
                        className={`p-2 rounded-lg border flex items-center gap-1 ${config.isItalic ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                    >
                        <Italic size={16} />
                        <span className="text-xs font-bold">{t.italic}</span>
                    </button>
                </div>
            </div>
            
            {/* Preview */}
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex justify-center items-center h-16 overflow-hidden">
                <span style={{
                    fontSize: `${config.fontSize}px`,
                    color: config.color,
                    fontWeight: config.isBold ? 'bold' : 'normal',
                    fontStyle: config.isItalic ? 'italic' : 'normal',
                }}>
                    Preview Text
                </span>
            </div>
        </div>
    )
}

/* --- MODALS --- */

export const RxSettingsModal = ({ show, onClose, t, data, setData, handleRxFileUpload, setShowAddMasterDrugModal, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    
    // View State: 'menu' is main grid, others are sub-pages
    type RxSettingsView = 'menu' | 'manage_meds' | 'upload_bg' | 'style_meds' | 'style_rx';
    const [currentView, setCurrentView] = useState<RxSettingsView>('menu');

    // Defaults
    const defaultRxSymbol = { fontSize: 30, color: '#000000', isBold: true, isItalic: true };
    const defaultMeds = { fontSize: 14, color: '#000000', isBold: true, isItalic: false };

    const [rxSymbolConfig, setRxSymbolConfig] = useState<TextStyleConfig>(defaultRxSymbol);
    const [medsConfig, setMedsConfig] = useState<TextStyleConfig>(defaultMeds);

    // Initialize state from props whenever modal opens
    useEffect(() => {
        if (show && data && data.settings) {
            const settings = data.settings;
            setRxSymbolConfig(settings.rxTemplate?.rxSymbol || defaultRxSymbol);
            setMedsConfig(settings.rxTemplate?.medications || defaultMeds);
            setCurrentView('menu'); // Reset to menu on open
        }
    }, [show, data]); 

    // Generalized Save function that updates state and returns to menu
    const handleSaveStyle = () => {
        setData((prev: ClinicData) => ({
            ...prev,
            settings: {
                ...prev.settings,
                rxTemplate: {
                    rxSymbol: rxSymbolConfig,
                    medications: medsConfig
                }
            }
        }));
        setCurrentView('menu');
    };

    if (!show) return null;

    const MenuCard = ({ title, icon: Icon, onClick, colorClass }: any) => (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-700/50 shadow-sm group ${colorClass}`}
        >
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon size={32} className="opacity-80" />
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-center">{title}</span>
        </button>
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`bg-gray-50 dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        {currentView !== 'menu' && (
                            <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                                <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300 rtl:rotate-180" />
                            </button>
                        )}
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            {currentView === 'menu' ? (
                                <>
                                    <Settings className="text-primary-600" />
                                    {t.rxSettings}
                                </>
                            ) : currentView === 'manage_meds' ? t.manageMedications :
                                currentView === 'upload_bg' ? t.uploadRxBg :
                                currentView === 'style_meds' ? t.medsTextStyle :
                                t.rxSymbolStyle
                            }
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X size={24} className="text-gray-500" /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-2">
                    
                    {currentView === 'menu' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
                            <MenuCard 
                                title={t.manageMedications} 
                                icon={Pill} 
                                onClick={() => { setShowAddMasterDrugModal(true); onClose(); }} // Direct logic for meds as it uses another modal
                                colorClass="hover:border-purple-200 text-purple-600"
                            />
                            <MenuCard 
                                title={t.uploadRxBg} 
                                icon={Image} 
                                onClick={() => setCurrentView('upload_bg')} 
                                colorClass="hover:border-blue-200 text-blue-600"
                            />
                            <MenuCard 
                                title={t.medsTextStyle} 
                                icon={AlignLeft} 
                                onClick={() => setCurrentView('style_meds')} 
                                colorClass="hover:border-green-200 text-green-600"
                            />
                            <MenuCard 
                                title={t.rxSymbolStyle} 
                                icon={Italic} 
                                onClick={() => setCurrentView('style_rx')} 
                                colorClass="hover:border-orange-200 text-orange-600"
                            />
                        </div>
                    )}

                    {currentView === 'upload_bg' && (
                        <div className="flex flex-col h-full justify-center">
                            <div className="p-8 bg-white dark:bg-gray-700 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-center">
                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Image size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.uploadRxBg}</h4>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">{t.recSize}</p>
                                
                                <label className="inline-flex cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 transform hover:-translate-y-1">
                                    {t.upload}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleRxFileUpload(e); setCurrentView('menu'); }} />
                                </label>
                            </div>
                        </div>
                    )}

                    {currentView === 'style_meds' && (
                        <div className="space-y-6">
                            <StyleEditor config={medsConfig} onChange={setMedsConfig} label={t.medicationSaved} t={t} />
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1">
                                {t.save}
                            </button>
                        </div>
                    )}

                    {currentView === 'style_rx' && (
                        <div className="space-y-6">
                            <StyleEditor config={rxSymbolConfig} onChange={setRxSymbolConfig} label="RX/" t={t} />
                            <button onClick={handleSaveStyle} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition transform hover:-translate-y-1">
                                {t.save}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
};

export const InventoryModal = ({ show, onClose, t, selectedItem, handleSaveItem, currentLang }: any) => {
    const [quantity, setQuantity] = useState(selectedItem?.quantity || 0);
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        setQuantity(selectedItem?.quantity || 0);
    }, [selectedItem, show]);

    if (!show) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                   <Package className="text-primary-600" />
                   {selectedItem ? t.editInventoryItem : t.addInventoryItem}
                </h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleSaveItem({
                        name: fd.get('name'),
                        quantity: quantity,
                        minQuantity: parseInt(fd.get('minQuantity') as string),
                        price: fd.get('price') ? parseFloat(fd.get('price') as string) : undefined,
                        expiryDate: fd.get('expiryDate'),
                        color: fd.get('color')
                    });
                }} className="space-y-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.itemName}</label>
                        <input name="name" defaultValue={selectedItem?.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.currentQty}</label>
                        <div className="flex items-center gap-3">
                            <button 
                                type="button" 
                                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                            >
                                <Minus size={18} />
                            </button>
                            <input 
                                name="quantity" 
                                type="number" 
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                className="flex-1 text-center font-bold text-xl py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.minQty}</label>
                            <input name="minQuantity" type="number" defaultValue={selectedItem ? selectedItem.minQuantity : 0} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.price} ({t.optional})</label>
                            <input name="price" type="number" step="0.01" defaultValue={selectedItem?.price} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.expiryDate}</label>
                        <input name="expiryDate" type="date" defaultValue={selectedItem?.expiryDate} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">{t.itemColor}</label>
                        <div className="flex gap-2 justify-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                            {MEMO_COLORS.map(c => (
                                <label key={c.id} className="cursor-pointer">
                                    <input type="radio" name="color" value={c.id} defaultChecked={selectedItem?.color === c.id || (!selectedItem && c.id === 'blue')} className="hidden peer" />
                                    <div className={`w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-500 peer-checked:scale-110 transition`} style={{ backgroundColor: c.bg }}></div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export const MedicalHistoryModal = ({ show, onClose, t, currentLang, initialData, onSave }: any) => {
    const [conditions, setConditions] = useState<Record<string, boolean>>({});
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (show) {
            const initialMap: Record<string, boolean> = {};
            if (initialData && initialData.length > 0) {
                initialData.forEach((item: MedicalConditionItem) => {
                    initialMap[item.id] = item.active;
                });
            }
            setConditions(initialMap);
        }
    }, [show, initialData]);

    if (!show) return null;

    const handleToggle = (id: string, value: boolean) => {
        setConditions(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSave = () => {
        const result: MedicalConditionItem[] = Object.entries(conditions).map(([id, active]) => ({
            id,
            active: active as boolean
        }));
        onSave(result);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Stethoscope className="text-red-500" />
                        {t.medicalHistory}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <div className="grid grid-cols-1 gap-3">
                        {MEDICAL_CONDITIONS_LIST.map((condition) => {
                            const label = currentLang === 'ar' ? condition.ar : currentLang === 'ku' ? condition.ku : condition.en;
                            const status = conditions[condition.id]; // true, false, or undefined

                            return (
                                <div key={condition.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <span className="font-bold text-gray-800 dark:text-white text-lg">{label}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleToggle(condition.id, true)}
                                            className={`p-2 rounded-lg border-2 transition ${status === true ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-red-300'}`}
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggle(condition.id, false)}
                                            className={`p-2 rounded-lg border-2 transition ${status === false ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-green-300'}`}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                    <button onClick={handleSave} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition">
                        {t.save}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const PatientQueriesModal = ({ show, onClose, t, currentLang, initialData, onSave }: any) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (show) {
            const initialMap: Record<string, string> = {};
            if (initialData && initialData.length > 0) {
                initialData.forEach((item: PatientQueryAnswer) => {
                    initialMap[item.questionId] = item.answerId;
                });
            }
            setAnswers(initialMap);
        }
    }, [show, initialData]);

    if (!show) return null;

    const handleSelect = (questionId: string, answerId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleSave = () => {
        const result: PatientQueryAnswer[] = Object.entries(answers).map(([questionId, answerId]) => ({
            questionId,
            answerId: answerId as string
        }));
        onSave(result);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" style={{ zIndex: 9999 }}>
            <div className={`bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl p-8 max-h-[85vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <HelpCircle className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        {t.dentalHistory}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-8">
                    {PATIENT_QUESTIONS_LIST.map((q) => {
                        const questionText = currentLang === 'ar' ? q.ar : currentLang === 'ku' ? q.ku : q.en;
                        
                        return (
                            <div key={q.id} className="space-y-4">
                                <h4 className="font-bold text-gray-700 dark:text-gray-200 text-lg leading-relaxed">{questionText}</h4>
                                <div className="flex flex-wrap gap-3">
                                    {q.options.map(opt => {
                                        const optText = currentLang === 'ar' ? opt.ar : currentLang === 'ku' ? opt.ku : opt.en;
                                        const isSelected = answers[q.id] === opt.id;
                                        
                                        return (
                                            <button 
                                                key={opt.id}
                                                onClick={() => handleSelect(q.id, opt.id)}
                                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
                                                    isSelected 
                                                    ? 'bg-blue-600 text-white shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {optText}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                        {t.save}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const DocumentModal = ({ show, onClose, t, type, onPrint, data, onSaveTemplate }: any) => {
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
    const [fontSize, setFontSize] = useState<number>(18);
    const [text, setText] = useState('');
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [templateTitle, setTemplateTitle] = useState('');

    if (!show) return null;

    const handleSaveNewTemplate = () => {
        if (!templateTitle.trim() || !text.trim()) return;
        const newTemplate: DocumentTemplate = {
            id: Date.now().toString(),
            title: templateTitle,
            text: text
        };
        onSaveTemplate(newTemplate);
        setTemplateTitle('');
        setShowSaveTemplate(false);
    };

    const handleLoadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tmpl = data?.documentTemplates?.find((t: DocumentTemplate) => t.id === e.target.value);
        if (tmpl) {
            setText(tmpl.text);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                         {type === 'consent' ? t.consentForm : t.patientInstructions}
                     </h3>
                     <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl">
                        <button onClick={() => setAlignment('left')} className={`p-2 rounded-lg ${alignment === 'left' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`} title={t.alignLeft}><AlignLeft size={18}/></button>
                        <button onClick={() => setAlignment('center')} className={`p-2 rounded-lg ${alignment === 'center' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`} title={t.alignCenter}><AlignCenter size={18}/></button>
                        <button onClick={() => setAlignment('right')} className={`p-2 rounded-lg ${alignment === 'right' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`} title={t.alignRight}><AlignRight size={18}/></button>
                        
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-gray-500">{t.fontSize}</span>
                             <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-14 p-1 rounded-lg border text-center dark:bg-gray-800 dark:text-white outline-none" min={10} max={40} />
                        </div>
                    </div>

                    {/* Template Controls */}
                    <div className="flex flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                        <div className="flex gap-2">
                            <select onChange={handleLoadTemplate} className="flex-1 p-2 rounded-lg border border-blue-100 dark:border-blue-800 dark:bg-gray-800 dark:text-white text-sm outline-none">
                                <option value="">{t.selectTemplate}</option>
                                {data?.documentTemplates?.map((tmpl: DocumentTemplate) => (
                                    <option key={tmpl.id} value={tmpl.id}>{tmpl.title}</option>
                                ))}
                            </select>
                            <button onClick={() => setShowSaveTemplate(!showSaveTemplate)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition" title={t.saveTemplate}>
                                <Save size={18} />
                            </button>
                        </div>
                        
                        {showSaveTemplate && (
                            <div className="flex gap-2 mt-2 animate-fade-in">
                                <input 
                                    value={templateTitle}
                                    onChange={(e) => setTemplateTitle(e.target.value)}
                                    placeholder={t.templateName}
                                    className="flex-1 p-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none text-sm"
                                />
                                <button onClick={handleSaveNewTemplate} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold">{t.save}</button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.documentText}</label>
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{ textAlign: alignment, fontSize: `${fontSize}px` }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none min-h-[300px]" 
                            placeholder={t.writeTextHere}
                        />
                    </div>
                </div>
                
                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={() => onPrint({ text, align: alignment, fontSize })}
                        className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                    >
                        <Printer size={20} />
                        {t.print}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const SupplyModal = ({ show, onClose, t, selectedSupply, handleSaveSupply, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{selectedSupply ? t.editItem : t.addItem}</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleSaveSupply(fd.get('name') as string, parseInt(fd.get('quantity') as string), parseFloat(fd.get('price') as string));
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.itemName}</label>
                        <input name="name" defaultValue={selectedSupply?.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.quantity}</label>
                        <input name="quantity" type="number" defaultValue={selectedSupply?.quantity || 1} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                        </div>
                        <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.price}</label>
                        <input name="price" type="number" defaultValue={selectedSupply?.price || 0} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export const MemoModal = ({ show, onClose, t, selectedMemo, memoType, setMemoType, tempTodos, setTempTodos, handleSaveMemo, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    
    // Formatting State
    const [style, setStyle] = useState<MemoStyle>({
        direction: 'rtl',
        fontSize: 14,
        textColor: '#374151',
        isItalic: false,
        titleFontSize: 20,
        titleColor: '#111827'
    });

    useEffect(() => {
        if (selectedMemo && selectedMemo.style) {
            setStyle(selectedMemo.style);
        } else {
            // Default styles based on language
            setStyle({
                direction: isRTL ? 'rtl' : 'ltr',
                fontSize: 14,
                textColor: '#374151',
                isItalic: false,
                titleFontSize: 20,
                titleColor: '#111827'
            });
        }
    }, [selectedMemo, isRTL, show]);

    if (!show) return null;

    const toggleItalic = () => setStyle(prev => ({ ...prev, isItalic: !prev.isItalic }));
    const setDirection = (dir: 'ltr' | 'rtl') => setStyle(prev => ({ ...prev, direction: dir }));

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 transition-all duration-300 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  {selectedMemo ? t.editMemo : t.newMemo}
              </h3>

              {!memoType ? (
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setMemoType('text')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition gap-3 group">
                          <FileText size={40} className="text-blue-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-blue-700 dark:text-blue-300">{t.textNote}</span>
                      </button>
                      <button onClick={() => setMemoType('todo')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition gap-3 group">
                          <ListTodo size={40} className="text-purple-500 group-hover:scale-110 transition-transform" />
                          <span className="font-bold text-purple-700 dark:text-purple-300">{t.todoList}</span>
                      </button>
                  </div>
              ) : (
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleSaveMemo(
                          fd.get('title') as string, 
                          fd.get('content') as string || '', 
                          fd.get('color') as string, 
                          memoType, 
                          tempTodos,
                          style // Pass the formatting style object
                      );
                  }} className="space-y-4">
                       
                       {/* Formatting Toolbar (Only for Text Memos or we can allow for todos too) */}
                       {memoType === 'text' && (
                           <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-600 mb-2">
                               {/* Direction */}
                               <div className="flex bg-white dark:bg-gray-600 rounded-lg p-1 border border-gray-200 dark:border-gray-500">
                                   <button type="button" onClick={() => setDirection('ltr')} className={`p-1.5 rounded-md ${style.direction === 'ltr' ? 'bg-gray-100 dark:bg-gray-500 shadow-sm' : ''}`} title="LTR"><AlignLeft size={16}/></button>
                                   <button type="button" onClick={() => setDirection('rtl')} className={`p-1.5 rounded-md ${style.direction === 'rtl' ? 'bg-gray-100 dark:bg-gray-500 shadow-sm' : ''}`} title="RTL"><AlignRight size={16}/></button>
                               </div>
                               
                               {/* Style Toggle */}
                               <button type="button" onClick={toggleItalic} className={`p-2 rounded-lg border ${style.isItalic ? 'bg-gray-200 dark:bg-gray-500 border-gray-300' : 'bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500'}`} title={t.italic}><Italic size={16}/></button>
                               
                               <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

                               {/* Title Formatting */}
                               <div className="flex items-center gap-1 bg-white dark:bg-gray-600 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-500">
                                   <Heading size={14} className="text-gray-500"/>
                                   <input type="number" value={style.titleFontSize} onChange={(e) => setStyle({...style, titleFontSize: parseInt(e.target.value)})} className="w-10 text-center text-xs bg-transparent outline-none" min={12} max={36} title={t.titleFormat} />
                                   <input type="color" value={style.titleColor} onChange={(e) => setStyle({...style, titleColor: e.target.value})} className="w-5 h-5 rounded cursor-pointer border-none bg-transparent" title={t.textColor} />
                               </div>

                               {/* Text Formatting */}
                               <div className="flex items-center gap-1 bg-white dark:bg-gray-600 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-500">
                                   <Type size={14} className="text-gray-500"/>
                                   <input type="number" value={style.fontSize} onChange={(e) => setStyle({...style, fontSize: parseInt(e.target.value)})} className="w-10 text-center text-xs bg-transparent outline-none" min={10} max={24} title={t.textFormat} />
                                   <input type="color" value={style.textColor} onChange={(e) => setStyle({...style, textColor: e.target.value})} className="w-5 h-5 rounded cursor-pointer border-none bg-transparent" title={t.textColor} />
                               </div>
                           </div>
                       )}

                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.memoTitle}</label>
                          <input 
                            name="title" 
                            defaultValue={selectedMemo?.title} 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 outline-none"
                            style={{ 
                                fontSize: `${style.titleFontSize}px`, 
                                color: style.titleColor,
                                direction: style.direction 
                            }} 
                          />
                       </div>

                       {memoType === 'text' ? (
                           <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.notes}</label>
                              <textarea 
                                name="content" 
                                defaultValue={selectedMemo?.content} 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 outline-none min-h-[150px]" 
                                placeholder={t.memoContent}
                                style={{
                                    direction: style.direction,
                                    fontSize: `${style.fontSize}px`,
                                    color: style.textColor,
                                    fontStyle: style.isItalic ? 'italic' : 'normal',
                                }}
                              />
                           </div>
                       ) : (
                           <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.todoList}</label>
                              <TodoListBuilder initialTodos={tempTodos} onChange={setTempTodos} t={t} />
                           </div>
                       )}

                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.pickColor}</label>
                          <div className="flex gap-2 justify-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                              {MEMO_COLORS.map(c => (
                                  <label key={c.id} className="cursor-pointer">
                                      <input type="radio" name="color" value={c.id} defaultChecked={selectedMemo?.color === c.id || (!selectedMemo && c.id === 'yellow')} className="hidden peer" />
                                      <div className={`w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-500 peer-checked:scale-110 transition`} style={{ backgroundColor: c.bg }}></div>
                                  </label>
                              ))}
                          </div>
                       </div>

                       <div className="flex gap-2 pt-2">
                          <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                          <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                       </div>
                  </form>
              )}
           </div>
        </div>,
        document.body
    );
};

export const PatientModal = ({ show, onClose, t, isRTL, currentLang, data, handleAddPatient, updatePatient, guestToConvert, activePatient, setSelectedPatientId, setCurrentView, setPatientTab }: any) => {
    if (!show) return null;
    const isEdit = !!activePatient;
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    
    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{isEdit ? t.editPatient : (guestToConvert ? t.convertGuestTitle : t.newPatient)}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              
              // Sanitization logic for phone number: remove spaces
              const rawPhone = fd.get('phone') as string;
              
              const formValues: any = {
                 name: fd.get('name') as string,
                 age: parseInt(fd.get('age') as string),
                 gender: fd.get('gender') as any,
                 phone: rawPhone.replace(/\s/g, ''), // Strip whitespace
                 phoneCode: fd.get('phoneCode') as string,
                 address: fd.get('address') as string,
                 category: fd.get('category') as any,
                 doctorId: fd.get('doctorId') as string
              };

              if (isEdit) {
                  updatePatient(activePatient.id, formValues);
                  onClose();
              } else {
                  handleAddPatient(formValues);
                  onClose();
              }
            }} className="space-y-4">
              
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
                  <input name="name" defaultValue={isEdit ? activePatient.name : guestToConvert?.patientName} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t.fullNamePlaceholder} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.age}</label>
                      <input name="age" type="number" defaultValue={isEdit ? activePatient.age : ''} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.gender}</label>
                      <select name="gender" defaultValue={isEdit ? activePatient.gender : 'male'} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                        <option value="male">{t.male}</option>
                        <option value="female">{t.female}</option>
                      </select>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                  <div className="flex gap-2">
                      <select 
                          name="phoneCode" 
                          defaultValue={isEdit ? activePatient.phoneCode : data.settings.defaultCountryCode}
                          className="w-24 px-2 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      >
                          {COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                          ))}
                      </select>
                      <input name="phone" type="tel" defaultValue={isEdit ? activePatient.phone : ''} className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="750 000 0000" />
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
                  <select name="category" defaultValue={isEdit ? activePatient.category : "diagnosis"} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{isRTL ? (currentLang === 'ku' ? cat.labelKu : cat.labelAr) : cat.label}</option>
                      ))}
                  </select>
              </div>
              
              {data.doctors.length > 1 && (
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.treatingDoctor}</label>
                      <select name="doctorId" defaultValue={isEdit ? activePatient.doctorId : ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                          {data.doctors.map(doc => (
                              <option key={doc.id} value={doc.id}>{doc.name}</option>
                          ))}
                      </select>
                  </div>
              )}

              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                  <input name="address" defaultValue={isEdit ? activePatient.address : ''} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t.cityStreetPlaceholder} />
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5">
                {t.save}
              </button>
            </form>
          </div>
        </div>,
        document.body
    );
};

export const PaymentModal = ({ show, onClose, t, activePatient, paymentType, data, handleSavePayment, selectedPayment, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    if (!show || !activePatient) return null;
    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {selectedPayment ? (paymentType === 'payment' ? t.editItem : t.editItem) : (paymentType === 'payment' ? t.addPayment : t.addCharge)}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleSavePayment({
                  amount: parseFloat(fd.get('amount') as string),
                  description: fd.get('description') as string,
                  date: fd.get('date') as string, // Might be null/empty if new
                  type: paymentType
              });
            }} className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
                  <input 
                    name="description" 
                    defaultValue={selectedPayment?.description}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                    placeholder={paymentType === 'payment' ? t.egConsultation : t.treatmentCost} 
                  />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.price}</label>
                  <div className="relative">
                      <span className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-500 font-bold">{data.settings.currency}</span>
                      <input 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        defaultValue={selectedPayment?.amount}
                        className="w-full ps-16 pe-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-bold text-lg outline-none" 
                        required 
                      />
                  </div>
              </div>
              
              {/* Date Input - Visible for Edit or Add */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.date}</label>
                  <input 
                    name="date" 
                    type="date"
                    defaultValue={selectedPayment ? format(new Date(selectedPayment.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                  />
              </div>

              <div className="flex gap-2 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                  <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${paymentType === 'payment' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {t.save}
                  </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
    );
};

export const AppointmentModal = ({ show, onClose, t, selectedAppointment, appointmentMode, setAppointmentMode, selectedPatientId, data, currentDate, handleAddAppointment, isRTL, currentLang }: any) => {
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatientIdForm, setSelectedPatientIdForm] = useState('');
    const [showPatientList, setShowPatientList] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (!show) {
            setPatientSearch('');
            setSelectedPatientIdForm('');
            setShowPatientList(false);
        } else {
            if(selectedAppointment) {
                 setSelectedPatientIdForm(selectedAppointment.patientId);
                 setPatientSearch(selectedAppointment.patientName);
            }
        }
    }, [show, selectedAppointment]);

    // Handle switching modes: reset search state
    useEffect(() => {
        if (show && !selectedAppointment) {
            setPatientSearch('');
            setSelectedPatientIdForm('');
            setShowPatientList(false);
        }
    }, [appointmentMode]);

    if (!show) return null;

    const filteredPatients = data.patients.filter((p: Patient) => 
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch)
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                      {selectedAppointment ? t.editAppointment : t.addAppointment}
                  </h3>
                  
                  {!selectedAppointment && !selectedPatientId && (
                      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-4">
                          <button 
                             type="button"
                             onClick={() => setAppointmentMode('existing')} 
                             className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${appointmentMode === 'existing' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}
                          >
                             {t.existingPatient}
                          </button>
                          <button 
                             type="button"
                             onClick={() => setAppointmentMode('new')} 
                             className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${appointmentMode === 'new' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}
                          >
                             {t.quickNewPatient}
                          </button>
                      </div>
                  )}

                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const apptData: Partial<Appointment> = {
                          date: fd.get('date') as string,
                          time: fd.get('time') as string,
                          duration: parseInt(fd.get('duration') as string),
                          treatmentType: fd.get('treatmentType') as string,
                          sessionNumber: parseInt(fd.get('sessionNumber') as string) || 1,
                          notes: fd.get('notes') as string
                      };

                      if (appointmentMode === 'new') {
                          apptData.patientName = fd.get('guestName') as string;
                          handleAddAppointment(null, apptData);
                      } else {
                          let pId = selectedPatientId || selectedPatientIdForm;
                          if (!pId) {
                              alert(isRTL ? "يرجى اختيار مريض" : "Please select a patient");
                              return;
                          }
                          handleAddAppointment(pId, apptData);
                      }
                  }} className="space-y-3">
                      
                      {appointmentMode === 'existing' ? (
                          !selectedPatientId && (
                              <div className="relative" ref={searchRef}>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.patients}</label>
                                  <div className="relative">
                                      <input 
                                         type="text" 
                                         value={patientSearch}
                                         onChange={(e) => {
                                             setPatientSearch(e.target.value);
                                             setSelectedPatientIdForm('');
                                             setShowPatientList(true);
                                         }}
                                         onFocus={() => setShowPatientList(true)}
                                         className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none pr-10" 
                                         placeholder={t.searchPatients}
                                         required={!selectedPatientIdForm}
                                         autoComplete="off"
                                      />
                                      {showPatientList && patientSearch && (
                                         <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border dark:border-gray-700 z-[110] max-h-40 overflow-y-auto rounded-xl shadow-lg mt-1">
                                             {filteredPatients.length > 0 ? (
                                                filteredPatients.map((p: Patient) => (
                                                    <div 
                                                        key={p.id} 
                                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm dark:text-white border-b last:border-0 border-gray-50 dark:border-gray-700"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent blur
                                                            setPatientSearch(p.name);
                                                            setSelectedPatientIdForm(p.id);
                                                            setShowPatientList(false);
                                                        }}
                                                    >
                                                        <div className="font-bold">{p.name}</div>
                                                        <div className="text-gray-400 text-xs">{p.phone}</div>
                                                    </div>
                                                ))
                                             ) : (
                                                 <div className="p-3 text-sm text-gray-400 italic text-center">{t.noPatientsFilter}</div>
                                             )}
                                         </div>
                                      )}
                                  </div>
                              </div>
                          )
                      ) : (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.guestNamePlaceholder}</label>
                              <input name="guestName" defaultValue={selectedAppointment?.patientName} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" required placeholder={t.guestNamePlaceholder} />
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.date}</label>
                              <input name="date" type="date" defaultValue={selectedAppointment?.date || format(currentDate, 'yyyy-MM-dd')} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.time}</label>
                              <input name="time" type="time" defaultValue={selectedAppointment?.time || '09:00'} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.treatmentType}</label>
                              <select name="treatmentType" defaultValue={selectedAppointment?.treatmentType || 'diagnosis'} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none">
                                  {TREATMENT_TYPES.map(type => (
                                      <option key={type.id} value={type.id}>{currentLang === 'ku' ? type.ku : (currentLang === 'ar' ? type.ar : type.en)}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.duration}</label>
                              <select name="duration" defaultValue={selectedAppointment?.duration || 30} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none">
                                  {DURATIONS.map(d => <option key={d} value={d}>{d} {t.min}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="flex gap-3">
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">{t.sessionNumber}</label>
                              <input name="sessionNumber" type="number" min="1" defaultValue={selectedAppointment?.sessionNumber || 1} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t.notes}</label>
                          <textarea name="notes" defaultValue={selectedAppointment?.notes} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder={t.optionalNotesPlaceholder} rows={2} />
                      </div>

                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                          <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                      </div>
                  </form>
              </div>
          </div>,
        document.body
    );
};

export const AddMasterDrugModal = ({ show, onClose, t, data, handleManageMedications, handleDeleteMasterDrug, currentLang, openConfirm }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDrug, setEditingDrug] = useState<Medication | null>(null);

    // Reset when closed
    useEffect(() => {
        if (!show) {
            setView('list');
            setSearchQuery('');
            setEditingDrug(null);
        }
    }, [show]);

    if (!show) return null;

    const filteredMeds = (data.medications || []).filter((m: Medication) => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{zIndex: 9999}}>
            <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 h-[80vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Pill className="text-primary-600" />
                        {view === 'list' ? t.addMasterDrug : (editingDrug ? t.editItem : t.addMedication)}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>

                {view === 'list' ? (
                    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                        {/* Search & Add Button */}
                        <div className="flex gap-2 mb-4 shrink-0">
                            <div className="relative flex-1">
                                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
                                <input 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t.searchMedications}
                                    className={`w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                />
                            </div>
                            <button 
                                onClick={() => { setEditingDrug(null); setView('form'); }}
                                className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl shadow-md transition"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                            {filteredMeds.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <Pill size={40} className="mx-auto mb-2 opacity-30" />
                                    <p>{t.noMedicationsFound}</p>
                                </div>
                            ) : (
                                filteredMeds.map((med: Medication) => (
                                    <div key={med.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex justify-between items-start group hover:border-primary-200 dark:hover:border-primary-500 transition">
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-white text-lg">{med.name}</div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {med.dose && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium">{med.dose}</span>}
                                                {med.form && <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">{med.form}</span>}
                                                {med.frequency && <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"> • {med.frequency}</span>}
                                            </div>
                                            {med.notes && <div className="text-xs text-gray-400 mt-1 italic">"{med.notes}"</div>}
                                        </div>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingDrug(med); setView('form'); }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => openConfirm(t.manageMedications, t.deleteMedicationConfirm, () => handleDeleteMasterDrug(med.id))}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        <button 
                            onClick={() => setView('list')}
                            className="mb-4 text-sm font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1 w-fit shrink-0"
                        >
                            <ArrowLeft size={16} className="rtl:rotate-180" /> {t.back}
                        </button>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            handleManageMedications({
                                id: editingDrug ? editingDrug.id : '', // ID handled in parent for add
                                name: fd.get('name') as string,
                                dose: fd.get('dose') as string,
                                frequency: fd.get('frequency') as string,
                                form: fd.get('form') as string,
                                notes: fd.get('notes') as string
                            }, editingDrug ? 'update' : 'add');
                            setView('list');
                        }} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.drugName} *</label>
                                    <input name="name" defaultValue={editingDrug?.name} placeholder={t.drugName} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 transition" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.dose}</label>
                                        <input name="dose" defaultValue={editingDrug?.dose} placeholder="500mg" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.form}</label>
                                        <input name="form" defaultValue={editingDrug?.form} placeholder="Tab, Cap..." className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.frequency}</label>
                                    <input name="frequency" defaultValue={editingDrug?.frequency} placeholder="3 times daily" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.medNotes}</label>
                                    <input name="notes" defaultValue={editingDrug?.notes} placeholder={t.medNotes} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" />
                                </div>
                            </div>
                            
                            <div className="pt-4 mt-2 shrink-0">
                                <button type="submit" className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition flex items-center justify-center gap-2">
                                    <Save size={18} />
                                    {t.save}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export const ExpenseModal = ({ show, onClose, t, selectedExpense, handleSaveExpense, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    if (!show) return null;
    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <h3 className="text-lg font-bold mb-4 dark:text-white">{selectedExpense ? t.editExpense : t.addExpense}</h3>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleSaveExpense(
                          fd.get('name') as string,
                          parseInt(fd.get('quantity') as string),
                          parseFloat(fd.get('price') as string),
                          fd.get('date') as string
                      );
                  }} className="space-y-4">
                      <input name="name" defaultValue={selectedExpense?.name} placeholder={t.itemName} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                          <input name="quantity" type="number" defaultValue={selectedExpense?.quantity || 1} placeholder={t.quantity} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          <input name="price" type="number" defaultValue={selectedExpense?.price} placeholder={t.price} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      </div>
                      <input name="date" type="date" defaultValue={selectedExpense?.date ? format(new Date(selectedExpense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />

                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                          <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                      </div>
                  </form>
              </div>
          </div>,
        document.body
    );
};

export const LabOrderModal = ({ show, onClose, t, data, selectedLabOrder, handleSaveLabOrder, currentLang }: any) => {
    const [selectedLab, setSelectedLab] = useState<string>('');
    const [isAddingLab, setIsAddingLab] = useState(false);
    
    // Searchable Patient State
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showPatientList, setShowPatientList] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (selectedLabOrder) {
            setSelectedLab(selectedLabOrder.labName);
            const p = data.patients.find((pt: Patient) => pt.id === selectedLabOrder.patientId);
            setSelectedPatient(p || null);
            setPatientSearch(p ? p.name : selectedLabOrder.patientName);
        } else {
            setSelectedLab(data.labs[0] || '');
            setSelectedPatient(null);
            setPatientSearch('');
        }
        setIsAddingLab(false);
    }, [selectedLabOrder, data.labs, data.patients, show]);

    // Close patient dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowPatientList(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredPatients = data.patients.filter((p: Patient) => 
        p.name.toLowerCase().includes(patientSearch.toLowerCase())
    );

    if (!show) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FlaskConical className="text-primary-600" />
                        {selectedLabOrder ? t.editLabOrder || t.labOrders : t.newLabOrder}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    
                    let patientId = selectedPatient?.id;
                    let patientName = selectedPatient?.name;
                    
                    if (!patientId && selectedLabOrder) {
                         patientId = selectedLabOrder.patientId;
                         patientName = selectedLabOrder.patientName;
                    }
                    
                    if(!patientId) {
                        alert("Please select a patient");
                        return;
                    }

                    const labName = isAddingLab ? (fd.get('newLabName') as string) : selectedLab;
                    
                    handleSaveLabOrder({
                        patientId,
                        patientName,
                        labName: labName || 'Unknown Lab',
                        workType: fd.get('workType') as string,
                        toothCount: fd.get('toothCount') ? parseInt(fd.get('toothCount') as string) : undefined,
                        toothNumbers: fd.get('toothNumbers') as string,
                        shade: fd.get('shade') as string,
                        price: fd.get('price') ? parseFloat(fd.get('price') as string) : undefined,
                        sentDate: fd.get('sentDate') as string,
                        status: fd.get('status') as string,
                        notes: fd.get('notes') as string
                    });
                }} className="space-y-4">
                    
                    {/* Searchable Patient Selection */}
                    <div ref={searchRef} className="relative">
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.patients} *</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={patientSearch}
                                onChange={(e) => {
                                    setPatientSearch(e.target.value);
                                    setShowPatientList(true);
                                    if(selectedPatient && e.target.value !== selectedPatient.name) {
                                        setSelectedPatient(null);
                                    }
                                }}
                                onFocus={() => setShowPatientList(true)}
                                className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none pr-10"
                                placeholder={t.searchPatients}
                                required
                            />
                            <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'left-3' : 'right-3'}`}>
                                {showPatientList ? <ChevronDown className="rotate-180 transition" size={16}/> : <ChevronDown className="transition" size={16}/>}
                            </div>
                        </div>
                        
                        {showPatientList && (
                            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl mt-1 shadow-xl max-h-48 overflow-y-auto z-50">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((p: Patient) => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => {
                                                setSelectedPatient(p);
                                                setPatientSearch(p.name);
                                                setShowPatientList(false);
                                            }}
                                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-0 border-gray-50 dark:border-gray-700/50"
                                        >
                                            <div className="font-bold text-sm text-gray-800 dark:text-white">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.phone}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-sm text-gray-400 italic text-center">{t.noPatientsFilter}</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lab Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.labName} *</label>
                        {!isAddingLab ? (
                            <div className="flex gap-2">
                                <select 
                                    name="labName" 
                                    value={selectedLab} 
                                    onChange={(e) => setSelectedLab(e.target.value)}
                                    className="flex-1 p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none"
                                >
                                    {data.labs.map((lab: string) => (
                                        <option key={lab} value={lab}>{lab}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddingLab(true)} 
                                    className="px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl"
                                    title={t.addLab}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input 
                                    name="newLabName" 
                                    placeholder={t.enterLabName} 
                                    className="flex-1 p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" 
                                    autoFocus
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddingLab(false)} 
                                    className="px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Work Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.workType} *</label>
                        <input name="workType" defaultValue={selectedLabOrder?.workType} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder="e.g. Zircon, Denture" />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.toothCount}</label>
                            <input name="toothCount" type="number" defaultValue={selectedLabOrder?.toothCount} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.shade}</label>
                            <input name="shade" defaultValue={selectedLabOrder?.shade} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder="A1, B2..." />
                        </div>
                    </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.toothNumbers}</label>
                        <input name="toothNumbers" defaultValue={selectedLabOrder?.toothNumbers} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder="e.g. 11, 21, 22" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.price}</label>
                            <input name="price" type="number" step="0.01" defaultValue={selectedLabOrder?.price} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.sentDate}</label>
                            <input name="sentDate" type="date" defaultValue={selectedLabOrder?.sentDate ? format(new Date(selectedLabOrder.sentDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.status}</label>
                        <select name="status" defaultValue={selectedLabOrder?.status || 'in_progress'} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none">
                            <option value="in_progress">{t.inProgress}</option>
                            <option value="ready">{t.ready}</option>
                            <option value="received">{t.received}</option>
                            <option value="cancelled">{t.cancelled}</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.notes}</label>
                        <textarea name="notes" defaultValue={selectedLabOrder?.notes} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none min-h-[80px]" placeholder={t.optionalNotesPlaceholder} />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
