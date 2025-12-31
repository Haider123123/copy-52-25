
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Plus, Search, Trash2, Edit2, Pill, ArrowLeft, Save, DollarSign, FileText, ListTodo, AlignLeft, AlignRight, Italic, Heading, Type } from 'lucide-react';
import { format } from 'date-fns';
import { MEMO_COLORS } from '../../constants';
import { TodoItem, Medication, MemoStyle } from '../../types';

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
              {todos.map(todo => ( <div key={todo.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg group"> <button type="button" onClick={() => handleToggle(todo.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${todo.done ? 'bg-green-500 border-transparent text-white' : 'border-gray-300 dark:border-gray-500'}`}> {todo.done && <Check size={12} />} </button> <span className={`flex-1 text-sm ${todo.done ? 'line-through opacity-50' : 'dark:text-white'}`}>{todo.text}</span> <button type="button" onClick={() => handleDelete(todo.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={16} /></button> </div> ))}
              {todos.length === 0 && <p className="text-center text-xs text-gray-400 italic py-2">{t.items}...</p>}
          </div>
      </div>
    );
};

export const PaymentModal = ({ show, onClose, t, activePatient, paymentType, data, handleSavePayment, selectedPayment, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    if (!show || !activePatient) return null;

    const isShortcutActive = data.settings.thousandsShortcut;

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
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              let amount = parseFloat(fd.get('amount') as string);
              
              // Apply thousand shortcut logic
              if (isShortcutActive && !isNaN(amount)) {
                  amount = amount * 1000;
              }

              handleSavePayment({ 
                  amount: amount, 
                  description: fd.get('description') as string, 
                  date: fd.get('date') as string, 
                  type: paymentType 
              });
            }} className="space-y-4">
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
                        type="number" 
                        step="0.001" 
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
              <div className="flex gap-2 pt-4"> 
                  <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">{t.cancel}</button> 
                  <button type="submit" className={`flex-1 py-4 text-white font-black rounded-xl shadow-xl shadow-primary-500/20 transform hover:-translate-y-0.5 active:scale-95 transition ${paymentType === 'payment' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}> 
                      {t.save} 
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

export const AddMasterDrugModal = ({ show, onClose, t, data, handleManageMedications, handleDeleteMasterDrug, currentLang, openConfirm }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDrug, setEditingDrug] = useState<Medication | null>(null);
    useEffect(() => { if (!show) { setView('list'); setSearchQuery(''); setEditingDrug(null); } }, [show]);
    if (!show) return null;
    const filteredMeds = (data.medications || []).filter((m: Medication) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) );

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{zIndex: 9999}}>
            <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 h-[80vh] flex flex-col ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-6 shrink-0"> <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"> <Pill className="text-primary-600" /> {view === 'list' ? t.addMasterDrug : (editingDrug ? t.editItem : t.addMedication)} </h3> <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button> </div>
                {view === 'list' ? (
                    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                        <div className="flex gap-2 mb-4 shrink-0">
                            <div className="relative flex-1"> <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={18} /> <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchMedications} autoComplete="off" className={`w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} /> </div>
                            <button onClick={() => { setEditingDrug(null); setView('form'); }} className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl shadow-md transition"> <Plus size={20} /> </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                            {filteredMeds.length === 0 ? ( <div className="text-center py-10 text-gray-400"> <Pill size={40} className="mx-auto mb-2 opacity-30" /> <p>{t.noMedicationsFound}</p> </div> ) : ( filteredMeds.map((med: Medication) => ( <div key={med.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex justify-between items-start group hover:border-primary-200 dark:hover:border-primary-500 transition"> <div> <div className="font-bold text-gray-800 dark:text-white text-lg">{med.name}</div> <div className="flex flex-wrap gap-2 mt-1"> {med.dose && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium" dir="ltr">{med.dose}</span>} {med.form && <span className="text-xs bg-purple-100 dark:bg-blue-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">{med.form}</span>} {med.frequency && <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1" dir="ltr"> • {med.frequency}</span>} </div> {med.notes && <div className="text-xs text-gray-400 mt-1 italic">"{med.notes}"</div>} </div> <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"> <button onClick={() => { setEditingDrug(med); setView('form'); }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"> <Edit2 size={18} /> </button> <button onClick={() => openConfirm(t.manageMedications, t.deleteMedicationConfirm, () => handleDeleteMasterDrug(med.id))} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"> <Trash2 size={18} /> </button> </div> </div> )) )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        <button onClick={() => setView('list')} className="mb-4 text-sm font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1 w-fit shrink-0"> <ArrowLeft size={16} className="rtl:rotate-180" /> {t.back} </button>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            handleManageMedications({ id: editingDrug ? editingDrug.id : '', name: fd.get('name') as string, dose: fd.get('dose') as string, frequency: fd.get('frequency') as string, form: fd.get('form') as string, notes: fd.get('notes') as string }, editingDrug ? 'update' : 'add');
                            setView('list');
                        }} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-4">
                                <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.drugName} *</label> <input name="name" defaultValue={editingDrug?.name} placeholder={t.drugName} required autoComplete="off" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 transition" /> </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.dose}</label> <input name="dose" defaultValue={editingDrug?.dose} dir="ltr" placeholder="500mg" autoComplete="off" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none text-end" /> </div>
                                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.form}</label> <input name="form" defaultValue={editingDrug?.form} placeholder="Tab, Cap..." autoComplete="off" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" /> </div>
                                </div>
                                <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.frequency}</label> <input name="frequency" defaultValue={editingDrug?.frequency} dir="ltr" placeholder="1 x 3" autoComplete="off" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none text-end" /> </div>
                                <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.medNotes}</label> <input name="notes" defaultValue={editingDrug?.notes} placeholder={t.medNotes} autoComplete="off" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none" /> </div>
                            </div>
                            <div className="pt-4 mt-2 shrink-0"> <button type="submit" className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"> <Save size={18} /> {t.save} </button> </div>
                        </form>
                    </div>
                )}
            </div>
        </div>, document.body
    );
};
