"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { Save } from "lucide-react";
import clsx from "clsx";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
type IncomeData = {
  amount: string;
  date: string;
  title: string;
  categoryId: string;
  paymentMethod: string;
};


const useGoBack = () => () => {
  if (typeof window !== "undefined") window.history.back();
};

export default function EditTransactionPage() {
  const handleGoBack = useGoBack();
  const [isSaving, setIsSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState("");

  const { contacts, loadingContacts } = useClientData("");

  const [incomeData, setIncomeData] = useState<IncomeData>({
    amount: "",
    date: "",
    title: "",
    categoryId: "Invoice Payment",
    paymentMethod: "Cash",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
 const params = useParams();
  const transactionId = params?.id;
  // Fetch transaction data
 

// After fetching transaction - improved version
useEffect(() => {
  if (!transactionId || loadingContacts) return;

  const fetchTransaction = async () => {
    try {
      const res = await fetch(`${BASE_URL}/professionals/transactions/show/${transactionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error("Failed to fetch transaction");
      
      const data = await res.json();

      setIncomeData({
        amount: String(data.amount),
        date: data.date,
        title: data.title || "",
        categoryId: data.category || "Invoice Payment",
        paymentMethod: data.payment_method || "Cash",
      });

      // ✅ Set client only if contact exists
      if (data.contact_id && contacts.find(c => c.id.toString() === data.contact_id.toString())) {
        setSelectedClient(data.contact_id.toString());
      } else {
        setSelectedClient(""); // Clear if contact doesn't exist
      }

      setSelectedProject(data.project_id?.toString() || "");
      setSelectedAppointment(data.appointment_id?.toString() || "");
      setSelectedInvoice(data.invoice_id?.toString() || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transaction data.");
    } finally {
      setPageLoading(false);
    }
  };

  fetchTransaction();
}, [transactionId, loadingContacts, contacts]);

// ... rest of the component remains the same ...



  useEffect(() => {
    if (!loadingContacts) setPageLoading(false);
  }, [loadingContacts]);

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        description: incomeData.title,
        category: incomeData.categoryId,
        contact_id: selectedClient || null,
        appointment_id: selectedAppointment || null,
        project_id: selectedProject || null,
        invoice_id: selectedInvoice || null,
      };

      const res = await fetch(`${BASE_URL}/professionals/transactions/update/${transactionId}`, {
        method: "PUT", // or PATCH depending on your API
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Failed to update transaction: " + (errorData.message || "Unknown error"));
        setIsSaving(false);
        return;
      }

      await res.json();
      toast.success("Transaction updated successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong while updating the transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Edit Income"
          description="Update your income transaction details."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
          {pageLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-ping"></div>
              </div>
              <p className="text-gray-700 font-semibold text-lg animate-pulse">
                Loading transaction...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              {/* Amount + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
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
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
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

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
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

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleGoBack}
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
                  <span>{isSaving ? "Updating..." : "Update Transaction"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
