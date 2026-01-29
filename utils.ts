
import { Language, ClinicData, Patient, Tooth, Appointment, Payment, Memo, InventoryItem, ExpenseItem, LabOrder, MedicalConditionItem, PatientQueryAnswer } from './types';
import { LABELS } from './locales';
import { TREATMENT_TYPES } from './constants';
// @ts-ignore
import ArabicReshaper from 'arabic-persian-reshaper';

/**
 * توليد ID فريد جداً وطويل يضمن عدم التكرار نهائياً
 */
export const generateId = () => {
    try {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
    } catch (e) {}
    // Fallback for older browsers
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const hexToRgb = (hex: string): string => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

/**
 * إجبار عرض الوقت بالأرقام اللاتينية 0-9
 */
export const formatTime12 = (time24: string, lang: Language) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const isPm = h >= 12;
  h = h % 12;
  h = h ? h : 12;
  
  const amLabel = LABELS[lang]?.morning || 'AM';
  const pmLabel = LABELS[lang]?.night || 'PM';
  const ampm = isPm ? pmLabel : amLabel;
  
  return `${h}:${minutes} ${ampm}`;
};

export const getLocaleCode = (lang: 'en' | 'ar' | 'ku') => {
    switch(lang) {
        case 'ar': return 'ar-IQ';
        case 'ku': return 'ckb-IQ';
        default: return 'en-US';
    }
}

/**
 * إجبار عرض التاريخ بالأرقام اللاتينية 0-9
 */
export const getLocalizedDate = (date: Date, type: 'day' | 'month' | 'full' | 'weekday', lang: 'en' | 'ar' | 'ku') => {
    const locale = getLocaleCode(lang);
    const options: Intl.DateTimeFormatOptions = { numberingSystem: 'latn' };
    
    if (type === 'day') options.day = 'numeric';
    else if (type === 'weekday') options.weekday = 'long';
    else if (type === 'month') { options.month = 'numeric'; options.year = 'numeric'; }
    else if (type === 'full') { options.day = 'numeric'; options.month = 'numeric'; options.year = 'numeric'; }
    
    return new Intl.DateTimeFormat(locale, options).format(date);
}

export const getTreatmentLabel = (typeId?: string, currentLang: Language = 'en', isRTL: boolean = false) => {
    if(!typeId) return '';
    const type = TREATMENT_TYPES.find(t => t.id === typeId);
    if(isRTL) return currentLang === 'ku' ? type?.ku : type?.ar;
    return type?.en;
};

/**
 * تحويل الأرقام الهندية/الشرقية إلى لاتينية لضمان استقرارها
 */
export const normalizeDigits = (val: any) => {
  if (val === null || val === undefined) return val;
  const str = String(val);
  return str.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
            .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵٦٧٨٩'.indexOf(d)]);
};

export const processArabicText = (text: string): string => {
  if (!text) return '';
  const normalizedText = normalizeDigits(text);
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (!arabicPattern.test(normalizedText)) return normalizedText;
  try {
      const reshaped = ArabicReshaper.convert(normalizedText);
      return reshaped.split('').reverse().join('');
  } catch (e) {
      return normalizedText;
  }
};

export const openWhatsApp = (phoneCode: string = '', phone: string = '') => {
    const cleanPhone = `${phoneCode.replace('+', '')}${normalizeDigits(phone).replace(/\s/g, '')}`;
    const directUrl = `whatsapp://send?phone=${cleanPhone}`;
    window.location.href = directUrl;
};

/**
 * نظام الدمج الذكي الدقيق (Granular Merge)
 * يمنع فقدان البيانات عبر دمج التعديلات على مستوى العنصر وليس الكائن الكامل
 */
