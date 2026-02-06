
import { PDFDocument, rgb, PDFFont, PDFPage, degrees } from 'pdf-lib';
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
    accent: rgb(0, 0, 0),
    line: rgb(0.7, 0.7, 0.7),
    darkLine: rgb(0, 0, 0), 
};

// --- HELPERS ---

// Helper function to create Blob from PDF bytes
const createPdfBlob = (pdfBytes: Uint8Array): Blob => {
    return new Blob([pdfBytes.slice().buffer], { type: 'application/pdf' });
};

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
    const result = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
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
    _maxWidth?: number,
    isItalic: boolean = false
) => {
    if (!text) return 0;
    
    const segmentsRaw = text.split(/(\s+|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g);
    const segments = segmentsRaw.filter(s => s !== '');
    const isRTL = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
    
    const orderedSegments = isRTL ? [...segments].reverse() : segments;
    const processedSegments = orderedSegments.map(seg => {
        const isArabicSeg = /[\u0600-\u06FF\u0750-\u077F]/.test(seg);
        const content = isArabicSeg ? processArabicText(seg) : seg; 
        const width = font.widthOfTextAtSize(content, size);
        return { content, width };
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
            ySkew: isItalic ? degrees(15) : undefined
        });
        currentX += seg.width;
    });
    
    return totalWidth;
};

