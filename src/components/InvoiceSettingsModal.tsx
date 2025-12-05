'use client';

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface InvoiceSettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_logo: string | null;
  business_signature: string | null;
}

interface Props {
  onClose: () => void;
  onSuccess: (data: InvoiceSettings, isEdit: boolean) => void;
}

export default function InvoiceSettingsModal({ onClose, onSuccess }: Props) {
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // 🌟 Populate fields from localStorage user data
  useEffect(() => {
    const user = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

    setCompanyAddress(user?.address || "");
    setCompanyPhone(user?.phone || "");
    setLogoPreview(user?.business_logo || null);
    setSignaturePreview(user?.business_signature || null);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSignatureFile(file);
    if (file) setSignaturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const formData = new FormData();
    formData.append("address", companyAddress);
    formData.append("phone", companyPhone);
    if (logoFile) formData.append("business_logo", logoFile);
    if (signatureFile) formData.append("business_signature", signatureFile);

    const res = await fetch(`${BASE_URL}/professionals/invoices/settings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok || result.status === false) {
      throw new Error(result.message || "Failed to save settings");
    }

    toast.success(result.message || "Invoice settings saved!");

    // 🌟 Update localStorage and state immediately
    const updatedUser = {
      ...JSON.parse(localStorage.getItem("user") || "{}"),
      ...result.data,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setCompanyAddress(updatedUser.address || "");
    setCompanyPhone(updatedUser.phone || "");
    setLogoPreview(updatedUser.business_logo || null);
    setSignaturePreview(updatedUser.business_signature || null);

    onSuccess(updatedUser, true);
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Error saving invoice settings");
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <h2 className="text-xl font-bold text-gray-800">Invoice Settings</h2>

      

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="text"
          value={companyPhone}
          onChange={(e) => setCompanyPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoUpload} />
        {logoPreview && (
          <img src={logoPreview} className="w-24 h-24 mt-3 rounded border object-contain" />
        )}
      </div>

      {/* Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Signature</label>
        <input type="file" accept="image/*" onChange={handleSignatureUpload} />
        {signaturePreview && (
          <img src={signaturePreview} className="w-24 h-24 mt-3 rounded border object-contain" />
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 px-6 py-2 rounded-xl"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
