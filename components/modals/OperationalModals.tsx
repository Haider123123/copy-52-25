
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Minus, Package, FlaskConical, ChevronDown, Tag, Search, CheckCircle2, User, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { MEMO_COLORS } from '../../constants';
import { InventoryItem, Patient, LabOrder } from '../../types';

export const InventoryModal = ({ show, onClose, t, selectedItem, handleSaveItem, currentLang }: any) => {
    const [quantity, setQuantity] = useState(selectedItem?.quantity || 0);
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    useEffect(() => { setQuantity(selectedItem?.quantity || 0); }, [selectedItem, show]);
    
    if (!show) return null;

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2"> <Package className="text-primary-600" /> {selectedItem ? t.editInventoryItem : t.addInventoryItem} </h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleSaveItem({ 
                        name: fd.get('name'), 
                        quantity: quantity, 
                        minQuantity: parseInt(fd.get('minQuantity') as string) || 0, 
                        price: fd.get('price') ? parseFloat(fd.get('price') as string) : undefined, 
                        expiryDate: fd.get('expiryDate'), 
                        color: fd.get('color') 
                    });
                    onClose();
                }} className="space-y-4">
                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.itemName}</label> <input name="name" defaultValue={selectedItem?.name} required autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" /> </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.currentQty}</label>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setQuantity(Math.max(0, quantity - 1))} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"> <Minus size={18} /> </button>
                            <input 
                                name="quantity" 
                                type="text" 
                                inputMode="numeric"
                                value={quantity} 
                                onInput={handleNumericInput}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} 
                                className="flex-1 text-center font-bold text-xl py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                            />
                            <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition"> <Plus size={18} /> </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div> 
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.minQty}</label> 
                            <input 
                                name="minQuantity" 
                                type="text" 
                                inputMode="numeric"
                                onInput={handleNumericInput}
                                defaultValue={selectedItem ? selectedItem.minQuantity : ''} 
                                required 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                            /> 
                         </div>
                        <div> 
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t.price}</label> 
                            <input 
                                name="price" 
                                type="text" 
                                inputMode="numeric"
                                onInput={handleNumericInput}
                                defaultValue={selectedItem?.price} 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                            /> 
                        </div>
                    </div>
                    <div> <label className="block text-xs font-bold text-gray-500 mb-1">{t.expiryDate}</label> <input name="expiryDate" type="date" defaultValue={selectedItem?.expiryDate} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" /> </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">{t.itemColor}</label>
                        <div className="flex gap-2 justify-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                            {MEMO_COLORS.map(c => ( <label key={c.id} className="cursor-pointer"> <input type="radio" name="color" value={c.id} defaultChecked={selectedItem?.color === c.id || (!selectedItem && c.id === 'blue')} className="hidden peer" /> <div className={`w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-500 peer-checked:scale-110 transition`} style={{ backgroundColor: c.bg }}></div> </label> ))}
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4"> <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button> <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button> </div>
                </form>
            </div>
        </div>, document.body
    );
};

export const SupplyModal = ({ show, onClose, t, selectedSupply, handleSaveSupply, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    if (!show) return null;

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{selectedSupply ? t.editItem : t.addItem}</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleSaveSupply(
                        fd.get('name') as string, 
                        parseInt(fd.get('quantity') as string) || 0, 
                        parseFloat(fd.get('price') as string) || 0
                    );
                    onClose();
                }} className="space-y-4">
                    <div> <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.itemName}</label> <input name="name" defaultValue={selectedSupply?.name} required autoComplete="off" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" /> </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div> 
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.quantity}</label> 
                            <input 
                                name="quantity" 
                                type="text" 
                                inputMode="numeric"
                                onInput={handleNumericInput}
                                defaultValue={selectedSupply?.quantity || 1} 
                                required 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                            /> 
                        </div>
                        <div> 
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.price}</label> 
                            <input 
                                name="price" 
                                type="text" 
                                inputMode="numeric"
                                onInput={handleNumericInput}
                                defaultValue={selectedSupply?.price} 
                                required 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" 
                            /> 
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2"> <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button> <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button> </div>
                </form>
            </div>
        </div>, document.body
    );
};

