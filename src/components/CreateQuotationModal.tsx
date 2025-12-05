'use client';

import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import ClientSelector from "@/components/ClientSelector1";
import { useClientData } from "@/hooks/useClientData";

interface QuotationModalProps {
  onClose?: () => void;
   onCreated?: () => void; // ✅ callback to refresh parent list
}

type LineItem = { description: string; qty: number; rate: number; };

export default function CreateQuotationModal({ onClose, onCreated }: QuotationModalProps) {
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, rate: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { contacts } = useClientData(selectedClient);
  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountedTotal = subtotal - subtotal * (discount / 100);
  const total = discountedTotal + discountedTotal * (tax / 100);

  const addItem = () => setItems([...items, { description: "", qty: 1, rate: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
   const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    if (field === "qty" || field === "rate") updated[index][field] = Number(value);
    else updated[index][field] = value;
    setItems(updated);
  };

  const isFormValid = () =>
    selectedClient &&
    issueDate &&
    expiryDate &&
    (selectedProject || selectedAppointment) &&
    items.length > 0 &&
    items.every(i => i.description.trim() && i.qty > 0 && i.rate > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill all required fields correctly.");
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
        notes,
        item: items.map(i => ({
          description: i.description,
          quantity: i.qty,
          rate: i.rate,
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
      if (!res.ok || result.status === false) throw new Error(result.message);

      toast.success(result.message || "Quotation created successfully!");
      if (onCreated) onCreated();
      onClose?.();
   } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quotation Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              Quotation Number (optional)
              <Info className="h-4 w-4 ml-1 text-gray-400" />
            </div>
          </label>
          <input
            type="text"
            value={quotationNo}
            onChange={(e) => setQuotationNo(e.target.value)}
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

      {/* Client Selector */}
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

      {/* Line Items Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
        <table className="w-full">
          <thead className="text-left text-xs text-gray-500 uppercase">
            <tr>
              <th>Description</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(index, "qty", e.target.value)}
                    className="w-20 text-center border border-gray-300 rounded-md p-2"
                  />
                </td>
                <td className="text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", e.target.value)}
                    className="w-32 text-right border border-gray-300 rounded-md p-2"
                  />
                </td>
                <td className="text-right">₦{(item.qty * item.rate).toFixed(2)}</td>
                <td className="text-right">
                  <button type="button" onClick={() => removeItem(index)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItem} className="mt-4 text-sm text-purple-600">
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
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Summary */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <div className="flex justify-between text-gray-600">
          <p>Subtotal</p>
          <p className="font-medium">₦{subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-gray-600">
          <p>Discount (%)</p>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-20 border border-gray-300 rounded-md p-1 text-right"
          />
        </div>
        <div className="flex justify-between text-gray-600">
          <p>Tax (%)</p>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
            className="w-20 border border-gray-300 rounded-md p-1 text-right"
          />
        </div>
        <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-2">
          <p>Total</p>
          <p>₦{total.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50"
          disabled={!isFormValid() || loading}
        >
          {loading ? "Sending..." : "Send Quotation"}
        </button>
      </div>
    </form>
  );
}
