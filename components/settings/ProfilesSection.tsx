
import React from 'react';
import { Stethoscope, Plus, X, User, Edit2, Trash2, Contact, UserCheck } from 'lucide-react';
import { ClinicData } from '../../types';

interface ProfilesSectionProps {
  t: any;
  data: ClinicData;
  showAddDoctorModal: boolean;
  setShowAddDoctorModal: (val: boolean) => void;
  showEditDoctorModal: boolean;
  setShowEditDoctorModal: (val: boolean) => void;
  formDoc: any;
  setFormDoc: (val: any) => void;
  handleAddDoctor: (name: string, user?: string, pass?: string) => void;
  onUpdateAttempt: (id: string, updates: any) => void;
  setPendingAction: (val: any) => void;
  setShowVerificationModal: (val: boolean) => void;
  showAddSecretaryModal: boolean;
  setShowAddSecretaryModal: (val: boolean) => void;
  formSec: any;
  setFormSec: (val: any) => void;
  handleAddSecretary: (name: string, user: string, pass?: string) => void;
}

export const ProfilesSection: React.FC<ProfilesSectionProps> = ({
  t, data, showAddDoctorModal, setShowAddDoctorModal, showEditDoctorModal, setShowEditDoctorModal,
  formDoc, setFormDoc, handleAddDoctor, onUpdateAttempt, setPendingAction, setShowVerificationModal,
  showAddSecretaryModal, setShowAddSecretaryModal, formSec, setFormSec, handleAddSecretary
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-10">
        {/* Doctors */}
        <div>
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-sm"><Stethoscope size={20} /></div>
                    <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.manageProfiles}</h3>
                </div>
                <button onClick={() => { setFormDoc({ id: '', name: '', user: '', pass: '' }); setShowAddDoctorModal(true); }} className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition active:scale-95"><Plus size={18} /> {t.addDoctor}</button>
            </div>
            {(showAddDoctorModal || showEditDoctorModal) && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (showEditDoctorModal) onUpdateAttempt(formDoc.id, { name: formDoc.name, username: formDoc.user, password: formDoc.pass });
                    else handleAddDoctor(formDoc.name, formDoc.user, formDoc.pass);
                    setShowAddDoctorModal(false); setShowEditDoctorModal(false);
                }} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-[2.5rem] mb-8 border-2 border-primary-100 dark:border-primary-900 animate-fade-in space-y-5 shadow-inner">
                    <div className="flex justify-between items-center">
                        <h4 className="font-black text-sm text-primary-600 uppercase tracking-widest">{showEditDoctorModal ? t.editItem : t.addDoctor}</h4>
                        <button type="button" onClick={() => { setShowAddDoctorModal(false); setShowEditDoctorModal(false); }} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"><X size={20}/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.drNamePlaceholder}</label>
                            <input value={formDoc.name} onChange={e => setFormDoc({...formDoc, name: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-bold" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.username}</label>
                                <input value={formDoc.user} onChange={e => setFormDoc({...formDoc, user: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-bold" required />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.password}</label>
                                <input value={formDoc.pass} onChange={e => setFormDoc({...formDoc, pass: e.target.value})} type="text" className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-bold" required />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition">{t.save}</button>
                </form>
            )}
            <div className="space-y-4">
                {data.doctors.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform"><User size={28} /></div>
                            <div>
                                <div className="font-black text-gray-800 dark:text-white text-lg">{doc.name}</div>
                                <div className="text-xs text-gray-400 font-bold tracking-tight">@{doc.username || '---'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setPendingAction({ type: 'edit', target: 'doctor', data: doc }); setShowVerificationModal(true); }} className="text-blue-500 bg-white dark:bg-gray-600 p-3 rounded-xl border dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"><Edit2 size={18} /></button>
                            <button onClick={() => { setPendingAction({ type: 'delete', target: 'doctor', data: doc }); setShowVerificationModal(true); }} className="text-red-500 bg-white dark:bg-gray-600 p-3 rounded-xl border dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Secretary */}
        <div>
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl shadow-sm"><Contact size={20} /></div>
                    <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">{t.manageSecretaries}</h3>
                </div>
                <button onClick={() => setShowAddSecretaryModal(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition active:scale-95"><Plus size={18} /> {t.addSecretary}</button>
            </div>
            {showAddSecretaryModal && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddSecretary(formSec.name, formSec.user, formSec.pass);
                    setFormSec({ name: '', user: '', pass: '' }); setShowAddSecretaryModal(false);
                }} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-[2.5rem] mb-8 border-2 border-purple-100 dark:border-purple-900 animate-fade-in space-y-5 shadow-inner">
                    <div className="flex justify-between items-center">
                        <h4 className="font-black text-sm text-purple-600 uppercase tracking-widest">{t.addSecretary}</h4>
                        <button type="button" onClick={() => setShowAddSecretaryModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"><X size={20}/></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.secretaryName}</label>
                            <input value={formSec.name} onChange={e => setFormSec({...formSec, name: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-bold" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.username}</label>
                                <input value={formSec.user} onChange={e => setFormSec({...formSec, user: e.target.value})} className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-bold" required />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ms-1">{t.password}</label>
                                <input value={formSec.pass} onChange={e => setFormSec({...formSec, pass: e.target.value})} type="text" className="w-full p-4 rounded-2xl border-none bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm font-bold" required />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition">{t.save}</button>
                </form>
            )}
            <div className="space-y-4">
                {(data.secretaries || []).map(sec => (
                    <div key={sec.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform"><UserCheck size={28} /></div>
                            <div>
                                <div className="font-black text-gray-800 dark:text-white text-lg">{sec.name}</div>
                                <div className="text-xs text-gray-400 font-bold tracking-tight">@{sec.username}</div>
                            </div>
                        </div>
                        <button onClick={() => { setPendingAction({ type: 'delete', target: 'secretary', data: sec }); setShowVerificationModal(true); }} className="text-red-500 bg-white dark:bg-gray-600 p-3 rounded-xl border dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
