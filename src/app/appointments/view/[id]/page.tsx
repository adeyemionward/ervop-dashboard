'use client';

import React, { useState, useEffect, useMemo, FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import clsx from "clsx";
import DashboardLayout from "@/components/DashboardLayout";
import InvoiceModal from "@/components/InvoiceModal";
import NoteModal from "@/components/NoteModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import { CheckCircle, Clock, Edit, RefreshCw, Trash2, ChevronUp, ChevronDown, PlusCircle, Loader2, FileText, Download } from 'lucide-react';
import { formatDate } from "@/app/utils/formatDate";
import { InvoiceItem, Invoice } from "@/types/invoice";
import { downloadFile } from "@/app/utils/downloadFile";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import FileUploadModal from "@/components/FileUploadModal";
import toast from "react-hot-toast";

// -------------------- TYPES --------------------
type PaymentHistoryItem = { id: number; date: string; amount: string; method: string; };
type NoteItem = { id: number; content: string; author: string; date: string; };
type DocumentFileItem = {
  id: number;
  file_path: string;   // file URL
  file_type: string;   // MIME type, e.g., "image/jpeg"
  created_at: string;  // upload timestamp
};

type DocumentItem = {
  id: number;
  title: string;
  tags?: string | null;
  created_at: string;
  files: DocumentFileItem[];
};


interface Customer {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
}

interface AppointmentDisplayData {
  id: string;
  appointmentId: number;
  createdAt: string;
  date: string;
  time: string;
  appointmentStatus: string;
  notes: string;
  serviceName: string;
  customer: Customer;
  paymentStatus: string;
  paymentHistory: PaymentHistoryItem[];
  notesHistory: NoteItem[];
  documents: DocumentItem[];
}

interface ApiAppointment {
  id: number;
  user_id: number; 
  date: string;
  time: string;
  appointment_status: string | null;
  notes: string;
  service_id: number;
  service_name: string;
  customer_id: number;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  invoices?: any[];
  notesHistory?: any[];
  service?: { name: string };
  customer?: { id: number; firstname: string; lastname: string; email: string; phone: string; };
}

// -------------------- HOOKS --------------------
const useParams = () => {
  if (typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/');
    return { id: pathParts[pathParts.length - 1] };
  }
  return { id: '1' };
};

// -------------------- REUSABLE COMPONENTS --------------------
const InfoCard: FC<{ title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({ title, children, className, action }) => (
  <div className={clsx("bg-white p-6 rounded-xl shadow-sm border border-gray-200", className)}>
    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// const AppointmentTimeline: FC<{ currentStatus: string }> = ({ currentStatus }) => {
//   const statuses = ['Upcoming', 'Inprogress', 'Completed', 'Converted'];
//   const currentIndex = statuses.indexOf(currentStatus);

//   return (
//     <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
//       {statuses.map((status, index) => (
//         <div key={status} className="flex items-center w-full">
//           <div className={clsx("flex flex-col items-center text-center", { 'text-purple-600': index <= currentIndex, 'text-gray-400': index > currentIndex })}>
//             <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-semibold border-2", { 
//               'bg-purple-600 text-white border-purple-600': index <= currentIndex, 
//               'bg-gray-200 border-gray-200': index > currentIndex 
//             })}>
//               {index < currentIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
//             </div>
//             <p className="text-xs font-medium mt-2">{status}</p>
//           </div>
//           {index < statuses.length - 1 && (
//             <div className={clsx("flex-1 h-0.5 mx-4", { 'bg-purple-600': index < currentIndex, 'bg-gray-200': index >= currentIndex })}></div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// -------------------- MAIN COMPONENT --------------------


export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentIdFromUrl = params.id as any;
  const queryClient = useQueryClient();
  const orderId = params.id as string;
  
    // const { data: order, isLoading, isError } = useQuery<OrderType>({
    //   queryKey: ["order", orderId],
    //   queryFn: () => fetchOrder(orderId),
    //   staleTime: 1000 * 60 * 5,
    // });


     const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);

  const [appointment, setAppointment] = useState<AppointmentDisplayData | null>(null);
   const [rawApiAppointment, setRawApiAppointment] = useState<ApiAppointment | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expandedInvoice, setExpandedInvoice] = useState<number | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceDueDate, setInvoiceDueDate] = useState('');
    const [invoiceTax, setInvoiceTax] = useState('0');
    const [invoiceDiscount, setInvoiceDiscount] = useState('0');

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

  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);

const [noteToDelete, setNoteToDelete] = useState<AppointmentNote | null>(null);
const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

 // modal state
 const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DocumentFile | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  

  // Helpers
  const fileNameFromPath = (p: string) =>
    p ? p.split("/").pop() || p : "file";
  const isImage = (t: string) => t?.toLowerCase().startsWith("image/");
  const isPdf = (t: string) => t?.toLowerCase().includes("pdf");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  
