'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import CreateClientModal from "./new/page";

interface Contact {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string | null;
  photo: string | null;
  tags: string;
  created_at: string;
  status?: string; // assuming API may include this
}

export default function ContactsPage() {
  const handleGoBack = useGoBack();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW states for search + filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  const fetchContacts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${BASE_URL}/professionals/contacts/list/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();
        console.log("Fetched contacts:", result);

        if (result.status && Array.isArray(result.data)) {
          setContacts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/professionals/contacts/delete/${contactToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (result.status) {
        setContacts((prev) =>
          prev.filter((c) => c.id !== contactToDelete.id)
        );
        setShowDeleteModal(false);
        setContactToDelete(null);
          toast.success(result.message || "Contact deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete contact.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }finally{
      setIsDeleting(false);
    }
  };


  useEffect(() => {
    fetchContacts();
  }, []);
  // Apply search + filter on contacts
  const filteredContacts = contacts.filter((contact) => {
    const query = search.toLowerCase();
    const matchesSearch =
      contact.firstname.toLowerCase().includes(query) ||
      contact.lastname.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      (contact.tags && contact.tags.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    // return <div className="p-8 text-center">Loading contacts...</div>;
  }

  return (
    <DashboardLayout>
      {/* PAGE TITLE */}
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Client Manager"
        description="Your unified hub for all clients and customers."
      >
        <div className="flex flex-col md:flex-row gap-2">
          <Link
            href="#"
            className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2"
          >
            <Icons.export />
            <span>Export Clients</span>
          </Link>

           <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center"
            >
            <Icons.plus />
            <span>Add New Client</span>
            </button>
        </div>
      </HeaderTitleCard>

      
        {/* ✅ Modal Wrapper */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Client"
        >
          <CreateClientModal
            onClose={() => setIsModalOpen(false)}
            onCreated={fetchContacts} // fetchContacts refreshes the parent list
          />
        </Modal>


      {/* SEARCH + FILTER */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap  gap-4 border border-gray-200 items-center justify-between">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search contacts (name, email, phone, tags...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Clear filter button */}
         

           <button onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }} className="text-sm text-gray-600 hover:text-purple-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 rounded-md font-medium">Clear Filters</button>
            <button onClick={fetchContacts} className="p-2 text-gray-500 cursor-pointer hover:text-purple-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                {/* <Icons.refresh className="h-6 w-6" /> */}
                  <RefreshCw size={22} />
            </button> 
        </div>
      </div>

      {/* CONTACTS TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
         <DataTable
            columns={[
              {
                label: "Name",
                field: "name",
                render: (contact) => {
                  const initials = `${contact.firstname?.[0] || ""}${contact.lastname?.[0] || ""}`.toUpperCase();
                  //const tags = contact.tags ? contact.tags.split(",").map((t: string) => t.trim()) : [];

                  return (
                    <div className="flex items-center space-x-3">
                      {contact.photo ? (
                        <Image
                          className="w-10 h-10 rounded-full object-cover"
                          src={contact.photo}
                          alt={`${contact.firstname} ${contact.lastname}`}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                          {initials}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {contact.firstname} {contact.lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {contact.email || contact.phone}
                        </p>
                      </div>
                    </div>
                  );
                },
              },
              { label: "Company", field: "company" },
              {
                label: "Tags",
                field: "tags",
                render: (contact) => {
                  const tags = contact.tags ? contact.tags.split(",").map((t: string) => t.trim()) : [];
                  return (
                    <div className="flex space-x-1 flex-wrap">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  );
                },
              },
              {
                label: "Created",
                field: "created_at",
                render: (contact) => (
                  <span className="text-sm text-gray-600">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                ),
              },
                ]}
                data={filteredContacts}
                loading={loading}
                error={null}
                itemsPerPage={10}
                actions={(contact) => (
                <>
                  <Link href={`/contacts/clients/view/${contact.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                      <Eye className="w-4 h-4 text-gray-500" /> View
                  </Link>
                  <Link href={`/contacts/clients/edit/${contact.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                      <Pencil className="w-4 h-4 text-gray-500" /> Edit
                  </Link>
                  <button onClick={() => {
                      setContactToDelete(contact);
                      setShowDeleteModal(true);
                    }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
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
                  {contactToDelete?.firstname} {contactToDelete?.lastname}
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
