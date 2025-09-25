'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MoreVertical, RefreshCw, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

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
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // NEW states for search + filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);


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
        title="Contact Manager"
        description="Your unified hub for all clients and customers."
      >
        <div className="flex flex-col md:flex-row gap-2">
          <Link
            href="#"
            className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2"
          >
            <Icons.export />
            <span>Export Contact</span>
          </Link>

          <Link
            href="contacts/new"
            className="btn-primary flex items-center justify-center"
          >
            <Icons.plus />
            <span>Add New Contact</span>
          </Link>
        </div>
      </HeaderTitleCard>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-4 rounded-lg shadow-sm mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
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
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            title="Clear Filters"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchContacts}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            title="Refresh Contacts"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* CONTACTS TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50">
                <tr>
                <th className="p-4 text-sm">Name</th>
                <th className="p-4 text-sm">Company</th>
                <th className="p-4 text-sm">Tags</th>
                <th className="p-4 text-sm">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                    Loading contacts...
                    </td>
                </tr>
                ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                    const initials = `${contact.firstname?.[0] || ""}${
                    contact.lastname?.[0] || ""
                    }`.toUpperCase();
                    const tags = contact.tags
                    ? contact.tags.split(",").map((t) => t.trim())
                    : [];

                    return (
                    <tr key={contact.id} className="hover:bg-gray-50">
                        {/* Avatar + name */}
                        <td className="p-4">
                        <div className="flex items-center space-x-3">
                            {contact.photo ? (
                            <img
                                className="w-10 h-10 rounded-full object-cover"
                                src={contact.photo}
                                alt={`${contact.firstname} ${contact.lastname}`}
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
                        </td>

                        {/* Company */}
                        <td className="p-4">
                        <p className="font-semibold text-gray-900">
                            {contact.company}
                        </p>
                        </td>

                        {/* Tags */}
                        <td className="p-4">
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
                        </td>

                        {/* Created */}
                        <td className="p-4 text-sm text-gray-600">
                        {new Date(contact.created_at).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right relative">
                        <div className="inline-block text-left">
                            <button
                            onClick={() =>
                                setOpenMenu(
                                openMenu === contact.id ? null : contact.id
                                )
                            }
                            className="p-2 rounded-full hover:bg-gray-100"
                            >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>

                            {openMenu === contact.id && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <Link
                                href={`/contacts/view/${contact.id}`}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                View
                                </Link>
                                <Link
                                href={`/contacts/edit/${contact.id}/edit`}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                Edit
                                </Link>
                                <button
                                    onClick={() => {
                                        setContactToDelete(contact);
                                        setShowDeleteModal(true);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                    Delete
                                </button>
                            </div>
                            )}
                        </div>
                        </td>
                    </tr>
                    );
                })
                ) : (
                <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                    No contacts found
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>

        {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{contactToDelete?.firstname} {contactToDelete?.lastname}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


    </DashboardLayout>
  );
}
