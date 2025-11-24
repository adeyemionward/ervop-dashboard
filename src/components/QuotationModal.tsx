"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Quotation, QuotationItem } from "@/types/quotation";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (quotation: Quotation) => void; // strongly typed
  sourceType: "project";
  sourceId: string;
  contactId: number;
  mode?: "create" | "edit";
  existingQuotation?: Quotation | null;
}

type EditableQuotationItemFields = "description" | "quantity" | "rate";

export default function QuotationModal({
  isOpen,
  onClose,
  onCreated,
  sourceType,
  sourceId,
  contactId,
  mode = "create",
  existingQuotation,
}: QuotationModalProps) {
  const [quotationNumber, setQuotationNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discount, setDiscount] = useState(0); // This is already the discount percentage
  const [tax, setTax] = useState(0); // This is already the tax percentage
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill fields when editing
  const formatDateForInput = (date?: string | null) => {
    if (!date) return ""; // fallback to empty string
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (mode === "edit" && existingQuotation) {
      setQuotationNumber(existingQuotation.quotationNumber || "");
      setIssueDate(formatDateForInput(existingQuotation.issueDate));
      setDueDate(formatDateForInput(existingQuotation.dueDate));
      // Ensure we use the calculated amount if available, otherwise quantity * rate
      setItems(
        existingQuotation.items.map((item) => ({
          ...item,
          amount: item.amount || item.quantity * item.rate,
        })) || []
      );
      setDiscount(existingQuotation.discountPercentage || 0);
      setTax(existingQuotation.taxPercentage || 0);
      setNotes(existingQuotation.notes || "");
    } else if (mode === "create") {
      setItems([
        {
          id: `new-${Date.now()}`,
          description: "",
          quantity: 1,
          rate: 0,
          // Amount is calculated from Qty * Rate
          amount: 0, 
        },
      ]);
      setIssueDate(new Date().toISOString().split("T")[0]);
      setDueDate(""); // optional default
    }
  }, [mode, existingQuotation]);

  if (!isOpen) return null;

  // 👉 Compute amounts 
  // We explicitly calculate amount based on current quantity/rate for reliable subtotal
  const calculatedItems = items.map(item => ({
    ...item,
    amount: item.quantity * item.rate, // Recalculate based on current state
  }));
  
  const subtotal = calculatedItems.reduce((acc, item) => acc + item.amount, 0);

  // Safety: Ensure discount and tax are treated as numbers (e.g., in case the input returns a string)
  const numericDiscount = Number(discount) || 0;
  const numericTax = Number(tax) || 0;

  const discountAmount = (subtotal * numericDiscount) / 100;
  const discounted = subtotal - discountAmount;
  const taxAmount = (discounted * numericTax) / 100;
  const total = discounted + taxAmount;

  const handleItemChange = <K extends EditableQuotationItemFields>(
    index: number,
    field: K,
    value: QuotationItem[K]
  ) => {
    const updated = [...items];
    updated[index][field] = value;
    // Update amount field automatically for display/next use
    if (field === "quantity" || field === "rate") {
      const quantity = Number(updated[index].quantity) || 0;
      const rate = Number(updated[index].rate) || 0;
      updated[index].amount = quantity * rate;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const isFormValid = () =>
    issueDate &&
    dueDate &&
    items.length > 0 &&
    items.every(
      (i) => i.description.trim() && (i.quantity || 0) > 0 && (i.rate || 0) >= 0
    );

  const handleSubmit = async () => {
    // Use calculatedItems to get the most up-to-date amount
    const payloadItems = calculatedItems.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      rate: i.rate,
      // Note: Backend typically recalculates the amount, but passing Qty/Rate is key.
      // If the backend expects amount, you can include: amount: i.amount 
    }));
    
    const payload: Record<string, unknown> = {
      contact_id: contactId,
      quotation_no: quotationNumber,
      issue_date: issueDate,
      valid_until: dueDate,
      tax_percentage: numericTax, // Use numeric value
      discount_percentage: numericDiscount, // Use numeric value
      notes,
      item: payloadItems,
    };

    // Conditionally add source IDs
    if (sourceType === "project") payload.project_id = sourceId;
    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

    let url = `${BASE_URL}/professionals/finances/quotations/create/`;
    let method: "POST" | "PUT" = "POST";

    if (mode === "edit" && existingQuotation) {
      url = `${BASE_URL}/professionals/finances/quotations/update/${existingQuotation.id}`;
      method = "PUT";
    }

    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.status) throw new Error(result.message);

      toast.success("Quotation saved successfully 🎉");

      // Build the quotation object directly from modal state
      const localQuotation: Quotation = {
        id: Number(result.data?.id ?? Date.now()),
        quotationNumber:
          quotationNumber || existingQuotation?.quotationNumber || "",
        taxPercentage: numericTax,
        discountPercentage: numericDiscount,

        // Compute amounts
        taxAmount,
        discountAmount,
        subTotal: subtotal,
        totalAmount: total,

        notes: notes,

        issueDate: new Date(issueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        dueDate: new Date(dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        // Fallback to existing quotation status or backend status
        status: result.data?.status || existingQuotation?.status || "Draft",
        items: calculatedItems, // Use calculatedItems for up-to-date item amounts
      };

      onCreated?.(localQuotation);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === "edit" ? "Edit Quotation" : "Create Quotation"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {/* Top Fields */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Quotation #"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              className="col-span-1 border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="col-span-1 border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* Items Table Header */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Items</h4>
            <div className="grid grid-cols-12 gap-2 text-sm text-gray-500 mb-1">
              <span className="col-span-5 font-medium">Description</span>
              <span className="col-span-2 font-medium text-center">Qty</span>
              <span className="col-span-2 font-medium text-right">Rate (₦)</span>
              <span className="col-span-2 font-medium text-right">Amount (₦)</span>
              <span className="col-span-1"></span> {/* For Trash icon */}
            </div>
            <div className="space-y-3">
              {/* Items List */}
              {items.map((item, index) => (
                <div
                  key={item.id} // Use item.id or unique key instead of index if possible
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
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", Number(e.target.value))
                    }
                    className="col-span-2 p-2 border rounded-md text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", Number(e.target.value))
                    }
                    className="col-span-2 p-2 border rounded-md text-right"
                  />
                  {/* Total amount for the row */}
                  <span className="col-span-2 text-right font-medium">
                    ₦{(item.quantity * item.rate).toLocaleString("en-NG")}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddItem}
              className="mt-3 text-sm flex items-center gap-1 text-purple-600"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* <div className="grid grid-cols-3 gap-4 mb-6"> */}
                
            {/* Discount & Tax Input Fields */}
          <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
            <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Discount (%)</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-right"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Tax (%)</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-right"
                />
            </div>
        </div>

          {/* </div> */}

          {/* Notes, Discount, and Tax Fields */}
          <div className="grid grid-cols- gap-6 mt-6">
            {/* Notes */}
            <div className="col-span-3 lg:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg p-3 mt-1"
              />
            </div>
            
          </div>

          {/* Totals Summary */}
          <div className="mt-6 border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-12">
              <span className="font-semibold">Subtotal:</span>
              <span>₦{subtotal.toLocaleString("en-NG")}</span>
            </div>
            <div className="flex justify-end gap-12 text-sm text-gray-600">
              <span className="font-medium">Discount ({numericDiscount}%):</span>
              <span>- ₦{discountAmount.toLocaleString("en-NG")}</span>
            </div>
            <div className="flex justify-end gap-12 text-sm text-gray-600">
              <span className="font-medium">Tax ({numericTax}%):</span>
              <span>+ ₦{taxAmount.toLocaleString("en-NG")}</span>
            </div>
            <div className="flex justify-end gap-12 text-xl font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span>₦{total.toLocaleString("en-NG")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            className={`px-4 py-2 text-white rounded-md ${
              !isFormValid() || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Submitting..." : "Send Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
}