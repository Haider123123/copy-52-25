
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ClinicData, Patient, Prescription, Payment, Appointment, Examination } from '../types';
import { processArabicText } from '../utils';
import { format } from 'date-fns';

// --- CONFIGURATION ---
const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf';
const FONT_BOLD_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf';

const COLORS = {
    primary: rgb(0.1, 0.1, 0.1), 
    secondary: rgb(0.4, 0.4, 0.4),
    accent: rgb(0, 0, 0), // Black
    line: rgb(0.7, 0.7, 0.7),
    darkLine: rgb(0, 0, 0), 
};

// --- HELPERS ---

const loadResources = async () => {
    try {
        const [fontBytes, fontBoldBytes] = await Promise.all([
            fetch(FONT_URL).then(res => res.arrayBuffer()),
            fetch(FONT_BOLD_URL).then(res => res.arrayBuffer())
        ]);
        return { fontBytes, fontBoldBytes };
    } catch (e) {
        console.error("PDF Resource Error:", e);
        throw new Error("Failed to load PDF resources.");
    }
};

const hexToPdfColor = (hex: string) => {
    if (!hex) return COLORS.primary;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ) : COLORS.primary;
};

const drawText = (
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number,
    align: 'left' | 'center' | 'right' = 'left',
    color = COLORS.primary,
    maxWidth?: number,
    isItalic: boolean = false
) => {
    if (!text) return 0;
    const segmentsRaw = text.split(/(\s+|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g);
    const segments = segmentsRaw.filter(s => s !== '');
    const isRTL = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
    const orderedSegments = isRTL ? segments.reverse() : segments;
    const processedSegments = orderedSegments.map(seg => {
        const isArabicSeg = /[\u0600-\u06FF\u0750-\u077F]/.test(seg);
        const content = isArabicSeg ? processArabicText(seg) : seg; 
        const width = font.widthOfTextAtSize(content, size);
        return { content, width, isArabicSeg };
    });
    const totalWidth = processedSegments.reduce((acc, seg) => acc + seg.width, 0);
    let currentX = x;
    if (align === 'center') currentX = x - (totalWidth / 2);
    else if (align === 'right') currentX = x - totalWidth;
    processedSegments.forEach(seg => {
        page.drawText(seg.content, {
            x: currentX,
            y,
            size,
            font,
            color,
            maxWidth,
            ySkew: isItalic ? degrees(15) : undefined
        });
        currentX += seg.width;
    });
    return totalWidth;
};

const drawLine = (page: PDFPage, startX: number, endX: number, y: number, thickness = 1, color = COLORS.line) => {
    page.drawLine({ start: { x: startX, y }, end: { x: endX, y }, thickness, color });
};

const drawDashedLine = (page: PDFPage, startX: number, endX: number, y: number) => {
    page.drawLine({ start: { x: startX, y }, end: { x: endX, y }, thickness: 1, color: COLORS.line, dashArray: [2, 2] });
};

// --- GENERATORS ---

export const generateRxPdf = async (data: ClinicData, patient: Patient, rx: Prescription, currentLang: string) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    const rxConfig = data.settings.rxTemplate?.rxSymbol || { fontSize: 30, color: '#000000', isBold: true, isItalic: true };
    const medsConfig = data.settings.rxTemplate?.medications || { fontSize: 14, color: '#000000', isBold: true, isItalic: false };
    const customTopMargin = data.settings.rxTemplate?.topMargin ?? 100;
    const paperSizeChoice = data.settings.rxTemplate?.paperSize || 'A5';
    const pageDimensions: [number, number] = paperSizeChoice === 'A4' ? [595, 842] : [420, 595];
    const page = pdfDoc.addPage(pageDimensions);
    const { width, height } = page.getSize();
    const margin = 25;
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    let bgImageBase64 = data.settings.rxBackgroundImage;
    if (patient.doctorId) {
        const doc = data.doctors.find(d => d.id === patient.doctorId);
        if (doc && doc.rxBackgroundImage) bgImageBase64 = doc.rxBackgroundImage;
    }
    if (bgImageBase64) {
        try {
            let imageBytes; let imageType;
            if (bgImageBase64.startsWith('data:image/png')) { imageBytes = bgImageBase64; imageType = 'png'; }
            else if (bgImageBase64.startsWith('data:image/jpeg')) { imageBytes = bgImageBase64; imageType = 'jpg'; }
            else { const imgRes = await fetch(bgImageBase64); const imgBlob = await imgRes.blob(); imageBytes = await imgBlob.arrayBuffer(); imageType = imgBlob.type === 'image/png' ? 'png' : 'jpg'; }
            const bgImage = imageType === 'png' ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
            page.drawImage(bgImage, { x: 0, y: 0, width, height });
        } catch (e) { console.error("Failed to load background image", e); }
    }
    let y = height - 40;
    if (!bgImageBase64) {
        drawText(page, data.clinicName, width / 2, y, fontBold, 18, 'center', COLORS.accent);
        y -= 15;
        const docName = data.doctors.find(d => d.id === patient.doctorId)?.name || '';
        if(docName) drawText(page, `Dr. ${docName}`, width / 2, y, fontRegular, 11, 'center', COLORS.secondary);
        y -= 15; drawLine(page, margin, width - margin, y, 1, COLORS.line); y -= 25;
    } else { y = height - customTopMargin; }
    const labelColor = COLORS.accent; const valueColor = COLORS.primary;
    const tName = currentLang === 'ar' ? 'الاسم:' : (currentLang === 'ku' ? 'ناو:' : 'Name:');
    const tAge = currentLang === 'ar' ? 'العمر:' : (currentLang === 'ku' ? 'تەمەن:' : 'Age:');
    const tDate = currentLang === 'ar' ? 'التاريخ:' : (currentLang === 'ku' ? 'بەروار:' : 'Date:');
    const dateStr = new Date(rx.date).toLocaleDateString('en-GB');
    if (isRTL) {
        drawText(page, tName, width - margin, y, fontBold, 12, 'right', labelColor);
        drawText(page, patient.name, width - margin - 40, y, fontBold, 12, 'right', valueColor);
        drawText(page, tAge, width - margin - (paperSizeChoice === 'A4' ? 250 : 190), y, fontBold, 12, 'right', labelColor);
        drawText(page, `${patient.age}`, width - margin - (paperSizeChoice === 'A4' ? 300 : 230), y, fontRegular, 12, 'right', valueColor);
        drawText(page, tDate, margin + 100, y, fontBold, 12, 'right', labelColor); 
        drawText(page, dateStr, margin, y, fontRegular, 12, 'left', valueColor);
    } else {
        drawText(page, tName, margin, y, fontBold, 12, 'left', labelColor);
        drawText(page, patient.name, margin + 50, y, fontBold, 12, 'left', valueColor);
        drawText(page, tAge, margin + (paperSizeChoice === 'A4' ? 230 : 170), y, fontBold, 12, 'left', labelColor);
        drawText(page, `${patient.age}`, margin + (paperSizeChoice === 'A4' ? 280 : 210), y, fontRegular, 12, 'left', valueColor);
        drawText(page, tDate, width - margin - 100, y, fontBold, 12, 'left', labelColor);
        drawText(page, dateStr, width - margin, y, fontRegular, 12, 'right', valueColor);
    }
    y -= 15; drawLine(page, margin, width - margin, y, 1, COLORS.primary); y -= 45;
    const rxFont = rxConfig.isBold ? fontBold : fontRegular;
    page.drawText('RX/', { x: margin, y, size: rxConfig.fontSize || 30, font: rxFont, color: hexToPdfColor(rxConfig.color), ySkew: rxConfig.isItalic ? degrees(15) : undefined });
    y -= 40;
    const medsFont = medsConfig.isBold ? fontBold : fontRegular;
    const medsColor = hexToPdfColor(medsConfig.color);
    const medsSize = medsConfig.fontSize || 14;
    rx.medications.forEach((med, idx) => {
        let currentX = margin; 
        page.drawText(`${idx + 1}.`, { x: currentX, y, size: medsSize, font: fontBold, color: COLORS.accent });
        const numWidth = fontBold.widthOfTextAtSize(`${idx + 1}.`, medsSize);
        currentX += numWidth + 10; 
        drawText(page, med.name, currentX, y, medsFont, medsSize, 'left', medsColor, undefined, medsConfig.isItalic);
        const nameWidth = medsFont.widthOfTextAtSize(med.name, medsSize);
        currentX += (nameWidth > 0 ? nameWidth : med.name.length * (medsSize * 0.5)) + 10; 
        const detailsParts = []; if (med.dose) detailsParts.push(med.dose); if (med.form) detailsParts.push(med.form); if (med.frequency) detailsParts.push(med.frequency);
        const detailsText = detailsParts.join(' - ');
        if (detailsText) drawText(page, detailsText, currentX, y, fontRegular, Math.max(10, medsSize - 2), 'left', COLORS.primary);
        if (med.notes) { y -= (medsSize + 5); drawText(page, `(${med.notes})`, margin + 20, y, fontRegular, Math.max(10, medsSize - 3), 'left', COLORS.secondary); }
        y -= (medsSize * 2.5);
    });
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generatePaymentPdf = async (data: ClinicData, patient: Patient, payment: Payment, t: any) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    const pageWidth = 226; const pageHeight = 500; 
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const centerX = pageWidth / 2; const margin = 10; let y = pageHeight - 30;
    drawText(page, data.clinicName, centerX, y, fontBold, 16, 'center', COLORS.accent);
    y -= 25;
    const printTimeStr = format(new Date(), 'yyyy-MM-dd  HH:mm');
    drawText(page, printTimeStr, centerX, y, fontRegular, 9, 'center', COLORS.secondary);
    y -= 12; drawDashedLine(page, margin, pageWidth - margin, y); y -= 20;
    drawText(page, t.receipt, centerX, y, fontBold, 14, 'center', COLORS.accent);
    y -= 20;
    const isRTL = /[\u0600-\u06FF]/.test(t.name);
    if (isRTL) { drawText(page, t.name, pageWidth - margin, y, fontRegular, 10, 'right', COLORS.secondary); drawText(page, patient.name, margin, y, fontBold, 11, 'left', COLORS.accent); }
    else { drawText(page, t.name, margin, y, fontRegular, 10, 'left', COLORS.secondary); drawText(page, patient.name, pageWidth - margin, y, fontBold, 11, 'right', COLORS.accent); }
    y -= 15; drawLine(page, margin, pageWidth - margin, y, 1, COLORS.line); y -= 20;
    const label = payment.type === 'payment' ? t.paymentReceived : t.treatmentCost;
    const amountStr = `${payment.amount.toLocaleString()} ${data.settings.currency}`;
    drawText(page, label, centerX, y, fontRegular, 12, 'center', COLORS.primary);
    y -= 25; drawText(page, amountStr, centerX, y, fontBold, 20, 'center', COLORS.accent);
    y -= 25; if (payment.description) { drawText(page, `(${payment.description})`, centerX, y, fontRegular, 10, 'center', COLORS.secondary); y -= 20; }
    drawDashedLine(page, margin, pageWidth - margin, y); y -= 20;
    const totalCost = patient.payments.filter(p => p.type === 'charge').reduce((a, c) => a + c.amount, 0);
    const totalPaid = patient.payments.filter(p => p.type === 'payment').reduce((a, c) => a + c.amount, 0);
    const rem = totalCost - totalPaid;
    const drawSummaryRow = (label: string, value: number, isBold = false) => {
        const font = isBold ? fontBold : fontRegular; const color = isBold ? COLORS.accent : COLORS.primary;
        const size = isBold ? 11 : 10; const valStr = `${value.toLocaleString()} ${data.settings.currency}`;
        if (isRTL) { drawText(page, label, pageWidth - margin, y, font, size, 'right', COLORS.secondary); drawText(page, valStr, margin, y, font, size, 'left', color); }
        else { drawText(page, label, margin, y, font, size, 'left', COLORS.secondary); drawText(page, valStr, pageWidth - margin, y, font, size, 'right', color); }
        y -= 16;
    };
    drawSummaryRow(t.totalCost, totalCost); drawSummaryRow(t.totalPaid, totalPaid);
    y -= 5; drawLine(page, margin, pageWidth - margin, y, 0.5, COLORS.line); y -= 15;
    drawSummaryRow(t.remaining, rem, true); y -= 40; 
    drawText(page, t.thankYou, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generateExaminationPdf = async (data: ClinicData, patient: Patient, examination: Examination, t: any) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    const pageWidth = 226; const pageHeight = 400; 
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const centerX = pageWidth / 2; const margin = 10; let y = pageHeight - 30;
    
    drawText(page, data.clinicName, centerX, y, fontBold, 16, 'center', COLORS.accent);
    y -= 25;
    const printTimeStr = format(new Date(), 'yyyy-MM-dd  HH:mm');
    drawText(page, printTimeStr, centerX, y, fontRegular, 9, 'center', COLORS.secondary);
    y -= 12; drawDashedLine(page, margin, pageWidth - margin, y); y -= 20;
    
    drawText(page, t.examinationReceipt, centerX, y, fontBold, 14, 'center', COLORS.accent);
    y -= 20;
    
    const isRTL = /[\u0600-\u06FF]/.test(t.name);
    if (isRTL) {
        drawText(page, t.name, pageWidth - margin, y, fontRegular, 10, 'right', COLORS.secondary);
        drawText(page, patient.name, margin, y, fontBold, 11, 'left', COLORS.accent);
    } else {
        drawText(page, t.name, margin, y, fontRegular, 10, 'left', COLORS.secondary);
        drawText(page, patient.name, pageWidth - margin, y, fontBold, 11, 'right', COLORS.accent);
    }
    y -= 15; drawLine(page, margin, pageWidth - margin, y, 1, COLORS.line); y -= 20;
    
    drawText(page, examination.description || t.checkup, centerX, y, fontRegular, 12, 'center', COLORS.primary);
    y -= 25;
    drawText(page, `${examination.amount.toLocaleString()} ${data.settings.currency}`, centerX, y, fontBold, 22, 'center', COLORS.accent);
    y -= 30;
    
    drawDashedLine(page, margin, pageWidth - margin, y);
    y -= 40;
    
    if (data.settings.clinicPhone) {
        drawText(page, `Tel: ${data.settings.clinicPhone}`, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
        y -= 15;
    }
    
    drawText(page, t.thankYou, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generateAppointmentPdf = async (data: ClinicData, appointment: Appointment, t: any) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    const pageWidth = 226; const pageHeight = 400; 
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const centerX = pageWidth / 2; const margin = 15; let y = pageHeight - 30;
    drawText(page, data.clinicName, centerX, y, fontBold, 15, 'center', COLORS.accent);
    y -= 25; drawText(page, t.appointmentTicket, centerX, y, fontBold, 14, 'center', COLORS.primary);
    y -= 15; drawDashedLine(page, margin, pageWidth - margin, y); y -= 20;
    const apptDate = new Date(appointment.date); const dateStr = apptDate.toLocaleDateString();
    let timeStr = appointment.time;
    try { const [h, m] = appointment.time.split(':'); let hours = parseInt(h); const ampm = hours >= 12 ? 'PM' : 'AM'; hours = hours % 12; hours = hours ? hours : 12; timeStr = `${hours}:${m} ${ampm}`; } catch (e) {}
    drawText(page, t.name, centerX, y, fontBold, 11, 'center', COLORS.secondary); y -= 22; 
    drawText(page, appointment.patientName, centerX, y, fontBold, 14, 'center', COLORS.accent); y -= 25;
    drawText(page, t.date, centerX, y, fontBold, 11, 'center', COLORS.secondary); y -= 22; 
    drawText(page, dateStr, centerX, y, fontBold, 16, 'center', COLORS.accent); y -= 25;
    drawText(page, t.time, centerX, y, fontBold, 11, 'center', COLORS.secondary); y -= 22; 
    drawText(page, timeStr, centerX, y, fontBold, 18, 'center', COLORS.accent); y -= 25;
    drawLine(page, margin, pageWidth - margin, y, 1, COLORS.line); y -= 20;
    if (data.settings.clinicPhone) { drawText(page, `Tel: ${data.settings.clinicPhone}`, centerX, y, fontRegular, 10, 'center', COLORS.secondary); y -= 15; }
    drawText(page, t.arriveEarlyNote, centerX, y, fontRegular, 9, 'center', COLORS.secondary, pageWidth - 20);
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generateDocumentPdf = async (data: ClinicData, patient: Patient, doc: { type: 'consent' | 'instructions', text: string, align: 'left'|'center'|'right', fontSize: number, topMargin: number }, t: any) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    const isA4 = doc.type === 'consent';
    const page = pdfDoc.addPage(isA4 ? [595, 842] : [420, 595]); 
    const { width, height } = page.getSize(); const margin = 30; 
    const bgImageStr = isA4 ? data.settings.consentBackgroundImage : data.settings.instructionsBackgroundImage;
    if (bgImageStr) {
        try {
             let imageBytes; let isPng = false;
             if (bgImageStr.startsWith('data:')) { imageBytes = bgImageStr; isPng = bgImageStr.includes('png'); }
             else { const res = await fetch(bgImageStr); const blob = await res.blob(); imageBytes = await blob.arrayBuffer(); isPng = blob.type === 'image/png'; }
             const bg = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
             page.drawImage(bg, { x: 0, y: 0, width, height });
        } catch (e) { console.error(e); }
    }
    let y = height - 40;
    if (!bgImageStr) {
        drawText(page, data.clinicName, width / 2, y, fontBold, 18, 'center', COLORS.accent);
        y -= 15; const docName = data.doctors.find(d => d.id === patient.doctorId)?.name || '';
        if(docName) drawText(page, `Dr. ${docName}`, width / 2, y, fontRegular, 11, 'center', COLORS.secondary);
        y -= 15; drawLine(page, margin, width - margin, y, 1, COLORS.line); y -= 25;
    } else { y = height - (doc.topMargin || 130); }
    const currentLang = data.settings.language || 'ar'; 
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const labelColor = COLORS.accent; const valueColor = COLORS.primary;
    const tName = currentLang === 'ar' ? 'الاسم:' : (currentLang === 'ku' ? 'ناو:' : 'Name:');
    const tAge = currentLang === 'ar' ? 'العمر:' : (currentLang === 'ku' ? 'تەمەن:' : 'Age:');
    const tDate = currentLang === 'ar' ? 'التاريخ:' : (currentLang === 'ku' ? 'بەروار:' : 'Date:');
    const dateStr = new Date().toLocaleDateString('en-GB');
    if (isRTL) {
        drawText(page, tName, width - margin, y, fontBold, 14, 'right', labelColor);
        drawText(page, patient.name, width - margin - 50, y, fontBold, 14, 'right', valueColor);
        if (doc.type === 'consent') { drawText(page, tAge, width - margin - 230, y, fontBold, 14, 'right', labelColor); drawText(page, `${patient.age}`, width - margin - 280, y, fontRegular, 14, 'right', valueColor); }
        drawText(page, tDate, margin + 110, y, fontBold, 14, 'right', labelColor); drawText(page, dateStr, margin, y, fontRegular, 14, 'left', valueColor);
    } else {
        drawText(page, tName, margin, y, fontBold, 14, 'left', labelColor);
        if (doc.type === 'consent') { drawText(page, patient.name, margin + 50, y, fontBold, 14, 'left', valueColor); drawText(page, tAge, margin + 250, y, fontBold, 14, 'left', labelColor); drawText(page, `${patient.age}`, margin + 290, y, fontRegular, 14, 'left', valueColor); drawText(page, tDate, width - margin - 120, y, fontBold, 14, 'left', labelColor); drawText(page, dateStr, width - margin, y, fontRegular, 14, 'right', valueColor); }
        else { drawText(page, patient.name, margin + 40, y, fontBold, 14, 'left', valueColor); drawText(page, tDate, width - margin - 100, y, fontBold, 14, 'left', labelColor); drawText(page, dateStr, width - margin, y, fontRegular, 14, 'right', valueColor); }
    }
    y -= 15; drawLine(page, margin, width - margin, y, 1, COLORS.primary); y -= 30;
    const lines = doc.text.split('\n'); const align = doc.align || 'right'; const fontSize = doc.fontSize || 12;
    lines.forEach(line => {
        if (line.trim()) { drawText(page, line, align === 'center' ? width/2 : (align === 'right' ? width - margin : margin), y, fontRegular, fontSize, align, COLORS.primary, width - (margin * 2)); y -= (fontSize * 1.5); }
        else { y -= fontSize; }
        if (y < margin) { y = height - margin; drawText(page, '...', width/2, margin, fontRegular, 12, 'center'); }
    });
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};