const drawLine = (page: PDFPage, startX: number, endX: number, y: number, thickness = 1, color = COLORS.line, isDashed = false) => {
    page.drawLine({ start: { x: startX, y }, end: { x: endX, y }, thickness, color, dashArray: isDashed ? [thickness * 2, thickness * 2] : undefined });
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
    
    const s = data.settings.rxTemplate;
    const rxConfig = s?.rxSymbol || { fontSize: 30, color: '#000000', isBold: true, isItalic: true };
    const medsConfig = s?.medications || { fontSize: 14, color: '#000000', isBold: true, isItalic: false };
    const headerInfoConfig = s?.headerInfo || { fontSize: 12, color: '#000000', isBold: true, isItalic: false };
    const headerLineConfig = s?.headerLine || { color: '#000000', thickness: 1, style: 'solid' };
    
    const customTopMargin = s?.topMargin ?? 100;
    const paperSizeChoice = s?.paperSize || 'A5';
    
    const pageDimensions: [number, number] = paperSizeChoice === 'A4' ? [595, 842] : [420, 595];
    const page = pdfDoc.addPage(pageDimensions);
    const { width, height } = page.getSize();
    const margin = 25;
    const labelPadding = 8;
    const isRTL = currentLang === 'ar' || currentLang === 'ku';

    let bgImageBase64 = data.settings.rxBackgroundImage;
    if (patient.doctorId) {
        const doc = data.doctors.find(d => d.id === patient.doctorId);
        if (doc && doc.rxBackgroundImage) bgImageBase64 = doc.rxBackgroundImage;
    }

    if (bgImageBase64) {
        try {
            if (bgImageBase64.startsWith('data:application/pdf')) {
                // Handle PDF Background
                const pdfBase64 = bgImageBase64.split(',')[1];
                const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
                const bgPdf = await PDFDocument.load(pdfBytes);
                const [bgPage] = await pdfDoc.embedPdf(bgPdf, [0]); // Embed first page
                page.drawPage(bgPage, { x: 0, y: 0, width, height });
            } else {
                // Handle Image Background
                let imageBytes; let imageType;
                if (bgImageBase64.startsWith('data:image/png')) { imageBytes = bgImageBase64; imageType = 'png'; }
                else if (bgImageBase64.startsWith('data:image/jpeg')) { imageBytes = bgImageBase64; imageType = 'jpg'; }
                else { 
                    const imgRes = await fetch(bgImageBase64); 
                    const imgBlob = await imgRes.blob(); 
                    imageBytes = await imgBlob.arrayBuffer(); 
                    imageType = imgBlob.type === 'image/png' ? 'png' : 'jpg'; 
                }
                const bgImage = imageType === 'png' ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
                page.drawImage(bgImage, { x: 0, y: 0, width, height });
            }
        } catch (e) { 
            console.error("Failed to load background", e); 
        }
    }

    let y = height - customTopMargin;
    
    const tName = currentLang === 'ar' ? 'الاسم:' : (currentLang === 'ku' ? 'ناو:' : 'Name:');
    const tAge = currentLang === 'ar' ? 'العمر:' : (currentLang === 'ku' ? 'تەمەن:' : 'Age:');
    const tDate = currentLang === 'ar' ? 'التاريخ:' : (currentLang === 'ku' ? 'بەروار:' : 'Date:');
    const dateStr = new Date(rx.date).toLocaleDateString('en-GB');

    const headerFont = headerInfoConfig.isBold ? fontBold : fontRegular;
    const headerColor = hexToPdfColor(headerInfoConfig.color);
    const headerSize = headerInfoConfig.fontSize || 12;

    const tNameWidth = headerFont.widthOfTextAtSize(processArabicText(tName), headerSize);
    const tAgeWidth = headerFont.widthOfTextAtSize(processArabicText(tAge), headerSize);

    if (isRTL) {
        drawText(page, tName, width - margin, y, headerFont, headerSize, 'right', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, patient.name, width - margin - tNameWidth - labelPadding, y, headerFont, headerSize, 'right', headerColor, undefined, headerInfoConfig.isItalic);
        const ageX = width - margin - (paperSizeChoice === 'A4' ? 250 : 190);
        drawText(page, tAge, ageX, y, headerFont, headerSize, 'right', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, `${patient.age}`, ageX - tAgeWidth - labelPadding, y, headerFont, headerSize, 'right', headerColor, undefined, headerInfoConfig.isItalic);
        const dateValueWidth = headerFont.widthOfTextAtSize(dateStr, headerSize);
        drawText(page, dateStr, margin, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, tDate, margin + dateValueWidth + labelPadding, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
    } else {
        drawText(page, tName, margin, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, patient.name, margin + tNameWidth + labelPadding, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
        const ageX = margin + (paperSizeChoice === 'A4' ? 230 : 170);
        drawText(page, tAge, ageX, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, `${patient.age}`, ageX + tAgeWidth + labelPadding, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, tDate, width - margin - 100, y, headerFont, headerSize, 'left', headerColor, undefined, headerInfoConfig.isItalic);
        drawText(page, dateStr, width - margin, y, headerFont, headerSize, 'right', headerColor, undefined, headerInfoConfig.isItalic);
    }

    y -= 15; 
    drawLine(page, margin, width - margin, y, headerLineConfig.thickness || 1, hexToPdfColor(headerLineConfig.color), headerLineConfig.style === 'dashed'); 
    y -= 45;

    const rxFont = rxConfig.isBold ? fontBold : fontRegular;
    page.drawText('RX/', { x: margin, y, size: rxConfig.fontSize || 30, font: rxFont, color: hexToPdfColor(rxConfig.color), ySkew: rxConfig.isItalic ? degrees(15) : undefined });
    y -= 40;

    const medsFont = medsConfig.isBold ? fontBold : fontRegular;
    const medsColor = hexToPdfColor(medsConfig.color);
    const medsSize = medsConfig.fontSize || 14;

    rx.medications.forEach((med, idx) => {
        let currentX = margin; 
        const indexText = `${idx + 1}.`;
        page.drawText(indexText, { x: currentX, y, size: medsSize, font: fontBold, color: COLORS.accent });
        const numWidth = fontBold.widthOfTextAtSize(indexText, medsSize);
        currentX += numWidth + 10; 

        const detailsParts = []; 
        if (med.dose) detailsParts.push(med.dose); 
        if (med.form) detailsParts.push(med.form); 
        if (med.frequency) detailsParts.push(med.frequency);
        const detailsText = detailsParts.join(' - ');
        const detailsSize = Math.max(10, medsSize - 2);

        const nameWidth = medsFont.widthOfTextAtSize(med.name, medsSize);
        const detailsWidth = detailsText ? fontRegular.widthOfTextAtSize(detailsText, detailsSize) : 0;
        const availableWidth = width - margin - currentX;

        if (nameWidth + detailsWidth + 15 > availableWidth) {
            drawText(page, med.name, currentX, y, medsFont, medsSize, 'left', medsColor, undefined, medsConfig.isItalic);
            y -= (medsSize + 5);
            if (detailsText) {
                drawText(page, detailsText, currentX + 15, y, fontRegular, detailsSize, 'left', COLORS.primary);
            }
        } else {
            drawText(page, med.name, currentX, y, medsFont, medsSize, 'left', medsColor, undefined, medsConfig.isItalic);
            if (detailsText) {
                drawText(page, detailsText, currentX + nameWidth + 15, y, fontRegular, detailsSize, 'left', COLORS.primary);
            }
        }

        if (med.notes) { 
            y -= (medsSize + 5); 
            drawText(page, `(${med.notes})`, currentX + 15, y, fontRegular, Math.max(10, medsSize - 3), 'left', COLORS.secondary); 
        }

        y -= (medsSize * 2.2);

        if (y < margin * 2) {
            y = height - margin * 4; 
        }
    });

    const pdfBytes = await pdfDoc.save();
    return createPdfBlob(pdfBytes);
};

export const generatePaymentPdf = async (data: ClinicData, patient: Patient, payment: Payment, t: Record<string, string>) => {
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
    const drawSummaryRow = (rowLabel: string, value: number, isBold = false) => {
        const font = isBold ? fontBold : fontRegular; const color = isBold ? COLORS.accent : COLORS.primary;
        const size = isBold ? 11 : 10; const valStr = `${value.toLocaleString()} ${data.settings.currency}`;
        if (isRTL) { drawText(page, rowLabel, pageWidth - margin, y, font, size, 'right', COLORS.secondary); drawText(page, valStr, margin, y, font, size, 'left', color); }
        else { drawText(page, rowLabel, margin, y, font, size, 'left', COLORS.secondary); drawText(page, valStr, pageWidth - margin, y, font, size, 'right', color); }
        y -= 16;
    };
    drawSummaryRow(t.totalCost, totalCost); drawSummaryRow(t.totalPaid, totalPaid);
    y -= 5; drawLine(page, margin, pageWidth - margin, y, 0.5, COLORS.line); y -= 15;
    drawSummaryRow(t.remaining, rem, true); y -= 40; 
    drawText(page, t.thankYou, centerX, y, fontRegular, 10, 'center', COLORS.secondary);
    const pdfBytes = await pdfDoc.save();
    return createPdfBlob(pdfBytes);
};

export const generateExaminationPdf = async (data: ClinicData, patient: Patient, examination: Examination, t: Record<string, string>) => {
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
    return createPdfBlob(pdfBytes);
};

export const generateAppointmentPdf = async (data: ClinicData, appointment: Appointment, t: Record<string, string>) => {
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
    try { const [h, m] = appointment.time.split(':'); let hours = parseInt(h); const ampm = hours >= 12 ? 'PM' : 'AM'; hours = hours % 12; hours = hours ? hours : 12; timeStr = `${hours}:${m} ${ampm}`; } catch { /* ignore */ }
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
    return createPdfBlob(pdfBytes);
};

// --- DOCUMENT WRAP HELPER (FIXED VERSION) ---

/**
 * Measures the width of text, handling Arabic text properly
 */
const measureTextWidth = (text: string, font: PDFFont, fontSize: number): number => {
    if (!text) return 0;
    const measuredText = /[\u0600-\u06FF\u0750-\u077F]/.test(text) ? processArabicText(text) : text;
    return font.widthOfTextAtSize(measuredText, fontSize);
};

/**
 * Breaks a single long word into smaller chunks that fit within maxWidth
 * This handles cases where a single word is longer than the available width
 */
const breakLongWord = (word: string, maxWidth: number, font: PDFFont, fontSize: number): string[] => {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Handle the word character by character
    const chars = [...word]; // Use spread to handle Unicode characters properly
    
    for (const char of chars) {
        const testChunk = currentChunk + char;
        const width = measureTextWidth(testChunk, font, fontSize);
        
        if (width > maxWidth && currentChunk !== '') {
            chunks.push(currentChunk);
            currentChunk = char;
        } else {
            currentChunk = testChunk;
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks;
};

/**
 * Wraps a single block of text into multiple lines based on maximum width.
 * For Arabic text, it uses reshaping to measure widths accurately.
 * This version properly handles:
 * - Long words that exceed the line width
 * - Mixed Arabic and Latin text
 * - Very long strings without spaces
 */
const wrapParagraph = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] => {
    if (!text || !text.trim()) return [];
    
    const lines: string[] = [];
    
    // Split by various whitespace characters and preserve structure
    const words = text.split(/(\s+)/);
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Skip empty strings
        if (!word) continue;
        
        // Handle whitespace-only segments
        if (/^\s+$/.test(word)) {
            // Only add space if we have content in the current line
            if (currentLine && i < words.length - 1) {
                currentLine += ' ';
            }
            continue;
        }
        
        // Measure the word
        const wordWidth = measureTextWidth(word, font, fontSize);
        
        // If the single word is longer than maxWidth, we need to break it
        if (wordWidth > maxWidth) {
            // First, save the current line if it has content
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
                currentLine = '';
            }
            
            // Break the long word into chunks
            const chunks = breakLongWord(word, maxWidth, font, fontSize);
            
            // Add all chunks except the last as complete lines
            for (let j = 0; j < chunks.length - 1; j++) {
                lines.push(chunks[j]);
            }
            
            // The last chunk becomes the start of the current line
            if (chunks.length > 0) {
                currentLine = chunks[chunks.length - 1];
            }
            continue;
        }
        
        // Test if adding this word would exceed the max width
        const testLine = currentLine ? currentLine + word : word;
        const testWidth = measureTextWidth(testLine, font, fontSize);
        
        if (testWidth > maxWidth) {
            // Current line is full, save it and start a new one
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = word;
        } else {
            // Word fits, add it to the current line
            currentLine = testLine;
        }
    }
    
    // Don't forget the last line
    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }
    
    return lines;
};

