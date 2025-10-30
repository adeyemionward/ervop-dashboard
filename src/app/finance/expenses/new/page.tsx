"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { PlusCircle, Trash2, Save } from "lucide-react";
import clsx from "clsx";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import toast from "react-hot-toast";

// --- TYPE DEFINITIONS ---
type TransactionType = "disbursement" | "expense";
type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
};
type DisbursementData = {
  amount: string;
  date: string;
  title:string;
  categoryId: string;
 
  paymentMethod: string;
};
type ExpenseData = {
  title: string;
  date: string;
  category: string;
  items: ExpenseItem[];
 
  paymentMethod: string;
};

  
  type Category = {
  title: string;
};


// --- HOOK FOR GO BACK ---
const useGoBack = () => () => {
  if (typeof window !== "undefined") window.history.back();
};

// --- MAIN PAGE ---
export default function CreateTransactionPage() {
  const handleGoBack = useGoBack();
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [isSaving, setIsSaving] = useState(false);
    // Initial page load loader
    const [pageLoading, setPageLoading] = useState(true);
   const [selectedClient, setSelectedClient] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    // Fetch contacts once on page load
      const { contacts, loadingContacts } = useClientData("");
     const [selectedAppointment, setSelectedAppointment] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';


const defaultCategories: Category[] = [
  { title: "Logistics" },
  { title: "Materials" },
  { title: "Software" },
  { title: "Equipment" },
  { title: "Other Expense" },
];

const [categories, setCategories] = useState<Category[]>(defaultCategories);


  useEffect(() => {
      if (!loadingContacts) {
        setPageLoading(false);
      }
    }, [loadingContacts]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/professionals/transactions/listCategory/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data: Category[] = await res.json(); // assume API returns Category[]

      if (Array.isArray(data)) {
        const merged: Category[] = [...data, ...defaultCategories];

        // Deduplicate by title
        const uniqueCategories = merged.filter(
          (cat, index, self) =>
            index === self.findIndex(c => c.title === cat.title)
        );

        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  fetchCategories();
}, []);


    const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
const [newCategory, setNewCategory] = useState("");

const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Income
  const [disbursementData, setDisbursementData] = useState<DisbursementData>({
    amount: "",
    date: "",
    title:"",
    categoryId: "Labour",
    paymentMethod: "Cash",
 
  });

  // State for Expense
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    title: "",
    date: "",
    category: "Logistics",
    paymentMethod: "Cash",
    items: [{ id: Date.now(), description: "", amount: 0 }],
 
  });

  const handleIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDisbursementData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setExpenseData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), description: "", amount: 0 },
      ],
    }));
  };

  const handleRemoveItem = (id: number) => {
    setExpenseData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (
    id: number,
    field: "description" | "amount",
    value: string
  ) => {
    setExpenseData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "amount" ? parseFloat(value) || 0 : value,
            }
          : item
      ),
    }));
  };

  const totalExpense = useMemo(() => {
    return expenseData.items.reduce((acc, item) => acc + item.amount, 0);
  }, [expenseData.items]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let payload: unknown;

      if (transactionType === "disbursement") {
        payload = {
          type: "expense",
          sub_type: "disbursement",
          amount: Number(disbursementData.amount),
          title: disbursementData.title,
          date: disbursementData.date,
          payment_method: disbursementData.paymentMethod,
          category: disbursementData.categoryId,
          contact_id: selectedClient || null,
          appointment_id: selectedAppointment || null,
          project_id: selectedProject || null,
          invoice_id: selectedInvoice || null,
        };
      } else {
        payload = {
          type: "expense",
          sub_type: "bills",
          amount: totalExpense,
          title: expenseData.title,
          date: expenseData.date,
          payment_method: expenseData.paymentMethod,
          contact_id: selectedClient || null,
          appointment_id: selectedAppointment || null,
          project_id: selectedProject || null,
          invoice_id: selectedInvoice || null,
          category: expenseData.category,
          items: expenseData.items.map((item) => ({
            description: item.description,
            amount: item.amount,
          })),
        };
      }

      console.log("Submitting payload:", payload);

      

      const res = await fetch(
        `${BASE_URL}/professionals/transactions/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Failed to save transaction: " + (errorData.message || "Unknown error"));
        setIsSaving(false);
        return;
      }

      const data = await res.json();
      console.log("Saved successfully:", data);
      toast.success("Transaction saved successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong while saving the transaction.");
    } finally {
      setIsSaving(false);
    }
  };



const createCategoryMutation = useMutation<Category, Error, string>({
  mutationFn: async (title: string) => {
    const payload = { type: "expense", title };
    const res = await fetch(`${BASE_URL}/professionals/transactions/createCategory/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create category");
    const json = await res.json();
    return json.data as Category;
  },
  onMutate: () => {
    setIsSubmitting(true);
  },
  onSuccess: (category) => {
    setCategories((prev: Category[]) => [...prev, category]);
    setExpenseData((prev) => ({ ...prev, category: category.title }));
    setNewCategory("");
    setIsCategoryModalOpen(false);
    toast.success("Category recorded successfully!");
  },
  onError: (err: Error) => {
    console.error(err);
    toast.error("Could not create category. Please try again.");
  },
  onSettled: () => {
    setIsSubmitting(false);
  },
});




  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    createCategoryMutation.mutate(newCategory);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Add an Expense"
          description="Manually record bills or disbursement for your business."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
          {pageLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              {/* Loader */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-ping"></div>
              </div>
              <p className="text-gray-700 font-semibold text-lg animate-pulse">
                Preparing your form...
              </p>
            </div>
          ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* --- Transaction Type Toggle --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-100">
                <button
                  type="button"
                  onClick={() => setTransactionType("expense")}
                  className={clsx(
                    "w-1/2 text-center py-2 rounded-md cursor-pointer font-semibold transition-colors",
                    {
                      "bg-purple-600 text-white shadow":
                        transactionType === "expense",
                      "text-gray-500 hover:bg-gray-200":
                        transactionType !== "expense",
                    }
                  )}
                >
                  Bills/Vendor Payments
                </button>
                
                <button
                  type="button"
                  onClick={() => setTransactionType("disbursement")}
                  className={clsx(
                    "w-1/2 text-center py-2 rounded-md cursor-pointer font-semibold transition-colors",
                    {
                      "bg-purple-600 text-white shadow":
                        transactionType === "disbursement",
                      "text-gray-500 hover:bg-gray-200":
                        transactionType !== "disbursement",
                    }
                  )}
                >
                  Contractor Disbursement
                </button>
                
              </div>
            </div>

            {/* --- CONDITIONAL FORMS --- */}
            {transactionType === "expense" ? (

               // --- EXPENSE FORM ---
              <div className="space-y-6 animate-fade-in">
                {/* title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Expense Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={expenseData.title}
                    onChange={handleExpenseChange}
                    placeholder="e.g., New Equipment Purchase"
                    className="mt-1 block w-full border border-gray-300 rounded-lg  py-3 px-4"
                    required
                  />
                </div>

                {/* line items */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3">Line Items</h4>
                  <div className="space-y-3">
                    {expenseData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Item description (e.g., Fuel)"
                          className="flex-grow border border-gray-300 rounded-lg sm:text-sm py-2 px-3"
                        />
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">
                            ₦
                          </span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) =>
                              handleItemChange(item.id, "amount", e.target.value)
                            }
                            placeholder="0.00"
                            className="w-32 pl-7 py-2 border border-gray-300 rounded-lg sm:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                {/* total + date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <div className="mt-1 relative rounded-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <span className="text-gray-500 sm:text-sm">₦</span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={totalExpense.toLocaleString()}
                        className="mt-1 block w-full border bg-gray-100 border-gray-300 pl-7  py-3 px-4 rounded-lg font-bold"
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
                      value={expenseData.date}
                      onChange={handleExpenseChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg  py-3 px-4"
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
                      contacts={contacts || []} // initial contacts loaded
                    />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={expenseData.paymentMethod}
                      onChange={handleExpenseChange}
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="POS">POS</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={expenseData.category}
                      onChange={(e) =>
                        setExpenseData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg"
                    >
                      {categories.map((cat: Category) => (
                        <option key={cat.title} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                    </select>

                    {/* New link/button */}
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="mt-2 text-sm text-purple-600 hover:underline"
                    >
                      + Create Expense Category
                    </button>
                  </div>
                </div>
              </div>

            ) : (
                     // --- INCOME FORM ---
              <div className="space-y-6 animate-fade-in">
                {/* description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Expense Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={disbursementData.title}
                    onChange={handleIncomeChange}
                    placeholder="e.g., Payment for Invoice #INV-002"
                    className="mt-1 block w-full border border-gray-300 rounded-lg py-3 px-4"
                  />
                </div>
                {/* amount + date */}
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
                        value={disbursementData.amount}
                        onChange={handleIncomeChange}
                        className=" w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg "
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
                      value={disbursementData.date}
                      onChange={handleIncomeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg  py-3 px-4"
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
                      contacts={contacts || []} // initial contacts loaded
                    />

                {/* payment method */}
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
                    value={expenseData.paymentMethod}
                    onChange={handleExpenseChange}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="POS">POS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
            )}

            {/* --- ACTION BUTTONS --- */}
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
                <span>{isSaving ? "Saving..." : "Save Transaction"}</span>
              </button>
            </div>
          </form>
           )}
        </div>
      </div>

      {/* modal for add category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-4">Create Expense Category</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category title"
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>

            </div>
        </div>
      )}
  </div>
    </DashboardLayout>
  );
}
