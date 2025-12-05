"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import ClientSelector from "@/components/ClientSelector1";
import { useClientData } from "@/hooks/useClientData";

interface CreateIncomeModalProps {
  onClose?: () => void;
  onCreated?: () => void; // ✅ callback to refresh parent list
}

type IncomeData = {
  amount: string;
  date: string;
  title: string;
  categoryId: string;
  paymentMethod: string;
};

export default function CreateIncomeModal({ onClose, onCreated }: CreateIncomeModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState("");

  const { contacts } = useClientData("");

  const [incomeData, setIncomeData] = useState<IncomeData>({
    amount: "",
    date: "",
    title: "",
    categoryId: "Invoice Payment",
    paymentMethod: "Cash",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setIncomeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        type: "income",
        amount: Number(incomeData.amount),
        date: incomeData.date,
        payment_method: incomeData.paymentMethod,
        title: incomeData.title,
        category: incomeData.categoryId,
        contact_id: selectedClient || null,
        appointment_id: selectedAppointment || null,
        project_id: selectedProject || null,
        invoice_id: selectedInvoice || null,
      };

      const res = await fetch(`${BASE_URL}/professionals/transactions/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(
          "Failed to save transaction: " + (errorData.message || "Unknown error")
        );
        return;
      }

      toast.success("Transaction saved successfully!");
      if (onCreated) onCreated();
      onClose?.();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong while saving the transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  // // If contacts are still loading, just show a spinner (no message)
  // if (loadingContacts) {
  //   return (
  //     <div className="flex justify-center items-center h-40">
  //       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-600 border-opacity-70"></div>
  //     </div>
  //   );
  // }

  return (
      <form onSubmit={handleSave} className="space-y-8">
        {/* Amount + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <div className="mt-1 relative rounded-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <span className="text-gray-500 sm:text-sm">₦</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                value={incomeData.amount}
                onChange={handleIncomeChange}
                className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Transaction Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={incomeData.date}
              onChange={handleIncomeChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg py-3 px-4"
              required
            />
          </div>
        </div>

        {/* Client Selector */}
        <ClientSelector
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
          selectedInvoice={selectedInvoice}
          setSelectedInvoice={setSelectedInvoice}
          contacts={contacts || []}
        />

        {/* Payment Method */}
        <div>
          <label
            htmlFor="paymentMethod"
            className="block text-sm font-medium text-gray-700"
          >
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={incomeData.paymentMethod}
            onChange={handleIncomeChange}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg"
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="POS">POS</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {/* Title / Note */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title / Note
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={incomeData.title}
            onChange={handleIncomeChange}
            placeholder="e.g., Payment for Invoice #INV-002"
            className="mt-1 block w-full border border-gray-300 rounded-lg py-3 px-4"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={clsx(
              "font-semibold py-2 px-6 rounded-lg flex items-center transition-colors",
              isSaving
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{isSaving ? "Saving..." : "Save Transaction"}</span>
          </button>
        </div>
      </form>
  );
}
