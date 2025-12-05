'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import DeleteConfirmModal from "@/components/DeleteConfirmModal"; // ✅ import modal
import { Eye, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import InvoiceStatusBadge from "@/components/InvoiceStatusBadge";
import Modal from "@/components/Modal";
import InvoiceSettings from "@/types/InvoiceSettings";
import InvoiceSettingsModal from "@/components/InvoiceSettingsModal";


type Customer = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
};

type Invoice = {
  id: number;
  invoice_no: string;
  issue_date: string;
  due_date: string;
  total: number;
  paid_amount: number;
  remaining_balance: number;
  status: "Paid" | "Unpaid" | "Overdue" | "Partially Paid" | string;
  customer: Customer;
};

type Overview = {
  total_billed: number;
  total_paid: number;
  total_unpaid: number;
  total_overdue: number;
  total_partially_paid: number;
};

export default function InvoicesPage() {
  const handleGoBack = useGoBack();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ Delete states
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
     // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);
const [editingSettings, setEditingSettings] = useState<InvoiceSettings | null>(null);

// --- Invoice Settings Save Handler ---
const handleInvoiceSave = (data: InvoiceSettings, isEdit: boolean) => {
  setEditingSettings(prev => {
    if (isEdit) {
      // If editing, merge changes with existing state (optional)
      return { ...prev, ...data };
    } else {
      // If creating new settings
      return data;
    }
  });

  console.log("Saved invoice settings:", data, "isEdit:", isEdit);
};



  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
 
  useEffect(() => {
    const fetchInvoices = async () => {
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/professionals/invoices/list/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.status) {
          setInvoices(data.data);
          setOverview(data.overview);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [BASE_URL]);

  // ✅ Delete invoice function
  const deleteInvoice = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await fetch(`${BASE_URL}/professionals/invoices/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete invoice");

      // ✅ Remove from state
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setInvoiceToDelete(null);
      toast.success("Invoice deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete invoice. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Filter/Search logic
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
      const matchesSearch =
        inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
        `${inv.customer?.firstname} ${inv.customer?.lastname}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" ? true : inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Invoices"
        description="Track and manage all your invoices in one place."
      >
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={() => {
              setEditingSettings(editingSettings); // keep existing values if already saved
              setIsModalOpen(true);
            }}
            className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Settings />
            <span>Invoice Settings</span>
          </button>


          <Link href="invoices/new" className="btn-primary flex items-center justify-center">
            <Plus />
            <span>Generate Invoice</span>
          </Link>
        </div>
      </HeaderTitleCard>
      {/* ✅ MODAL LOGIC */}
        
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSettings ? "Edit Invoice Settings" : "Add Invoice Settings"}
      >
        <InvoiceSettingsModal
          onClose={() => setIsModalOpen(false)}
          // existingData={editingSettings}   // if null → create mode
          onSuccess={handleInvoiceSave}
        />
      </Modal>


      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Billed" value={overview ? `₦${overview.total_billed.toLocaleString()}` : "₦0"} icon={Icons.arrowUp} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" valueTextSize="text-md"/>
        <StatCard title="Paid" value={overview ? `₦${overview.total_paid.toLocaleString()}` : "₦0"} icon={Icons.cash} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" valueTextSize="text-md"/>
        <StatCard title="Unpaid" value={overview ? `₦${overview.total_unpaid.toLocaleString()}` : "₦0"} icon={Icons.cashPending} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" valueTextSize="text-md"/>
        <StatCard title="Overdue" value={overview ? `₦${overview.total_overdue.toLocaleString()}` : "₦0"} icon={Icons.arrowDown} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" valueTextSize="text-md"/>
        <StatCard title="Partially Paid" value={overview ? `₦${overview.total_partially_paid.toLocaleString()}` : "₦0"} icon={Icons.refresh} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" valueTextSize="text-md"/>
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40"
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
          <option value="Partially Paid">Partially Paid</option>
        </select>

        <div className="hidden md:block md:flex-grow"></div>

        <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
          <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium rounded-lg">
            Clear Filters
          </button>
          <button className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
            <Icons.refresh className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable
          columns={[
            { label: "Invoice #", field: "invoice_no" },
            { label: "Customer", render: (row) => `${row.customer.firstname} ${row.customer.lastname}` },
            { label: "Issue Date", field: "issue_date" },
            { label: "Due Date", field: "due_date" },
            { label: "Total", render: (row) => `₦${row.total.toLocaleString()}`, alignRight: true },
            { label: "Amount Paid", render: (row) => `₦${row.paid_amount.toLocaleString()}`, alignRight: true },
            { label: "Balance", render: (row) => `₦${Number(row.remaining_balance).toLocaleString()}`, alignRight: true },
            {
              label: "Status",
              render: (row) => (
                <InvoiceStatusBadge status={row.status} />
              ),
            },
          ]}
          data={filteredInvoices}
          loading={loading}
          error={error}
          itemsPerPage={10}
          actions={(row) => (
            <>
              <Link href={`/finance/invoices/view/${row.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                <Eye className="w-4 h-4 text-gray-500" /> View
              </Link>
              <Link href={`/finance/invoices/edit/${row.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                <Pencil className="w-4 h-4 text-gray-500" /> Edit
              </Link>
              <button
                onClick={() => setInvoiceToDelete(row)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4 text-red-500" /> Delete
              </button>
            </>
          )}
        />
      </div>

      {/* ✅ Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!invoiceToDelete}
        onCancel={() => setInvoiceToDelete(null)}
        onConfirm={() => invoiceToDelete && deleteInvoice(invoiceToDelete.id)}
        title="Delete Invoice"
        message={
          invoiceToDelete
            ? `Are you sure you want to delete invoice #${invoiceToDelete.invoice_no} for ${invoiceToDelete.customer.firstname} ${invoiceToDelete.customer.lastname}?`
            : ""
        }
        deleting={deletingId === invoiceToDelete?.id}
      />
    </DashboardLayout>
  );
}
