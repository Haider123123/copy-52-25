
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Plus, Search, Trash2, Edit2, Pill, ArrowLeft, Save, DollarSign, FileText, ListTodo, AlignLeft, AlignRight, Italic, Heading, Type, Folder, LayoutGrid, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MEMO_COLORS } from '../../constants';
import { TodoItem, Medication, MemoStyle, MedicationCategory } from '../../types';

const TodoListBuilder = ({ initialTodos, onChange, t }: { initialTodos: TodoItem[], onChange: (todos: TodoItem[]) => void, t: any }) => {
    const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
    const [newTodo, setNewTodo] = useState('');
    useEffect(() => { onChange(todos); }, [todos, onChange]);
    const handleAdd = () => { if (!newTodo.trim()) return; const item: TodoItem = { id: Date.now().toString(), text: newTodo, done: false }; setTodos([...todos, item]); setNewTodo(''); };
    const handleToggle = (id: string) => { setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t)); };
    const handleDelete = (id: string) => { setTodos(todos.filter(t => t.id !== id)); };

    return (
      <div className="space-y-3">
          <div className="flex gap-2"> <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} placeholder={t.addTodo} autoComplete="off" className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" /> <button type="button" onClick={handleAdd} className="bg-primary-600 text-white p-2 rounded-xl"><Plus size={20} /></button> </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
              {todos.map(todo => ( <div key={todo.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg group"> <button type="button" onClick={() => handleToggle(todo.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${todo.done ? 'bg-green-500 border-transparent text-white' : 'border-gray-300 dark:border-gray-500'}`}> {todo.done && <Check size={12} />} </button> <span className={`flex-1 text-sm ${todo.done ? 'line-through opacity-50' : ''} dark:text-white`}>{todo.text}</span> <button type="button" onClick={() => handleDelete(todo.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={16} /></button> </div> ))}
              {todos.length === 0 && <p className="text-center text-xs text-gray-400 italic py-2">{t.items}...</p>}
          </div>
      </div>
    );
};

export const PaymentModal = ({ show, onClose, t, activePatient, paymentType, data, handleSavePayment, selectedPayment, currentLang, isSaving, error }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    if (!show || !activePatient) return null;

    const isShortcutActive = data.settings.thousandsShortcut;

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white"> 
                    {selectedPayment ? t.editItem : (paymentType === 'payment' ? t.addPayment : t.addCharge)} 
                </h3>
                {isShortcutActive && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse shadow-sm">
                        {t.thousandsShortcut} Active
                    </span>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              let amount = parseFloat(fd.get('amount') as string);
              
              if (isShortcutActive && !isNaN(amount)) {
                  amount = amount * 1000;
              }

              handleSavePayment({ 
                  id: selectedPayment?.id,
                  amount: amount || 0, 
                  description: fd.get('description') as string, 
                  date: fd.get('date') as string, 
                  type: paymentType 
              }, !!selectedPayment);
            }} className="space-y-4">
              <fieldset disabled={isSaving} className="space-y-4">
                <div> 
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.description}</label> 
                    <input name="description" defaultValue={selectedPayment?.description} autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder={paymentType === 'payment' ? t.egConsultation : t.treatmentCost} /> 
                </div>
                <div> 
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.price}</label> 
                    <div className="relative"> 
                        <span className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-500 font-bold">{data.settings.currency}</span> 
                        <input 
                          name="amount" 
                          type="text" 
                          inputMode="numeric"
                          onInput={handleNumericInput}
                          defaultValue={selectedPayment ? (isShortcutActive ? selectedPayment.amount / 1000 : selectedPayment.amount) : ''} 
                          className="w-full ps-16 pe-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-bold text-xl outline-none focus:ring-2 focus:ring-primary-500 shadow-inner" 
                          required 
                          autoFocus
                        /> 
                        {isShortcutActive && (
                            <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-gray-300 font-black text-xs pointer-events-none`}>
                                ,000
                            </span>
                        )}
                    </div> 
                </div>
                <div> 
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.date}</label> 
                    <input name="date" type="date" defaultValue={selectedPayment ? format(new Date(selectedPayment.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" /> </div>
              </fieldset>

              <div className="flex gap-2 pt-4"> 
                  <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition disabled:opacity-30">{t.cancel}</button> 
                  <button type="submit" disabled={isSaving} className={`flex-1 py-4 text-white font-black rounded-xl shadow-xl shadow-primary-500/20 transform hover:-translate-y-0.5 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-70 ${paymentType === 'payment' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}> 
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t.save} 
                  </button> 
              </div>
            </form>
          </div>
        </div>, document.body
    );
};

