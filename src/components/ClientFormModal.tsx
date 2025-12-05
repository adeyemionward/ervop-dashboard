// ./new/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import clsx from "clsx"; 
import { toast } from "react-hot-toast";

// --- START: SYNCHRONIZED CONTACT INTERFACE ---
// Define the interface based on your API structure (copied from parent, 
// adjusting optional fields for local use if necessary, but matching structure)
export interface Contact {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string | null; // Must match parent
  photo: string | null;   // Must match parent
  tags: string;           // Must match parent (API returns string)
  created_at: string;     // Must match parent (This was missing/inconsistent before)
  status?: string; 
}
// --- END: SYNCHRONIZED CONTACT INTERFACE ---

interface ClientFormModalProps {
  onClose: () => void;
  clientToEdit?: Contact | null; // Now using the correct Contact interface
  onSuccess: (client: Contact, isEdit: boolean) => void; // Now using the correct Contact interface
}

export default function ClientFormModal({ 
  onClose, 
  clientToEdit, 
  onSuccess 
}: ClientFormModalProps) {
  
  // State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

  // ✅ EFFECT: Populate form if in Edit mode
  useEffect(() => {
    if (clientToEdit) {
      // Using the nullish coalescing operator (??) for safer defaults
      setFirstName(clientToEdit.firstname ?? "");
      setLastName(clientToEdit.lastname ?? "");
      setEmail(clientToEdit.email ?? "");
      setPhone(clientToEdit.phone ?? "");
      setCompany(clientToEdit.company ?? "");
      
      // Handle Tags: API likely returns a string "tag1, tag2", convert to array
      if (clientToEdit.tags) {
        // Tags from the API are a string, use .tags
        const tagArray = clientToEdit.tags.split(",").map(t => t.trim()).filter(Boolean);
        setTags(tagArray);
      } else {
        setTags([]);
      }
    }
  }, [clientToEdit]);

  // Tag Handlers
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) setTags(prev => [...prev, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No authentication token found.");

      const payload = {
        firstname: firstName,
        lastname: lastName,
        email,
        phone,
        company: company || null, // Ensure 'null' is sent for empty company, matching parent's interface
        tags: tags.join(", "),
      };

      // ✅ Dynamic URL & Method
      const url = clientToEdit 
        ? `${BASE_URL}/professionals/contacts/update/${clientToEdit.id}` 
        : `${BASE_URL}/professionals/contacts/create/`;

      const method = clientToEdit ? "PUT" : "POST"; 

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.status === false) {
        if (result.errors) {
          const extractedErrors: { [key: string]: string } = {};
          for (const key in result.errors) {
            if (result.errors[key]?.length > 0) extractedErrors[key] = result.errors[key][0];
          }
          setFieldErrors(extractedErrors);
        }
        throw new Error(result.message || "Failed to save contact.");
      }

      toast.success(result.message || `Contact ${clientToEdit ? 'updated' : 'created'} successfully!`);
      
      // ✅ Update Parent
      // Ensure the returnedClient object structure is compatible with the parent's Contact interface
      const returnedClient: Contact = { 
        ...payload, 
        id: result.data?.id || result.contact?.id || clientToEdit?.id || Date.now(),
        photo: result.data?.photo || result.contact?.photo || clientToEdit?.photo || null,
        created_at: result.data?.created_at || result.contact?.created_at || clientToEdit?.created_at || new Date().toISOString(),
      };
      
      onSuccess(returnedClient, !!clientToEdit);
      
      onClose();

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto pr-1">
      {/* Dynamic Title */}
      <h2 className="text-xl font-bold text-gray-800">
        {clientToEdit ? "Edit Client" : "Add New Client"}
      </h2>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. John"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.firstname && <p className="text-red-500 text-sm mt-1">{fieldErrors.firstname}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Doe"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.lastname && <p className="text-red-500 text-sm mt-1">{fieldErrors.lastname}</p>}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. johndoe@email.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +234 801 234 5678"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.phone && <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Chioma’s Designs Ltd."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-purple-500 hover:text-purple-700"
              >
                ✕
              </button>
            </span>
          ))}
          
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
            className="flex-1 border-none focus:ring-0 outline-none px-2 py-1 text-sm bg-transparent"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">Press Enter or comma to add a tag.</p>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition",
            { "opacity-50 cursor-not-allowed": isSubmitting }
          )}
        >
          {isSubmitting ? "Saving..." : clientToEdit ? "Update Contact" : "Save Contact"}
        </button>
      </div>
    </form>
  );
}