const [totals, setTotals] = useState({ totalBudget: 0, totalSpent: 0, outstanding: 0 });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) setToken(token);
    }
  }, []);
  const fetchAppointment = async () => {
  if (!appointmentIdFromUrl || !BASE_URL || !token) return;

  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(
      `${BASE_URL}/professionals/appointments/show/${appointmentIdFromUrl}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch appointment details.");

    const result = await response.json();
    const apiData: ApiAppointment = result.data;

    // Map API data -> display structure
    const formatted: AppointmentDisplayData = {
      id: String(apiData.id),
      appointmentId: apiData.id,
      createdAt: new Date(apiData.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      date: new Date(apiData.date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: new Date(`1970-01-01T${apiData.time}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      appointmentAmount: apiData.amount || 0 ,
      appointmentStatus: apiData.appointment_status || "Upcoming",
      notes: apiData.notes ?? "",
      serviceName: apiData.service?.name || "",
      customer: {
        customer_id: apiData.customer?.id ?? 0,
        name: `${apiData.customer?.firstname ?? ""} ${apiData.customer?.lastname ?? ""}`,
        email: apiData.customer?.email ?? "",
        phone: apiData.customer?.phone ?? "",
      },
      paymentStatus: apiData.invoices?.every((inv) => inv.status === "Paid")
        ? "Paid"
        : apiData.invoices?.some((inv) => inv.status === "Paid")
        ? "Partially Paid"
        : "Unpaid",
      paymentHistory:
        apiData.invoices?.flatMap(
          (inv) =>
            inv.payments?.map((p: any) => ({
              id: p.id,
              date: new Date(p.payment_date).toLocaleDateString("en-US"),
              amount: `₦${Number(p.amount).toLocaleString()}`,
              method: (p.payment_method || "Manual Entry")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              invoiceNumber: inv.invoice_no || `#INV-${inv.id}`, // 👈 include invoice number
            })) ?? []
        ) ?? [],
      notesHistory:
        apiData.notesHistory?.map((n) => ({
          id: n.id,
          content: n.content,
          author: n.author || "Unknown",
          date: new Date(n.created_at).toLocaleDateString("en-US"),
        })) ?? [],

        // ✅ Add documents with files
      documents:
        apiData.documents?.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            uploadedAt: new Date(doc.created_at).toLocaleDateString("en-US"),
            files: doc.files?.map((f: any) => ({
                id: f.id,
                name: fileNameFromPath(f.file_path),
                file_path: f.file_path,
                file_type: f.file_type,
                uploadedAt: new Date(f.created_at).toLocaleDateString("en-US"),
            })) ?? [],
        })) ?? [],
    };

    setAppointment(formatted);

    setInvoices(
      apiData.invoices?.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_no || `#INV-${inv.id}`,
        issuedDate: new Date(inv.issue_date).toLocaleDateString("en-US"),
        dueDate: new Date(inv.due_date).toLocaleDateString("en-US"),
        taxPercentage: inv.tax_percentage,
        discountPercentage: inv.discount_percentage,
        taxAmount: inv.tax_amount,
        discountAmount: inv.discount,
        remainingBalance: inv.remaining_balance,
        notes: inv.notes,
        status: inv.status || "Pending",
        items:
          inv.items?.map((it: any) => ({
            id: it.id,
            description: it.description,
            quantity: it.quantity,
            rate: it.rate,
            // 🔥 calculate amount right here
            amount: (Number(it.quantity) || 0) * (Number(it.rate) || 0),
          })) ?? [],
      })) ?? []
    );

    // ✅ Compute totals here
   // Assuming apiData.appointments is an array of appointments
    // total budget comes straight from appointment.amount
    const totalBudget = Number(formatted.appointmentAmount)

    // sum of all payments
    const totalSpent =
    apiData.invoices?.flatMap(inv => inv.payments || [])
        .reduce((sum: number, pay: any) => sum + (Number(pay.amount) || 0), 0) || 0;

    // outstanding balance
    const outstanding = totalBudget - totalSpent;



    setTotals({ totalBudget, totalSpent, outstanding }); // 👈 store it in state
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "An unknown error occurred."
    );
  } finally {
    setIsLoading(false);
  }
};


  // Load on mount
