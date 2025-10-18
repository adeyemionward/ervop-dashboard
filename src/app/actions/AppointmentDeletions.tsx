import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AppointmentDisplayData, NoteItem, PaymentHistoryItem } from "@/types/AppointmentTypes";
import { Invoice } from "@/types/invoice";
import { Dispatch, SetStateAction } from "react";

interface UseAppointmentDeletionsParams {
  BASE_URL: string;
  token: string | null;
  appointment: AppointmentDisplayData | null;
  setAppointment: Dispatch<SetStateAction<AppointmentDisplayData | null>>; // ✅ fix here
  invoices: Invoice[];
  setInvoices: Dispatch<SetStateAction<Invoice[]>>;
  setDeletingId: Dispatch<SetStateAction<number | null>>;
  setDeletingInvoiceId: Dispatch<SetStateAction<number | null>>;
  setDeletingNoteId: Dispatch<SetStateAction<number | null>>;
  setDeletingFileId: Dispatch<SetStateAction<number | null>>;
  setNoteToDelete: Dispatch<SetStateAction<NoteItem | null>>;
  setFileToDelete: Dispatch<SetStateAction<number | null>>;
  setInvoiceToDelete: Dispatch<SetStateAction<number | null>>;
  fetchAppointment: () => void;
  appointmentIdFromUrl: string;
}

export const AppointmentDeletions = ({
  BASE_URL,
  token,
  appointment,
  setAppointment,
  invoices,
  setInvoices,
  setDeletingId,
  setDeletingInvoiceId,
  setDeletingNoteId,
  setDeletingFileId,
  setNoteToDelete,
  setFileToDelete,
  setInvoiceToDelete,
  fetchAppointment,
  appointmentIdFromUrl,
}: UseAppointmentDeletionsParams) => {
  const queryClient = useQueryClient();

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/professionals/invoices/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete invoice");
      return data;
    },
    onMutate: (id: number) => {
      setDeletingInvoiceId(id);
      const previousInvoices = [...invoices];
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      return { previousInvoices };
    },
    onError: (error, id, context) => {
      if (context?.previousInvoices) setInvoices(context.previousInvoices);
      toast.error(error.message || "Failed to delete invoice.");
      setDeletingInvoiceId(null);
    },
    onSuccess: () => {
      toast.success("Invoice deleted successfully!");
      setInvoiceToDelete(null);
      setDeletingInvoiceId(null);
      queryClient.invalidateQueries();
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/professionals/invoices/deletePayment/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete payment");
      return data;
    },
    onMutate: (id: number) => {
      const previousPayments: PaymentHistoryItem[] = appointment?.paymentHistory ?? [];
      setAppointment(prev =>
        prev ? { ...prev, paymentHistory: prev.paymentHistory.filter(p => p.id !== id) } : prev
      );
      setDeletingId(id);
      return { previousPayments };
    },
    onSuccess: () => {
      fetchAppointment();
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentIdFromUrl] });
      toast.success("Payment deleted successfully!");
      setDeletingId(null);
    },
    onError: (error, variables, context?: { previousPayments: PaymentHistoryItem[] }) => {
      if (context?.previousPayments) {
        setAppointment(prev =>
          prev ? { ...prev, paymentHistory: context.previousPayments } : prev
        );
      }
      setDeletingId(null);
      toast.error(error.message || "Failed to delete payment.");
    },
  });

  const deleteNoteMutation = useMutation<string, Error, number, { previousNotes: NoteItem[] }>({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE_URL}/professionals/appointments/notes/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete note");
      return data;
    },
    onMutate: (id: number) => {
      const previousNotes: NoteItem[] = appointment?.notesHistory ?? [];
      setAppointment(prev =>
        prev ? { ...prev, notesHistory: prev.notesHistory.filter(n => n.id !== id) } : prev
      );
      setDeletingNoteId(id);
      return { previousNotes };
    },
    onError: (error, id, context?: { previousNotes: NoteItem[] }) => {
      if (context?.previousNotes) {
        setAppointment(prev =>
          prev ? { ...prev, notesHistory: context.previousNotes } : prev
        );
      }
      setDeletingNoteId(null);
      toast.error(error.message || "Failed to delete note.");
    },
    onSuccess: () => {
      toast.success("Note deleted successfully!");
      setNoteToDelete(null);
      setDeletingNoteId(null);
    },
  });

  const deleteFile = async (fileId: number) => {
    setDeletingFileId(fileId);
    try {
      const res = await fetch(`${BASE_URL}/professionals/documents/delete/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { status?: boolean; message?: string } = await res.json().catch(() => ({}));
      if (!res.ok || data.status === false) throw new Error(data.message || "Delete failed");

      setAppointment(prev => {
        if (!prev) return prev;
        const updatedDocuments = prev.documents.map(doc => ({
          ...doc,
          files: doc.files.filter(f => f.id !== fileId),
        }));
        return { ...prev, documents: updatedDocuments };
      });

      toast.success("File deleted successfully");
      setFileToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeletingFileId(null);
    }
  };

  return { deleteInvoiceMutation, deletePaymentMutation, deleteNoteMutation, deleteFile };
};
