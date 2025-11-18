// components/RecordPaymentModal.tsx
import React, { useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  onPaymentRecorded?: (payment: {
    id: number;
    method: string;
    date: string;
    amount: string;
  }) => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  onPaymentRecorded,
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonSuccess, setButtonSuccess] = useState<boolean>(false);

  const handleRecordPayment = async () => {
    if (!paymentAmount || !paymentDate || !paymentMethod) return;

    setIsSubmitting(true);

    try {
      const payload = {
        amount: Number(paymentAmount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        title: paymentNotes,
      };

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/professionals/invoices/recordPayment/${invoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record payment");
      }

      // Example output: "October 27, 2023

      // 1. Await the response data from your API.
      const result = await response.json();

      // 2. Extract the actual payment object from the response.
      // Assuming your API returns the new payment object under a 'data' key.
      const newPaymentFromApi = result.data;


      const formattedPayment = {
        id: newPaymentFromApi.id,
        method: newPaymentFromApi.payment_method, // Use the key from the API response
        date: new Date(newPaymentFromApi.payment_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        amount: `₦${Number(newPaymentFromApi.amount).toLocaleString()}`, // Format the number
      };
      
      // 3. Call the parent function with the real payment object,
      // which includes the unique ID from the database.
      onPaymentRecorded?.(formattedPayment);

      setButtonSuccess(true);

      setTimeout(() => {
        setIsSubmitting(false);
        setButtonSuccess(false);
        onClose(); // close modal
        setPaymentAmount("");
        setPaymentDate("");
        setPaymentMethod("");
        setPaymentNotes("");
      }, 1000);

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // ... (rest of your JSX remains the same)
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Payment</h3>
        
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. 55000"
          />
        </div>

        {/* Payment Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="" disabled>Select Method</option>
            <option value="POS">POS</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Description)</label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter notes about this payment..."
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleRecordPayment}
            disabled={isSubmitting || !paymentAmount || !paymentDate || !paymentMethod}
            className={clsx(
              "px-4 py-2 rounded-md flex items-center justify-center gap-2",
              isSubmitting || !paymentAmount || !paymentDate || !paymentMethod
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#7E51FF] text-white hover:bg-primary-700"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recording...
              </>
            ) : buttonSuccess ? (
              "Recorded ✅"
            ) : (
              "Record Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;