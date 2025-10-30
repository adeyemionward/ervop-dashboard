'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import { RecurringInvoiceSetup } from "@/components/RecurringInvoiceSetup";
import { toast } from "react-hot-toast";
import { Info, Trash2 } from "lucide-react";

type LineItem = {
  description: string;
  qty: number;
  rate: number;
};

export default function EditInvoice() {
  const router = useRouter();
  const { id } = useParams(); // URL param e.g. /invoices/edit/58
  const handleGoBack = useGoBack();

  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeats, setRepeats] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  const { contacts } = useClientData(selectedClient);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountedTotal = subtotal - subtotal * (discount / 100);
  const total = discountedTotal + discountedTotal * (tax / 100);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/professionals/invoices/show/${id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok || data.status === false) {
          throw new Error(data.message || "Failed to fetch invoice");
        }

        const inv = data.data;

        setInvoiceNo(inv.invoice_no || "");
        setIssueDate(inv.issue_date || "");
        setDueDate(inv.due_date || "");
        setNotes(inv.notes || "");
        setSelectedClient(inv.customer?.id?.toString() || "");
        setSelectedProject(inv.project_id?.toString() || "");
       setSelectedAppointment(inv.appointment_id?.toString() || "");
        setDiscount(parseFloat(inv.summary?.discount_percentage || 0));
        setTax(parseFloat(inv.summary?.tax_percentage || 0));



        setItems(
            inv.items.map((item: LineItem) => ({
                description: item.description || "",
                qty: Number(item.qty) || 1,
                rate: Number(item.rate) || 0,
            }))
        );
        setDiscount(parseFloat(inv.summary?.discount_percentage) || 0);
        setTax(parseFloat(inv.summary?.tax_percentage) || 0);

        // Recurring
        if (inv.reoccuring) {
          setIsRecurring(Boolean(inv.reoccuring.is_recurring));
          setRepeats(inv.reoccuring.repeats || "");
          setStartDate(inv.reoccuring.occuring_start_date || "");
          setEndDate(inv.reoccuring.occuring_end_date || "");
        }
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
            toast.error(err.message);
        } else {
            toast.error("Error loading invoice");
        }
        } finally {    
        setLoading(false);
    }

    };

    fetchInvoice();
  }, [id, BASE_URL, userToken]);

  // Form validation
  const isFormValid = () => {
    if (!selectedClient || !invoiceNo.trim() || !issueDate || !dueDate) return false;
    if (items.length === 0) return false;
    for (const item of items) {
      if (!item.description.trim() || item.qty <= 0 || item.rate <= 0) return false;
    }
    return true;
  };

  // Update item
  const updateItem = (index: number, field: keyof LineItem, value: string) => {
  setItems(prev => {
    const updated = [...prev];
    if (field === "qty" || field === "rate") {
      updated[index][field] = Number(value) as LineItem[typeof field];
    } else {
      updated[index][field] = value as LineItem[typeof field];
    }
    return updated;
  });
};


  const addItem = () => setItems([...items, { description: "", qty: 1, rate: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        contact_id: selectedClient,
        project_id: selectedProject || null,
        appointment_id: selectedAppointment || null,
        invoice_no: invoiceNo,
        issue_date: issueDate,
        due_date: dueDate,
        tax_percentage: tax,
        discount_percentage: discount,
        notes,
        item: items.map((item) => ({
          description: item.description,
          quantity: item.qty,
          rate: item.rate,
        })),
        is_recurring: isRecurring,
        ...(isRecurring && {
          repeats,
          occuring_start_date: startDate,
          occuring_end_date: endDate || null,
        }),
      };

      const res = await fetch(`${BASE_URL}/professionals/invoices/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to update invoice");
      }

      toast.success("Invoice updated successfully!");
      router.push("/finance/invoices");
    } catch (err: unknown) {
        console.error(err); 
        if (err instanceof Error) {
            toast.error(err.message);
        } else {
            toast.error("Error loading invoice");
        }
        } finally {
        setLoading(false);
        }

  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Edit Invoice"
          description="Update details for this invoice."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-5xl mx-auto">
          <form className="space-y-8" onSubmit={handleUpdate}>
            {/* --- Invoice Info --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
              <div>
                 Invoice Number (optional)
                {/* Tooltip icon */}
                <span className="ml-2 relative group">
                    <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                    {/* Tooltip content */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-md bg-gray-900 text-white text-xs text-center px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    If left empty, the invoice number will be generated automatically
                    </span>
                </span>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="Invoice Number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
              contacts={contacts || []}
              showInvoices={false}
            />

            <RecurringInvoiceSetup
              isRecurring={isRecurring}
              setIsRecurring={setIsRecurring}
              repeats={repeats}
              setRepeats={setRepeats}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />

            {/* --- Items Table --- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="pb-2 font-medium w-1/2">Description</th>
                      <th className="pb-2 font-medium text-center">Qty</th>
                      <th className="pb-2 font-medium text-right">Rate</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(index, "qty", e.target.value)}
                            className="w-20 text-center border border-gray-300 rounded-md p-2"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(index, "rate", e.target.value)}
                            className="w-32 text-right border border-gray-300 rounded-md p-2"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-gray-800">
                          ₦{(item.qty * item.rate).toFixed(2)}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                + Add Line Item
              </button>
            </div>

            {/* Notes */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            {/* Totals */}
            <div className="border-t pt-6 space-y-3 max-w-sm ml-auto">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p>₦{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <label>Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 text-right border border-gray-300 rounded-md p-1"
                />
              </div>
              <div className="flex justify-between">
                <label>Tax (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-24 text-right border border-gray-300 rounded-md p-1"
                />
              </div>
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>₦{total.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