useEffect(() => {
  fetchAppointment();
}, [appointmentIdFromUrl, BASE_URL, token]);
  
  const handleEditInvoiceClick = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setInvoiceItems(invoice.items);
    setIsInvoiceModalOpen(true);
  };

  const handleEditNoteClick = (note: NoteItem) => {
    setNoteToEdit(note);
    setNewNote(note.content);
    setIsNoteModalOpen(true);
  };

  const handleNewPayment = (payment: PaymentHistoryItem) => {
    setAppointment(prev => prev ? { ...prev, paymentHistory: [...prev.paymentHistory, payment], paymentStatus: "Paid" } : prev);
  };


   const [searchInvoice, setSearchInvoice] = useState("");

  // only run filter when appointment is loaded
  const filteredHistory = appointment?.paymentHistory?.filter((p) =>
    p.invoiceNumber?.toLowerCase().includes(searchInvoice.toLowerCase())
  ) ?? [];

    const openCreateInvoiceModal = () => {
        setInvoiceToEdit(null);
        setInvoiceItems([{ id: `new-${Date.now()}`, description: '', quantity: 1, rate: 0, amount: 0 }]);
        setInvoiceDueDate(''); setInvoiceTax('0'); setInvoiceNotes('');
        setIsInvoiceModalOpen(true);
    };

    const updateAppointmentStatus = async (newStatus: string) => {
        setIsUpdating(true);
        setUpdateSuccess(false);
        setUpdateError(null);

        try {
            // Assume you have the user's token stored somewhere
            const token = localStorage.getItem("token");
            const payload = {
                status: newStatus,
            };

            const response = await fetch(
                `http://127.0.0.1:8000/api/v1/professionals/appointments/updateStatus/${appointment.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update status");
            }

            // Update the local state with the new status after a successful API call
            setAppointment(prev => prev ? {...prev, appointmentStatus: newStatus} : null);
            setUpdateSuccess(true);
            toast.success("Status updated successfully!");

        } catch (error: any) {
            console.error("API error:", error);
            setUpdateError(error.message);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // The provided AppointmentTimeline component
    const AppointmentTimeline: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
      const statuses = ['Upcoming', 'Inprogress', 'Completed', 'Converted'];
      const currentIndex = statuses.indexOf(currentStatus);

      return (
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
          {statuses.map((status, index) => (
            <div key={status} className="flex items-center w-full">
              <div className={clsx("flex flex-col items-center text-center", { 'text-purple-600': index <= currentIndex, 'text-gray-400': index > currentIndex })}>
                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-semibold border-2", { 
                  'bg-purple-600 text-white border-purple-600': index <= currentIndex, 
                  'bg-gray-200 border-gray-200': index > currentIndex 
                })}>
                  {index < currentIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <p className="text-xs font-medium mt-2">{status}</p>
              </div>
              {index < statuses.length - 1 && (
                <div className={clsx("flex-1 h-0.5 mx-4", { 'bg-purple-600': index < currentIndex, 'bg-gray-200': index >= currentIndex })}></div>
              )}
            </div>
          ))}
        </div>
      );
    };

    const deleteInvoiceMutation = useMutation({
        mutationFn: async (id: number) => {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`http://127.0.0.1:8000/api/v1/professionals/invoices/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete invoice");
            return data;
        },
        onMutate: (id: number) => {
            setDeletingInvoiceId(id);

            // Optimistic update
            const previousInvoices = invoices;
            setInvoices(prev => prev?.filter(inv => inv.id !== id) || []);

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
            queryClient.invalidateQueries(["invoices"]); // optional refetch for server sync
        }
    });

    const deletePaymentMutation = useMutation({
        mutationFn: (id: number) => {
            const token = localStorage.getItem("token") || "";
            return fetch(`http://127.0.0.1:8000/api/v1/professionals/invoices/deletePayment/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            }).then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to delete payment");
                return data;
            });
        },
        onMutate: async (id: number) => {
            // Optimistic update: Temporarily remove the payment from the UI
            const previousPayments = appointment?.paymentHistory;
            setAppointment(prev => prev ? {
                ...prev,
                paymentHistory: prev.paymentHistory.filter(p => p.id !== id),
            } : null);
            setDeletingId(id);
            return { previousPayments };
        },
        onSuccess: () => {
            fetchAppointment(); // 🔥 re-populate both appointment + invoices states
            queryClient.invalidateQueries({ queryKey: ["appointment", appointmentIdFromUrl] });
            toast.success("Payment deleted successfully!");
            setPaymentToDelete(null);
        },
        onError: (error, variables, context) => {
        // Revert the optimistic update on error
        if (context?.previousPayments) {
            setAppointment(prev => {
                // If prev is null, return null and don't proceed.
                if (!prev) {
                    return null;
                }

                // Ensure context.previousPayments is an array.
                // Use an empty array if it's undefined.
                const previousPayments = context?.previousPayments || [];

                return {
                    ...prev,
                    paymentHistory: previousPayments,
                };
            });
        }
        setDeletingId(null);
        toast.error(error.message || "Failed to delete payment.");
        },
    });

const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => {
        const token = localStorage.getItem("token") || "";
        return fetch(`http://127.0.0.1:8000/api/v1/professionals/appointments/notes/delete/${id}`, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete note");
            return data;
        });
    },
    onMutate: (id: number) => {
        const previousNotes = appointment?.notesHistory || [];

        setAppointment(prev => prev ? {
            ...prev,
            notesHistory: [...prev.notesHistory.filter(n => n.id !== id)]
        } : null);

        setDeletingNoteId(id);
        return { previousNotes };
    },


    onSuccess: () => {
        toast.success("Note deleted successfully!");
        setNoteToDelete(null);
        setDeletingNoteId(null);
        // No need to refetch appointment
        // Optionally invalidateQueries if you have a separate appointment query you want synced
        // queryClient.invalidateQueries({ queryKey: ["appointment", appointmentIdFromUrl] });
    },
    onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousNotes) {
            setAppointment(prev => prev ? {
                ...prev,
                notes: Array.isArray(context.previousNotes) ? context.previousNotes : [],
            } : null);
        }
        setDeletingNoteId(null);
        toast.error(error.message || "Failed to delete note.");
    },
});