export const ExpenseModal = ({ show, onClose, t, selectedExpense, handleSaveExpense, currentLang }: any) => {
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';
    if (!show) return null;

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className={`bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <h3 className="text-lg font-bold mb-4 dark:text-white">{selectedExpense ? t.editExpense : t.addExpense}</h3>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleSaveExpense( 
                          fd.get('name') as string, 
                          parseInt(fd.get('quantity') as string) || 1, 
                          parseFloat(fd.get('price') as string) || 0, 
                          fd.get('date') as string 
                      );
                      onClose();
                  }} className="space-y-4">
                      <input name="name" defaultValue={selectedExpense?.name} placeholder={t.itemName} required autoComplete="off" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                          <input 
                            name="quantity" 
                            type="text" 
                            inputMode="numeric"
                            onInput={handleNumericInput}
                            defaultValue={selectedExpense?.quantity || 1} 
                            placeholder={t.quantity} 
                            required 
                            className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" 
                          />
                          <input 
                            name="price" 
                            type="text" 
                            inputMode="numeric"
                            onInput={handleNumericInput}
                            defaultValue={selectedExpense?.price} 
                            placeholder={t.price} 
                            required 
                            className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" 
                          />
                      </div>
                      <input name="date" type="date" defaultValue={selectedExpense?.date ? format(new Date(selectedExpense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} required className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      <div className="flex gap-2 pt-2"> <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button> <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700">{t.save}</button> </div>
                  </form>
              </div>
          </div>, document.body
    );
};

const ModernSelector = ({ options, selectedValue, onSelect, label, isRTL, icon: Icon }: any) => {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                {Icon && <Icon size={16} />} {label}
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/50 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-inner no-scrollbar">
                {options?.map((opt: string) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onSelect(opt)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center gap-2 ${
                            selectedValue === opt 
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg scale-105' 
                            : 'bg-white dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                        }`}
                    >
                        {selectedValue === opt && <CheckCircle2 size={14} />}
                        {opt}
                    </button>
                ))}
                {(!options || options.length === 0) && (
                    <p className="text-xs text-gray-400 italic p-2">{isRTL ? "يرجى إضافة خيارات من الإعدادات أولاً" : "Please add options from settings first."}</p>
                )}
            </div>
        </div>
    );
};

