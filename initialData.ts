
import { ClinicData } from './types';

export const INITIAL_DATA: ClinicData = {
  clinicName: "",
  doctors: [],
  secretaries: [],
  patients: [],
  guestAppointments: [],
  memos: [],
  supplies: [],
  inventory: [],
  expenses: [],
  deletedIds: [], // مصفوفة لتتبع المعرفات المحذوفة
  medicationCategories: [
    { id: 'cat_antibiotics', name: 'Antibiotics - المضادات الحيوية' },
    { id: 'cat_analgesics', name: 'Analgesics - مسكنات الألم' },
    { id: 'cat_anti_inflam', name: 'Anti-inflammatory - مضادات الالتهاب' },
    { id: 'cat_mouthwash', name: 'Mouthwashes - غسول الفم' },
    { id: 'cat_antifungal', name: 'Antifungals - مضادات الفطريات' },
    { id: 'cat_other', name: 'Other - أخرى' }
  ],
  medications: [
    // --- Antibiotics ---
    { id: '1', categoryId: 'cat_antibiotics', name: 'Amoxicillin', dose: '500mg', frequency: '1 x 3', form: 'Cap', notes: 'After meals' },
    { id: '2', categoryId: 'cat_antibiotics', name: 'Augmentin', dose: '1g', frequency: '1 x 2', form: 'Tab', notes: 'Every 12 hours' },
    { id: '3', categoryId: 'cat_antibiotics', name: 'Augmentin', dose: '625mg', frequency: '1 x 3', form: 'Tab', notes: 'Every 8 hours' },
    { id: '4', categoryId: 'cat_antibiotics', name: 'Metronidazole (Flagyl)', dose: '500mg', frequency: '1 x 3', form: 'Tab', notes: 'For 5-7 days' },
    { id: '5', categoryId: 'cat_antibiotics', name: 'Azithromycin (Zithromax)', dose: '500mg', frequency: '1 x 1', form: 'Tab', notes: 'For 3 days only' },
    { id: '6', categoryId: 'cat_antibiotics', name: 'Clindamycin (Dalacin C)', dose: '300mg', frequency: '1 x 3', form: 'Cap', notes: 'For penicillin allergic patients' },
    
    // --- Analgesics & NSAIDs ---
    { id: '7', categoryId: 'cat_analgesics', name: 'Paracetamol (Panadol)', dose: '500mg', frequency: '1 x 3', form: 'Tab', notes: 'When needed' },
    // Fix: Removed 'fontStyle' property as it is not part of the Medication interface
    { id: '8', categoryId: 'cat_analgesics', name: 'Paracetamol (Panadol Joint)', dose: '1000mg', frequency: '1 x 3', form: 'Tab', notes: 'Every 8 hours' },
    { id: '9', categoryId: 'cat_analgesics', name: 'Ibuprofen (Brufen)', dose: '400mg', frequency: '1 x 3', form: 'Tab', notes: 'After food' },
    { id: '10', categoryId: 'cat_analgesics', name: 'Ibuprofen (Brufen)', dose: '600mg', frequency: '1 x 2', form: 'Tab', notes: 'After food' },
    { id: '11', categoryId: 'cat_analgesics', name: 'Diclofenac Potassium (Catafast)', dose: '50mg', frequency: '1 x 3', form: 'Sachet', notes: 'Dissolve in water' },
    { id: '12', categoryId: 'cat_analgesics', name: 'Diclofenac Potassium (Cataflam)', dose: '50mg', frequency: '1 x 3', form: 'Tab', notes: 'After food' },
    { id: '13', categoryId: 'cat_analgesics', name: 'Mefenamic Acid (Ponstan Forte)', dose: '500mg', frequency: '1 x 3', form: 'Tab', notes: 'For pain and inflammation' },
    { id: '14', categoryId: 'cat_analgesics', name: 'Ketoprofen (Ketofan)', dose: '50mg', frequency: '1 x 3', form: 'Cap', notes: 'Powerful analgesic' },
    { id: '15', categoryId: 'cat_analgesics', name: 'Celecoxib (Celebrex)', dose: '200mg', frequency: '1 x 1', form: 'Cap', notes: 'Safe for stomach' },
    
    // --- Anti-inflammatory & Corticosteroids ---
    { id: '16', categoryId: 'cat_anti_inflam', name: 'Dexamethasone', dose: '0.5mg', frequency: '1 x 3', form: 'Tab', notes: 'For swelling' },
    { id: '17', categoryId: 'cat_anti_inflam', name: 'Alpha-Chymotrypsin', dose: '5mg', frequency: '1 x 3', form: 'Tab', notes: 'To reduce edema' },
    
    // --- Mouthwashes & Topical ---
    { id: '18', categoryId: 'cat_mouthwash', name: 'Chlorhexidine Mouthwash', dose: '0.2%', frequency: 'Rinse x 2', form: 'Bottle', notes: '30 seconds rinse' },
    { id: '19', categoryId: 'cat_mouthwash', name: 'Kenalog in Orabase', dose: 'Topical', frequency: '3 times', form: 'Paste', notes: 'For mouth ulcers' },
    { id: '20', categoryId: 'cat_mouthwash', name: 'Gengigel', dose: 'Topical', frequency: '3 times', form: 'Gel', notes: 'For gum inflammation' }
  ],
  documentTemplates: [],
  labOrders: [],
  labs: ['Default Lab', 'Modern Dental Lab', 'Expert Lab'],
  workTypes: [
    'Zircon Bridge', 'Zircon Single', 'E-Max Veneer', 'E-Max Inlay/Onlay', 
    'PFM Crown', 'Partial Denture', 'Full Denture', 'Night Guard', 'Implant Abutment'
  ],
  shades: [
    'A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'D2', 'D3', 'BL1', 'BL2', 'BL3', 'BL4'
  ],
  settings: {
    language: 'ar',
    theme: 'light',
    currency: 'USD',
    appScale: 100,
    defaultCountryCode: '+964',
    isLoggedIn: false,
    rxBackgroundImage: '',
    consentBackgroundImage: '',
    instructionsBackgroundImage: '',
    clinicPhone: '',
    dashboardEnabled: true,
    dashboardPin: '',
    adminPassword: '123456',
    googleDriveLinked: false,
    thousandsShortcut: false,
    geminiApiKey: '',
    monthViewSettings: {
      fontSize: 12,
      columnPadding: 20,
      textColor: '#4b5563',
      cardBgColor: '#ffffff',
      columnColors: Array(7).fill('#ffffff')
    },
    weekViewSettings: {
      fontSize: 14,
      textColor: '#111827',
      cardBgColor: '#ffffff',
      dayColors: Array(7).fill('')
    },
    rxTemplate: {
        rxSymbol: { fontSize: 30, color: '#000000', isBold: true, isItalic: true },
        medications: { fontSize: 14, color: '#000000', isBold: true, isItalic: false },
        headerInfo: { fontSize: 12, color: '#000000', isBold: true, isItalic: false },
        headerLine: { color: '#000000', thickness: 1, style: 'solid' },
        topMargin: 100,
        paperSize: 'A5'
    },
    consentSettings: { text: '', fontSize: 12, align: 'right', topMargin: 130 },
    instructionSettings: { text: '', fontSize: 12, align: 'right', topMargin: 130 }
  },
  lastUpdated: 0 
};