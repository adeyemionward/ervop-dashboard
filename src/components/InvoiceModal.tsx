import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { InvoiceItem, Invoice } from "@/types/invoice"; // ✅ import shared types
import toast from "react-hot-toast";

type EditableInvoiceItemFields = "description" | "quantity" | "rate";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceSaved: (invoice: Invoice) => void; // ✅ now strongly typed
  sourceType: "appointment" | "project";
  sourceId: string;
  contactId: number;
  mode?: "create" | "edit";
  existingInvoice?: Invoice | null; // ✅ now strongly typed
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceSaved,
  sourceType,
  sourceId,
  contactId,
  mode = "create",
  existingInvoice,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    existingInvoice?.invoiceNumber || ""
  );
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceIssueDate, setInvoiceIssueDate] = useState("");
  const [invoiceTax, setInvoiceTax] = useState("0");
  const [invoiceDiscount, setInvoiceDiscount] = useState("0");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  
  const hasValidItems =
  invoiceItems.length > 0 &&
  invoiceItems.every(
    (i) => i.description.trim() !== "" && i.quantity > 0 && i.rate > 0
  );

  const isFormValid = invoiceNumber && invoiceIssueDate && invoiceDueDate && hasValidItems;


  const subtotal = invoiceItems.reduce((acc, item) => acc + (item.amount ?? 0), 0);
  const taxAmount = (subtotal * Number(invoiceTax)) / 100;
  const discountAmount = (subtotal * Number(invoiceDiscount)) / 100;
  const total = subtotal + taxAmount - discountAmount;


