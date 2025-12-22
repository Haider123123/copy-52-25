
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ClinicData, Patient, Prescription, Payment, Appointment } from '../types';
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

// Helper to draw text with alignment and RTL support by drawing COMPONENTS individually
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
    isItalic: boolean = false // Added parameter for simulating Italic
) => {
    if (!text) return 0;

    // 1. Tokenize text into segments
    const segmentsRaw = text.split(/(\s+|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g);
    const segments = segmentsRaw.filter(s => s !== '');

    // 2. Check direction context
    const isRTL = /[\u0600-\u06FF\u0750-\u077F]/.test(text);

    // 3. Reorder segments for RTL rendering
    const orderedSegments = isRTL ? segments.reverse() : segments;

    // 4. Calculate Total Width for Alignment
    const processedSegments = orderedSegments.map(seg => {
        const isArabicSeg = /[\u0600-\u06FF\u0750-\u077F]/.test(seg);
        const content = isArabicSeg ? processArabicText(seg) : seg; 
        const width = font.widthOfTextAtSize(content, size);
        return { content, width, isArabicSeg };
    });

    const totalWidth = processedSegments.reduce((acc, seg) => acc + seg.width, 0);

    // 5. Determine Start X based on alignment
    let currentX = x;
    if (align === 'center') currentX = x - (totalWidth / 2);
    else if (align === 'right') currentX = x - totalWidth;

    // 6. Draw each segment individually
    processedSegments.forEach(seg => {
        page.drawText(seg.content, {
            x: currentX,
            y,
            size,
            font,
            color,
            maxWidth,
            ySkew: isItalic ? degrees(15) : undefined // Apply ySkew (slant) to simulate italic (Faux Italic)
        });
        currentX += seg.width;
    });
    
    return totalWidth;
};

const drawLine = (page: PDFPage, startX: number, endX: number, y: number, thickness = 1, color = COLORS.line) => {
    page.drawLine({
        start: { x: startX, y },
        end: { x: endX, y },
        thickness,
        color,
    });
};

const drawDashedLine = (page: PDFPage, startX: number, endX: number, y: number) => {
    page.drawLine({
        start: { x: startX, y },
        end: { x: endX, y },
        thickness: 1,
        color: COLORS.line,
        dashArray: [2, 2],
    });
};

// --- GENERATORS ---

export const generateRxPdf = async (data: ClinicData, patient: Patient, rx: Prescription, currentLang: string) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    
    // Load config from data or use defaults
    const rxConfig = data.settings.rxTemplate?.rxSymbol || { fontSize: 30, color: '#000000', isBold: true, isItalic: true };
    const medsConfig = data.settings.rxTemplate?.medications || { fontSize: 14, color: '#000000', isBold: true, isItalic: false };

    const page = pdfDoc.addPage([420, 595]); // A5 Size
    const { width, height } = page.getSize();
    const margin = 25;
    const isRTL = currentLang === 'ar' || currentLang === 'ku';

    // 1. Determine Background Image (Doctor Specific vs Global)
    let bgImageBase64 = data.settings.rxBackgroundImage;
    if (patient.doctorId) {
        const doc = data.doctors.find(d => d.id === patient.doctorId);
        if (doc && doc.rxBackgroundImage) {
            bgImageBase64 = doc.rxBackgroundImage;
        }
    }

    if (bgImageBase64) {
        try {
            let imageBytes;
            let imageType;
            if (bgImageBase64.startsWith('data:image/png')) {
                imageBytes = bgImageBase64;
                imageType = 'png';
            } else if (bgImageBase64.startsWith('data:image/jpeg')) {
                imageBytes = bgImageBase64;
                imageType = 'jpg';
            } else {
                const imgRes = await fetch(bgImageBase64);
                const imgBlob = await imgRes.blob();
                imageBytes = await imgBlob.arrayBuffer();
                imageType = imgBlob.type === 'image/png' ? 'png' : 'jpg';
            }
            const bgImage = imageType === 'png' ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
            page.drawImage(bgImage, { x: 0, y: 0, width, height });
        } catch (e) {
            console.error("Failed to load background image", e);
        }
    }

    // 2. Header Content
    let y = height - 40;
    
    if (!bgImageBase64) {
        drawText(page, data.clinicName, width / 2, y, fontBold, 18, 'center', COLORS.accent);
        y -= 15;
        const docName = data.doctors.find(d => d.id === patient.doctorId)?.name || '';
        if(docName) {
            drawText(page, `Dr. ${docName}`, width / 2, y, fontRegular, 11, 'center', COLORS.secondary);
        }
        y -= 15;
        drawLine(page, margin, width - margin, y, 1, COLORS.line);
        y -= 25;
    } else {
        y = height - 130; 
    }

    // 3. Patient Info
    const labelColor = COLORS.accent; 
    const valueColor = COLORS.primary;
    const labelSize = 12;
    const valueSize = 12;
    
    const tName = currentLang === 'ar' ? 'الاسم:' : (currentLang === 'ku' ? 'ناو:' : 'Name:');
    const tAge = currentLang === 'ar' ? 'العمر:' : (currentLang === 'ku' ? 'تەمەن:' : 'Age:');
    const tDate = currentLang === 'ar' ? 'التاريخ:' : (currentLang === 'ku' ? 'بەروار:' : 'Date:');
    const dateStr = new Date(rx.date).toLocaleDateString('en-GB');

    if (isRTL) {
        // Name (Right)
        drawText(page, tName, width - margin, y, fontBold, labelSize, 'right', labelColor);
        drawText(page, patient.name, width - margin - 40, y, fontBold, valueSize, 'right', valueColor);
        
        // Age (Middle - Shifted Right)
        drawText(page, tAge, width - margin - 190, y, fontBold, labelSize, 'right', labelColor);
        drawText(page, `${patient.age}`, width - margin - 230, y, fontRegular, valueSize, 'right', valueColor);

        // Date (Left - Increased Space to 100)
        drawText(page, tDate, margin + 100, y, fontBold, labelSize, 'right', labelColor); 
        drawText(page, dateStr, margin, y, fontRegular, valueSize, 'left', valueColor);
    } else {
        // Name (Left)
        drawText(page, tName, margin, y, fontBold, labelSize, 'left', labelColor);
        drawText(page, patient.name, margin + 50, y, fontBold, valueSize, 'left', valueColor);
        
        // Age (Middle - Shifted further left to avoid overlap with Date)
        drawText(page, tAge, margin + 170, y, fontBold, labelSize, 'left', labelColor);
        drawText(page, `${patient.age}`, margin + 210, y, fontRegular, valueSize, 'left', valueColor);

        // Date (Right)
        drawText(page, tDate, width - margin - 100, y, fontBold, labelSize, 'left', labelColor);
        drawText(page, dateStr, width - margin, y, fontRegular, valueSize, 'right', valueColor);
    }

    y -= 15;
    // Always draw separator line
    drawLine(page, margin, width - margin, y, 1, COLORS.primary);
    y -= 45;
    
    // RX Symbol - Using Dynamic Config
    const rxFont = rxConfig.isBold ? fontBold : fontRegular;
    
    // Apply ySkew manually for the raw drawText call if italic
    page.drawText('RX/', { 
        x: margin, 
        y, 
        size: rxConfig.fontSize || 30, 
        font: rxFont, 
        color: hexToPdfColor(rxConfig.color),
        ySkew: rxConfig.isItalic ? degrees(15) : undefined
    });
    
    y -= 40;

    // 4. Medications - Using Dynamic Config
    const medsFont = medsConfig.isBold ? fontBold : fontRegular;
    const medsColor = hexToPdfColor(medsConfig.color);
    const medsSize = medsConfig.fontSize || 14;

    rx.medications.forEach((med, idx) => {
        let currentX = margin; 

        // 1. Bullet Number
        page.drawText(`${idx + 1}.`, { x: currentX, y, size: medsSize, font: fontBold, color: COLORS.accent });
        const numWidth = fontBold.widthOfTextAtSize(`${idx + 1}.`, medsSize);
        currentX += numWidth + 10; 

        // 2. Drug Name (Applied Custom Style)
        // Note: Passing medsConfig.isItalic to the helper
        drawText(page, med.name, currentX, y, medsFont, medsSize, 'left', medsColor, undefined, medsConfig.isItalic);
        
        // Calculate width to position next elements
        const nameWidth = medsFont.widthOfTextAtSize(med.name, medsSize);
        // Simple heuristic for mixed arabic/english width
        const estimatedNameWidth = nameWidth > 0 ? nameWidth : med.name.length * (medsSize * 0.5); 
        currentX += estimatedNameWidth + 10; 

        // 3. Details
        const detailsParts = [];
        if (med.dose) detailsParts.push(med.dose);
        if (med.form) detailsParts.push(med.form);
        if (med.frequency) detailsParts.push(med.frequency);
        
        const detailsText = detailsParts.join(' - ');
        if (detailsText) {
            // Details usually kept slightly smaller or standard black for readability, but can follow config if desired.
            // For now, keeping details standard to differentiate from drug name
            drawText(page, detailsText, currentX, y, fontRegular, Math.max(10, medsSize - 2), 'left', COLORS.primary);
        }

        if (med.notes) {
            y -= (medsSize + 5);
            drawText(page, `(${med.notes})`, margin + 20, y, fontRegular, Math.max(10, medsSize - 3), 'left', COLORS.secondary);
        }
        y -= (medsSize * 2.5); // Dynamic spacing based on font size
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

    // Standard 80mm Thermal Receipt width is ~226 pts
    const pageWidth = 226;
    // Estimate height based on content
    const pageHeight = 500; 
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    const centerX = pageWidth / 2;
    const margin = 10;
    let y = pageHeight - 30;

    // --- Header ---
    drawText(page, data.clinicName, centerX, y, fontBold, 16, 'center', COLORS.accent);
    y -= 18;
    if(data.settings.clinicPhone) {
        drawText(page, data.settings.clinicPhone, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
        y -= 15;
    }
    // Change: Use payment date instead of current date
    const paymentDateStr = format(new Date(payment.date), 'yyyy-MM-dd  HH:mm');
    drawText(page, paymentDateStr, centerX, y, fontRegular, 9, 'center', COLORS.secondary);
    y -= 12;
    
    drawDashedLine(page, margin, pageWidth - margin, y);
    y -= 20;

    // --- Title ---
    drawText(page, t.receipt, centerX, y, fontBold, 14, 'center', COLORS.accent);
    y -= 20;

    // --- Patient Info ---
    const isRTL = /[\u0600-\u06FF]/.test(t.name);
    
    if (isRTL) {
        drawText(page, t.name, pageWidth - margin, y, fontRegular, 10, 'right', COLORS.secondary);
        drawText(page, patient.name, margin, y, fontBold, 11, 'left', COLORS.accent);
    } else {
        drawText(page, t.name, margin, y, fontRegular, 10, 'left', COLORS.secondary);
        drawText(page, patient.name, pageWidth - margin, y, fontBold, 11, 'right', COLORS.accent);
    }
    y -= 15;

    drawLine(page, margin, pageWidth - margin, y, 1, COLORS.line);
    y -= 20;

    // --- Transaction Details (Centered) ---
    const label = payment.type === 'payment' ? t.paymentReceived : t.treatmentCost;
    const amountStr = `${payment.amount.toLocaleString()} ${data.settings.currency}`;
    
    // Change: Centered and stacked
    drawText(page, label, centerX, y, fontRegular, 12, 'center', COLORS.primary);
    y -= 25;
    drawText(page, amountStr, centerX, y, fontBold, 20, 'center', COLORS.accent);
    y -= 25;

    if (payment.description) {
        drawText(page, `(${payment.description})`, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
        y -= 20;
    }

    drawDashedLine(page, margin, pageWidth - margin, y);
    y -= 20;

    // --- Financial Summary ---
    const totalCost = patient.payments.filter(p => p.type === 'charge').reduce((a, c) => a + c.amount, 0);
    const totalPaid = patient.payments.filter(p => p.type === 'payment').reduce((a, c) => a + c.amount, 0);
    const rem = totalCost - totalPaid;

    const rowSpace = 16;

    // Helper for summary rows
    const drawSummaryRow = (label: string, value: number, isBold = false) => {
        const font = isBold ? fontBold : fontRegular;
        const color = isBold ? COLORS.accent : COLORS.primary;
        const size = isBold ? 11 : 10;
        const valStr = `${value.toLocaleString()} ${data.settings.currency}`;

        if (isRTL) {
            drawText(page, label, pageWidth - margin, y, font, size, 'right', COLORS.secondary);
            drawText(page, valStr, margin, y, font, size, 'left', color);
        } else {
            drawText(page, label, margin, y, font, size, 'left', COLORS.secondary);
            drawText(page, valStr, pageWidth - margin, y, font, size, 'right', color);
        }
        y -= rowSpace;
    };

    drawSummaryRow(t.totalCost, totalCost);
    drawSummaryRow(t.totalPaid, totalPaid);
    
    y -= 5;
    drawLine(page, margin, pageWidth - margin, y, 0.5, COLORS.line);
    y -= 15;
    
    // Remaining Balance (Prominent)
    drawSummaryRow(t.remaining, rem, true);

    y -= 30;
    
    // --- Footer ---
    drawText(page, t.thankYou, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
    y -= 12;
    drawText(page, '*** Dentro Clinic App ***', centerX, y, fontRegular, 8, 'center', rgb(0.7, 0.7, 0.7));

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generateAppointmentPdf = async (data: ClinicData, appointment: Appointment, t: any) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const pageWidth = 226;
    const pageHeight = 400; // Smaller height for tickets
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const centerX = pageWidth / 2;
    const margin = 15;
    let y = pageHeight - 30;

    // Header
    drawText(page, data.clinicName, centerX, y, fontBold, 15, 'center', COLORS.accent);
    y -= 25;
    
    // Title (No Box)
    drawText(page, t.appointmentTicket, centerX, y, fontBold, 14, 'center', COLORS.primary);
    y -= 15;

    // Line
    drawDashedLine(page, margin, pageWidth - margin, y);
    y -= 20;

    // Formatting Values
    const apptDate = new Date(appointment.date);
    const dateStr = apptDate.toLocaleDateString();
    
    let timeStr = appointment.time;
    try {
        const [h, m] = appointment.time.split(':');
        let hours = parseInt(h);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        timeStr = `${hours}:${m} ${ampm}`;
    } catch (e) { /* fallback */ }

    // Patient
    drawText(page, t.name, centerX, y, fontBold, 11, 'center', COLORS.secondary);
    y -= 22; // Increased spacing
    drawText(page, appointment.patientName, centerX, y, fontBold, 14, 'center', COLORS.accent);
    y -= 25;

    // Date
    drawText(page, t.date, centerX, y, fontBold, 11, 'center', COLORS.secondary);
    y -= 22; // Increased spacing
    drawText(page, dateStr, centerX, y, fontBold, 16, 'center', COLORS.accent);
    y -= 25;

    // Time
    drawText(page, t.time, centerX, y, fontBold, 11, 'center', COLORS.secondary);
    y -= 22; // Increased spacing
    drawText(page, timeStr, centerX, y, fontBold, 18, 'center', COLORS.accent);
    y -= 25;

    drawLine(page, margin, pageWidth - margin, y, 1, COLORS.line);
    y -= 20;
    
    // Notes / Footer
    if (data.settings.clinicPhone) {
        drawText(page, `Tel: ${data.settings.clinicPhone}`, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
        y -= 15;
    }
    
    const note = t.arriveEarlyNote;
    drawText(page, note, centerX, y, fontRegular, 9, 'center', COLORS.secondary, pageWidth - 20);

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generateDocumentPdf = async (data: ClinicData, patient: Patient, doc: { type: 'consent' | 'instructions', text: string, align: any, fontSize: number }, t: any) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const isA4 = doc.type === 'consent';
    const page = pdfDoc.addPage(isA4 ? [595, 842] : [420, 595]); 
    const { width, height } = page.getSize();
    const margin = 30; // Closer to Rx margin

    const bgImageStr = isA4 ? data.settings.consentBackgroundImage : data.settings.instructionsBackgroundImage;
    if (bgImageStr) {
        try {
             let imageBytes;
             let isPng = false;
             if (bgImageStr.startsWith('data:')) {
                 imageBytes = bgImageStr;
                 isPng = bgImageStr.includes('png');
             } else {
                 const res = await fetch(bgImageStr);
                 const blob = await res.blob();
                 imageBytes = await blob.arrayBuffer();
                 isPng = blob.type === 'image/png';
             }
             const bg = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
             page.drawImage(bg, { x: 0, y: 0, width, height });
        } catch (e) {
            console.error(e);
        }
    }

    let y = height - 40;

    // 1. Clinic Header (Similar to Rx if no BG)
    if (!bgImageStr) {
        drawText(page, data.clinicName, width / 2, y, fontBold, 18, 'center', COLORS.accent);
        y -= 15;
        const docName = data.doctors.find(d => d.id === patient.doctorId)?.name || '';
        if(docName) {
            drawText(page, `Dr. ${docName}`, width / 2, y, fontRegular, 11, 'center', COLORS.secondary);
        }
        y -= 15;
        drawLine(page, margin, width - margin, y, 1, COLORS.line);
        y -= 25;
    } else {
        y = height - 130;
    }

    // 2. Patient Information (Exactly like Rx but larger font)
    // PROTECTED LOCAL LANG: Use logic from calling environment
    const currentLang = data.settings.language || 'ar'; 
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const labelColor = COLORS.accent;
    const valueColor = COLORS.primary;
    
    // Separate Font Sizes for Consent vs Instructions
    const labelSize = doc.type === 'consent' ? 14 : 12;
    const valueSize = doc.type === 'consent' ? 14 : 12;

    const tName = currentLang === 'ar' ? 'الاسم:' : (currentLang === 'ku' ? 'ناو:' : 'Name:');
    const tAge = currentLang === 'ar' ? 'العمر:' : (currentLang === 'ku' ? 'تەمەن:' : 'Age:');
    const tDate = currentLang === 'ar' ? 'التاريخ:' : (currentLang === 'ku' ? 'بەروار:' : 'Date:');
    const dateStr = new Date().toLocaleDateString('en-GB');

    if (isRTL) {
        // Name (Right)
        drawText(page, tName, width - margin, y, fontBold, labelSize, 'right', labelColor);
        drawText(page, patient.name, width - margin - 50, y, fontBold, valueSize, 'right', valueColor);
        
        if (doc.type === 'consent') {
            // Age (Middle - Shifted further Left for better spacing)
            drawText(page, tAge, width - margin - 230, y, fontBold, labelSize, 'right', labelColor);
            drawText(page, `${patient.age}`, width - margin - 280, y, fontRegular, valueSize, 'right', valueColor);
        }

        // Date (Left) - Adjusted gap to 110 as requested
        drawText(page, tDate, margin + 110, y, fontBold, labelSize, 'right', labelColor); 
        drawText(page, dateStr, margin, y, fontRegular, valueSize, 'left', valueColor);
    } else {
        // Name (Left)
        drawText(page, tName, margin, y, fontBold, labelSize, 'left', labelColor);
        
        if (doc.type === 'consent') {
            // Consent Form (A4) - Wider space, existing layout logic
            drawText(page, patient.name, margin + 50, y, fontBold, valueSize, 'left', valueColor);
            
            drawText(page, tAge, margin + 250, y, fontBold, labelSize, 'left', labelColor);
            drawText(page, `${patient.age}`, margin + 290, y, fontRegular, valueSize, 'left', valueColor);

            drawText(page, tDate, width - margin - 120, y, fontBold, labelSize, 'left', labelColor);
            drawText(page, dateStr, width - margin, y, fontRegular, valueSize, 'right', valueColor);
        } else {
            // Instructions (A5) - Narrower space, NO AGE
            drawText(page, patient.name, margin + 40, y, fontBold, valueSize, 'left', valueColor);

            // Date (Right) - Allocated 100 space
            drawText(page, tDate, width - margin - 100, y, fontBold, labelSize, 'left', labelColor);
            drawText(page, dateStr, width - margin, y, fontRegular, valueSize, 'right', valueColor);
        }
    }

    y -= 15;
    // Always draw separator line under patient info
    drawLine(page, margin, width - margin, y, 1, COLORS.primary);
    y -= 30;

    // 3. Document Body
    const lines = doc.text.split('\n');
    const align = doc.align || 'right';
    const fontSize = doc.fontSize || 12;
    
    lines.forEach(line => {
        if (line.trim()) {
            drawText(page, line, align === 'center' ? width/2 : (align === 'right' ? width - margin : margin), y, fontRegular, fontSize, align, COLORS.primary, width - (margin * 2));
            y -= (fontSize * 1.5);
        } else {
            y -= fontSize;
        }
        
        if (y < margin) {
            y = height - margin; 
            drawText(page, '...', width/2, margin, fontRegular, 12, 'center');
        }
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};
