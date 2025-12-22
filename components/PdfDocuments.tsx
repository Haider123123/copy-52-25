
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { ClinicData, Patient, Prescription, Payment, Appointment } from '../types';
import { format } from 'date-fns';
import { getLocalizedDate, formatTime12 } from '../utils';

// Register Arabic Font
// Using a standard Arabic font hosted on a CDN that supports .ttf
Font.register({
  family: 'Naskh',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-naskh-arabic@4.5.12/files/noto-naskh-arabic-arabic-400-normal.ttf'
});

Font.register({
  family: 'NaskhBold',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-naskh-arabic@4.5.12/files/noto-naskh-arabic-arabic-700-normal.ttf'
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Naskh',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    objectFit: 'cover',
  },
  rxContent: {
    padding: 30,
    paddingTop: 100, // Space for header in bg
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
  },
  label: {
    color: '#555',
    fontSize: 10,
    marginRight: 5,
  },
  value: {
    fontSize: 12,
    fontFamily: 'NaskhBold',
  },
  rxSymbol: {
    marginBottom: 10,
    marginLeft: 10,
  },
  medicationRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  medIndex: {
    width: 20,
    fontSize: 10,
    color: '#777',
  },
  receiptContainer: {
    padding: 10,
    fontSize: 10,
    textAlign: 'center',
  },
  receiptHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderStyle: 'dashed',
    marginBottom: 10,
    paddingBottom: 5,
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 14,
    fontFamily: 'NaskhBold',
    marginBottom: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderStyle: 'dashed',
    marginTop: 10,
    paddingTop: 5,
  },
  docText: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'center',
  },
});

interface RxPdfProps {
  data: ClinicData;
  patient: Patient;
  rx: Prescription;
  currentLang: string;
}

export const RxPdf: React.FC<RxPdfProps> = ({ data, patient, rx, currentLang }) => {
  const rxLabels = {
      en: { name: 'Name', age: 'Age', date: 'Date' },
      ar: { name: 'الاسم', age: 'العمر', date: 'التاريخ' },
      ku: { name: 'ناو', age: 'تەمەن', date: 'بەروار' }
  }[currentLang] || { name: 'Name', age: 'Age', date: 'Date' };

  // Use Settings for dynamic styles or defaults
  const rxSymStyle = data.settings.rxTemplate?.rxSymbol || { fontSize: 30, color: '#000000', isBold: true, isItalic: true };
  const medsStyle = data.settings.rxTemplate?.medications || { fontSize: 14, color: '#000000', isBold: true, isItalic: false };

  // Dynamic Font Logic based on Bold setting
  // We use standard fonts for Rx symbol usually, but for Meds we use Naskh/NaskhBold for Arabic support
  const medsFontFamily = medsStyle.isBold ? 'NaskhBold' : 'Naskh';
  const rxSymbolFontFamily = rxSymStyle.isBold ? 'Helvetica-Bold' : 'Helvetica';

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {data.settings.rxBackgroundImage && (
          <Image src={data.settings.rxBackgroundImage} style={styles.backgroundImage} />
        )}
        
        <View style={styles.rxContent}>
           {/* Header Info */}
           <View style={styles.headerRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.label}>{rxLabels.name}:</Text>
                  <Text style={styles.value}>{patient.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.label}>{rxLabels.age}:</Text>
                      <Text style={styles.value}>{patient.age}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.label}>{rxLabels.date}:</Text>
                      <Text style={styles.value}>{new Date(rx.date).toLocaleDateString('en-GB')}</Text>
                  </View>
              </View>
           </View>

           {/* Body */}
           <Text style={{
               ...styles.rxSymbol,
               fontSize: rxSymStyle.fontSize,
               color: rxSymStyle.color,
               fontFamily: rxSymbolFontFamily,
               fontStyle: rxSymStyle.isItalic ? 'italic' : 'normal',
           }}>R/x</Text>

           <View>
              {rx.medications.map((m, i) => (
                  <View key={i} style={styles.medicationRow}>
                      <Text style={styles.medIndex}>{i + 1})</Text>
                      {/* Dynamic Medication Name */}
                      <Text style={{
                          marginRight: 5,
                          fontSize: medsStyle.fontSize,
                          color: medsStyle.color,
                          fontFamily: medsFontFamily,
                          fontStyle: medsStyle.isItalic ? 'italic' : 'normal',
                      }}>{m.name}</Text>
                      
                      {/* Details - Keep simpler style or inherit somewhat smaller */}
                      <Text style={{
                          fontSize: Math.max(10, medsStyle.fontSize - 2),
                          color: '#333',
                          marginRight: 5,
                          fontFamily: 'Naskh',
                      }}>{m.dose}</Text>
                      <Text style={{
                          fontSize: Math.max(10, medsStyle.fontSize - 2),
                          color: '#333',
                          marginRight: 5,
                          fontFamily: 'Naskh',
                      }}>{m.form}</Text>
                      <Text style={{
                          fontSize: Math.max(10, medsStyle.fontSize - 2),
                          color: '#333',
                          marginRight: 5,
                          fontFamily: 'Naskh',
                      }}>{m.frequency}</Text>
                      
                      {m.notes && <Text style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>({m.notes})</Text>}
                  </View>
              ))}
           </View>
        </View>
      </Page>
    </Document>
  );
};

