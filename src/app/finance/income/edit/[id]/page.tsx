"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { PlusCircle, Trash2, Save } from "lucide-react";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector";
// --- TYPES ---
type TransactionType = "income" | "expense";
type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
};
type TransactionResponse = {
  id: number;
  type: TransactionType;
  amount?: number;
  title?: string;
  date: string;
  payment_method: string;
  category?: string;
  invoice_id?: string | null;
  contact_id?: string | null;
  project_id?: string | null;
  appointment_id?: string | null;
  description?: string;
  items?: ExpenseItem[];
};

export default function TransactionEditPage() {
  const { id } = useParams(); // catch id from URL
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("income");
  const [paymentMethod, setPaymentMethod] = useState("");
 const [selectedClient, setSelectedClient] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState("");
    const { contacts, clientProjects, clientAppointments } = useClientData(selectedClient);
    const [isLinked, setIsLinked] = useState(false);

  const [incomeData, setIncomeData] = useState({
    amount: "",
    date: "",
    description: "",
    category: "",
    invoiceId: "",
    paymentMethod: "Cash",
  });

  const [expenseData, setExpenseData] = useState({
    title: "",
    date: "",
    category: "",
    paymentMethod: "Cash",
    items: [] as ExpenseItem[],
  });

  // Fetch transaction details 
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/professionals/transactions/show/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch transaction");
        const data: TransactionResponse = await res.json();

         // --- Check if transaction is linked ---
      const linked = Boolean(data.contact_id || data.project_id || data.appointment_id);
      setIsLinked(linked);

      if (linked) {
        setSelectedClient(data.contact_id || "");
        setSelectedProject(data.project_id || "");
        setSelectedAppointment(data.appointment_id || "");
      }

        setTransactionType(data.type);

        if (data.type === "income") {
          setIncomeData({
            amount: data.amount?.toString() || "",
            date: data.date,
            description: data.title || "",
            category: data.category || "",
            invoiceId: data.invoice_id || "",
            paymentMethod: data.payment_method,
          });
          // ✅ Set payment method for income
         setPaymentMethod(data.payment_method ?? "Cash"); // default if null
        } else {
          setExpenseData({
            title: data.title || "",
            date: data.date,
            category: data.category || "",
            paymentMethod: data.payment_method,
            items: data.items || [],
          });
          // ✅ Set payment method for income
         setPaymentMethod(data.payment_method ?? "Cash"); // default if null
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load transaction");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);




  // --- Handlers ---
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setIncomeData({ ...incomeData, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (id: number, field: "description" | "amount", value: string) => {
    setExpenseData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "amount" ? parseFloat(value) || 0 : value }
          : item
      ),
    }));
  };

  const handleAddItem = () => {
    setExpenseData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: "", amount: 0 }],
    }));
  };

  const handleRemoveItem = (id: number) => {
    setExpenseData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const totalExpense = useMemo(
    () => expenseData.items.reduce((sum, i) => sum + (i.amount || 0), 0),
    [expenseData.items]
  );

  // --- Save transaction ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      let payload: any;

      if (transactionType === "income") {
        payload = {
          type: "income",
          amount: parseFloat(incomeData.amount),
          date: incomeData.date,
          description: incomeData.description,
          category: incomeData.category,
          invoice_id: incomeData.invoiceId || null,
          payment_method: incomeData.paymentMethod,
        };
      } else {
        payload = {
          type: "expense",
          title: expenseData.title,
          date: expenseData.date,
          category: expenseData.category,
          payment_method: expenseData.paymentMethod,
          items: expenseData.items,
        };
      }

      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/professionals/transactions/update/${id}`,
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
        const err = await res.json();
        console.error("Save error:", err);
        toast.error("Failed to update transaction");
        return;
      }

      toast.success("Transaction updated successfully!");
      router.push("/transactions");
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error saving transaction");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={() => router.back()}
          title={transactionType === "income" ? "Edit Income" : "Edit Expense"}
          description="Update your transaction details"
        />

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            {transactionType === "income" ? (
              <>
                {/* Income fields */}
                {/* <div>
                  <label className="block text-sm font-medium">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={incomeData.amount}
                    onChange={handleIncomeChange}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={incomeData.date}
                    onChange={handleIncomeChange}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div> */}

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
                        value={incomeData.amount}
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
                      value={incomeData.date}
                      onChange={handleIncomeChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg  py-3 px-4"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="POS">POS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>


                {/* <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={incomeData.category}
                    onChange={handleIncomeChange}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={incomeData.description}
                    onChange={handleIncomeChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Expense fields */}
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={expenseData.title}
                    onChange={handleExpenseChange}
                    className="w-full border border-gray-300 rounded-lg-lg px-4 py-3"
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Items</h4>
                  {expenseData.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id, "description", e.target.value)
                        }
                        className="flex-grow border rounded-lg px-3 py-2"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(item.id, "amount", e.target.value)
                        }
                        className="w-32 border rounded-lg px-3 py-2"
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center text-purple-600 mt-2"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> Add Item
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

                <div className="mb-4">
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="POS">POS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <input
  type="checkbox"
  checked={isLinked}
  onChange={(e) => {
    setIsLinked(e.target.checked);
    if (!e.target.checked) {
      setSelectedClient("");
      setSelectedProject("");
      setSelectedAppointment("");
    }
  }}
/>
{isLinked && (
  <ClientSelector
    selectedClient={selectedClient}
    setSelectedClient={setSelectedClient}
    selectedProject={selectedProject}
    setSelectedProject={setSelectedProject}
    selectedAppointment={selectedAppointment}
    setSelectedAppointment={setSelectedAppointment}
    contacts={contacts}
  />
)}

                
              </>
            )}

            {/* Save */}
            <div>
              <button
                type="submit"
                disabled={saving}
                className={clsx(
                  "w-full flex justify-center items-center py-3 rounded-lg text-white",
                  saving ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                {saving ? "Saving..." : "Save Changes"}
                {!saving && <Save className="ml-2 w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