// ---------- Delete File ----------
  const handleDelete = async (fileId: number) => {
    setDeletingFileId(fileId); // ✅ must happen before await
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/professionals/documents/delete/${fileId}`,
        { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Delete failed");
      }

     // ✅ Update appointment.documents directly
    const updatedDocuments = appointment.documents.map((doc) => ({
      ...doc,
      files: doc.files.filter((f) => f.id !== fileId),
    }))
    // Remove empty documents if needed:
    // .filter(doc => doc.files.length > 0);

    setAppointment((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
      toast.success("File deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting the file.");
    } finally {
      setDeletingFileId(null);
      setFileToDelete(null);
    }
  };
    
   
  const invoiceTotals = useMemo(() => {
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
    const taxVal = parseFloat(invoiceItems[0]?.tax?.toString() || "0");
    const taxAmount = (subtotal * taxVal) / 100;
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  }, [invoiceItems]);

  const handleFetchAvailableSlots = async (date: string) => {
    console.log("handleFetchAvailableSlots called with date:", date);

    // Only check the date for now
    if (!date) return;

    setNewTime('');
    setIsLoadingSlots(true);
    setAvailableSlots([]);

    try {
        const response = await fetch(`${BASE_URL}/professionals/appointments/getAvailableSlots?date=${date}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Raw response:", response);

        if (!response.ok) throw new Error("Failed to fetch slots");

        const data = await response.json();
        console.log("Fetched slots:", data);

        setAvailableSlots(data.available_slots || []);
    } catch (error) {
        console.error("Fetch error:", error);
    } finally {
        setIsLoadingSlots(false);
    }
};



  const handleConfirmReschedule = async () => {
        if (!newDate || !newTime || !appointment) return;
        try {
            const response = await fetch(`${BASE_URL}/professionals/appointments/reschedule/${appointment.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({ date: newDate, time: newTime })
            });
            if (!response.ok) throw new Error("Failed to reschedule");
            setAppointment(prev => prev ? { ...prev, appointmentStatus: 'Rescheduled', date: new Date(newDate + 'T00:00:00').toLocaleDateString('en-US'), time: new Date(`1970-01-01T${newTime}`).toLocaleTimeString('en-US') } : null);
            setIsRescheduleModalOpen(false);
        } catch (error) {
            console.error("Reschedule failed:", error);
        }
    };

  const formatSlotTime = (time: string) => new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isLoading) return <DashboardLayout><div className="text-center p-12">Loading...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="text-center p-12 text-red-600">{error}</div></DashboardLayout>;
  if (!appointment) return <DashboardLayout><div className="text-center p-12">No appointment data found.</div></DashboardLayout>;

  // -------------------- JSX --------------------
  return (
    <DashboardLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <Link href="/appointments" className="w-35 p-2 flex items-center text-sm hover:bg-gray-200 text-gray-500 font-medium hover:text-primary-600 mb-2 rounded-md">
                        <ChevronDown className="w-4 h-4 mr-1 rotate-90" />
                        Back to Appointments
                    </Link>
                    <div className="flex items-center gap-4 mt-2">
                        <h1 className="text-3xl font-bold text-gray-900">{appointment.serviceName}</h1>
                        <span className={clsx("px-3 py-1 text-sm font-medium rounded-full", {
                            'bg-green-100 text-green-800': ['Completed', 'Converted'].includes(appointment.appointmentStatus),
                            'bg-yellow-100 text-yellow-800': appointment.appointmentStatus === 'Inprogress',
                            'bg-blue-100 text-blue-800': appointment.appointmentStatus === 'Upcoming',
                            'bg-red-100 text-red-800': appointment.appointmentStatus === 'Cancelled',
                            'bg-orange-100 text-orange-800': appointment.appointmentStatus === 'Rescheduled',
                        })}>
                            {appointment.appointmentStatus}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Created on: {appointment.createdAt}</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <button onClick={() => setIsRescheduleModalOpen(true)} className="bg-white border border-purple-300 cursor-pointer text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Reschedule</span>
                    </button> 
                    <button className="bg-[#7E51FF] text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700 flex items-center space-x-2">
                        <RefreshCw className="h-5 w-5" />
                        <span>Convert to Project</span>
                    </button>
                </div>
            </div>
            
            <div className="mb-8"><AppointmentTimeline currentStatus={appointment.appointmentStatus} /></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title="Appointment Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div><p className="text-gray-500">Service</p><p className="font-medium text-gray-800 mt-1">{appointment.serviceName}</p></div>
                            <div><p className="text-gray-500">Date</p><p className="font-medium text-gray-800 mt-1">{appointment.date}</p></div>
                            <div><p className="text-gray-500">Time</p><p className="font-medium text-gray-800 mt-1">{appointment.time}</p></div>
                            <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-800 mt-1"><span className={clsx("px-2 py-1 text-xs font-medium rounded-full", {'bg-green-100 text-green-800': ['Completed', 'Converted'].includes(appointment.appointmentStatus),'bg-yellow-100 text-yellow-800': appointment.appointmentStatus === 'Inprogress','bg-blue-100 text-blue-800': appointment.appointmentStatus === 'Upcoming','bg-red-100 text-red-800': appointment.appointmentStatus === 'Cancelled','bg-orange-100 text-orange-800': appointment.appointmentStatus === 'Rescheduled',})}>{appointment.appointmentStatus}</span></p></div>
                        </div>
                        <div className="w-full mt-5"><p className="font-bold text-gray-800">Description</p><p className="text-gray-600 whitespace-pre-wrap">{appointment.notes || 'No notes provided.'}</p></div>
                    </InfoCard>

                    <InfoCard
                        title="Invoices"
                        action={
                            <button
                            onClick={openCreateInvoiceModal}
                            className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800"
                            >
                            + Create Invoice
                            </button>
                        }
                        >
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {invoices && invoices.length > 0 ? (
                            invoices.map((invoice) => {
                                const subtotal = invoice.items?.reduce((acc, item) => {
                                const base = item.amount ?? (item.quantity ?? 0) * (item.rate ?? 0);
                                return acc + base;
                                }, 0) ?? 0;

                                const discountPercentage = invoice.discountAmount ?? 0;
                                const taxPercentage = invoice.taxAmount ?? 0;

                                const discount = (subtotal * discountPercentage) / 100;
                                const tax = (subtotal * taxPercentage) / 100;

                                const total = subtotal - discount + tax;

                                const finalTotal =
                                subtotal +
                                (subtotal * (invoice.taxPercentage ?? 0)) / 100 -
                                (subtotal * (invoice.discountPercentage ?? 0)) / 100;

                                const remainingBalance = Number(invoice.remainingBalance ?? finalTotal);

                                let statusLabel = "Pending";
                                let statusClass = "bg-yellow-100 text-yellow-800";

                                if (remainingBalance === 0) {
                                statusLabel = "Fully Paid";
                                statusClass = "bg-green-100 text-green-800";
                                } else if (remainingBalance === finalTotal) {
                                statusLabel = "Unpaid";
                                statusClass = "bg-red-100 text-red-800";
                                } else if (remainingBalance > 0 && remainingBalance < finalTotal) {
                                statusLabel = "Partially Paid";
                                statusClass = "bg-blue-100 text-blue-800";
                                }

                                if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && remainingBalance > 0) {
                                statusLabel = "Overdue";
                                statusClass = "bg-red-200 text-red-900";
                                }

                                const isExpanded = expandedInvoice === invoice.id;

                                return (
                                <div
                                    key={invoice.id}
                                    className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
                                >
                                    {/* Row Header */}
                                    <div
                                    className="flex justify-between items-center p-4 cursor-pointer"
                                    onClick={() => setExpandedInvoice(isExpanded ? null : invoice.id)}
                                    >
                                    <div>
                                        <p className="font-semibold text-gray-800">{invoice.invoiceNumber}</p>
                                        <p className="text-xs text-gray-500">Issued: {invoice.issuedDate}</p>
                                        <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                                        <p className="text-xs text-gray-500">
                                        Paid: ₦{(Number(finalTotal) - Number(invoice.remainingBalance)).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                        Bal.: ₦{Number(invoice.remainingBalance).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                        <p className="font-semibold text-gray-800">₦{finalTotal.toLocaleString()}</p>
                                        <span
                                            className={clsx(
                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                            statusClass
                                            )}
                                        >
                                            {statusLabel}
                                        </span>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditInvoiceClick(invoice);
                                            }}
                                            className="p-2 rounded-full hover:bg-gray-200"
                                            title="Edit Invoice"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            setInvoiceToDelete(invoice);
                                            }}
                                            className="p-2 rounded-full hover:bg-gray-200 text-red-600"
                                            title="Delete Invoice"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedInvoiceId(invoice.id);
                                            setIsPaymentModalOpen(true);
                                            }}
                                            className="p-2 rounded-full hover:bg-gray-200 text-[#7E51FF]"
                                            title="Record Payment"
                                        >
                                            <PlusCircle className="h-5 w-5" />
                                        </button>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                        </div>
                                    </div>
                                    </div>

                                    {/* Expanded Row */}
                                    {isExpanded && (
                                    <div className="px-4 pb-4">
                                        <table className="w-full text-sm text-left border-t border-gray-200 mt-2">
                                        <thead>
                                            <tr className="text-gray-600">
                                            <th className="py-2">Description</th>
                                            <th className="py-2 text-right">Qty</th>
                                            <th className="py-2 text-right">Rate</th>
                                            <th className="py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.items.map((item) => (
                                            <tr key={item.id} className="border-t border-gray-100">
                                                <td className="py-2">{item.description}</td>
                                                <td className="py-2 text-right">{item.quantity}</td>
                                                <td className="py-2 text-right">₦{item.rate.toLocaleString()}</td>
                                                <td className="py-2 text-right">₦{item.quantity * item.rate}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                        </table>

                                        <div className="flex flex-col items-end mt-3 font-semibold text-gray-800 space-y-1">
                                        <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
                                        <p>Tax ({invoice.taxPercentage ?? 0}%): ₦{((subtotal * (invoice.taxPercentage ?? 0)) / 100).toLocaleString()}</p>
                                        <p>Discount ({invoice.discountPercentage ?? 0}%): ₦{((subtotal * (invoice.discountPercentage ?? 0)) / 100).toLocaleString()}</p>
                                        <p className="text-lg">
                                            Total: ₦{(subtotal + (subtotal * (invoice.taxPercentage ?? 0)) / 100 - (subtotal * (invoice.discountPercentage ?? 0)) / 100).toLocaleString()}
                                        </p>
                                        </div>
                                    </div>
                                    )}
                                </div>
                                );
                            })
                            ) : (
                            <p className="text-gray-400 text-center py-4">No invoice available</p>
                            )}
                        </div>
                    </InfoCard>


                    <InfoCard
                        title="Appointment Notes"
                        action={
                            <button
                            onClick={() => {
                                setNoteToEdit(null);
                                setNewNote('');
                                setIsNoteModalOpen(true);
                            }}
                            className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800"
                            >
                            + Add Note
                            </button>
                        }
                        >
                        <div className="max-h-64 overflow-y-auto pr-2 space-y-4">
                            {appointment.notesHistory && appointment.notesHistory.length > 0 ? (
                            appointment.notesHistory.map(note => (
                                <div
                                key={note.id}
                                className="flex items-start space-x-3 pt-4 first:pt-0 first:border-none border-t group relative"
                                >
                                <img
                                    alt="User avatar"
                                    src="https://i.pravatar.cc/150?u=ervop-admin"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">{note.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                    {note.author} - {note.date}
                                    </p>
                                </div>
                                <div className="absolute top-4 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                    onClick={() => handleEditNoteClick(note)}
                                    className="p-2 rounded-full hover:bg-gray-200"
                                    >
                                    <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                    key={note.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setNoteToDelete(note);
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-200 text-red-600"
                                    title="Delete Note"
                                    >
                                    <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                </div>
                            ))
                            ) : (
                            <p className="text-gray-400 text-center py-4">No data available</p>
                            )}
                        </div>
                    </InfoCard>


                    

                    {/* PROJECT FILES */}
                    <InfoCard
                        title="Project Files"
                        action={
                            <button
                                onClick={() => setIsFileModalOpen(true)}
                                className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800"
                            >
                                + Upload File
                            </button>
                            
                        }
                        >
                        <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                            {appointment.documents && appointment.documents.length > 0 ? (
                            appointment.documents.map((doc) =>
                                doc.files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg group"
                                >
                                    <div className="flex items-center space-x-3">
                                    <div className="bg-gray-200 p-3 rounded-full">
                                        {isImage(file.url) ? (
                                        <FileImage className="w-6 h-6 text-gray-600" />
                                        ) : (
                                        <FileText className="w-6 h-6 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-blue-600 hover:underline"
                                        >
                                        {fileNameFromPath(file.file_path)}
                                        </a>

                                        {doc.title && (
                                        <p className="text-xs text-gray-400">{doc.title}</p>
                                        )}

                                        <p className="text-sm text-gray-500">
                                        Uploaded: {formatDate(file.uploadedAt)} • {file.file_type.toUpperCase()}
                                        </p>
                                    </div>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => downloadFile(file.file_path)}
                                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
                                        aria-label={`Download ${fileNameFromPath(file.file_path)}`}
                                        title="Download"
                                        >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setFileToDelete(file)}
                                        disabled={deletingFileId === file.id}
                                        className={`p-2 rounded-md text-red-600 hover:bg-red-50 cursor-pointer ${
                                            deletingFileId === file.id ? "opacity-60 cursor-not-allowed" : ""
                                        }`}
                                    title="Delete"
                                    >
                                    <Trash2 className="w-5 h-5" />
                                    </button>
                                    </div>
                                </div>
                                ))
                            )
                            ) : (
                            <p className="text-gray-400 text-center py-4">No data available</p>
                            )}
                        </div>
                    </InfoCard>

                    
                </div>
                <div className="lg:col-span-1 space-y-8">
                 <div className="lg:col-span-1 space-y-8">
                    <div className="w-full max-w-2xl">

                        <div className="">
                            <InfoCard title="Update Status">
                                <div>
                                    <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Update Appointment Status
                                    </label>
                                    <select
                                        id="order-status"
                                        value={appointment.appointmentStatus}
                                        onChange={(e) => updateAppointmentStatus(e.target.value)}
                                        className={clsx(
                                            "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                                            {"bg-gray-100 border-gray-300": !isUpdating},
                                            {"bg-gray-300 border-gray-400 cursor-not-allowed": isUpdating}
                                        )}
                                        disabled={isUpdating}
                                    >
                                        <option>Upcoming</option>
                                        <option>Inprogress</option>
                                        <option>Completed</option>
                                        <option>Converted</option>
                                        <option>Cancelled</option>
                                        {/* <option>Rescheduled</option> */}
                                    </select>
                                </div>

                                <div className="mt-4 text-sm">
                                    {isUpdating && (
                                        <p className="text-gray-500 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Updating status...
                                        </p>
                                    )}
                                    {updateSuccess && (
                                        <p className="text-green-600">
                                            Status updated successfully!
                                        </p>
                                    )}
                                    {updateError && (
                                        <p className="text-red-600">
                                            Error: {updateError}
                                        </p>
                                    )}
                                </div>
                            </InfoCard>
                        </div>
                    </div>
                    <InfoCard
                        title="Payment History"
                        action={
                            <span
                            className={clsx(
                                "px-3 py-1 text-xs font-medium rounded-full",
                                {
                                "bg-yellow-100 text-yellow-800":
                                    totals.totalSpent > 0 && totals.totalSpent < appointment.appointmentAmount,
                                "bg-green-100 text-green-800":
                                    totals.totalSpent >= appointment.appointmentAmount,
                                "bg-red-100 text-red-800": totals.totalSpent === 0,
                                }
                            )}
                            >
                            {totals.totalSpent === 0
                                ? "Unpaid"
                                : totals.totalSpent < appointment.appointmentAmount
                                ? "Partially Paid"
                                : "Paid"}
                            </span>
                        }
                        >
                        {/* Totals */}
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500">Total Budget</p>
                                <p className="font-semibold text-gray-800">
                                    ₦{Number(appointment.appointmentAmount).toLocaleString("en-NG", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    })}
                                </p>

                            </div>
                            <div>
                            <p className="text-xs text-gray-500">Total Spent</p>
                            <p className="font-semibold text-green-600">₦{totals.totalSpent.toLocaleString()}</p>
                            </div>
                            <div>
                            <p className="text-xs text-gray-500">Outstanding</p>
                            <p className="font-semibold text-red-600">₦{totals.outstanding.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Search bar */}
                        <div className="mb-3">
                            <input
                            type="text"
                            placeholder="Search by Invoice Number..."
                            value={searchInvoice}
                            onChange={(e) => setSearchInvoice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* History list */}
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-3">
                            {filteredHistory.map((p) => (
                            <div key={p.id} className="flex justify-between text-sm">
                                <div>
                                <p className="text-xs text-gray-500">{p.invoiceNumber}</p>
                                <p className="text-gray-500">{p.date}</p>
                                <p className="text-gray-800 text-xs"> {p.method}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-800">{p.amount}</p>
                                <button
                                    onClick={() => setPaymentToDelete(p)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                                </div>
                            </div>
                            ))}
                        </div>
                    </InfoCard>

                    {/* <InfoCard title="Customer">
                        <div className="space-y-1 text-sm">
                            <p className="font-medium text-gray-800">{appointment.customer.name}</p>
                            <p className="text-gray-500">{appointment.customer.email}</p>
                            <p className="text-gray-500">{appointment.customer.phone}</p>
                        </div>
                    </InfoCard> */}
                </div>
                </div>
            </div>
            
            {/* All Modals */}
            {isPaymentModalOpen && selectedInvoiceId !== null && (
                <RecordPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    invoiceId={selectedInvoiceId} // ✅ always number now
                    onPaymentRecorded={(payment) => {
                        handleNewPayment(payment); // your optimistic update
                        fetchAppointment();        // 🔥 refresh from server
                    }}
                />
            )}

            {isNoteModalOpen && ( 
                <NoteModal
                    isOpen={isNoteModalOpen}
                    onClose={() => {
                        setIsNoteModalOpen(false);
                        setNoteToEdit(null);
                        setNewNote("");
                    }}
                    noteToEdit={noteToEdit}
                    appointmentId={appointmentIdFromUrl} // 👈 pass the ID
                    onNoteSaved={(savedNote) => {   // 👈 must match NoteModalProps
                        setAppointment((prev) =>
                        prev
                            ? {
                                ...prev,
                                notesHistory: noteToEdit
                                ? prev.notesHistory.map((n) =>
                                    n.id === savedNote.id ? savedNote : n
                                    )
                                : [savedNote, ...prev.notesHistory],
                            }
                            : null
                        );

                        setIsNoteModalOpen(false);
                        setNoteToEdit(null);
                        setNewNote("");
                    }}
                />
            )}
         
           {isInvoiceModalOpen && (
            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => {
                    setIsInvoiceModalOpen(false);
                    setInvoiceToEdit(null); // reset when closing
                }}
                onInvoiceSaved={(newInvoice) => {
                    setInvoices((prev) =>
                invoiceToEdit
                    ? prev.map((inv) => (inv.id === newInvoice.id ? newInvoice : inv))
                    : [newInvoice, ...prev]
                )
                    setIsInvoiceModalOpen(false);
                    setInvoiceToEdit(null);
                }}
                sourceType="appointment"
                sourceId={appointment.id}
                contactId={appointment.customer.customer_id}
                mode={invoiceToEdit ? "edit" : "create"}
                existingInvoice={invoiceToEdit}
            />
            )}

            <FileUploadModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onFileUploaded={() => {
                         fetchAppointment(); 
                }}
            />

            {isRescheduleModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Reschedule Appointment</h3>
                        <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select a new date</label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => {
                                    const selectedDate = e.target.value;
                                    setNewDate(selectedDate);  // ✅ update state
                                    handleFetchAvailableSlots(selectedDate); // ✅ fetch slots for that date
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                />
                        </div>
                        {newDate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select an available time</label>
                                {isLoadingSlots ? (<div className="text-center py-4 text-gray-500">Loading slots...</div>) : availableSlots.length > 0 ? (<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{availableSlots.map(slot => (<button key={slot} type="button" onClick={() => setNewTime(slot)} className={clsx("w-full text-center font-semibold rounded-lg py-2 transition-colors", newTime === slot ? 'bg-purple-600 text-white' : 'border border-purple-500 text-purple-600 hover:bg-purple-50')}>
                                    {formatSlotTime(slot)}
                                </button>))}</div>) : (<div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No slots available.</div>)}
                            </div>
                        )}
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button onClick={() => setIsRescheduleModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                            <button onClick={handleConfirmReschedule} disabled={!newTime} className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-300">Confirm Reschedule</button>
                        </div>
                    </div>
                </div>
            )}


            <DeleteConfirmModal
                isOpen={!!paymentToDelete}
                onCancel={() => setPaymentToDelete(null)}
                onConfirm={() => paymentToDelete && deletePaymentMutation.mutate(paymentToDelete.id)}
                title="Delete Payment"
                message={
                    paymentToDelete
                    ? `Are you sure you want to delete the payment of ${paymentToDelete.amount} on ${paymentToDelete.date}?`
                    : ""
                }
                deleting={deletingId === paymentToDelete?.id} // ✅ only disables for the active payment
            />


            <DeleteConfirmModal
                isOpen={!!invoiceToDelete}
                onCancel={() => setInvoiceToDelete(null)}
                onConfirm={() => invoiceToDelete && deleteInvoiceMutation.mutate(invoiceToDelete.id)}
                title="Delete Invoice"
                message={
                    invoiceToDelete
                        ? `Are you sure you want to delete the invoice of ${invoiceToDelete.invoiceNumber}?`
                        : ""
                }
                deleting={deletingInvoiceId === invoiceToDelete?.id}
            />

            <DeleteConfirmModal
                isOpen={!!noteToDelete}
                onCancel={() => setNoteToDelete(null)}
                onConfirm={() => noteToDelete && deleteNoteMutation.mutate(noteToDelete.id)}
                title="Delete Note"
                message={
                    noteToDelete
                        ? `Are you sure you want to delete this note: "${noteToDelete.content}"?`
                        : ""
                }
                deleting={deletingNoteId === noteToDelete?.id}
            />

            {/* delete modal */}
            <DeleteConfirmModal
                isOpen={!!fileToDelete}
                onCancel={() => setFileToDelete(null)}
                onConfirm={() => fileToDelete && handleDelete(fileToDelete.id)}
                title="Delete File"
                message={
                fileToDelete
                    ? `Are you sure you want to delete "${fileNameFromPath(fileToDelete.file_path)}"?`
                    : ""
                }
                deleting={deletingFileId === fileToDelete?.id}
            />

        </DashboardLayout>

  );
}