/**
 * Alternative approach: wrap text with word-break support
 * This function handles edge cases better and provides more consistent results
 */
const wrapTextAdvanced = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] => {
    if (!text) return [];
    
    const lines: string[] = [];
    const paragraphs = text.split(/\r?\n/);
    
    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            // Preserve empty lines as empty strings
            lines.push('');
            continue;
        }
        
        const wrappedLines = wrapParagraph(paragraph, maxWidth, font, fontSize);
        lines.push(...wrappedLines);
    }
    
    return lines;
};

export const generateDocumentPdf = async (
    data: ClinicData, 
    patient: Patient, 
    doc: { type: 'consent' | 'instructions', text: string, align: 'left'|'center'|'right', fontSize: number, topMargin: number }, 
    _t?: Record<string, string>
) => {
    const { fontBytes, fontBoldBytes } = await loadResources();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontRegular = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);
    
    const isA4 = doc.type === 'consent';
    const paperDimensions: [number, number] = isA4 ? [595, 842] : [420, 595];
    let page = pdfDoc.addPage(paperDimensions); 
    const { width, height } = page.getSize(); 
    const margin = 40; 
    
    const bgImageStr = isA4 ? data.settings.consentBackgroundImage : data.settings.instructionsBackgroundImage;

    const drawBackground = async (targetPage: PDFPage) => {
        if (!bgImageStr) return;
        try {
             let imageBytes; let isPng = false;
             if (bgImageStr.startsWith('data:')) { imageBytes = bgImageStr; isPng = bgImageStr.includes('png'); }
             else { const res = await fetch(bgImageStr); const blob = await res.blob(); imageBytes = await blob.arrayBuffer(); isPng = blob.type === 'image/png'; }
             const bg = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
             targetPage.drawImage(bg, { x: 0, y: 0, width, height });
        } catch (e) { console.error("BG Embed Error:", e); }
    };

    await drawBackground(page);

    let y = height - (doc.topMargin || 130);
    
    const currentLang = data.settings.language || 'ar'; 
    const isRTL = currentLang === 'ar' || currentLang === 'ku';
    const labelColor = COLORS.accent; const valueColor = COLORS.primary;
    const tName = currentLang === 'ar' ? 'الاسم:' : (currentLang === 'ku' ? 'ناو:' : 'Name:');
    const tAge = currentLang === 'ar' ? 'العمر:' : (currentLang === 'ku' ? 'تەمەن:' : 'Age:');
    const tDate = currentLang === 'ar' ? 'التاريخ:' : (currentLang === 'ku' ? 'بەروار:' : 'Date:');
    const dateStr = new Date().toLocaleDateString('en-GB');

    // Draw Header patient details line
    if (isRTL) {
        drawText(page, tName, width - margin, y, fontBold, 12, 'right', labelColor);
        drawText(page, patient.name, width - margin - 50, y, fontBold, 12, 'right', valueColor);
        if (doc.type === 'consent') { 
            drawText(page, tAge, width - margin - 230, y, fontBold, 12, 'right', labelColor); 
            drawText(page, `${patient.age}`, width - margin - 280, y, fontRegular, 12, 'right', valueColor); 
        }
        drawText(page, tDate, margin + 110, y, fontBold, 12, 'right', labelColor); 
        drawText(page, dateStr, margin, y, fontRegular, 12, 'left', valueColor);
    } else {
        drawText(page, tName, margin, y, fontBold, 12, 'left', labelColor);
        drawText(page, patient.name, margin + 50, y, fontBold, 12, 'left', valueColor);
        if (doc.type === 'consent') { 
            drawText(page, tAge, margin + 250, y, fontBold, 12, 'left', labelColor); 
            drawText(page, `${patient.age}`, margin + 290, y, fontRegular, 12, 'left', valueColor); 
        }
        drawText(page, tDate, width - margin - 120, y, fontBold, 12, 'left', labelColor); 
        drawText(page, dateStr, width - margin, y, fontRegular, 12, 'right', valueColor);
    }
    
    y -= 15; 
    drawLine(page, margin, width - margin, y, 1.5, COLORS.primary); 
    y -= 40;

    // Calculate the maximum width for text wrapping
    // This is the key fix - ensuring proper maxWidth calculation
    const maxWidth = width - (margin * 2);
    const fontSize = doc.fontSize || 12;
    const align = doc.align || (isRTL ? 'right' : 'left');
    const lineHeight = fontSize * 1.6;

    // Use the improved text wrapping function
    const allLines = wrapTextAdvanced(doc.text, maxWidth, fontRegular, fontSize);

    // Draw each line
    for (const line of allLines) {
        // Check if we need a new page
        if (y < margin + 40) {
            page = pdfDoc.addPage(paperDimensions);
            await drawBackground(page);
            y = height - margin - 40;
        }

        // Handle empty lines (paragraph breaks)
        if (!line.trim()) {
            y -= (lineHeight * 0.5);
            continue;
        }

        // Calculate x position based on alignment
        let xPos: number;
        if (align === 'center') {
            xPos = width / 2;
        } else if (align === 'right') {
            xPos = width - margin;
        } else {
            xPos = margin;
        }

        drawText(
            page, 
            line, 
            xPos, 
            y, 
            fontRegular, 
            fontSize, 
            align, 
            COLORS.primary
        );
        
        y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return createPdfBlob(pdfBytes);
};
