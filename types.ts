
export type Language = 'en' | 'ar' | 'ku';

export interface MedicationCategory {
  id: string;
  name: string;
  updatedAt?: number;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  form: string;
  notes?: string;
  categoryId?: string; // ربط الدواء بمجموعة
  updatedAt?: number;
}

export interface PatientImage {
  id: string;
  url: string;
  name: string;
  date: string;
  driveFileId?: string;
  updatedAt?: number;
}

export interface Theme {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu: string;
  type: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    bg: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  username?: string; 
  password?: string; 
  rxBackgroundImage?: string; 
  dashboardPin?: string;
  incomePercentage?: number;
  updatedAt?: number;
}

export interface Secretary {
  id: string;
  name: string;
  username: string;
  password: string;
  updatedAt?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration?: number;
  treatmentType?: string;
  sessionNumber?: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'noshow';
  updatedAt?: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'payment' | 'charge';
  updatedAt?: number;
}

export interface Examination {
  id: string;
  date: string;
  amount: number;
  description: string;
  updatedAt?: number;
}

export interface ToothSurfaces {
  top: string;
  bottom: string;
  left: string;
  right: string;
  center: string;
}

export interface ToothNote {
  text: string;
  align: 'left' | 'center' | 'right';
  fontSize: number;
  textColor: string;
  bgColor: string;
  updatedAt?: number;
}

export interface Tooth {
  id: number; 
  status: 'healthy' | 'decay' | 'filled' | 'missing' | 'crown' | 'rct' | 'extraction' | 'bridge' | 'veneer';
  surfaces?: ToothSurfaces;
  notes?: string;
  specialNote?: ToothNote;
  updatedAt?: number;
}

export interface RootCanalEntry {
  id: string;
  toothNumber: string;
  canalName: string;
  length: string;
  date: string;
  updatedAt?: number;
}

export interface TreatmentSession {
  id: string;
  date: string;
  description: string;
  updatedAt?: number;
}

export interface Prescription {
  id: string;
  date: string;
  medications: Medication[];
  notes?: string;
  updatedAt?: number;
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  updatedAt?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price?: number;
  expiryDate?: string;
  color: string;
  updatedAt?: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  uid?: string;
  updatedAt?: number;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  text: string;
  updatedAt?: number;
}

export type PatientCategory = 'diagnosis' | 'rct' | 'implant' | 'crown' | 'surgery' | 'ortho' | 'filling' | 'cleaning' | 'smile' | 'whitening' | 'other';

export interface MedicalConditionItem {
  id: string;
  active: boolean;
  updatedAt?: number;
}

export interface PatientQueryAnswer {
  questionId: string;
  answerId: string;
  updatedAt?: number;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  phoneCode?: string;
  age: number;
  gender: 'male' | 'female';
  category?: PatientCategory;
  address?: string;
  medicalHistory: string;
  structuredMedicalHistory?: MedicalConditionItem[];
  patientQueries?: PatientQueryAnswer[];
  dentalHistoryNotes?: string;
  status: 'active' | 'finished' | 'pending' | 'discontinued'; 
  doctorId: string;
  createdAt: string;
  updatedAt?: number; 
  teeth: Record<number, Tooth>;
  headMap?: Record<string, string>;
  bodyMap?: Record<string, string>;
  appointments: Appointment[];
  payments: Payment[];
  examinations?: Examination[];
  notes: string;
  rootCanals: RootCanalEntry[];
  treatmentSessions: TreatmentSession[];
  prescriptions: Prescription[];
  images?: PatientImage[]; 
  rctDrawing?: string; 
  rctDrawingDriveId?: string; 
  profilePicture?: string; 
  profilePictureDriveId?: string; 
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  updatedAt?: number;
}

export interface MemoStyle {
  direction: 'ltr' | 'rtl';
  fontSize: number;
  textColor: string;
  isItalic: boolean;
  titleFontSize: number;
  titleColor: string;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  type?: 'text' | 'todo';
  todos?: TodoItem[];
  color: string;
  date: string;
  style?: MemoStyle;
  updatedAt?: number;
}

export type LabOrderStatus = 'in_progress' | 'ready' | 'received' | 'cancelled';

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  labName: string;
  workType: string;
  toothCount?: number;
  toothNumbers?: string;
  shade?: string;
  price?: number;
  sentDate: string;
  status: LabOrderStatus;
  notes?: string;
  updatedAt?: number;
}

export interface TextStyleConfig {
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
}

export interface LineStyleConfig {
  color: string;
  thickness: number;
  style: 'solid' | 'dashed';
}

export interface DocumentSettings {
    text: string;
    fontSize: number;
    align: 'left' | 'center' | 'right';
    topMargin: number;
    backgroundImage?: string;
}

export interface MonthViewSettings {
  fontSize: number;
  columnPadding: number;
  textColor: string;
  cardBgColor: string;
  columnColors: string[];
}

export interface WeekViewSettings {
  fontSize: number;
  textColor: string;
  cardBgColor: string;
  dayColors: string[];
}

export interface ClinicData {
  clinicName: string;
  doctors: Doctor[];
  secretaries: Secretary[];
  patients: Patient[];
  guestAppointments: Appointment[];
  memos: Memo[];
  supplies: SupplyItem[];
  inventory: InventoryItem[];
  expenses: ExpenseItem[];
  medications: Medication[];
  medicationCategories?: MedicationCategory[]; // المجموعات الدوائية
  documentTemplates: DocumentTemplate[];
  labOrders: LabOrder[];
  labs: string[];
  workTypes: string[];
  shades: string[];
  deletedIds?: string[]; // مصفوفة لتتبع المعرفات المحذوفة
  settings: {
    language: Language;
    theme: 'light' | 'dark';
    currency: string;
    appScale: number;
    defaultCountryCode: string;
    isLoggedIn: boolean;
    rxBackgroundImage?: string;
    consentBackgroundImage?: string;
    instructionsBackgroundImage?: string;
    clinicPhone?: string;
    dashboardEnabled?: boolean;
    dashboardPin?: string;
    adminPassword?: string;
    googleDriveLinked?: boolean; 
    googleDriveRootId?: string; 
    thousandsShortcut?: boolean;
    geminiApiKey?: string;
    monthViewSettings?: MonthViewSettings;
    weekViewSettings?: WeekViewSettings;
    rxTemplate?: {
        rxSymbol: TextStyleConfig;
        medications: TextStyleConfig;
        headerInfo?: TextStyleConfig;
        headerLine?: LineStyleConfig;
        topMargin?: number;
        paperSize?: 'A4' | 'A5';
    };
    consentSettings?: DocumentSettings;
    instructionSettings?: DocumentSettings;
  };
  lastUpdated: number;
  lastSynced?: string;
}
