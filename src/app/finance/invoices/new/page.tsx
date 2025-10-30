'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useClientData } from "@/hooks/useClientData";
import ClientSelector from "@/components/ClientSelector1";
import { RecurringInvoiceSetup } from "@/components/RecurringInvoiceSetup";
import { toast } from "react-hot-toast";
import { Info, Trash2} from "lucide-react";

type LineItem = {
  description: string;
  qty: number;
  rate: number;
};




export default function CreateInvoice() {
  const handleGoBack = useGoBack();

  const [items, setItems] = useState<LineItem[]>([
    { description: "", qty: 1, rate: 0 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  // const [selectedInvoice, setSelectedInvoice] = useState("");

  const [loading, setLoading] = useState(false);

  //vaidation
  const [invoiceNo, setInvoiceNo] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  // const [invalidItems, setInvalidItems] = useState<number[]>([]);

  const { contacts} = useClientData(selectedClient);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountedTotal = subtotal - subtotal * (discount / 100);
  const total = discountedTotal + discountedTotal * (tax / 100);


  const [isRecurring, setIsRecurring] = useState(false);
  const [startDate, setStartDate] = useState("2024-01-01"); // Added default dates for demonstration
  const [endDate, setEndDate] = useState("2024-12-31");

   // Default to the first combined option
  const [repeats, setRepeats] = useState("Weekly (Every Monday)");

  const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  

  const addItem = () => {
    setItems([...items, { description: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    if (field === "qty" || field === "rate") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  //form validation
  const isFormValid = () => {
  if (!selectedClient || !invoiceNo.trim() || !issueDate || !dueDate) return false;
  if (!selectedAppointment && !selectedProject) return false;
  if (items.length === 0) return false;
  for (const item of items) {
    if (!item.description.trim() || item.qty <= 0 || item.rate <= 0) return false;
  }
  return true;
};

  // API Integration
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check for invalid items
  const invalidIndices = items
    .map((item, idx) =>
      !item.description.trim() || item.qty <= 0 || item.rate <= 0 ? idx : -1
    )
    .filter((idx) => idx !== -1);

  if (invalidIndices.length > 0) {
    // setInvalidItems(invalidIndices);
    toast.error("Please fill out all item fields correctly.");
    return;
  }

  // Check overall form validity
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
      notes: notes,
      item: items.map((item) => ({
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
      })),
      // --- RECURRING INVOICE DATA ---
      is_recurring: isRecurring, // MANDATORY: True/False based on toggle
      
      // Conditionally add recurrence details only if it is recurring
      ...(isRecurring && {
        repeats: repeats, // e.g., "Weekly (Every Monday)"
        occuring_start_date: startDate,
        occuring_end_date: endDate || null, // Use null if user leaves it blank
      }),
    };
    
    const res = await fetch(
      `${BASE_URL}/professionals/invoices/create/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    
    const result = await res.json();
    if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to create invoice");
      }

      toast.success(result.message || "Invoice created successfully!");

    console.log(result);
  } catch (error) {
    console.error("Error creating invoice:", error);
    // toast.error(error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};



  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Generate Invoice"
          description="Create and send a professional invoice to your customers."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-5xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
              {/* Invoice Number */}
              <div>
              
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    Invoice Number (optional)
                    {/* Tooltip icon */}
                    <span className="ml-2 relative group">
                      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      {/* Tooltip content */}
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-md bg-gray-900 text-white text-xs text-center px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        If left empty, the invoice number will be generated automatically
                      </span>
                    </span>
                  </div>
                </label>

                <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Invoice Number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
              </div>
              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
              </div>
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
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
            
              contacts={contacts || []} // initial contacts loaded
                showInvoices={false}
            />

            {/* --- RECURRING INVOICE SETUP (NEW SECTION) --- */}
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

            {/* --- END RECURRING INVOICE SETUP --- */}

            {/* Items Table */}
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
                          <input type="text" value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Item or service description" className="w-full border border-gray-300 rounded-md p-2" />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} className="w-20 text-center border border-gray-300 rounded-md p-2" />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} placeholder="0.00" className="w-32 text-right border border-gray-300 rounded-md p-2" />
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
                              <Trash2 className="w-4 h-4"/>
                          </button>
                        
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addItem} className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-800">+ Add Line Item</button>
            </div>

            {/* Notes Section */}
            <div className="border-t pt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add any special instructions or remarks here..."
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
                    <label htmlFor="discount" className="text-gray-600">Discount (%)</label>
                    <input type="number" id="discount" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 text-right border border-gray-300 rounded-md p-1" />
                  </div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="tax" className="text-gray-600">Tax (%)</label>
                    <input type="number" id="tax" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-24 text-right border border-gray-300 rounded-md p-1" />
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
              <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Save Draft</button>
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid() || loading}
              >
                {loading ? "Sending..." : "Send Invoice"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}