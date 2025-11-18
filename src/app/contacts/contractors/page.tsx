'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import CreateContractorModal from "./new/page";

interface Contractor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string | null;
  address: string | null;
  bank_name: string | null;
  account_number: string | null;
  created_at: string;
  status?: string;
}

export default function ContractorsPage() {
  const handleGoBack = useGoBack();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW states for search + filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<Contractor | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchContractors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/professionals/contractors/list/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log("Fetched contractors:", result);

      if (result.status && Array.isArray(result.data)) {
        setContractors(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch contractors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contractorToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/professionals/contractors/delete/${contractorToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (result.status) {
        setContractors((prev) =>
          prev.filter((c) => c.id !== contractorToDelete.id)
        );
        setShowDeleteModal(false);
        setContractorToDelete(null);
        toast.success(result.message || "Contractor deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete contractor.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }finally{
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  // Apply search + filter
  const filteredContractors = contractors.filter((contractor) => {
    const query = search.toLowerCase();
    const matchesSearch =
      contractor.firstname.toLowerCase().includes(query) ||
      contractor.lastname.toLowerCase().includes(query) ||
      contractor.email?.toLowerCase().includes(query) ||
      contractor.phone?.toLowerCase().includes(query) ||
      contractor.address?.toLowerCase().includes(query) ||
      contractor.bank_name?.toLowerCase().includes(query) ||
      contractor.account_number?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || contractor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Contractor Manager"
        description="Your unified hub for all service providers and contractors."
      >
        <div className="flex flex-col md:flex-row gap-2">
          <Link
            href="#"
            className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2"
          >
            <Icons.export />
            <span>Export Contractors</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center"
            >
            <Icons.plus />
            <span>Add New Contractor</span>
          </button>
        </div>
      </HeaderTitleCard>
       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Contractor"
      >
        <CreateContractorModal
          onClose={() => setIsModalOpen(false)}
           onCreated={fetchContractors} // refresh list
        />
      </Modal>


      {/* SEARCH + FILTER */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap gap-4 border border-gray-200 items-center justify-between">
        <input
          type="text"
          placeholder="Search contractors (name, email, phone...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="text-sm text-gray-600 hover:text-purple-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 rounded-md font-medium"
          >
            Clear Filters
          </button>

          <button
            onClick={fetchContractors}
            className="p-2 text-gray-500 cursor-pointer hover:text-purple-600 hover:bg-gray-200 bg-gray-100 rounded-full"
          >
            <RefreshCw size={22} />
          </button>
        </div>
      </div>

      {/* CONTRACTORS TABLE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <DataTable
          columns={[
            {
              label: "Name",
              field: "name",
              render: (contractor) => {
                const initials = `${contractor.firstname?.[0] || ""}${contractor.lastname?.[0] || ""}`.toUpperCase();

                return (
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {initials}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {contractor.firstname} {contractor.lastname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contractor.email || contractor.phone}
                      </p>
                    </div>
                  </div>
                );
              },
            },
            { label: "Company", field: "company" },
            {
              label: "Created",
              field: "created_at",
              render: (contractor) => (
                <span className="text-sm text-gray-600">
                  {new Date(contractor.created_at).toLocaleDateString()}
                </span>
              ),
            },
          ]}
          data={filteredContractors}
          loading={loading}
          error={null}
          itemsPerPage={10}
          actions={(contractor) => (
            <>
              <Link
                href={`/contacts/contractors/view/${contractor.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <Eye className="w-4 h-4 text-gray-500" /> View
              </Link>
              <Link
                href={`/contacts/contractors/edit/${contractor.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <Pencil className="w-4 h-4 text-gray-500" /> Edit
              </Link>
              <button
                onClick={() => {
                  setContractorToDelete(contractor);
                  setShowDeleteModal(true);
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4 text-red-500" /> Delete
              </button>
            </>
          )}
        />
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">
                {contractorToDelete?.firstname} {contractorToDelete?.lastname}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
