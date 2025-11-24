'use client';

import React, { useState, useEffect, FC } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import clsx from "clsx";
import DashboardLayout from "@/components/DashboardLayout";
import InvoiceModal from "@/components/InvoiceModal"; 
import NoteModal from "@/components/NoteModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import {Edit, RefreshCw, Trash2, ChevronUp, ChevronDown, PlusCircle,  FileText, Download, FileImage } from 'lucide-react';
import { formatDate } from "@/app/utils/formatDate";
import {Invoice } from "@/types/invoice";
import { downloadFile } from "@/app/utils/downloadFile";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import FileUploadModal from "@/components/FileUploadModal";
import { PaymentHistoryItem, NoteItem, ProjectDisplayData  } from "@/types/ProjectTypes";
import { useProjectState } from "@/hooks/useProjectState";
import { ProjectApi } from "@/app/actions/ProjectApi"; // NEW

import Image from "next/image";
import toast from "react-hot-toast";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import QuotationModal from "@/components/QuotationModal";
import { Quotation } from "@/types/quotation";
import CreateExpenseModal from "@/components/ExpenseModal";
import { ExpenseResponse } from "@/types/expenses";

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

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectIdFromUrl = params.id as string;
  const queryClient = useQueryClient();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
// const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
// const [expenseToEdit, setExpenseToEdit] = useState<ExpenseItemType | null>(null);

const [expenseSearch, setExpenseSearch] = useState("");
const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
const [expenseToEdit, setExpenseToEdit] = useState(null);

  // 1. STATE & DATA

    // call the project state
  const {
    project, setProject,
    expandedInvoice, setExpandedInvoice,
    quotationToEdit, setQuotationToEdit,
    isQuotationModalOpen, setIsQuotationModalOpen,

    invoiceToEdit, setInvoiceToEdit,
    isInvoiceModalOpen, setIsInvoiceModalOpen,

    isNoteModalOpen, setIsNoteModalOpen,
    noteToEdit, setNoteToEdit,
   
    isPaymentModalOpen, setIsPaymentModalOpen,
    selectedInvoiceId, setSelectedInvoiceId,

    paymentToDelete, setPaymentToDelete,
    expenseToDelete, setExpenseToDelete,
    deletingId, setDeletingId,

     quotationToDelete, setQuotationToDelete,
    deletingQuotationId, setDeletingQuotationId,

    invoiceToDelete, setInvoiceToDelete,
    deletingInvoiceId, setDeletingInvoiceId,

    noteToDelete, setNoteToDelete,
    deletingNoteId, setDeletingNoteId,
    deletingFileId, setDeletingFileId,
    fileToDelete, setFileToDelete,
    isFileModalOpen, setIsFileModalOpen
  } = useProjectState();
  
    const { project: fetchedProject, invoices: fetchedInvoices, quotations:fetchedQuotations, fetchProject, isLoading, error } = ProjectApi(projectIdFromUrl);




     const [isOpen, setIsOpen] = useState(false);


    // Helpers
    const fileNameFromPath = (p: string) =>
        p ? p.split("/").pop() || p : "file";
    const isImage = (t: string) => t?.toLowerCase().startsWith("image/");

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

    
    // Load on mount

    useEffect(() => {
        if (fetchedProject) {
            setProject(fetchedProject);
        }
    }, [fetchedProject, setProject]);



    useEffect(() => {
    if (fetchedInvoices) {
        setInvoices(fetchedInvoices);
    }
}, [fetchedInvoices]);


    useEffect(() => {
    if (fetchedQuotations) {
        setQuotations(fetchedQuotations);
    }
}, [fetchedQuotations]);

