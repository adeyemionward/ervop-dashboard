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
import CreateVendorModal, { Vendor } from "@/components/CreateVendorModal";

export default function VendorsPage() {
  const handleGoBack = useGoBack();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  // --- 1. STATE ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Delete States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 2. DATA FETCHING ---
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/professionals/vendors/list/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      console.log("Fetched vendors:", result);

      if (result.status && Array.isArray(result.data)) {
        // Cast to match the strict interface if API returns nulls
        setVendors(result.data as Vendor[]);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // --- 3. HANDLERS ---

  // Open "Add New" Modal
  const openAddModal = () => {
    setEditingVendor(null); // Clear edit state for creation
    setIsModalOpen(true);
  };

  // Open "Edit" Modal
  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor); // Set specific vendor to edit
    setIsModalOpen(true);
  };

  // Callback for successful Create or Update
  const handleSaveSuccess = (savedVendor: Vendor, isEdit: boolean) => {
    if (isEdit) {
      setVendors((prev) =>
        prev.map((v) => (v.id === savedVendor.id ? savedVendor : v))
      );
    } else {
      setVendors((prev) => [savedVendor, ...prev]);
    }
  };

  // Delete Logic
  const handleDelete = async () => {
    if (!vendorToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/professionals/vendors/delete/${vendorToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();

      if (result.status) {
        setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete.id));
        setShowDeleteModal(false);
        setVendorToDelete(null);
        toast.success(result.message || "Vendor deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete vendor.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 4. FILTERING ---
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const query = search.toLowerCase();
      
      // Helper to safely check string inclusion
      const matches = (field?: string | null) => 
        field?.toLowerCase().includes(query);

      return (
        matches(vendor.firstname) ||
        matches(vendor.lastname) ||
        matches(vendor.email) ||
        matches(vendor.phone) ||
        matches(vendor.company) ||
        matches(vendor.address) ||
        matches(vendor.bank_name) ||
        matches(vendor.account_number)
      );
    });
  }, [vendors, search]);

  // --- 5. RENDER ---
  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Vendor Manager"
        description="Manage all business vendors, suppliers, and billers easily."
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
        <CreateVendorModal
          onClose={() => setIsModalOpen(false)}
          // Explicit cast helps if API types are loose (null vs undefined)
          vendorToEdit={editingVendor as Vendor | null} 
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
            onClick={fetchVendors}
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
              render: (vendor: Vendor) => {
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
              render: (vendor: Vendor) => (
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
          actions={(vendor: Vendor) => (
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
                  setVendorToDelete(vendor);
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
                {vendorToDelete?.firstname} {vendorToDelete?.lastname}
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