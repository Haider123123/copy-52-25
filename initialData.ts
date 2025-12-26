
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
  medications: [
    { id: '1', name: 'Amoxicillin', dose: '500mg', frequency: '3 times daily', form: 'cap' },
    { id: '2', name: 'Ibuprofen', dose: '400mg', frequency: 'When needed', form: 'tab', notes: 'After food' },
    { id: '3', name: 'Paracetamol', dose: '500mg', frequency: 'Every 6 hours', form: 'tab' },
    { id: '4', name: 'Metronidazole', dose: '500mg', frequency: '3 times daily', form: 'tab' },
    { id: '5', name: 'Augmentin', dose: '625mg', frequency: '2 times daily', form: 'tab' },
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
    rxTemplate: {
        rxSymbol: { fontSize: 30, color: '#000000', isBold: true, isItalic: true },
        medications: { fontSize: 14, color: '#000000', isBold: true, isItalic: false },
        topMargin: 100,
        paperSize: 'A5'
    },
    consentSettings: { text: '', fontSize: 12, align: 'right', topMargin: 130 },
    instructionSettings: { text: '', fontSize: 12, align: 'right', topMargin: 130 }
  },
  lastUpdated: 0 
};
