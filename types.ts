
export type Language = 'en' | 'ar' | 'ku';

export interface PatientImage {
  id: string;
  url: string;
  name: string;
  date: string;
  driveFileId?: string;
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
}

export interface Secretary {
  id: string;
  name: string;
  username: string;
  password: string;
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
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'payment' | 'charge';
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
}

export interface Tooth {
  id: number; 
  status: 'healthy' | 'decay' | 'filled' | 'missing' | 'crown' | 'rct' | 'extraction' | 'bridge' | 'veneer';
  surfaces?: ToothSurfaces;
  notes?: string;
  specialNote?: ToothNote;
}

export interface RootCanalEntry {
  id: string;
  toothNumber: string;
  canalName: string;
  length: string;
  date: string;
}

export interface TreatmentSession {
  id: string;
  date: string;
  description: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  form: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  date: string;
  medications: Medication[];
  notes?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price?: number;
  expiryDate?: string;
  color: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  uid?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  text: string;
}

export type PatientCategory = 'diagnosis' | 'rct' | 'implant' | 'crown' | 'surgery' | 'ortho' | 'filling' | 'cleaning' | 'smile' | 'whitening' | 'other';

export interface MedicalConditionItem {
  id: string;
  active: boolean;
}

export interface PatientQueryAnswer {
  questionId: string;
  answerId: string;
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
  teeth: Record<number, Tooth>;
  headMap?: Record<string, string>;
  bodyMap?: Record<string, string>;
  appointments: Appointment[];
  payments: Payment[];
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
}

export interface TextStyleConfig {
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
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
  documentTemplates: DocumentTemplate[];
  labOrders: LabOrder[];
  labs: string[];
  workTypes: string[];
  shades: string[];
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
        topMargin?: number;
        paperSize?: 'A4' | 'A5';
    };
    consentSettings?: DocumentSettings;
    instructionSettings?: DocumentSettings;
  };
  lastUpdated: number;
  lastSynced?: string;
}