useEffect(() => {
  if (mode === "edit" && existingInvoice) {
    setInvoiceNumber(existingInvoice.invoiceNumber || "");

    // Convert pretty strings (e.g. "September 25, 2025") back to ISO for <input type="date">
    if (existingInvoice.issuedDate) {
      setInvoiceIssueDate(
        new Date(existingInvoice.issuedDate).toISOString().split("T")[0]
      );
    }
    if (existingInvoice.dueDate) {
      setInvoiceDueDate(
        new Date(existingInvoice.dueDate).toISOString().split("T")[0]
      );
    }

    setInvoiceTax(existingInvoice.taxPercentage?.toString() || "0");
    setInvoiceDiscount(existingInvoice.discountPercentage?.toString() || "0");
    setInvoiceNotes(existingInvoice.notes || "");
    setInvoiceItems(existingInvoice.items || []);
  } else if (mode === "create") {
    setInvoiceNumber("");
    setInvoiceIssueDate(new Date().toISOString().split("T")[0]); // today in ISO
    setInvoiceDueDate("");
    setInvoiceItems([
      { id: `new-${Date.now()}`, description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
    setInvoiceTax("0");
    setInvoiceDiscount("0");
    setInvoiceNotes("");
  }
}, [mode, existingInvoice]);

  if (!isOpen) return null;

  const handleItemChange = <K extends EditableInvoiceItemFields>(
    index: number,
    field: K,
    value: InvoiceItem[K]
  ) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;

    if (field === "quantity" || field === "rate") {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }

    setInvoiceItems(updated);
  };

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: `new-${Date.now()}`, description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

 const handleSubmit = async () => {
  // if (!invoiceDueDate || invoiceItems.some(i => !i.description || i.quantity <= 0 || i.rate <= 0)) {
  //   alert("Please fill out all required invoice fields.");
  //   return;
  // }

    const payload: any = {
        contact_id: contactId,
        invoice_no: invoiceNumber,
        issue_date: invoiceIssueDate,
        due_date: invoiceDueDate,
        tax_percentage: Number(invoiceTax),
        discount_percentage: Number(invoiceDiscount),
        notes: invoiceNotes,
        item: invoiceItems.map(({ description, quantity, rate }) => ({
            description, quantity, rate,
        })),
    };

  if (sourceType === "appointment") payload.appointment_id = sourceId;
  if (sourceType === "project") payload.project_id = sourceId;

  let url = "http://127.0.0.1:8000/api/v1/professionals/invoices/create/";
  let method: "POST" | "PUT" = "POST";

  if (mode === "edit" && existingInvoice) {
    url = `http://127.0.0.1:8000/api/v1/professionals/invoices/update/${existingInvoice.id}`;
    method = "PUT";
  } 

  if (loading) return;

  setLoading(true);


  try {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json(); // 👈 parse first, THEN check

    if (!res.ok || !data.status) {
      if (data.errors) {
          setValidationErrors(data.errors);
      }
      throw new Error(data.message || "Failed to save invoice");
    }
    setValidationErrors({});
    // ✅ success toast
    toast.success(
      mode === "edit" ? "Invoice updated successfully 🎉" : "Invoice created successfully 🎉"
    );
  

    // ✅ Build the invoice object directly from modal state
    const localInvoice: Invoice = {
        id: Number(data.data?.id ?? Date.now()), // ✅ always a number
        invoiceNumber: payload.invoice_no || existingInvoice?.invoiceNumber || "",
        taxPercentage: payload.tax_percentage, 
        discountPercentage: payload.discount_percentage, 
        taxAmount: payload.tax_amount, 
        discountAmount:payload.discount,
        remainingBalance: data.data?.remaining_balance ?? total,
        notes: payload.notes,
        issuedDate: new Date(payload.issue_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        dueDate: new Date(payload.due_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        status: data.data?.status || "Unpaid",
        items: invoiceItems,
    };

    onInvoiceSaved(localInvoice);

    // onInvoiceSaved(data.data);
    onClose();
  } catch (err: any) {
    console.error("Invoice error:", err.message);
  }finally {
    setLoading(false);
  }
};


  //
  // --- Totals ---
  //

  //
  // --- JSX ---
  //
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === "edit" ? "Edit Invoice" : "Create Invoice"}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {/* Form Body */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">
            {/* Invoice Number, Issue Date, Due Date */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice #
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g., INV-001"
                />
                {validationErrors.invoice_no && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.invoice_no[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="invoiceIssueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="invoiceIssueDate"
                  value={invoiceIssueDate}
                  onChange={(e) => setInvoiceIssueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                {validationErrors.issue_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.issue_date[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="invoiceDueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="invoiceDueDate"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                {validationErrors.due_date && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.due_date[0]}</p>
                )}
              </div>
            </div>


            {/* Items */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Invoice Items</h4>
              <div className="space-y-3">
                {invoiceItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      className="col-span-5 p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", Number(e.target.value))
                      }
                      placeholder="Qty"
                      className="col-span-2 p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", Number(e.target.value))
                      }
                      placeholder="Rate"
                      className="col-span-2 p-2 border rounded-md"
                    />
                    <span className="col-span-2 text-right">
                      ₦{(item.amount ?? 0).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {validationErrors.item && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.item[0]}</p>
              )}

              <button
                onClick={handleAddItem}
                className="mt-3 flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Tax & Discount */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label
                  htmlFor="invoiceTax"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tax (%)
                </label>
                <input
                  type="number"
                  id="invoiceTax"
                  value={invoiceTax}
                  onChange={(e) => setInvoiceTax(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="invoiceDiscount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="invoiceDiscount"
                  value={invoiceDiscount}
                  onChange={(e) => setInvoiceDiscount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label
                htmlFor="invoiceNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="invoiceNotes"
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="e.g., 50% deposit..."
              />
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t text-right space-y-2 font-medium">
              <div className="flex justify-end gap-4">
                <span>Subtotal:</span> <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span>Tax ({invoiceTax || 0}%):</span>{" "}
                <span>₦{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span>Discount ({invoiceDiscount || 0}%):</span>{" "}
                <span>-₦{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-4 text-lg font-bold">
                <span>Total:</span> <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
      </div>


        {/* Footer */}
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`px-4 py-2 rounded-md text-white ${
              !isFormValid || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7E51FF] hover:bg-[#6a42e6]"
            }`}
          >
            {loading
              ? "Submitting..."
              : mode === "edit"
              ? "Update Invoice"
              : "Create Invoice"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
