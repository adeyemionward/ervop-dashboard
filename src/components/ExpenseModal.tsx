"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import ProfessionalSelector from "@/components/ProfessionalSelector";

// Import the types from the file created above
import { 
  TransactionType, 
  Category, 
  ExpenseFormData, 
  DisbursementFormData, 
  CreateExpenseModalProps,
  ExpenseResponse 
} from "@/types/expenses"; 
// Adjust path above based on where you saved the types file

export default function CreateExpenseModal({
  isOpen,
  onClose,
  onCreated,
  projectId,
}: CreateExpenseModalProps) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState(projectId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCategories: Category[] = [
    { title: "Logistics" },
    { title: "Materials" },
    { title: "Software" },
    { title: "Equipment" },
    { title: "Other Expense" },
  ];

  const [categories, setCategories] =
    useState<Category[]>(defaultCategories);

  const [expenseData, setExpenseData] = useState<ExpenseFormData>({
    title: "",
    date: "",
    category: "Logistics",
    paymentMethod: "Cash",
    items: [{ id: Date.now(), description: "", amount: 0 }],
  });

  const [disbursementData, setDisbursementData] =
    useState<DisbursementFormData>({
      amount: "",
      date: "",
      title: "",
      categoryId: "Labour",
      paymentMethod: "Cash",
    });

  const totalExpense = useMemo(
    () => expenseData.items.reduce((acc, item) => acc + item.amount, 0),
    [expenseData.items]
  );

  const handleExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDisbursementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDisbursementData((prev) => ({ ...prev, [name]: value }));
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

  const createCategoryMutation = useMutation<Category, Error, string>({
    mutationFn: async (title: string) => {
      const payload = { type: "expense", title };
      const res = await fetch(
        `${BASE_URL}/professionals/transactions/createCategory/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to create category");
      const json = await res.json();
      // Handle case where API returns wrapped data
      return (json.data || json) as Category;
    },
    onMutate: () => setIsSubmitting(true),
    onSuccess: (category) => {
      setCategories((prev) => [...prev, category]);
      setExpenseData((prev) => ({ ...prev, category: category.title }));
      setNewCategory("");
      setIsCategoryModalOpen(false);
      toast.success("Category added!");
    },
    onError: () => toast.error("Could not create category."),
    onSettled: () => setIsSubmitting(false),
  });

  if (!isOpen) return null;

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    createCategoryMutation.mutate(newCategory);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Define a specific payload type to avoid "unknown"
      type PayloadType = {
        type: string;
        sub_type: string;
        title: string;
        amount: number;
        date: string;
        payment_method: string;
        category: string;
        contact_id: string | null;
        project_id: string;
        items?: { description: string; amount: number }[];
      };

      let payload: PayloadType;

      if (transactionType === "disbursement") {
        payload = {
          type: "expense",
          sub_type: "disbursement",
          title: disbursementData.title,
          amount: Number(disbursementData.amount),
          date: disbursementData.date,
          payment_method: disbursementData.paymentMethod,
          category: disbursementData.categoryId,
          contact_id: selectedClient || null,
          project_id: selectedProject,
        };
      } else {
        payload = {
          type: "expense",
          sub_type: "bills",
          title: expenseData.title,
          amount: totalExpense,
          date: expenseData.date,
          payment_method: expenseData.paymentMethod,
          category: expenseData.category,
          contact_id: selectedClient || null,
          project_id: selectedProject,
          items: expenseData.items.map((i) => ({
            description: i.description,
            amount: i.amount,
          })),
        };
      }

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

      const responseJson = await res.json();

      if (!res.ok) {
        toast.error("Failed: " + (responseJson.message || "Unknown error"));
        setIsSubmitting(false);
        return;
      }

      toast.success("Expense saved successfully!");
      
      // FIX: extract the actual data from the response to pass to onCreated
      // Assuming the API returns { data: { ...expenseObj } } or just the object
      const createdExpense = (responseJson.data || responseJson) as ExpenseResponse;
      
      onCreated?.(createdExpense);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving the transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {transactionType === "expense"
              ? "Add Vendor Expense"
              : "Add Contractor Disbursement"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Toggle */}
          <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-100">
            <button
              type="button"
              onClick={() => setTransactionType("expense")}
              className={clsx(
                "w-1/2 text-center py-2 rounded-md font-semibold transition-colors",
                transactionType === "expense"
                  ? "bg-purple-600 text-white"
                  : "text-gray-500 hover:bg-gray-200"
              )}
            >
              Bills / Vendor Payments
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("disbursement")}
              className={clsx(
                "w-1/2 text-center py-2 rounded-md font-semibold transition-colors",
                transactionType === "disbursement"
                  ? "bg-purple-600 text-white"
                  : "text-gray-500 hover:bg-gray-200"
              )}
            >
              Contractor Disbursement
            </button>
          </div>

          {transactionType === "expense" ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expense Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={expenseData.title}
                  onChange={handleExpenseChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 mt-1"
                  required
                />
              </div>

              {/* Line Items */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Line Items</h4>
                {expenseData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 mb-2"
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
                      placeholder="Item description"
                      className="flex-grow border border-gray-300 rounded-lg py-2 px-3"
                    />
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-gray-500">
                        ₦
                      </span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(item.id, "amount", e.target.value)
                        }
                        className="w-28 pl-6 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-2 text-sm font-semibold text-purple-600 flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Item
                </button>
              </div>

              {/* Date, Payment & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={expenseData.date}
                    onChange={handleExpenseChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={expenseData.paymentMethod}
                    onChange={handleExpenseChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>POS</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={expenseData.category}
                  onChange={(e) =>
                    setExpenseData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                >
                  {categories.map((c, index) => (
                    <option key={`${c.title}-${index}`}>{c.title}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="mt-2 text-sm text-purple-600 hover:underline"
                >
                  + Create Expense Category
                </button>
              </div>

              {/* Vendor Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Vendor
                </label>
                <ProfessionalSelector
                  type="vendors"
                  showProjectsByDefault={false}
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                />
              </div>
            </>
          ) : (
            <>
              {/* Contractor Disbursement */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={disbursementData.title}
                  onChange={handleDisbursementChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={disbursementData.amount}
                    onChange={handleDisbursementChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={disbursementData.date}
                    onChange={handleDisbursementChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Contractor
                </label>
                <ProfessionalSelector
                  type="contractors"
                  showProjectsByDefault={false}
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        {/* Add Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">
                Create Expense Category
              </h2>
              <form onSubmit={handleCategorySubmit}>
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
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}