export const granularMerge = (local: ClinicData, remote: ClinicData): ClinicData => {
    if (!remote || !remote.clinicName) return local;
    if (!local || !local.clinicName) return remote;

    // Preserve local-only background images before merging
    const localRxBg = local.settings.rxBackgroundImage;
    const localConsentBg = local.settings.consentBackgroundImage;
    const localInstructionsBg = local.settings.instructionsBackgroundImage;
    
    // Create a map of local doctor background images
    const localDocBgs = new Map();
    (local.doctors || []).forEach(d => {
        if (d.rxBackgroundImage) localDocBgs.set(d.id, d.rxBackgroundImage);
    });

    const combinedDeletedIds = Array.from(new Set([
        ...(local.deletedIds || []),
        ...(remote.deletedIds || [])
    ]));

    const purgeDeleted = <T extends { id: string | number }>(arr: T[]): T[] => {
        return (arr || []).filter(item => !combinedDeletedIds.includes(String(item.id)));
    };

    const mergeArrayBy = <T extends { updatedAt?: number }>(locArr: T[], remArr: T[], key: keyof T): T[] => {
        const mergedMap = new Map<any, T>();
        (remArr || []).forEach(item => mergedMap.set(item[key], item));
        (locArr || []).forEach(localItem => {
            const remoteItem = mergedMap.get(localItem[key]);
            if (!remoteItem || (localItem.updatedAt || 0) >= (remoteItem.updatedAt || 0)) {
                mergedMap.set(localItem[key], localItem);
            }
        });
        return Array.from(mergedMap.values());
    };

    const mergeArrayById = <T extends { id: string | number, updatedAt?: number }>(locArr: T[], remArr: T[]): T[] => {
        return purgeDeleted(mergeArrayBy(locArr, remArr, 'id'));
    };

    const mergePatients = (locPats: Patient[], remPats: Patient[]): Patient[] => {
        const mergedMap = new Map<string, Patient>();
        (remPats || []).forEach(p => mergedMap.set(p.id, p));

        (locPats || []).forEach(localPat => {
            const remotePat = mergedMap.get(localPat.id);
            if (!remotePat) {
                mergedMap.set(localPat.id, localPat);
            } else {
                const newerBase = (localPat.updatedAt || 0) >= (remotePat.updatedAt || 0) ? localPat : remotePat;
                
                const mergedTeeth: Record<number, Tooth> = { ...remotePat.teeth };
                Object.keys(localPat.teeth).forEach(key => {
                    const toothNum = parseInt(key);
                    const localTooth = localPat.teeth[toothNum];
                    const remoteTooth = mergedTeeth[toothNum];
                    if (!remoteTooth || (localTooth.updatedAt || 0) >= (remoteTooth.updatedAt || 0)) {
                        mergedTeeth[toothNum] = localTooth;
                    }
                });

                mergedMap.set(localPat.id, {
                    ...newerBase,
                    teeth: mergedTeeth,
                    appointments: mergeArrayById(localPat.appointments, remotePat.appointments),
                    payments: mergeArrayById(localPat.payments, remotePat.payments),
                    examinations: mergeArrayById(localPat.examinations || [], remotePat.examinations || []),
                    rootCanals: mergeArrayById(localPat.rootCanals || [], remotePat.rootCanals || []),
                    treatmentSessions: mergeArrayById(localPat.treatmentSessions || [], remotePat.treatmentSessions || []),
                    prescriptions: mergeArrayById(localPat.prescriptions || [], remotePat.prescriptions || []),
                    images: mergeArrayById(localPat.images || [], remotePat.images || []),
                    structuredMedicalHistory: mergeArrayById(localPat.structuredMedicalHistory || [], remotePat.structuredMedicalHistory || []) as MedicalConditionItem[],
                    patientQueries: mergeArrayBy(localPat.patientQueries || [], remotePat.patientQueries || [], 'questionId'),
                    updatedAt: Math.max(localPat.updatedAt || 0, remotePat.updatedAt || 0)
                });
            }
        });
        
        return purgeDeleted(Array.from(mergedMap.values()));
    };

    const finalResult: ClinicData = {
        ...((local.lastUpdated || 0) >= (remote.lastUpdated || 0) ? local : remote),
        patients: mergePatients(local.patients, remote.patients),
        memos: mergeArrayById(local.memos || [], remote.memos || []),
        inventory: mergeArrayById(local.inventory || [], remote.inventory || []),
        expenses: mergeArrayById(local.expenses || [], remote.expenses || []),
        labOrders: mergeArrayById(local.labOrders || [], remote.labOrders || []),
        doctors: mergeArrayById(local.doctors || [], remote.doctors || []),
        secretaries: mergeArrayById(local.secretaries || [], remote.secretaries || []),
        deletedIds: combinedDeletedIds,
        lastUpdated: Math.max(local.lastUpdated || 0, remote.lastUpdated || 0)
    };

    // RESTORE PROTECTED FIELDS: Background images are local-only
    if (finalResult.settings) {
        if (localRxBg) finalResult.settings.rxBackgroundImage = localRxBg;
        if (localConsentBg) finalResult.settings.consentBackgroundImage = localConsentBg;
        if (localInstructionsBg) finalResult.settings.instructionsBackgroundImage = localInstructionsBg;
    }
    
    // Restore doctor-specific backgrounds
    if (finalResult.doctors) {
        finalResult.doctors = finalResult.doctors.map(d => ({
            ...d,
            rxBackgroundImage: localDocBgs.get(d.id) || d.rxBackgroundImage || ""
        }));
    }

    return finalResult;
};
