// useAppointmentState.ts
import { AppointmentDisplayData, DocumentFileItem, NoteItem, PaymentHistoryItem } from "@/types/AppointmentTypes";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { useState } from "react";

export const useAppointmentState = () => {
  const [appointment, setAppointment] = useState<AppointmentDisplayData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expandedInvoice, setExpandedInvoice] = useState<number | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAppointmentStatusModalOpen, setIsAppointmentStatusModalOpen] = useState(false);
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
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<number | null>(null);

  const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DocumentFileItem | null>(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  return {
    appointment, setAppointment,
    invoices, setInvoices,
    expandedInvoice, setExpandedInvoice,
    invoiceToEdit, setInvoiceToEdit,
    invoiceItems, setInvoiceItems,
    isInvoiceModalOpen, setIsInvoiceModalOpen,
    isAppointmentStatusModalOpen, setIsAppointmentStatusModalOpen,
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
    invoiceToDelete, setInvoiceToDelete,
    deletingInvoiceId, setDeletingInvoiceId,
    noteToDelete, setNoteToDelete,
    deletingNoteId, setDeletingNoteId,
    deletingFileId, setDeletingFileId,
    fileToDelete, setFileToDelete,
    isFileModalOpen, setIsFileModalOpen,
  };
};
