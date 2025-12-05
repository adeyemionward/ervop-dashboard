'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
// ✅ Import the reusable modal and interface
import CreateContractorModal, { Contractor } from "@/components/CreateContractorModal";

export default function ContractorPage() {
  const handleGoBack = useGoBack();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  // --- 1. STATE ---
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Contractor | null>(null);

  // Delete States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<Contractor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 2. DATA FETCHING ---
  const fetchContractors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/professionals/contractors/list/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      console.log("Fetched contractors:", result);

      if (result.status && Array.isArray(result.data)) {
        // Cast to match the strict interface if API returns nulls
        setContractors(result.data as Contractor[]);
      }
    } catch (error) {
      console.error("Failed to fetch contractors:", error);
      toast.error("Failed to load contractors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  // --- 3. HANDLERS ---

  // Open "Add New" Modal
  const openAddModal = () => {
    setEditingVendor(null); // Clear edit state for creation
    setIsModalOpen(true);
  };

  // Open "Edit" Modal
  const openEditModal = (vendor: Contractor) => {
    setEditingVendor(vendor); // Set specific vendor to edit
    setIsModalOpen(true);
  };

  // Callback for successful Create or Update
  const handleSaveSuccess = (savedVendor: Contractor, isEdit: boolean) => {
    if (isEdit) {
      setContractors((prev) =>
        prev.map((v) => (v.id === savedVendor.id ? savedVendor : v))
      );
    } else {
      setContractors((prev) => [savedVendor, ...prev]);
    }
  };

  // Delete Logic
  const handleDelete = async () => {
    if (!contractorToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/professionals/contractors/delete/${contractorToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();

      if (result.status) {
        setContractors((prev) => prev.filter((v) => v.id !== contractorToDelete.id));
        setShowDeleteModal(false);
        setContractorToDelete(null);
        toast.success(result.message || "Contractor deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete contractor.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 4. FILTERING ---
  const filteredVendors = useMemo(() => {
    return contractors.filter((contractor) => {
      const query = search.toLowerCase();
      
      // Helper to safely check string inclusion
      const matches = (field?: string | null) => 
        field?.toLowerCase().includes(query);

      return (
        matches(contractor.firstname) ||
        matches(contractor.lastname) ||
        matches(contractor.email) ||
        matches(contractor.phone) ||
        matches(contractor.company) ||
        matches(contractor.address) ||
        matches(contractor.bank_name) ||
        matches(contractor.account_number)
      );
    });
  }, [contractors, search]);

  // --- 5. RENDER ---
  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Contractor Manager"
        description="Manage all service providers, and contractors easily."
      >
        <div className="flex flex-col md:flex-row gap-2">
          <Link
            href="#"
            className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2"
          >
            <Icons.export />
            <span>Export Vendor</span>
          </Link>

          <button
            onClick={openAddModal} // ✅ Open Modal
            className="btn-primary flex items-center justify-center"
          >
            <Icons.plus />
            <span>Add New Vendor</span>
          </button>
        </div>
      </HeaderTitleCard>

      {/* ✅ MAIN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? "Edit Vendor" : "Add New Vendor"}
      >
        <CreateContractorModal
          onClose={() => setIsModalOpen(false)}
          // Explicit cast helps if API types are loose (null vs undefined)
          vendorToEdit={editingVendor as Contractor | null} 
          onSuccess={handleSaveSuccess}
        />
      </Modal>

      {/* SEARCH + FILTER */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap gap-4 border border-gray-200 items-center justify-between">
        <input
          type="text"
          placeholder="Search vendors (name, email, phone...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearch("")}
            className="text-sm text-gray-600 hover:text-purple-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 rounded-md font-medium"
          >
            Clear Search
          </button>
          <button
            onClick={fetchContractors}
            className="p-2 text-gray-500 cursor-pointer hover:text-purple-600 hover:bg-gray-200 bg-gray-100 rounded-full"
          >
            <RefreshCw size={22} />
          </button>
        </div>
      </div>

      {/* VENDORS TABLE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <DataTable
          columns={[
            {
              label: "Name",
              field: "name",
              render: (vendor: Contractor) => {
                const initials = `${vendor.firstname?.[0] || ""}${vendor.lastname?.[0] || ""}`.toUpperCase();
                return (
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {initials}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {vendor.firstname} {vendor.lastname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {vendor.email || vendor.phone}
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
              render: (vendor: Contractor) => (
                <span className="text-sm text-gray-600">
                  {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "N/A"}
                </span>
              ),
            },
          ]}
          data={filteredVendors}
          loading={loading}
          error={null}
          itemsPerPage={10}
          actions={(vendor: Contractor) => (
            <>
            <Link href={`/vendor/clients/view/${vendor.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer">
                    <Eye className="w-4 h-4 text-gray-500" /> View
              </Link>
              {/* ✅ Edit Button - Opens Modal */}
              <button
                onClick={() => openEditModal(vendor)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-gray-500" /> Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => {
                  setContractorToDelete(vendor);
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

      {/* DELETE MODAL */}
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
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
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