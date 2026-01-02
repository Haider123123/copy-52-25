
import React, { useEffect, useState } from 'react';
import { ClinicData, Patient, Prescription, Payment, Appointment, Examination } from '../types';
import { generateRxPdf, generatePaymentPdf, generateAppointmentPdf, generateDocumentPdf, generateExaminationPdf } from '../services/pdfGenerator';

interface PrintLayoutsProps {
  t: any;
  data: ClinicData;
  activePatient: Patient | null | undefined;
  printingRx: Prescription | null;
  setPrintingRx: (val: any) => void;
  printingPayment: Payment | null;
  setPrintingPayment: (val: any) => void;
  printingAppointment: Appointment | null;
  setPrintingAppointment: (val: any) => void;
  printingExamination: Examination | null;
  setPrintingExamination: (val: any) => void;
  printingDocument?: { type: 'consent' | 'instructions', text: string, align: 'left'|'center'|'right', fontSize: number } | null;
  setPrintingDocument?: (val: any) => void;
  currentLang: any;
  isRTL: boolean;
}

export const PrintLayouts: React.FC<PrintLayoutsProps> = ({
  t, data, activePatient, printingRx, setPrintingRx, printingPayment, setPrintingPayment, printingAppointment, setPrintingAppointment, printingExamination, setPrintingExamination, printingDocument, setPrintingDocument, currentLang
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenPdf = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
          alert("Pop-up blocked. Please allow pop-ups to print.");
      }
      setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  useEffect(() => {
      const generate = async () => {
          if (printingRx && activePatient) {
              setIsGenerating(true);
              try {
                  const blob = await generateRxPdf(data, activePatient, printingRx, currentLang);
                  handleOpenPdf(blob);
              } catch (e) {
                  console.error(e);
                  alert("Error generating Prescription PDF");
              } finally {
                  setIsGenerating(false);
                  setPrintingRx(null);
              }
          }
      };
      generate();
  }, [printingRx]);

  useEffect(() => {
      const generate = async () => {
          if (printingPayment && activePatient) {
              setIsGenerating(true);
              try {
                  const blob = await generatePaymentPdf(data, activePatient, printingPayment, t);
                  handleOpenPdf(blob);
              } catch (e) {
                  console.error(e);
                  alert("Error generating Receipt PDF");
              } finally {
                  setIsGenerating(false);
                  setPrintingPayment(null);
              }
          }
      };
      generate();
  }, [printingPayment]);

  useEffect(() => {
      const generate = async () => {
          if (printingExamination && activePatient) {
              setIsGenerating(true);
              try {
                  const blob = await generateExaminationPdf(data, activePatient, printingExamination, t);
                  handleOpenPdf(blob);
              } catch (e) {
                  console.error(e);
                  alert("Error generating Examination Receipt PDF");
              } finally {
                  setIsGenerating(false);
                  setPrintingExamination(null);
              }
          }
      };
      generate();
  }, [printingExamination]);

  useEffect(() => {
      const generate = async () => {
          if (printingAppointment) {
              setIsGenerating(true);
              try {
                  const blob = await generateAppointmentPdf(data, printingAppointment, t);
                  handleOpenPdf(blob);
              } catch (e) {
                  console.error(e);
                  alert("Error generating Appointment PDF");
              } finally {
                  setIsGenerating(false);
                  setPrintingAppointment(null);
              }
          }
      };
      generate();
  }, [printingAppointment]);

  useEffect(() => {
      const generate = async () => {
          if (printingDocument && activePatient && setPrintingDocument) {
              setIsGenerating(true);
              try {
                  const blob = await generateDocumentPdf(data, activePatient, printingDocument, t);
                  handleOpenPdf(blob);
              } catch (e) {
                  console.error(e);
                  alert("Error generating Document PDF");
              } finally {
                  setIsGenerating(false);
                  setPrintingDocument(null);
              }
          }
      };
      generate();
  }, [printingDocument]);

  if (isGenerating) {
      return (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center text-white font-bold">
              <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Generating PDF...
              </div>
          </div>
      );
  }

  return null;
};