export const LabOrderModal = ({ show, onClose, t, data, selectedLabOrder, handleSaveLabOrder, currentLang }: any) => {
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showPatientList, setShowPatientList] = useState(false);
    
    const [labName, setLabName] = useState('');
    const [workType, setWorkType] = useState('');
    const [shade, setShade] = useState('');

    const searchRef = useRef<HTMLDivElement>(null);
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const fontClass = isRTL ? 'font-cairo' : 'font-sans';

    useEffect(() => {
        if (selectedLabOrder) { 
            setLabName(selectedLabOrder.labName); 
            setWorkType(selectedLabOrder.workType);
            setShade(selectedLabOrder.shade || '');
            const p = data.patients.find((pt: Patient) => pt.id === selectedLabOrder.patientId); 
            setSelectedPatient(p || null); 
            setPatientSearch(p ? p.name : selectedLabOrder.patientName); 
        } else { 
            setLabName(data.labs?.[0] || ''); 
            setWorkType(data.workTypes?.[0] || '');
            setShade(data.shades?.[0] || '');
            setSelectedPatient(null); 
            setPatientSearch(''); 
        }
    }, [selectedLabOrder, data.labs, data.workTypes, data.shades, data.patients, show]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(event.target as Node)) { setShowPatientList(false); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredPatients = data.patients.filter((p: Patient) => p.name.toLowerCase().includes(patientSearch.toLowerCase()) );
    
    if (!show) return null;

    const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center mb-8"> 
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3"> 
                        <FlaskConical className="text-primary-600" size={32} /> 
                        {selectedLabOrder ? t.editLabOrder : t.newLabOrder} 
                    </h3> 
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-500"><X size={28} /></button> 
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    let patientId = selectedPatient?.id;
                    let patientName = selectedPatient?.name;
                    if (!patientId && selectedLabOrder) { patientId = selectedLabOrder.patientId; patientName = selectedLabOrder.patientName; }
                    if(!patientId) { alert(isRTL ? "يرجى اختيار مريض" : "Please select a patient"); return; }
                    
                    if(!labName) { alert(isRTL ? "يرجى اختيار المختبر" : "Please select a lab"); return; }
                    if(!workType) { alert(isRTL ? "يرجى اختيار نوع العمل" : "Please select work type"); return; }

                    handleSaveLabOrder({ 
                        patientId, 
                        patientName, 
                        labName, 
                        workType, 
                        toothCount: fd.get('toothCount') ? parseInt(fd.get('toothCount') as string) : undefined, 
                        toothNumbers: fd.get('toothNumbers') as string, 
                        shade, 
                        price: fd.get('price') ? parseFloat(fd.get('price') as string) : undefined, 
                        sentDate: fd.get('sentDate') as string, 
                        status: fd.get('status') as any, 
                        notes: fd.get('notes') as string 
                    });
                    onClose();
                }} className="space-y-8">
                    
                    <div ref={searchRef} className="relative bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <label className="block text-sm font-black text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                           <User size={16}/> {t.selectPatient} *
                        </label>
                        <div className="relative">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={20} />
                            <input 
                                type="text" 
                                value={patientSearch} 
                                onChange={(e) => { setPatientSearch(e.target.value); setShowPatientList(true); if(selectedPatient && e.target.value !== selectedPatient.name) setSelectedPatient(null); }} 
                                onFocus={() => setShowPatientList(true)} 
                                autoComplete="off"
                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:text-white outline-none font-bold text-lg shadow-sm`} 
                                placeholder={t.searchPatients} 
                                required 
                            />
                            {showPatientList && ( 
                                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl mt-2 shadow-2xl max-h-48 overflow-y-auto z-50"> 
                                    {filteredPatients.length > 0 ? ( 
                                        filteredPatients.map((p: Patient) => ( 
                                            <div key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(p.name); setShowPatientList(false); }} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-0 border-gray-50 dark:border-gray-700/50 transition"> 
                                                <div className="font-black text-gray-800 dark:text-white">{p.name}</div> 
                                                <div className="text-xs text-gray-400 font-bold">{p.phone}</div> 
                                            </div> 
                                        )) 
                                    ) : ( 
                                        <div className="p-4 text-sm text-gray-400 italic text-center">{t.noPatientsFilter}</div> 
                                    )} 
                                </div> 
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ModernSelector 
                            label={t.labName} 
                            options={data.labs} 
                            selectedValue={labName} 
                            onSelect={setLabName} 
                            isRTL={isRTL} 
                            icon={FlaskConical} 
                        />
                        <ModernSelector 
                            label={t.labWorkTypes} 
                            options={data.workTypes} 
                            selectedValue={workType} 
                            onSelect={setWorkType} 
                            isRTL={isRTL} 
                            icon={Tag} 
                        />
                    </div>

                    <ModernSelector 
                        label={t.shade} 
                        options={data.shades} 
                        selectedValue={shade} 
                        onSelect={setShade} 
                        isRTL={isRTL} 
                        icon={Palette} 
                    />

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div> 
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ms-1">{t.toothCount}</label> 
                                <input 
                                    name="toothCount" 
                                    type="text" 
                                    inputMode="numeric"
                                    onInput={handleNumericInput}
                                    defaultValue={selectedLabOrder?.toothCount} 
                                    className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none font-bold text-lg shadow-sm" 
                                    placeholder="0" 
                                /> 
                            </div>
                            <div className="md:col-span-2"> 
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ms-1">{t.toothNumbers}</label> 
                                <input name="toothNumbers" defaultValue={selectedLabOrder?.toothNumbers} autoComplete="off" className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none font-bold text-lg shadow-sm" placeholder="e.g. 11, 21, 22" /> 
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> 
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ms-1">{t.price}</label> 
                                <div className="relative">
                                    <input 
                                        name="price" 
                                        type="text" 
                                        inputMode="numeric"
                                        onInput={handleNumericInput}
                                        defaultValue={selectedLabOrder?.price} 
                                        className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none font-black text-2xl shadow-sm" 
                                        placeholder="0" 
                                    /> 
                                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 font-bold`}>{data.settings.currency}</span>
                                </div>
                            </div>
                            <div> 
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ms-1">{t.sentDate}</label> 
                                <input name="sentDate" type="date" defaultValue={selectedLabOrder?.sentDate ? format(new Date(selectedLabOrder.sentDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none font-bold text-lg shadow-sm" /> </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> 
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ms-1">{t.status}</label> 
                                <select name="status" defaultValue={selectedLabOrder?.status || 'in_progress'} className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none font-black text-lg shadow-sm appearance-none cursor-pointer"> 
                                    <option value="in_progress">{t.inProgress}</option> 
                                    <option value="ready">{t.ready}</option> 
                                    <option value="received">{t.received}</option> 
                                    <option value="cancelled">{t.cancelled}</option> 
                                </select> 
                            </div>
                            <div className="md:col-start-1 md:col-end-3"> 
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ms-1">{t.notes}</label> 
                                <textarea name="notes" defaultValue={selectedLabOrder?.notes} autoComplete="off" className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none min-h-[100px] font-medium shadow-sm" placeholder={t.optionalNotesPlaceholder} /> 
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4"> 
                        <button type="button" onClick={onClose} className="flex-1 py-5 text-gray-500 dark:text-gray-400 font-black text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition active:scale-95">{t.cancel}</button> 
                        <button type="submit" className="flex-[2] py-5 bg-primary-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition transform hover:-translate-y-1 active:scale-95">{t.save}</button> 
                    </div>
                </form>
            </div>
        </div>, document.body
    );
};