export const MemoModal = ({ show, onClose, t, selectedMemo, memoType, setMemoType, tempTodos, setTempTodos, handleSaveMemo, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    const [style, setStyle] = useState<MemoStyle>({ direction: 'rtl', fontSize: 14, textColor: '#374151', isItalic: false, titleFontSize: 20, titleColor: '#111827' });
    useEffect(() => {
        if (selectedMemo && selectedMemo.style) { setStyle(selectedMemo.style); }
        else { setStyle({ direction: isRTL ? 'rtl' : 'ltr', fontSize: 14, textColor: '#374151', isItalic: false, titleFontSize: 20, titleColor: '#111827' }); }
    }, [selectedMemo, isRTL, show]);
    if (!show) return null;
    const toggleItalic = () => setStyle(prev => ({ ...prev, isItalic: !prev.isItalic }));
    const setDirection = (dir: 'ltr' | 'rtl') => setStyle(prev => ({ ...prev, direction: dir }));

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 transition-all duration-300 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6"> {selectedMemo ? t.editMemo : t.newMemo} </h3>
              {!memoType ? (
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setMemoType('text')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition gap-3 group"> <FileText size={40} className="text-blue-500 group-hover:scale-110 transition-transform" /> <span className="font-bold text-blue-700 dark:text-blue-300">{t.textNote}</span> </button>
                      <button onClick={() => setMemoType('todo')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition gap-3 group"> <ListTodo size={40} className="text-purple-500 group-hover:scale-110 transition-transform" /> <span className="font-bold text-purple-700 dark:text-purple-300">{t.todoList}</span> </button>
                  </div>
              ) : (
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleSaveMemo( fd.get('title') as string, fd.get('content') as string || '', fd.get('color') as string, memoType, tempTodos, style );
                  }} className="space-y-4">
                       {memoType === 'text' && (
                           <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-600 mb-2">
                               <div className="flex bg-white dark:bg-gray-600 rounded-lg p-1 border border-gray-200 dark:border-gray-500">
                                   <button type="button" onClick={() => setDirection('ltr')} className={`p-1.5 rounded-md ${style.direction === 'ltr' ? 'bg-gray-100 dark:bg-gray-500 shadow-sm' : ''}`} title="LTR"><AlignLeft size={16}/></button>
                                   <button type="button" onClick={() => setDirection('rtl')} className={`p-1.5 rounded-md ${style.direction === 'rtl' ? 'bg-gray-100 dark:bg-gray-500 shadow-sm' : ''}`} title="RTL"><AlignRight size={16}/></button>
                               </div>
                               <button type="button" onClick={toggleItalic} className={`p-2 rounded-lg border ${style.isItalic ? 'bg-gray-200 dark:bg-gray-500 border-gray-300' : 'bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500'}`} title={t.italic}><Italic size={16}/></button>
                               <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                               <div className="flex items-center gap-1 bg-white dark:bg-gray-600 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-500">
                                   <Heading size={14} className="text-gray-500"/>
                                   <input type="number" value={style.titleFontSize} onChange={(e) => setStyle({...style, titleFontSize: parseInt(e.target.value)})} className="w-10 text-center text-xs bg-transparent outline-none" min={12} max={36} title={t.titleFormat} />
                                   <input type="color" value={style.titleColor} onChange={(e) => setStyle({...style, titleColor: e.target.value})} className="w-5 h-5 rounded cursor-pointer border-none bg-transparent" title={t.textColor} />
                               </div>
                               <div className="flex items-center gap-1 bg-white dark:bg-gray-600 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-500">
                                   <Type size={14} className="text-gray-500"/>
                                   <input type="number" value={style.fontSize} onChange={(e) => setStyle({...style, fontSize: parseInt(e.target.value)})} className="w-10 text-center text-xs bg-transparent outline-none" min={10} max={24} title={t.textFormat} />
                                   <input type="color" value={style.textColor} onChange={(e) => setStyle({...style, textColor: e.target.value})} className="w-5 h-5 rounded cursor-pointer border-none bg-transparent" title={t.textColor} />
                               </div>
                           </div>
                       )}
                       <div> <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.memoTitle}</label> <input name="title" defaultValue={selectedMemo?.title} required autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 outline-none" style={{ fontSize: `${style.titleFontSize}px`, color: style.titleColor, direction: style.direction }} /> </div>
                       {memoType === 'text' ? ( <div> <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.notes}</label> <textarea name="content" defaultValue={selectedMemo?.content} autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 outline-none min-h-[150px]" placeholder={t.memoContent} style={{ direction: style.direction, fontSize: `${style.fontSize}px`, color: style.textColor, fontStyle: style.isItalic ? 'italic' : 'normal', }} /> </div> ) : ( <div> <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.todoList}</label> <TodoListBuilder initialTodos={tempTodos} onChange={setTempTodos} t={t} /> </div> )}
                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.pickColor}</label>
                          <div className="flex gap-2 justify-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                              {MEMO_COLORS.map(c => ( <label key={c.id} className="cursor-pointer"> <input type="radio" name="color" value={c.id} defaultChecked={selectedMemo?.color === c.id || (!selectedMemo && c.id === 'yellow')} className="hidden peer" /> <div className={`w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-500 peer-checked:scale-110 transition`} style={{ backgroundColor: c.bg }}></div> </label> ))}
                          </div>
                       </div>
                       <div className="flex gap-2 pt-2"> <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button> <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button> </div>
                  </form>
              )}
           </div>
        </div>, document.body
    );
};

