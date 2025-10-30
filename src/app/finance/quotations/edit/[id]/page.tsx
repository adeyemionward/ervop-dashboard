'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import { toast } from "react-hot-toast";
import { Info, Trash2 } from "lucide-react";

type LineItem = {
  description: string;
  qty: number;
  rate: number;
};

export default function EditQuotation() {
  const router = useRouter();
  const { id } = useParams();
  const handleGoBack = useGoBack();

  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotationNo, setQuotationNo] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

  const { contacts } = useClientData(selectedClient);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountedTotal = subtotal - subtotal * (discount / 100);
  const total = discountedTotal + discountedTotal * (tax / 100);

  // Fetch quotation details
  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/professionals/finances/quotations/show/${id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok || data.status === false) {
          throw new Error(data.message || "Failed to fetch quotation");
        }

        const q = data.data;
        setQuotationNo(q.quotation_no || "");
        setIssueDate(q.issue_date || "");
        setValidUntil(q.valid_until || "");
        setNotes(q.notes || "");
        setSelectedClient(q.customer?.id?.toString() || "");
        setSelectedProject(q.project_id?.toString() || "");
        setSelectedAppointment(q.appointment_id?.toString() || "");
        setDiscount(parseFloat(q.summary?.discount || "0"));
        setTax(parseFloat(q.summary?.tax || "0"));

        setItems(
          q.items.map((item: LineItem) => ({
            description: item.description || "",
            qty: Number(item.qty) || 1,
            rate: Number(item.rate) || 0,
          }))
        );
      } catch (err: unknown) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Error loading quotation");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id, BASE_URL, userToken]);

  // Form validation
  const isFormValid = () => {
    if (!selectedClient || !quotationNo.trim() || !issueDate || !validUntil) return false;
    if (items.length === 0) return false;
    for (const item of items) {
      if (!item.description.trim() || item.qty <= 0 || item.rate <= 0) return false;
    }
    return true;
  };

  // Update item fields
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
        quotation_no: quotationNo,
        issue_date: issueDate,
        valid_until: validUntil,
        tax_percentage: tax,
        discount_percentage: discount,
        notes,
        item: items.map((item) => ({
          description: item.description,
          quantity: item.qty,
          rate: item.rate,
        })),
      };

      const res = await fetch(`${BASE_URL}/professionals/finances/quotations/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to update quotation");
      }

      toast.success("Quotation updated successfully!");
      router.push("/finance/quotations");
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error updating quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Edit Quotation"
          description="Update details for this quotation."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-5xl mx-auto">
          <form className="space-y-8" onSubmit={handleUpdate}>
            {/* --- Quotation Info --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
              <div>
                Quotation Number (optional)
               
                <input
                  type="text"
                  value={quotationNo}
                  onChange={(e) => setQuotationNo(e.target.value)}
                  placeholder="Quotation Number"
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
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
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
                {loading ? "Updating..." : "Update Quotation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
