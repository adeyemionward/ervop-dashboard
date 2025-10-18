'use client';

import React, { useState, useEffect, FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import clsx from "clsx";
import DashboardLayout from "@/components/DashboardLayout";
import InvoiceModal from "@/components/InvoiceModal"; 
import AppointmentStatusModal from "@/components/AppointmentStatusModal";
import NoteModal from "@/components/NoteModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import {  Clock, Edit, RefreshCw, Trash2, ChevronUp, ChevronDown, PlusCircle,  FileText, Download, FileImage } from 'lucide-react';
import { formatDate } from "@/app/utils/formatDate";
import {Invoice } from "@/types/invoice";
import { downloadFile } from "@/app/utils/downloadFile";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import FileUploadModal from "@/components/FileUploadModal";
import { PaymentHistoryItem, NoteItem, AppointmentDisplayData  } from "@/types/AppointmentTypes";
import { useAppointmentState } from "@/hooks/useAppointmentState";
import { AppointmentApi } from "@/app/actions/AppointmentApi"; // NEW

import Image from "next/image";
import toast from "react-hot-toast";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";

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

// -------------------- MAIN COMPONENT --------------------

export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentIdFromUrl = params.id as string;
  const queryClient = useQueryClient();

  // 1. STATE & DATA

    // call the appointment state
  const {
    appointment, setAppointment,
    invoices, setInvoices,
    expandedInvoice, setExpandedInvoice,
    invoiceToEdit, setInvoiceToEdit,
    isInvoiceModalOpen, setIsInvoiceModalOpen,
    isAppointmentStatusModalOpen, setIsAppointmentStatusModalOpen,
    isNoteModalOpen, setIsNoteModalOpen,
    noteToEdit, setNoteToEdit,
   
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
    isFileModalOpen, setIsFileModalOpen
  } = useAppointmentState();
  
    const { appointment: fetchedAppointment, fetchAppointment, isLoading, error } = AppointmentApi(appointmentIdFromUrl);



     const [isOpen, setIsOpen] = useState(false);


    // Helpers
    const fileNameFromPath = (p: string) =>
        p ? p.split("/").pop() || p : "file";
    const isImage = (t: string) => t?.toLowerCase().startsWith("image/");
    // const isPdf = (t: string) => t?.toLowerCase().includes("pdf");

    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    //   TABS
    const [activeTab, setActiveTab] = useState("summary");

    const tabs = [
        { key: "summary", label: "Summary" },
        { key: "financials", label: "Financials" },
        { key: "documents", label: "Documents" },
        { key: "notes", label: "Notes" },
    ];

    

    const handleGoBack = useGoBack();
    const [totals] = useState({ totalBudget: 0, totalPaid: 0, outstanding: 0 });

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    useEffect(() => {
        if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) setToken(token);
        }
    }, []);
    
    // Load on mount

    useEffect(() => {
        if (fetchedAppointment) {
            setAppointment(fetchedAppointment);
        }
    }, [fetchedAppointment, setAppointment]);
  
    const handleEditInvoiceClick = (invoice: Invoice) => {
        setInvoiceToEdit(invoice);
       
        setIsInvoiceModalOpen(true);
    };

    const handleEditNoteClick = (note: NoteItem) => {
        setNoteToEdit(note);
        setIsNoteModalOpen(true);
    };

    const handleNewPayment = (payment: PaymentHistoryItem) => {
        setAppointment(prev => prev ? { ...prev, paymentHistory: [...prev.paymentHistory, payment], paymentStatus: "Paid" } : prev);
    };

    const [searchInvoice, setSearchInvoice] = useState("");

    // only run filter when appointment is loaded
    const filteredHistory = appointment?.paymentHistory?.filter((p) =>
        p.invoice_no?.toLowerCase().includes(searchInvoice.toLowerCase())
    ) ?? [];

        const openCreateInvoiceModal = () => {
            setInvoiceToEdit(null);
            
            setIsInvoiceModalOpen(true);
        };
    
    const deleteInvoiceMutation = useMutation({
        mutationFn: async (id: number) => {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`${BASE_URL}/professionals/invoices/delete/${id}`, {
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
            queryClient.invalidateQueries(); // optional refetch for server sync
        }
    });

    const deletePaymentMutation = useMutation({
        mutationFn: (id: number) => {
            const token = localStorage.getItem("token") || "";
            return fetch(`${BASE_URL}/professionals/invoices/deletePayment/${id}`, {
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

    const deleteNoteMutation = useMutation<
        string, // response type
        Error, // error type
        number, // variable type (the id)
        { previousNotes: NoteItem[] } // context type
        >
        ({
            mutationFn: async (id: number) => {
                const token = localStorage.getItem("token") || "";
                const res = await fetch(`${BASE_URL}/professionals/appointments/notes/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to delete note");
                return data;
            },

            onMutate: (id: number) => {
                const previousNotes = appointment?.notesHistory || [];

                setAppointment(prev =>
                prev
                    ? {
                        ...prev,
                        notesHistory: prev.notesHistory.filter(n => n.id !== id),
                    }
                    : null
                );

                setDeletingNoteId(id);
                return { previousNotes };
            },

            onError: (error, id, context) => {
                if (context?.previousNotes) {
                setAppointment(prev =>
                    prev
                    ? { ...prev, notesHistory: context.previousNotes }
                    : null
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

    // ---------- Delete File ----------
    const handleDelete = async (fileId: number): Promise<void> => {
    setDeletingFileId(fileId);

    try {
        const token = localStorage.getItem("token");
        if (!token) {
        toast.error("Authentication token missing");
        return;
        }

        const res = await fetch(`${BASE_URL}/professionals/documents/delete/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        });

        // Try to parse JSON safely
        const data: { status?: boolean; message?: string } = await res.json().catch(() => ({}));

        if (!res.ok || data.status === false) {
        throw new Error(data.message || "Delete failed");
        }

        // ✅ Safely handle possible null
        setAppointment((prev) => {
        if (!prev) return prev; // keep null if it was null

        const updatedDocuments = prev.documents.map((doc) => ({
            ...doc,
            files: doc.files.filter((f) => f.id !== fileId),
        }));

        return { ...prev, documents: updatedDocuments };
        });

        toast.success("File deleted successfully");
    } catch (err) {
        // ✅ Type-safe error handling (no `any`)
        const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred while deleting the file.";
        toast.error(errorMessage);
    } finally {
        setDeletingFileId(null);
        setFileToDelete(null);
    }
    };

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
            <HeaderTitleCard
                onGoBack={handleGoBack}
                title="Appointments"
                description="Manage your schedule, availability, and client bookings."
                >
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <span>Quick Actions</span>
                        <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        
                        {/* Button to open modal */}
                        <button
                            onClick={() => {
                            setIsAppointmentStatusModalOpen(true);
                            setIsOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>Update Status</span>
                        </button>

                        {/* Navigation Link */}
                        <Link
                            href="/appointments/availability"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsOpen(false)}
                        >
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>Reschedule</span>
                        </Link>

                        <Link
                            href="/booking-link"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsOpen(false)}
                        >
                            <RefreshCw className="w-4 h-4 text-purple-600" />
                            <span>Convert to Project</span>
                        </Link>

                        </div>
                    )}
                </div>
            </HeaderTitleCard>
               
            {/* Tabs Navigation */}
            <div className="flex space-x-6 border-b border-gray-300 mb-6 overflow-x-auto whitespace-nowrap px-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-block px-4 py-2 font-medium ${
                        activeTab === tab.key
                        ? "border-b-2 border-purple-600 text-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    >
                    {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* SUMMARY TAB */}
                    {activeTab === "summary" && (
                        <InfoCard title="Appointment Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div><p className="text-gray-500">Service</p><p className="font-medium text-gray-800 mt-1">{appointment.serviceName}</p></div>
                                <div><p className="text-gray-500">Date</p><p className="font-medium text-gray-800 mt-1">{appointment.date}</p></div>
                                <div><p className="text-gray-500">Time</p><p className="font-medium text-gray-800 mt-1">{appointment.time}</p></div>
                                <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-800 mt-1"><span className={clsx("px-2 py-1 text-xs font-medium rounded-full", {'bg-green-100 text-green-800': ['Completed', 'Converted'].includes(appointment.appointmentStatus),'bg-yellow-100 text-yellow-800': appointment.appointmentStatus === 'Inprogress','bg-blue-100 text-blue-800': appointment.appointmentStatus === 'Upcoming','bg-red-100 text-red-800': appointment.appointmentStatus === 'Cancelled','bg-orange-100 text-orange-800': appointment.appointmentStatus === 'Rescheduled',})}>{appointment.appointmentStatus}</span></p></div>
                            </div>
                            <div className="w-full mt-5"><p className="font-bold text-gray-800">Description</p><p className="text-gray-600 whitespace-pre-wrap">{appointment.notes || 'No notes provided.'}</p></div>
                        </InfoCard>
                    )}
                    

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    
                    {activeTab === "financials" && (

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
                            <div className="space-y-3 max-h-150 overflow-y-auto pr-2">
                                {invoices && invoices.length > 0 ? (
                                invoices.map((invoice) => {
                                    const subtotal = invoice.items?.reduce((acc, item) => {
                                    const base = item.amount ?? (item.quantity ?? 0) * (item.rate ?? 0);
                                    return acc + base;
                                    }, 0) ?? 0;

                                    // const discountPercentage = invoice.discountAmount ?? 0;
                                    // const taxPercentage = invoice.taxAmount ?? 0;

                                    // const discount = (subtotal * discountPercentage) / 100;
                                    // const tax = (subtotal * taxPercentage) / 100;

                                    // const total = subtotal - discount + tax;

                                    const finalTotal =
                                    subtotal +
                                    (subtotal * (invoice.taxPercentage ?? 0)) / 100 -
                                    (subtotal * (invoice.discountPercentage ?? 0)) / 100;

                                    const remainingBalance = Number(invoice.remainingBalance ?? finalTotal);

                                    let statusLabel = "Pending";
                                    let statusclassName = "bg-yellow-100 text-yellow-800";

                                    if (remainingBalance === 0) {
                                    statusLabel = "Fully Paid";
                                    statusclassName = "bg-green-100 text-green-800";
                                    } else if (remainingBalance === finalTotal) {
                                    statusLabel = "Unpaid";
                                    statusclassName = "bg-red-100 text-red-800";
                                    } else if (remainingBalance > 0 && remainingBalance < finalTotal) {
                                    statusLabel = "Partially Paid";
                                    statusclassName = "bg-blue-100 text-blue-800";
                                    }

                                    if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && remainingBalance > 0) {
                                    statusLabel = "Overdue";
                                    statusclassName = "bg-red-200 text-red-900";
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
                                                statusclassName
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
                    )}
            

                </div>
            

                <div className="lg:col-span-1 space-y-8">
                    <div className="lg:col-span-1 space-y-8">
                    
                        {activeTab === "financials" && (
                            <>
                            <InfoCard
                                title="Payment History"
                                action={
                                    <span
                                    className={clsx(
                                        "px-3 py-1 text-xs font-medium rounded-full",
                                        {
                                        "bg-yellow-100 text-yellow-800":
                                            totals.totalPaid > 0 && totals.totalPaid < appointment.appointmentAmount,
                                        "bg-green-100 text-green-800":
                                            totals.totalPaid >= appointment.appointmentAmount,
                                        "bg-red-100 text-red-800": totals.totalPaid === 0,
                                        }
                                    )}
                                    >
                                    {totals.totalPaid === 0
                                        ? "Unpaid"
                                        : totals.totalPaid < appointment.appointmentAmount
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
                                    <p className="text-xs text-gray-500">Total Paid</p>
                                    <p className="font-semibold text-green-600">₦{totals.totalPaid.toLocaleString()}</p>
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
                                        <p className="text-xs text-gray-500">{p.invoice_no}</p>
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

                            <InfoCard title="Expenses">
                                    {/* Totals */}
                                    <div className="grid grid-cols-1 mb-4 text-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Expenses</p>
                                            <p className="font-semibold text-red-600">₦80,000</p>
                                        </div>
                                    </div>

                                    {/* Search bar */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            placeholder="Search by description or category..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Expense list */}
                                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-3">
                                        {/* Expense item */}
                                        <div className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg shadow-sm">
                                            <div>
                                            <p className="text-gray-800 font-medium">Contractor Payment</p>
                                            <p className="text-gray-500 text-xs">2025-10-01</p>
                                            <p className="text-gray-400 text-xs">Labor</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-800">₦50,000</p>
                                            <button className="text-red-500 hover:text-red-700">
                                                {/* Trash icon placeholder */}
                                                🗑
                                            </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg shadow-sm">
                                            <div>
                                            <p className="text-gray-800 font-medium">Material Purchase</p>
                                            <p className="text-gray-500 text-xs">2025-10-03</p>
                                            <p className="text-gray-400 text-xs">Supplies</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-800">₦20,000</p>
                                            <button className="text-red-500 hover:text-red-700">
                                                🗑
                                            </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg shadow-sm">
                                            <div>
                                            <p className="text-gray-800 font-medium">Transport Cost</p>
                                            <p className="text-gray-500 text-xs">2025-10-05</p>
                                            <p className="text-gray-400 text-xs">Logistics</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-800">₦10,000</p>
                                            <button className="text-red-500 hover:text-red-700">
                                                🗑
                                            </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add expense button */}
                                    <div className="mt-3 flex justify-end">
                                    <button className="bg-[#7E51FF] text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                                        + Record Expense
                                    </button>
                                    </div>
                            </InfoCard>
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* other */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === "notes" && (
                        <InfoCard
                            title="Appointment Notes"
                            action={
                                <button
                                onClick={() => {
                                    setNoteToEdit(null);
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
                                    <Image
                                        alt="User avatar"
                                        src="https://i.pravatar.cc/150?u=ervop-admin"
                                        width={32} // your desired width
                                        height={32} // your desired height
                                        className="rounded-full object-cover"
                                        />
                                    <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">{note.content}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                        {note.author} - {note.date}
                                        </p>
                                    </div>
                                    <div className="absolute top-4 right-2 flex items-center space-x-1">
                                        <button
                                        onClick={() => handleEditNoteClick(note)}
                                        className="p-2 rounded-full hover:bg-gray-200"
                                        >
                                        <Edit className="h-5 w-5" />
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
                    )}
                        
                    {activeTab === "documents" && (
                        <InfoCard
                            title="Project Documents"
                            action={
                                <button
                                    onClick={() => setIsFileModalOpen(true)}
                                    className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800"
                                >
                                    + Upload File
                                </button>
                                
                            }
                            >
                            <div className="max-width pr-2 space-y-3">
                                {appointment.documents && appointment.documents.length > 0 ? (
                                appointment.documents.map((doc) =>
                                    doc.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg group"
                                    >
                                        <div className="flex items-center space-x-3">
                                        <div className="bg-gray-200 p-3 rounded-full">
                                            {isImage(file.file_path) ? (
                                            <FileImage className="w-6 h-6 text-gray-600" />
                                            ) : (
                                            <FileText className="w-6 h-6 text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <a
                                            href={file.file_path}
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
                                            Uploaded: {formatDate(file.created_at)} • {file.file_type.toUpperCase()}
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
                    )} 
                </div>  
            </div>  
            
            {/* All Modals */}
            {isPaymentModalOpen && selectedInvoiceId !== null && (
                <RecordPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    invoiceId={selectedInvoiceId} // ✅ always number now
                    onPaymentRecorded={(payment) => {
                        const fullPayment: PaymentHistoryItem = {
                            ...payment,
                            status: "Paid",              // default or from modal
                            payments: [],                // could push the new PaymentItem here
                            invoice_no: `#INV-${selectedInvoiceId}`,
                            created_at: new Date().toISOString(),
                        };
                        handleNewPayment(fullPayment);
                        fetchAppointment(); // refresh
                    }}

                />
            )}

            {isNoteModalOpen && (
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => {
                setIsNoteModalOpen(false);
                setNoteToEdit(null);
                }}
                noteToEdit={noteToEdit}
                appointmentId={appointmentIdFromUrl} // string
                onNoteSaved={(savedNote, isUpdate) => {
                setAppointment((prev: AppointmentDisplayData | null) => {
            if (!prev) return prev;

            const noteWithCreatedAt: NoteItem = {
                ...savedNote,
                created_at: savedNote.created_at ?? new Date().toISOString(),
            };

            return {
                ...prev,
                notesHistory: isUpdate
                ? prev.notesHistory.map((n) =>
                    n.id === noteWithCreatedAt.id ? noteWithCreatedAt : n
                    )
                : [noteWithCreatedAt, ...prev.notesHistory],
            };
            });



            setIsNoteModalOpen(false);
            setNoteToEdit(null);
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

            {/* Status Modal */}
            {isAppointmentStatusModalOpen && (
                <AppointmentStatusModal
                isOpen={isAppointmentStatusModalOpen}
                currentStatus={appointment.appointmentStatus}
                appointmentId={Number(appointment.id)}
                onClose={() => setIsAppointmentStatusModalOpen(false)}
                onStatusUpdated={(newStatus) => {
                    setAppointment((prev) =>
                    prev ? { ...prev, appointmentStatus: newStatus } : prev
                    );
                }}
                />
            )}


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