interface ReceiptPdfProps {
  data: ClinicData;
  patient: Patient;
  payment: Payment;
  t: any;
}

export const ReceiptPdf: React.FC<ReceiptPdfProps> = ({ data, patient, payment, t }) => {
  const totalPaid = patient.payments.filter(p => p.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCost = patient.payments.filter(p => p.type === 'charge').reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = totalCost - totalPaid;

  return (
    <Document>
      <Page size={[226, 600]} style={styles.page}> {/* 80mm width approx 226 points */}
         <View style={styles.receiptContainer}>
             <View style={styles.receiptHeader}>
                 <Text style={styles.receiptTitle}>{data.clinicName}</Text>
                 <Text>{t.receipt}</Text>
                 {data.settings.clinicPhone && <Text style={{fontSize: 9}}>{data.settings.clinicPhone}</Text>}
             </View>

             <View style={styles.receiptRow}>
                 <Text style={{ fontFamily: 'NaskhBold' }}>{t.name}:</Text>
                 <Text>{patient.name}</Text>
             </View>
             <View style={styles.receiptRow}>
                 <Text style={{ fontFamily: 'NaskhBold' }}>{t.dateLabel}:</Text>
                 <Text>{format(new Date(), 'yyyy-MM-dd HH:mm')}</Text>
             </View>

             <View style={[styles.receiptHeader, { marginTop: 10 }]}>
                 <Text style={{ fontSize: 9 }}>{payment.type === 'payment' ? t.paymentReceived : t.treatmentCost}</Text>
                 <Text style={{ fontSize: 18, fontFamily: 'NaskhBold' }}>{data.settings.currency} {payment.amount}</Text>
                 {payment.description && <Text>{payment.description}</Text>}
             </View>

             <View style={styles.totalSection}>
                 <View style={styles.receiptRow}>
                     <Text>{t.totalCost}:</Text>
                     <Text>{data.settings.currency} {totalCost}</Text>
                 </View>
                 <View style={styles.receiptRow}>
                     <Text>{t.totalPaid}:</Text>
                     <Text>{data.settings.currency} {totalPaid}</Text>
                 </View>
                 <View style={styles.receiptRow}>
                     <Text style={{ fontFamily: 'NaskhBold' }}>{t.remaining}:</Text>
                     <Text style={{ fontFamily: 'NaskhBold' }}>{data.settings.currency} {remaining}</Text>
                 </View>
             </View>

             <Text style={{ marginTop: 15, fontStyle: 'italic' }}>{t.thankYou}</Text>
         </View>
      </Page>
    </Document>
  );
};

interface AppointmentPdfProps {
    data: ClinicData;
    appointment: Appointment;
    t: any;
    currentLang: string;
}

export const AppointmentPdf: React.FC<AppointmentPdfProps> = ({ data, appointment, t, currentLang }) => {
    return (
        <Document>
            <Page size={[226, 400]} style={styles.page}>
                <View style={styles.receiptContainer}>
                    <View style={styles.receiptHeader}>
                        <Text style={styles.receiptTitle}>{data.clinicName}</Text>
                        <Text>{t.appointmentTicket}</Text>
                    </View>

                    <View style={{ marginBottom: 10, alignItems: 'flex-start' }}>
                        <Text style={{ marginBottom: 4 }}>{t.name}:  <Text style={{ fontFamily: 'NaskhBold' }}>{appointment.patientName}</Text></Text>
                        <Text style={{ marginBottom: 4 }}>{t.date}:  <Text style={{ fontFamily: 'NaskhBold' }}>{getLocalizedDate(new Date(appointment.date), 'full', currentLang)}</Text></Text>
                        <Text style={{ marginBottom: 4 }}>{t.time}:  <Text style={{ fontFamily: 'NaskhBold' }}>{formatTime12(appointment.time, currentLang)}</Text></Text>
                    </View>

                    <View style={{ borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 5 }}>
                        {data.settings.clinicPhone && <Text style={{fontSize: 10, marginBottom: 2}}>{data.settings.clinicPhone}</Text>}
                        <Text style={{ fontSize: 9, color: '#555' }}>{t.arriveEarlyNote}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}

interface DocumentPdfProps {
    data: ClinicData;
    patient: Patient;
    doc: { type: 'consent' | 'instructions', text: string, align: any, fontSize: number };
    t: any;
}

export const DocumentPdf: React.FC<DocumentPdfProps> = ({ data, patient, doc }) => {
    const isA4 = doc.type === 'consent';
    const bgImage = isA4 ? data.settings.consentBackgroundImage : data.settings.instructionsBackgroundImage;
    
    return (
        <Document>
            <Page size={isA4 ? 'A4' : 'A5'} style={styles.page}>
                {bgImage && <Image src={bgImage} style={styles.backgroundImage} />}
                
                <View style={{ padding: 40, paddingTop: 100 }}>
                    <View style={styles.headerRow}>
                        <Text style={styles.value}>{patient.name}</Text>
                        <Text style={styles.value}>{new Date().toLocaleDateString('en-GB')}</Text>
                    </View>
                    
                    <Text style={{
                        marginTop: 20,
                        fontSize: doc.fontSize || 12,
                        textAlign: doc.align || 'left',
                        lineHeight: 1.5
                    }}>
                        {doc.text}
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