useEffect(() => {
  // Check if project data exists and if its expenses array has length
  if (project?.expenses?.length) { 
    
    // Use type assertion (as ExpenseResponse[]) to force compliance with the state type.
    // This tells TypeScript to trust that the data from the project is suitable for the state.
    setExpenses(project.expenses as ExpenseResponse[]); 
  }
}, [project?.expenses]);
  
    const handleEditInvoiceClick = (invoice: Invoice) => {
        setInvoiceToEdit(invoice);
       
        setIsInvoiceModalOpen(true);
    };

    const handleEditNoteClick = (note: NoteItem) => {
        setNoteToEdit(note);
        setIsNoteModalOpen(true);
    };

    const handleNewPayment = (payment: PaymentHistoryItem) => {
        setProject(prev => prev ? { ...prev, paymentHistory: [...prev.paymentHistory, payment], paymentStatus: "Paid" } : prev);
    };

    const [searchInvoice, setSearchInvoice] = useState("");

    // only run filter when project is loaded
    const filteredHistory = project?.paymentHistory?.filter((p) =>
        p.invoice_no?.toLowerCase().includes(searchInvoice.toLowerCase())
    ) ?? [];

        const openCreateInvoiceModal = () => {
            setInvoiceToEdit(null);
            
            setIsInvoiceModalOpen(true);
        };

        const openCreateQuotationModal = () => {
            setQuotationToEdit(null); // reset any previous quotation
            setIsQuotationModalOpen(true);
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
            return { id }; // return deleted invoice ID
        },

        onMutate: (id: number) => {
            setDeletingInvoiceId(id); // just mark as deleting
        },

        onSuccess: ({ id }) => {
            // Remove from UI only after successful deletion
            setInvoices(prev => prev ? prev.filter(inv => inv.id !== id) : []);
            toast.success("Invoice deleted successfully!");
            setInvoiceToDelete(null);
            setDeletingInvoiceId(null);
            queryClient.invalidateQueries(); // optional refetch
        },

        onError: (error) => {
            toast.error(error.message || "Failed to delete invoice.");
            setDeletingInvoiceId(null); // reset deleting state
        },
        });


        const deleteQuotationMutation = useMutation({
            mutationFn: async (id: number) => {
                const token = localStorage.getItem("token") || "";
                const res = await fetch(`${BASE_URL}/professionals/finances/quotations/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to delete quotation");
                return { id }; // return deleted quotation ID
            },

            onMutate: (id: number) => {
                // Set deleting ID so button shows "Deleting..."
                setDeletingQuotationId(id);
            },

            onSuccess: ({ id }) => {
                setQuotations(prev => prev ? prev.filter(q => q.id !== id) : []);
                toast.success("Quotation deleted successfully!");
                setQuotationToDelete(null);
                setDeletingQuotationId(null); // reset after success
            },

            onError: (err) => {
                toast.error(err.message || "Failed to delete quotation");
                setDeletingQuotationId(null); // reset on error
            },
        });

   
        const deletePaymentMutation = useMutation({
            mutationFn: async (id: number) => {
                const token = localStorage.getItem("token") || "";
                const res = await fetch(`${BASE_URL}/professionals/transactions/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to delete payment");

                return { id };
            },

            onMutate: (id: number) => {
                // Just like quotations: start delete UI state
                setDeletingId(id);
            },

            onSuccess: ({ id }) => {
                // Remove payment from UI after API success
                setProject(prev =>
                    prev
                        ? {
                            ...prev,
                            paymentHistory: prev.paymentHistory.filter(p => p.id !== id),
                        }
                        : null
                );

                queryClient.invalidateQueries({
                    queryKey: ["project", projectIdFromUrl],
                });

                toast.success("Payment deleted successfully!");
                setPaymentToDelete(null);
                setDeletingId(null);
            },

            onError: (err) => {
                toast.error(err.message || "Failed to delete payment");
                setDeletingId(null);
            },
        });

        const deleteExpenseMutation = useMutation({
        mutationFn: async (id: number) => {
            const token = localStorage.getItem("token") || "";
            const res = await fetch(`${BASE_URL}/professionals/transactions/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete expense");

            return { id };
        },

        onMutate: (id: number) => {
            setDeletingId(id); // spinner / disabled button
        },

        onSuccess: ({ id }) => {
            // ✅ Remove from the correct array
            setProject(prev =>
            prev
                ? {
                    ...prev,
                    expenses: prev.expenses.filter(exp => exp.id !== id),
                }
                : null
            );

            // ✅ Close the modal
            setExpenseToDelete(null);

            // ✅ Reset deleting state
            setDeletingId(null);

            toast.success("Expense deleted successfully!");

            // Optional: refetch project to sync backend
            queryClient.invalidateQueries({ queryKey: ["project", projectIdFromUrl] });
        },

        onError: (err) => {
            toast.error(err.message || "Failed to delete expense.");
            setDeletingId(null);
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
                    const res = await fetch(`${BASE_URL}/professionals/projects/notes/delete/${id}`, {
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
                    const previousNotes = project?.notesHistory || [];

                    setProject(prev =>
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
                    setProject(prev =>
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
        setProject((prev) => {
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

    if (isLoading) return <DashboardLayout><div className="text-center p-12">Loading...</div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="text-center p-12 text-red-600">{error}</div></DashboardLayout>;
    if (!project) return <DashboardLayout><div className="text-center p-12">No project data found.</div></DashboardLayout>;

    // -------------------- JSX --------------------
    return (
        <DashboardLayout>
            <HeaderTitleCard
                onGoBack={handleGoBack}
                title="Project Details"
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
                        <InfoCard title="Projects Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div><p className="text-gray-500">Service</p><p className="font-medium text-gray-800 mt-1">{project.serviceName}</p></div>
                                <div><p className="text-gray-500">Date</p><p className="font-medium text-gray-800 mt-1">{project.date}</p></div>
                                <div><p className="text-gray-500">Time</p><p className="font-medium text-gray-800 mt-1">{project.time}</p></div>
                                <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-800 mt-1"><span className={clsx("px-2 py-1 text-xs font-medium rounded-full", {'bg-green-100 text-green-800': ['Completed', 'Converted'].includes(project.projectStatus),'bg-yellow-100 text-yellow-800': project.projectStatus === 'Inprogress','bg-blue-100 text-blue-800': project.projectStatus === 'Upcoming','bg-red-100 text-red-800': project.projectStatus === 'Cancelled','bg-orange-100 text-orange-800': project.projectStatus === 'Rescheduled',})}>{project.projectStatus}</span></p></div>
                            </div>
                            <div className="w-full mt-5"><p className="font-bold text-gray-800">Description</p><p className="text-gray-600 whitespace-pre-wrap">{project.notes || 'No notes provided.'}</p></div>
                        </InfoCard>
                    )}
                    

                </div>
            </div>
            
            {/* FINANCIALS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Left Column: Quotations & Invoices */}
  <div className="lg:col-span-2 space-y-8">
    {/* Quotations */}
    {activeTab === "financials" && (
      <InfoCard
        title="Quotations"
        action={
          <button
            onClick={openCreateQuotationModal}
            className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800"
          >
            + Create Quotation
          </button>
        }
      >
        <div className="space-y-3 max-h-[38rem] overflow-y-auto pr-2">
          {quotations && quotations.length > 0 ? (
            quotations.map((q) => {
              const subtotal =
                q.items?.reduce((acc, item) => {
                  const base = item.amount ?? (item.quantity ?? 0) * (item.rate ?? 0);
                  return acc + base;
                }, 0) ?? 0;
              const finalTotal =
                subtotal + (subtotal * (q.taxPercentage ?? 0)) / 100 -
                (subtotal * (q.discountPercentage ?? 0)) / 100;

              const isExpanded = expandedInvoice === q.id;

              return (
                <div key={q.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md">
                  {/* Header */}
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => setExpandedInvoice(isExpanded ? null : q.id)}
                  >
                    <div>
                      <p className="font-semibold">{q.quotationNumber}</p>
                      <p className="text-xs text-gray-500">Issued: {q.issueDate}</p>
                      <p className="text-xs text-gray-500">Due: {q.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">₦{finalTotal.toLocaleString()}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuotationToEdit(q);
                          setIsQuotationModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuotationToDelete(q);
                        }}
                        className="p-2 hover:bg-gray-200 text-red-600 rounded-full"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <table className="w-full text-sm text-left mt-2 border-t">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Rate</th>
                            <th className="text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="py-2">{item.description}</td>
                              <td className="py-2 text-right">{item.quantity}</td>
                              <td className="py-2 text-right">₦{item.rate}</td>
                              <td className="py-2 text-right">₦{item.quantity * item.rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="flex flex-col items-end mt-3 space-y-1">
                        <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
                        <p>Tax: {q.taxPercentage}%</p>
                        <p>Discount: {q.discountPercentage}%</p>
                        <p className="text-lg font-semibold">Total: ₦{finalTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-center py-4">No quotation available</p>
          )}
        </div>
      </InfoCard>
    )}

    {/* Invoices */}
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
        <div className="space-y-3 max-h-[38rem] overflow-y-auto pr-2">
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => {
              const subtotal =
                invoice.items?.reduce((acc, item) => {
                  const base = item.amount ?? (item.quantity ?? 0) * (item.rate ?? 0);
                  return acc + base;
                }, 0) ?? 0;
              const finalTotal =
                subtotal + (subtotal * (invoice.taxPercentage ?? 0)) / 100 -
                (subtotal * (invoice.discountPercentage ?? 0)) / 100;
              const remainingBalance = Number(invoice.remainingBalance ?? finalTotal);

              let statusLabel = "Pending";
              let statusClassName = "bg-yellow-100 text-yellow-800";
              if (remainingBalance === 0) {
                statusLabel = "Fully Paid";
                statusClassName = "bg-green-100 text-green-800";
              } else if (remainingBalance === finalTotal) {
                statusLabel = "Unpaid";
                statusClassName = "bg-red-100 text-red-800";
              } else if (remainingBalance > 0 && remainingBalance < finalTotal) {
                statusLabel = "Partially Paid";
                statusClassName = "bg-blue-100 text-blue-800";
              }
              if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && remainingBalance > 0) {
                statusLabel = "Overdue";
                statusClassName = "bg-red-200 text-red-900";
              }

              const isExpanded = expandedInvoice === invoice.id;

              return (
                <div key={invoice.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                  {/* Header */}
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
                      <p className="text-xs text-gray-500">Bal.: ₦{Number(invoice.remainingBalance).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₦{finalTotal.toLocaleString()}</p>
                        <span className={clsx("px-2 py-0.5 text-xs font-medium rounded-full", statusClassName)}>
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
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                      </div>
                    </div>

                  </div>

                  {/* Expanded */}
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

  {/* Right Column: Payment History & Expenses */}
  <div className="lg:col-span-1 space-y-8">
    {activeTab === "financials" && (
      <>
        {/* Payment History */}
        <InfoCard
          title="Payment History"
          action={
            <span
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded-full",
                {
                  "bg-yellow-100 text-yellow-800": totals.totalPaid > 0 && totals.totalPaid < project.projectAmount,
                  "bg-green-100 text-green-800": totals.totalPaid >= project.projectAmount,
                  "bg-red-100 text-red-800": totals.totalPaid === 0,
                }
              )}
            >
              {totals.totalPaid === 0 ? "Unpaid" : totals.totalPaid < project.projectAmount ? "Partially Paid" : "Paid"}
            </span>
          }
        >
          {/* Totals */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Budget</p>
              <p className="font-semibold text-gray-800">
                ₦{Number(project.projectAmount).toLocaleString("en-NG")}
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

          {/* Search & List */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search by Invoice Number..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-3">
            {filteredHistory.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <div>
                  <p className="text-xs text-gray-500">{p.invoice_no}</p>
                  <p className="text-gray-500">{p.date}</p>
                  <p className="text-gray-800 text-xs">{p.method}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{p.amount}</p>
                  <button onClick={() => setPaymentToDelete(p)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Expenses */}
        <InfoCard title="Expenses">
          {/* Totals */}
          <div className="grid grid-cols-1 mb-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="font-semibold text-red-600">
                ₦{project?.expenses?.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              value={expenseSearch}
              onChange={(e) => setExpenseSearch(e.target.value)}
              placeholder="Search by description or category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-3">
            {(expenses ?? [])
              .filter(
                (exp) =>
                  (exp.title ?? "").toLowerCase().includes(expenseSearch.toLowerCase()) ||
                  (exp.category ?? "").toLowerCase().includes(expenseSearch.toLowerCase())
              )
              .map((expense) => (
                <div key={expense.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg shadow-sm">
                  <div>
                    <p className="text-gray-800 font-medium">{expense.title ?? "None"}</p>
                    <p className="text-gray-500 text-xs">{new Date(expense.date).toLocaleDateString()}</p>
                    <p className="text-gray-400 text-xs">{expense.category ?? "None"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">₦{Number(expense.amount).toLocaleString()}</p>
                    <button onClick={() => setExpenseToDelete(expense)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Expense */}
          <div className="mt-3 flex justify-end">
            <button
              className="bg-[#7E51FF] text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
            >
              + Add Expense
            </button>
          </div>
        </InfoCard>
      </>
    )}
  </div>
</div>


            {/* other */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === "notes" && (
                        <InfoCard
                            title="Project Notes"
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
                                {project.notesHistory && project.notesHistory.length > 0 ? (
                                project.notesHistory.map(note => (
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
                                {project.documents && project.documents.length > 0 ? (
                                project.documents.map((doc) =>
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
                        fetchProject(); // refresh
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
                entityId={projectIdFromUrl}  // ✅ correct prop name
                type="project"
                onNoteSaved={(savedNote, isUpdate) => {
                setProject((prev: ProjectDisplayData | null) => {
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


            {isQuotationModalOpen && (
                <QuotationModal
                isOpen={isQuotationModalOpen}
                onClose={() => {
                    setIsQuotationModalOpen(false);
                    setQuotationToEdit(null);
                }}
                onCreated={(newQuotation) => {
                    setQuotations((prev) =>
                    quotationToEdit
                        ? prev.map((q) => (q.id === newQuotation.id ? newQuotation : q))
                        : [newQuotation, ...prev]
                    );
                    setIsQuotationModalOpen(false);
                    setQuotationToEdit(null);
                }}
                sourceType="project"
                sourceId={project.id}
                contactId={project.customer.customer_id}
                   
                mode={quotationToEdit ? "edit" : "create"}
                existingQuotation={quotationToEdit || undefined}
                />

            )}


            {isExpenseModalOpen && (
                <CreateExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => {
                        setIsExpenseModalOpen(false)
                    }}
                    onCreated={(newExpense) => {
                        // Insert or update in the parent list
                        setExpenses((prev) =>
                            expenseToEdit
                                ? prev.map((exp) =>
                                    exp.id === newExpense.id ? newExpense : exp
                                )
                                : [newExpense, ...prev]
                        )

                        setIsExpenseModalOpen(false)
                        setExpenseToEdit(null)
                    }}
                    projectId={project.id}            // <— IMPORTANT
                    sourceType="project"              // <— Just like InvoiceModal
                    mode={expenseToEdit ? "edit" : "create"}
                    existingExpense={expenseToEdit}
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
                    sourceType="project"
                    sourceId={project.id}
                    contactId={project.customer.customer_id}
                    mode={invoiceToEdit ? "edit" : "create"}
                    existingInvoice={invoiceToEdit}
                />
            )}

            <FileUploadModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onFileUploaded={() => {
                        fetchProject(); 
                }}
            />
        
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
  isOpen={!!expenseToDelete} // ✅ modal controlled by this state
  onCancel={() => setExpenseToDelete(null)} 
  onConfirm={() => expenseToDelete && deleteExpenseMutation.mutate(expenseToDelete.id)}
  title="Delete Expense"
  message={
    expenseToDelete
      ? `Are you sure you want to delete the expense of ${expenseToDelete.amount} on ${expenseToDelete.date}?`
      : ""
  }
  deleting={deletingId === expenseToDelete?.id} // only disables for the active expense
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
                isOpen={!!quotationToDelete}
                onCancel={() => setQuotationToDelete(null)}
                onConfirm={() => quotationToDelete && deleteQuotationMutation.mutate(quotationToDelete.id)}
                title="Delete quotation"
                message={
                    quotationToDelete
                        ? `Are you sure you want to delete the quotationm of ${quotationToDelete.quotationNumber}?`
                        : ""
                }
                deleting={deletingQuotationId === quotationToDelete?.id}
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