export const AddMasterDrugModal = ({ show, onClose, t, data, setData, handleManageMedications, handleDeleteMasterDrug, currentLang, openConfirm }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    const [activeTab, setActiveTab] = useState<'meds' | 'groups'>('meds');
    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDrug, setEditingDrug] = useState<Medication | null>(null);
    const [editingGroup, setEditingGroup] = useState<MedicationCategory | null>(null);

    useEffect(() => { if (!show) { setView('list'); setSearchQuery(''); setEditingDrug(null); setEditingGroup(null); setActiveTab('meds'); } }, [show]);
    
    if (!show) return null;

    const filteredMeds = (data.medications || []).filter((m: Medication) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) );
    const categories = data.medicationCategories || [];

    const handleSaveGroup = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const name = fd.get('groupName') as string;
        if (!name.trim()) return;

        setData((prev: any) => {
            const timestamp = Date.now();
            const currentCats = prev.medicationCategories || [];
            if (editingGroup) {
                return { ...prev, lastUpdated: timestamp, medicationCategories: currentCats.map((c: any) => c.id === editingGroup.id ? { ...c, name, updatedAt: timestamp } : c) };
            } else {
                return { ...prev, lastUpdated: timestamp, medicationCategories: [{ id: 'cat_' + timestamp, name, updatedAt: timestamp }, ...currentCats] };
            }
        });
        setView('list'); setEditingGroup(null);
    };

    const handleDeleteGroup = (id: string) => {
        openConfirm(t.deleteDrugGroup, isRTL ? "هل تريد حذف هذه المجموعة؟ لن يتم حذف الأدوية بداخلها بل سيتم نقلها لغير مصنف." : "Delete this group? Medications inside will be moved to uncategorized.", () => {
            setData((prev: any) => ({
                ...prev,
                lastUpdated: Date.now(),
                medications: (prev.medications || []).map((m: any) => m.categoryId === id ? { ...m, categoryId: undefined } : m),
                medicationCategories: (prev.medicationCategories || []).filter((c: any) => c.id !== id)
            }));
        });
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{zIndex: 9999}}>
            <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 h-[85vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6 shrink-0"> 
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> 
                        <Pill className="text-primary-600" /> {t.addMasterDrug} 
                    </h3> 
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><X size={20} className="text-gray-500" /></button> 
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl mb-6 shrink-0 shadow-inner">
                    <button onClick={() => { setActiveTab('meds'); setView('list'); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'meds' ? 'bg-white dark:bg-gray-600 shadow-md text-primary-600' : 'text-gray-500'}`}>
                        <Pill size={18}/> {t.meds}
                    </button>
                    <button onClick={() => { setActiveTab('groups'); setView('list'); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'groups' ? 'bg-white dark:bg-gray-600 shadow-md text-primary-600' : 'text-gray-500'}`}>
                        <Folder size={18}/> {t.drugGroups}
                    </button>
                </div>

                {activeTab === 'meds' ? (
                    view === 'list' ? (
                        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                            <div className="flex gap-2 mb-4 shrink-0">
                                <div className="relative flex-1"> <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={18} /> <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchMedications} autoComplete="off" className={`w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} /> </div>
                                <button onClick={() => { setEditingDrug(null); setView('form'); }} className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl shadow-md transition"> <Plus size={20} /> </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                                {filteredMeds.length === 0 ? ( <div className="text-center py-10 text-gray-400"> <Pill size={40} className="mx-auto mb-2 opacity-30" /> <p>{t.noMedicationsFound}</p> </div> ) : ( filteredMeds.map((med: Medication) => {
                                    const cat = categories.find(c => c.id === med.categoryId);
                                    return ( <div key={med.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex justify-between items-start group hover:border-primary-200 dark:hover:border-primary-500 transition"> <div> <div className="font-bold text-gray-800 dark:text-white text-lg">{med.name}</div> <div className="flex flex-wrap gap-2 mt-1"> {cat && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-inner flex items-center gap-1"><Folder size={10}/> {cat.name}</span>} {med.dose && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium" dir="ltr">{med.dose}</span>} {med.form && <span className="text-xs bg-purple-100 dark:bg-blue-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">{med.form}</span>} </div> {med.notes && <div className="text-xs text-gray-400 mt-1 italic">"{med.notes}"</div>} </div> <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"> <button onClick={() => { setEditingDrug(med); setView('form'); }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"> <Edit2 size={18} /> </button> <button onClick={() => openConfirm(t.manageMedications, t.deleteMedicationConfirm, () => handleDeleteMasterDrug(med.id))} className="p-2 text-red-500 hover:bg-red-900/20 rounded-lg"> <Trash2 size={18} /> </button> </div> </div> );
                                }) )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            <button onClick={() => setView('list')} className="mb-4 text-sm font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1 w-fit shrink-0"> <ArrowLeft size={16} className="rtl:rotate-180" /> {t.back} </button>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget as HTMLFormElement);
                                handleManageMedications({ id: editingDrug ? editingDrug.id : '', name: fd.get('name') as string, dose: fd.get('dose') as string, frequency: fd.get('frequency') as string, form: fd.get('form') as string, notes: fd.get('notes') as string, categoryId: fd.get('categoryId') as string }, editingDrug ? 'update' : 'add');
                                setView('list');
                            }} className="flex flex-col flex-1 min-h-0">
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.drugName} *</label> <input name="name" defaultValue={editingDrug?.name} placeholder={t.drugName} required autoComplete="off" className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 transition font-bold" /> </div>
                                    <div> 
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.drugGroups}</label> 
                                        <select name="categoryId" defaultValue={editingDrug?.categoryId || ''} className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:border-primary-500 transition font-bold appearance-none">
                                            <option value="">{isRTL ? "غير مصنف" : "Uncategorized"}</option>
                                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.dose}</label> <input name="dose" defaultValue={editingDrug?.dose} dir="ltr" placeholder="500mg" autoComplete="off" className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-end font-bold" /> </div>
                                        <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.form}</label> <input name="form" defaultValue={editingDrug?.form} placeholder="Tab, Cap..." autoComplete="off" className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none font-bold" /> </div>
                                    </div>
                                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.frequency}</label> <input name="frequency" defaultValue={editingDrug?.frequency} dir="ltr" placeholder="1 x 3" autoComplete="off" className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-end font-bold" /> </div>
                                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.medNotes}</label> <input name="notes" defaultValue={editingDrug?.notes} placeholder={t.medNotes} autoComplete="off" className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none font-medium" /> </div>
                                </div>
                                <div className="pt-4 mt-2 shrink-0"> <button type="submit" className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition flex items-center justify-center gap-2 transform active:scale-95"> <Save size={20} /> {t.save} </button> </div>
                            </form>
                        </div>
                    )
                ) : (
                    // Drug Groups Management
                    view === 'list' ? (
                        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                            <button onClick={() => { setEditingGroup(null); setView('form'); }} className="w-full mb-6 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition flex items-center justify-center gap-2 transform active:scale-95">
                                <Plus size={20} /> {t.addDrugGroup}
                            </button>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                                {categories.length === 0 ? (
                                    <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-[2rem]">
                                        <Folder size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>{isRTL ? "لا توجد مجموعات دوائية بعد." : "No drug groups yet."}</p>
                                    </div>
                                ) : (
                                    categories.map((cat: MedicationCategory) => (
                                        <div key={cat.id} className="flex items-center justify-between p-5 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-3xl hover:shadow-md transition group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform"><Folder size={24}/></div>
                                                <span className="font-black text-gray-800 dark:text-white text-lg">{cat.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingGroup(cat); setView('form'); }} className="p-3 text-blue-500 bg-gray-50 dark:bg-gray-800 rounded-xl hover:scale-110 transition-transform"><Edit2 size={18}/></button>
                                                <button onClick={() => handleDeleteGroup(cat.id)} className="p-3 text-red-500 bg-gray-50 dark:bg-gray-800 rounded-xl hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <button onClick={() => setView('list')} className="mb-4 text-sm font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1 w-fit"> <ArrowLeft size={16} className="rtl:rotate-180" /> {t.back} </button>
                            <form onSubmit={handleSaveGroup} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest ms-1">{t.drugGroups}</label>
                                    <input name="groupName" defaultValue={editingGroup?.name} autoFocus required className="w-full p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white outline-none focus:border-primary-500 font-black text-xl shadow-inner" placeholder={isRTL ? "مثلاً: مضادات حيوية" : "e.g. Antibiotics"} />
                                </div>
                                <button type="submit" className="w-full py-5 bg-primary-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition transform active:scale-95 flex items-center justify-center gap-3">
                                    <Check size={26} /> {t.save}
                                </button>
                            </form>
                        </div>
                    )
                )}
            </div>
        </div>, document.body
    );
};
