'use client';

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { toast } from "react-hot-toast";

// ✅ Export interface for parent page use
export interface Contractor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  bank_name: string;
  account_number: string;
  created_at?: string;
  photo?: string;
}

interface VendorFormModalProps { 
  onClose: () => void;
  vendorToEdit?: Contractor | null; // If null, "Create" mode
  onSuccess: (vendor: Contractor, isEdit: boolean) => void;
}

export default function CreateContractorModal({ 
  onClose, 
  vendorToEdit, 
  onSuccess 
}: VendorFormModalProps) {

  // State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

  // ✅ EFFECT: Populate form if in Edit mode
  useEffect(() => {
    if (vendorToEdit) {
      setFirstName(vendorToEdit.firstname || "");
      setLastName(vendorToEdit.lastname || "");
      setEmail(vendorToEdit.email || "");
      setPhone(vendorToEdit.phone || "");
      setCompany(vendorToEdit.company || "");
      setAddress(vendorToEdit.address || "");
      setBankName(vendorToEdit.bank_name || "");
      setAccountNumber(vendorToEdit.account_number || "");
    }
  }, [vendorToEdit]);

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
        company,
        address,
        bank_name: bankName,
        account_number: accountNumber,
      };

      // ✅ Dynamic URL & Method
      const url = vendorToEdit
        ? `${BASE_URL}/professionals/contractors/update/${vendorToEdit.id}`
        : `${BASE_URL}/professionals/contractors/create/`;

      const method = vendorToEdit ? "PUT" : "POST";

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
            if (result.errors[key]?.length > 0) {
              extractedErrors[key] = result.errors[key][0];
            }
          }
          setFieldErrors(extractedErrors);
        }
        throw new Error(result.message || "Failed to save vendor.");
      }

      toast.success(result.message || `Vendor ${vendorToEdit ? 'updated' : 'created'} successfully!`);
      
      // ✅ Update Parent
      const returnedVendor = result.data || result.vendor || { ...payload, id: vendorToEdit?.id };
      onSuccess(returnedVendor, !!vendorToEdit);
      
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
                {vendorToEdit ? "Edit Vendor" : "Add New Vendor"}
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
                {fieldErrors.firstname && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.firstname}</p>
                )}
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
                {fieldErrors.lastname && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.lastname}</p>
                )}
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
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
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
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Company & Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Chioma's Designs Ltd."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Vendor address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Bank Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Access Bank"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.bank_name && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.bank_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0123456789"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.account_number && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.account_number}</p>
                )}
              </div>
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
                {isSubmitting ? "Saving..." : vendorToEdit ? "Update Vendor" : "Save Vendor"}
              </button>
            </div>
          </form>
  );
}