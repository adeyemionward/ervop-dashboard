'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
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

export default function CreateQuotation() {
  const handleGoBack = useGoBack();

  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, rate: 0 }]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { contacts } = useClientData(selectedClient);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountedTotal = subtotal - subtotal * (discount / 100);
  const total = discountedTotal + discountedTotal * (tax / 100);

  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

  const addItem = () => setItems([...items, { description: "", qty: 1, rate: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    if (field === "qty" || field === "rate") updated[index][field] = Number(value);
    else updated[index][field] = value;
    setItems(updated);
  };

  const isFormValid = () => {
    if (!selectedClient || !issueDate || !expiryDate) return false;
    if (!selectedAppointment && !selectedProject) return false;
    if (items.length === 0) return false;
    for (const item of items) {
      if (!item.description.trim() || item.qty <= 0 || item.rate <= 0) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill out all required fields correctly.");
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
        valid_until: expiryDate,
        tax_percentage: tax,
        discount_percentage: discount,
        notes: notes,
        item: items.map((item) => ({
          description: item.description,
          quantity: item.qty,
          rate: item.rate,
        })),
      };

      const res = await fetch(`${BASE_URL}/professionals/finances/quotations/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.status === false)
        throw new Error(result.message || "Failed to create quotation");

      toast.success(result.message || "Quotation created successfully!");
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Create Quotation"
          description="Prepare and send a quotation for your customer."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-5xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Quotation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    Quotation Number (optional)
                    <span className="ml-2 relative group">
                      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-md bg-gray-900 text-white text-xs text-center px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        If left empty, the quotation number will be generated automatically
                      </span>
                    </span>
                  </div>
                </label>
                <input
                  type="text"
                  value={quotationNo}
                  onChange={(e) => setQuotationNo(e.target.value)}
                  placeholder="Quotation Number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
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

            {/* Items */}
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
                            placeholder="Item or service description"
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
                            placeholder="0.00"
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
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add remarks or conditions..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Summary */}
            <div className="border-t border-gray-100 pt-6 space-y-6">
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium text-gray-900">₦{subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="discount" className="text-gray-600">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      id="discount"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 text-right border border-gray-300 rounded-md p-1"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="tax" className="text-gray-600">
                      Tax (%)
                    </label>
                    <input
                      type="number"
                      id="tax"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="w-24 text-right border border-gray-300 rounded-md p-1"
                    />
                  </div>
                  <div className="border-t my-2 pt-2"></div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <p>Total</p>
                    <p>₦{total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">
                Save Draft
              </button>
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid() || loading}
              >
                {loading ? "Sending..." : "Send Quotation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
