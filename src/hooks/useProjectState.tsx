// useProjectState.ts
import { ProjectDisplayData, DocumentFileItem, NoteItem, PaymentHistoryItem } from "@/types/ProjectTypes";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { Quotation } from "@/types/quotation";
import { useState } from "react";

export const useProjectState = () => {
  const [project, setProject] = useState<ProjectDisplayData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expandedInvoice, setExpandedInvoice] = useState<number | null>(null);
  
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceTax, setInvoiceTax] = useState('0');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteItem | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentHistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  

  // QUOTATIONS
const [quotations, setQuotations] = useState<Invoice[]>([]);
const [quotationToEdit, setQuotationToEdit] = useState<Quotation | null>(null);
const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
const [deletingQuotationId, setDeletingQuotationId] = useState<number | null>(null);


  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<number | null>(null);

  const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DocumentFileItem | null>(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  return {
    project, setProject,
    invoices, setInvoices,
    quotations, setQuotations,
    expandedInvoice, setExpandedInvoice,
    invoiceToEdit, setInvoiceToEdit,
    invoiceItems, setInvoiceItems,
    isInvoiceModalOpen, setIsInvoiceModalOpen,
    invoiceDueDate, setInvoiceDueDate,
    invoiceTax, setInvoiceTax,
    invoiceNotes, setInvoiceNotes,
    isNoteModalOpen, setIsNoteModalOpen,
    noteToEdit, setNoteToEdit,
    newNote, setNewNote,
    isPaymentModalOpen, setIsPaymentModalOpen,
    selectedInvoiceId, setSelectedInvoiceId,
    isRescheduleModalOpen, setIsRescheduleModalOpen,
    newDate, setNewDate,
    newTime, setNewTime,
    availableSlots, setAvailableSlots,
    isLoadingSlots, setIsLoadingSlots,
    paymentToDelete, setPaymentToDelete,
    deletingId, setDeletingId,

    quotationToEdit, setQuotationToEdit,
    isQuotationModalOpen, setIsQuotationModalOpen,
    quotationToDelete, setQuotationToDelete,
    deletingQuotationId, setDeletingQuotationId,

    invoiceToDelete, setInvoiceToDelete,
    deletingInvoiceId, setDeletingInvoiceId,
    noteToDelete, setNoteToDelete,
    deletingNoteId, setDeletingNoteId,
    deletingFileId, setDeletingFileId,
    fileToDelete, setFileToDelete,
    isFileModalOpen, setIsFileModalOpen,
  };
};
