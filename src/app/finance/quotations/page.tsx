"use client";

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { FileText, CheckCircle2, Clock, XCircle, Pencil, Trash2, Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import QuotationModal from "./new/page";

type Customer = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
};

type Quotation = {
  id: number;
  quotation_no: string;
  issue_date: string;
  expiry_date: string;
  total: number;
  status: "Pending" | "Accepted" | "Rejected" | string;
  customer: Customer;
};

type Overview = {
  total_quoted: number;
  accepted: number;
  pending: number;
  rejected: number;
};

export default function QuotationsPage() {
  const handleGoBack = useGoBack();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchQuotations = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/professionals/finances/quotations/list/`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await res.json();

      if (data.status) {
        setQuotations(data.data);
        setOverview(data.overview);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setError("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [BASE_URL]);

  const deleteQuotation = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await fetch(`${BASE_URL}/professionals/finances/quotations/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete quotation");

      setQuotations((prev) => prev.filter((q) => q.id !== id));
      setQuotationToDelete(null);
      toast.success("Quotation deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete quotation. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredQuotations = useMemo(() => {
    return (quotations || []).filter((q) => {
      const matchesSearch =
        q.quotation_no.toLowerCase().includes(search.toLowerCase()) ||
        `${q.customer?.firstname} ${q.customer?.lastname}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" ? true : q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Quotations"
        description="View and manage all quotations created for your clients."
      >
        <div className="flex flex-col md:flex-row gap-2">
        <button
                className="btn-primary flex items-center"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Generate Quotation
              </button>
      </div>
         {/* Quotation Modal */}
        <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate New Quotation"
      >
        <QuotationModal 
          onClose={() => setIsModalOpen(false)} 
          onCreated={fetchQuotations}
        />
      </Modal>

      </HeaderTitleCard>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Quotations" value={overview ? `${overview.total_quoted}` : "0"} icon={FileText} mainBg="bg-white" iconBg="bg-blue-100" mainText="text-gray-900" iconText="text-blue-800" valueTextSize="text-md" />
        <StatCard title="Accepted" value={overview ? `${overview.accepted}` : "0"} icon={CheckCircle2} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" valueTextSize="text-md" />
        <StatCard title="Pending" value={overview ? `${overview.pending}` : "0"} icon={Clock} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" valueTextSize="text-md" />
        <StatCard title="Rejected" value={overview ? `${overview.rejected}` : "0"} icon={XCircle} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" valueTextSize="text-md" />
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search quotation or customer..."
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
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>

        <div className="hidden md:block md:flex-grow"></div>

        <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium rounded-lg"
          >
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
            { label: "Quotation #", field: "quotation_no" },
            { label: "Customer", render: (row) => `${row.customer.firstname} ${row.customer.lastname}` },
            { label: "Issue Date", field: "issue_date" },
            { label: "Expiry Date", field: "valid_until" },
            { label: "Total", render: (row) => `₦${row.total.toLocaleString()}`, alignRight: true },
            {
              label: "Status",
              render: (row) => (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    row.status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : row.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : row.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
          ]}
          data={filteredQuotations}
          loading={loading}
          error={error}
          itemsPerPage={10}
          actions={(row) => (
            <>
              <Link
                href={`/finance/quotations/view/${row.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <Eye className="w-4 h-4 text-gray-500" /> View
              </Link>
              <Link
                href={`/finance/quotations/edit/${row.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <Pencil className="w-4 h-4 text-gray-500" /> Edit
              </Link>
              <button
                onClick={() => setQuotationToDelete(row)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4 text-red-500" /> Delete
              </button>
            </>
          )}
        />
      </div>

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={!!quotationToDelete}
        onCancel={() => setQuotationToDelete(null)}
        onConfirm={() => quotationToDelete && deleteQuotation(quotationToDelete.id)}
        title="Delete Quotation"
        message={
          quotationToDelete
            ? `Are you sure you want to delete quotation #${quotationToDelete.quotation_no} for ${quotationToDelete.customer.firstname} ${quotationToDelete.customer.lastname}?`
            : ""
        }
        deleting={deletingId === quotationToDelete?.id}
      />
    </DashboardLayout>
  );
}
