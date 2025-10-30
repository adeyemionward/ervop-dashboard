"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { Save, Trash2, PlusCircle } from "lucide-react";
import clsx from "clsx";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import toast from "react-hot-toast";
import { useGoBack } from "@/hooks/useGoBack";
import { useMutation } from "@tanstack/react-query";

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
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

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const handleGoBack = useGoBack();
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [loadingTransaction, setLoadingTransaction] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState("");

  const { contacts } = useClientData("");

 const defaultCategories: Category[] = [
  { title: "Logistics" },
  { title: "Materials" },
  { title: "Software" },
  { title: "Equipment" },
  { title: "Other Expense" },
];
const [categories, setCategories] = useState<Category[]>(defaultCategories);

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

  const [expenseData, setExpenseData] = useState<ExpenseData>({
    title: "",
    date: "",
    category: "Logistics",
    paymentMethod: "Cash",
    items: [{ id: Date.now(), description: "Default item", amount: 0 }],
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Transaction Details
  useEffect(() => {
    if (!id || !token) return;

    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/professionals/transactions/show/${id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to fetch transaction");

        console.log("Fetched expense:", data);

        setExpenseData({
          title: data.title || "",
          date: data.date || "",
          category: data.category || "Logistics",
          paymentMethod: data.payment_method || "Cash",
          items:
            data.items && data.items.length > 0
              ? data.items.map((it: ExpenseItem) => ({
                  id: it.id || Date.now(),
                  description: it.description || "",
                  amount: it.amount || 0,
                }))
              : [{ id: Date.now(), description: "Default item", amount: 0 }],
        });

        if (data.contact_id) setSelectedClient(data.contact_id.toString());
        if (data.project_id) setSelectedProject(data.project_id.toString());
        if (data.appointment_id)
          setSelectedAppointment(data.appointment_id.toString());
        if (data.invoice_id) setSelectedInvoice(data.invoice_id.toString());
      } catch (err) {
        console.error("Error fetching transaction:", err);
        toast.error("Failed to load expense details");
      } finally {
        setLoadingTransaction(false);
      }
    };

    fetchTransaction();
  }, [id, token]);

  // Handlers
  const handleExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({ ...prev, [name]: value }));
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

  const handleAddItem = () => {
    setExpenseData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), description: "New Item", amount: 0 },
      ],
    }));
  };

  const handleRemoveItem = (id: number) => {
    setExpenseData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const totalExpense = useMemo(
    () => expenseData.items.reduce((acc, i) => acc + i.amount, 0),
    [expenseData.items]
  );

  // Update Transaction
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        type: "expense",
        sub_type: "bills",
        amount: totalExpense,
        title: expenseData.title,
        date: expenseData.date,
        payment_method: expenseData.paymentMethod,
        category: expenseData.category,
        contact_id: selectedClient || null,
        appointment_id: selectedAppointment || null,
        project_id: selectedProject || null,
        invoice_id: selectedInvoice || null,
        items: expenseData.items.map((i) => ({
          description: i.description,
          amount: i.amount,
        })),
      };

      const res = await fetch(
        `${BASE_URL}/professionals/transactions/update/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        toast.error("Failed to update expense: " + errData.message);
        setIsSaving(false);
        return;
      }

      toast.success("Expense updated successfully!");
      router.push("/professionals/transactions");
    } catch (err) {
      console.error("Error updating expense:", err);
      toast.error("Something went wrong while updating.");
    } finally {
      setIsSaving(false);
    }
  };

  // UI
  if (loadingTransaction) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-ping"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg animate-pulse">
            Loading expense...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Edit Expense (Bill)"
          description="Update your existing bill record below."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
             <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={expenseData.title}
                  onChange={handleExpenseChange}
                  placeholder="e.g., Office Supplies"
                  className="mt-1 block w-full border border-gray-300 rounded-lg py-3 px-4"
                  required
                />
              </div>
                {/* Expense Items */}
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
              contacts={contacts || []}
            />

          
            {/* Total + Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={expenseData.paymentMethod}
                  onChange={handleExpenseChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg py-3 px-4"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="POS">POS</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

                {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={expenseData.category}
                onChange={handleExpenseChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg py-3 px-4"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.title}>
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

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
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
                <span>{isSaving ? "Updating..." : "Update Expense"}</span>
              </button>
            </div>
          </form>
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
    </DashboardLayout>
  );
}
