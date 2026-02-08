
import React from 'react';
import { ArrowLeft, Edit2, Trash2, Phone, Copy, MessageCircle, Camera, BrainCircuit, RefreshCw, AlertCircle, Cloud } from 'lucide-react';
import { STATUS_COLORS, CATEGORIES } from '../../constants';
import { openWhatsApp } from '../../utils';
import { Patient, Language } from '../../types';

interface PatientHeaderProps {
  activePatient: Patient;
  t: any;
  isRTL: boolean;
  currentLang: Language;
  setSelectedPatientId: (id: string | null) => void;
  setShowEditPatientModal: (show: boolean) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  handleDeletePatient: (id: string) => void;
  profilePicInputRef: React.RefObject<HTMLInputElement | null>;
  handleProfilePicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessingProfilePic?: boolean;
  onOpenAI?: () => void; // New prop for AI assistant
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  activePatient, t, isRTL, currentLang, setSelectedPatientId, setShowEditPatientModal,
  openConfirm, handleDeletePatient, profilePicInputRef, handleProfilePicUpload, isProcessingProfilePic, onOpenAI
}) => {
  const statusColorData = STATUS_COLORS[activePatient.status] || STATUS_COLORS.active;
  
  // تحقق إذا كانت الصورة محلية وغير مزامنة
  const isProfilePicUnsynced = activePatient.profilePicture && !activePatient.profilePictureDriveId && activePatient.profilePicture.startsWith('data:');

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <button onClick={() => setSelectedPatientId(null)} className="md:hidden mb-2 flex items-center gap-2 text-gray-500">
            <ArrowLeft size={20} className="rtl:rotate-180" /> {t.back}
        </button>

        <div className="relative mx-auto md:mx-0 group">
            <div 
                onClick={() => !isProcessingProfilePic && profilePicInputRef.current?.click()}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl relative shadow-inner overflow-hidden shrink-0 border-4 border-white dark:border-gray-700 cursor-pointer transition-all ${statusColorData.split(' ')[0]} ${isProcessingProfilePic ? 'opacity-70' : ''}`}
            >
                {isProcessingProfilePic ? (
                    <div className="bg-gray-100 dark:bg-gray-800 w-full h-full flex items-center justify-center">
                        <RefreshCw className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : activePatient.profilePicture ? (
                    <img src={activePatient.profilePicture} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                    <span>{activePatient.gender === 'male' ? '👨' : '👩'}</span>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera size={24} />
                </div>
                <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleProfilePicUpload} disabled={isProcessingProfilePic} />
            </div>

            {/* مؤشر عدم المزامنة */}
            {isProfilePicUnsynced && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-10 animate-bounce" title={t.unsyncedAlert}>
                    <Cloud size={14} />
                </div>
            )}
        </div>

        <div className="flex-1 text-center md:text-start w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{activePatient.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-3 md:mt-0">
                    <button 
                      onClick={onOpenAI}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                      title={t.aiAssistant}
                    >
                      <BrainCircuit size={18} />
                      <span className="hidden sm:inline">{t.aiAssistant}</span>
                    </button>

                    <button onClick={() => setSelectedPatientId(null)} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <ArrowLeft size={20} className="rtl:rotate-180" /> {t.backToPatients}
                    </button>
                    <button onClick={() => setShowEditPatientModal(true)} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"><Edit2 size={20} /></button>
                    <button onClick={() => openConfirm(t.deletePatient, t.confirmDelete, () => handleDeletePatient(activePatient.id))} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-blue-900/20 rounded-lg transition"><Trash2 size={20} /></button>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Phone size={14} />
                        <span dir="ltr">{activePatient.phoneCode} {activePatient.phone}</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(`${activePatient.phoneCode}${activePatient.phone}`)} className="text-gray-400 hover:text-primary-500 transition" title={t.copyPhone}><Copy size={14} /></button>
                </div>
                <span className="hidden md:inline">•</span>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {(() => {
                            const cat = CATEGORIES.find(c => c.id === activePatient.category);
                            return isRTL ? (currentLang === 'ku' ? cat?.labelKu : cat?.labelAr) : cat?.label || 'Other';
                        })()}
                    </span>
                </div>
                <span className="hidden md:inline">•</span>
                <button 
                    onClick={() => openWhatsApp(activePatient.phoneCode, activePatient.phone)} 
                    className="flex items-center gap-1 text-green-600 hover:underline"
                >
                    <MessageCircle size={14} /> {t.whatsapp}
                </button>
                <span className="hidden md:inline">•</span>
                <a href={`tel:${activePatient.phoneCode?.replace('+','')}${activePatient.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Phone size={14} /> {t.call}</a>
            </div>
        </div>
    </div>
  );
};
