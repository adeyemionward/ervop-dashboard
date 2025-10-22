"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import clsx from "clsx";
import { Link, Loader2, Trash2 } from "lucide-react";
import { Icons } from "@/components/icons";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "react-hot-toast";
// --- Types ---
type Item = { id: number; description: string; quantity: number; rate: number };
type PaymentHistoryItem = { id: number; date: string; amount: string; method: string };
type OrderType = {
  id: string;
  orderId: string;
  createdAt: string;
  dueDate: string;
  discount: Number;
  tax_amount: Number;
  discount_percentage: Number;
  tax_percentage: Number;
  orderStatus: string;
  paymentStatus: string;
  customer: { name: string; email: string; phone: string };
  professional: { name: string; address: string; business_name: string };
  items: Item[];
  summary: {
    subtotal: string;
    tax: string;
    discount: string;
    tax_percentage: string;
    discount_percentage: string;
    total: string;
    totalPaid: string; 
    remainingBalance: string;
  };
  paymentHistory: PaymentHistoryItem[];
  notes: string;
};

// --- API Functions ---
async function fetchOrder(id: string): Promise<OrderType> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`http://127.0.0.1:8000/api/v1/professionals/invoices/show/${id}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.status) throw new Error("Failed to fetch order");
  const invoice = data.data;
  return {
    id: invoice.id.toString(),
    orderId: invoice.invoice_no,
    createdAt: invoice.issue_date,
    orderStatus: invoice.status,
    paymentStatus: invoice.status,
    dueDate: invoice.due_date,
    discount: invoice.discount,
    tax_amount: invoice.tax_amount,
    discount_percentage: invoice.discount_percentage,
    tax_percentage: invoice.tax_percentage,
    customer: {
      name: `${invoice.customer.firstname} ${invoice.customer.lastname}`,
      email: invoice.customer.email,
      phone: invoice.customer.phone,
    },
    professional: {
      name: invoice.professional.name,
      business_name: invoice.professional.business_name,
      address: invoice.professional.address,
    },
    items: invoice.items.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
    })),
    summary: {
      subtotal: `₦${Number(invoice.summary.subtotal).toLocaleString()}`,
      tax: `₦${Number(invoice.summary.tax).toLocaleString()}`,
      discount: `₦${Number(invoice.summary.discount).toLocaleString()}`,
      tax_percentage: `${Number(invoice.summary.tax_percentage).toLocaleString()}`,
      discount_percentage: `${Number(invoice.summary.discount_percentage).toLocaleString()}`,
      total: `₦${Number(invoice.summary.total).toLocaleString()}`,
      totalPaid: `₦${Number(invoice.summary.total_paid).toLocaleString()}`,
      remainingBalance: `₦${Number(invoice.summary.remaining_balance).toLocaleString()}`,
    },
    paymentHistory: invoice.payments.map((p: any) => ({
      id: p.id,
      date: p.payment_date.split("T")[0],
      amount: `₦${Number(p.paid_amount).toLocaleString()}`,
      method: p.payment_method,
    })),
    notes: invoice.notes,
  };
}

async function recordPayment(
  id: string,
  payment: { amount: number; date: string; method: string; notes: string }
) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`http://127.0.0.1:8000/api/v1/professionals/invoices/recordPayment/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amount: payment.amount,
      payment_date: payment.date,
      payment_method: payment.method,
      notes: payment.notes,
    }),
  });
//   const data = await res.json();
//   if (!res.ok || !data.status) throw new Error(data.message || "Payment failed");
//   return data;
  const data = await res.json();

  if (!res.ok || !data.status) {
    // ✅ Throw the full data object, not just the message
    throw data;
  }

  return data;
}

// Generic Card Component
const InfoCard = ({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) => (
  <div className={clsx("bg-white p-6 rounded-xl shadow-sm", className)}>
    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// --- Main Page Component ---
export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery<OrderType>({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    staleTime: 1000 * 60 * 5,
  });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const [paymentToDelete, setPaymentToDelete] = useState<PaymentHistoryItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);


    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [buttonSuccess, setButtonSuccess] = useState(false);

    const resetPaymentForm = () => {
        setPaymentAmount("");
        setPaymentDate("");
        setPaymentMethod("");
        setPaymentNotes("");
    };

const mutation = useMutation({
  mutationFn: (payment: { amount: number; date: string; method: string; notes: string }) =>
    recordPayment(orderId, payment),
  onMutate: () => {
    setIsSubmitting(true); // Start disabling
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    setIsPaymentModalOpen(false);
    resetPaymentForm();
    setButtonSuccess(true);
    setTimeout(() => setButtonSuccess(false), 2000);
    toast.success("Payment recorded successfully!");
  },
  onError: (error: any) => {
    // ✅ error now contains the full API response
    if (error.errors) {
      // show the first field error
      const firstFieldErrors = Object.values(error.errors)[0] as string[];
      if (firstFieldErrors?.length) {
        toast.error(firstFieldErrors[0]); // "The amount field is required."
        return;
      }
    }

    // fallback to main message
    toast.error(error.message || "Payment failed");
  },
  onSettled: () => {
    setIsSubmitting(false); // Re-enable button after mutation finishes
  },
});


  const handleRecordPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || !paymentDate || !paymentMethod) {
      alert("Please fill all fields");
      return;
    }
    mutation.mutate({
      amount: Number(paymentAmount),
      date: paymentDate,
      method: paymentMethod,
      notes: paymentNotes,
    });
  };

  //delete payment recored
 const deletePaymentMutation = useMutation({
  mutationFn: (id: number) => {
    const token = localStorage.getItem("token") || "";
    return fetch(`http://127.0.0.1:8000/api/v1/professionals/invoices/deletePayment/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete payment");
      return data;
    });
  },
  onMutate: (id: number) => {
    setDeletingId(id); // disable modal buttons only for this payment
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    setPaymentToDelete(null);
    setDeletingId(null);
    toast.success("Payment deleted successfully!");
  },
  onError: () => {
    setDeletingId(null);
  },
});


  

  return (
    <DashboardLayout>
      {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                      <p className="text-gray-500">Loading...</p>
                      </div>
                  ) : isError || !order ? (
                      <div className="flex justify-center items-center h-64">
                      <p className="text-red-500">No invoice found.</p>
                      </div>
                  ) : (
                      <>
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/orders" className="w-35 p-2 flex items-center text-sm hover:bg-gray-200 text-gray-500 font-medium hover:text-primary-600 mb-2">
                            <Icons.chevronDown className="w-4 h-4 mr-1 rotate-90" />
                            Back to Orders
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">Invoice {order.orderId}</h1>
                            <span className={clsx("px-3 py-1 text-xs font-medium rounded-full", {
                                    'bg-yellow-100 text-yellow-800': order.orderStatus === 'Partially Paid',
                                    'bg-green-100 text-green-800': order.orderStatus === 'Paid',
                                    'bg-red-100 text-red-800': order.orderStatus === 'Unpaid' || order.orderStatus === 'Refunded'
                                })}>
                                {order.orderStatus}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Created on: {order.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                            <button className="bg-white border border-purple-300 cursor-pointer text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center space-x-2">
                                <Icons.export className="h-5 w-5" />
                                <span>Download PDF</span>
                            </button> 
                            <button className="bg-[#7E51FF] text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700 flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.5l7.997 3.384A1 1 0 0019 4.5v.445l-7.997 3.384-7.997-3.384z" /><path d="M19 8.118l-8 3.384L3 8.118V15.5a1 1 0 001 1h12a1 1 0 001-1V8.118z" /></svg>
                                <span>Send Invoice</span>
                            </button>
                    </div>
                  </div>
      
                  
                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left Column */}
                      <div className="lg:col-span-2 space-y-8">
                              <div id="invoice-container" className="bg-white p-12 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
                          {/* <!-- Invoice Header --> */}
                          <div className="flex justify-between items-start">
                              <div>
                                  <h2 className="text-2xl font-bold text-gray-900">{order.professional.business_name}</h2>
                                  <p className="text-sm text-gray-500">{order.professional.address}</p>
                              </div>
                              <div className="text-right">
                                  <h1 className="text-4xl font-bold text-gray-800 uppercase">Invoice</h1>
                                  <p className="text-sm text-gray-500">{order.orderId}</p>
                              </div>
                          </div>
      
                          {/* <!-- Billed To and Dates --> */}
                          <div className="grid grid-cols-2 gap-8 mt-12">
                              {/* Customer Info */}
                              <div>
                                  <p className="font-semibold text-gray-500 text-sm mb-1">BILLED TO</p>
                                  <p className="font-bold text-gray-800">{order.customer.name}</p>
                                  <p className="text-gray-600">{order.customer.email}</p>
                                  <p className="text-gray-600">{order.customer.phone}</p>
                              </div>
      
                              {/* Invoice Dates */}
                              <div className="text-right">
                                  <div className="flex justify-end">
                                  <p className="font-semibold text-gray-500 text-sm w-32">Issue Date:</p>
                                  <p className="text-gray-800 w-32">{order.createdAt}</p>
                                  </div>
                                  <div className="flex justify-end mt-1">
                                  <p className="font-semibold text-gray-500 text-sm w-32">Due Date:</p>
                                  <p className="text-gray-800 w-32">{order.dueDate}</p>
                                  </div>
                              </div>
                          </div>
      
                          
                          {/* <!-- Line Items Table --> */}
                          <div className="mt-10">
                              <table className="w-full">
                                  <thead className="bg-gray-50">
                                      <tr>
                                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/2">Description</th>
                                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Rate</th>
                                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                      {order.items.map((item) => (
                                          <tr key={item.id}>
                                          <td className="px-6 py-4">{item.description}</td>
                                          <td className="px-6 py-4 text-center">{item.quantity}</td>
                                          <td className="px-6 py-4 text-right">
                                              ₦{item.rate.toLocaleString()}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              ₦{(item.rate * item.quantity).toLocaleString()}
                                          </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                         
      
                          {/* <!-- Footer --> */}
                          <div className="mt-16 border-t pt-6 text-center text-sm text-gray-500">
                              <p>Thank you for your business!</p>
                              <p>Ervop Fashion House | +234 801 234 5678 | hello@ervop.com</p>
                          </div>
      
                      </div>
                      </div>
      
                      {/* Right Column (Order Summary & Notes) */}
                      <div className="lg:col-span-1 space-y-8">
                          
      
                          <InfoCard 
                              title="Payment History" 
                              action={
                                  <span className={clsx("px-3 py-1 text-xs font-medium rounded-full", {
                                      'bg-yellow-100 text-yellow-800': order.paymentStatus === 'Partially Paid',
                                      'bg-green-100 text-green-800': order.paymentStatus === 'Paid',
                                      'bg-red-100 text-red-800': order.paymentStatus === 'Unpaid' || order.paymentStatus === 'Refunded'
                                  })}>
                                      {order.paymentStatus}
                                  </span>
                              }
                          >
                               <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-3">
                                  {order.paymentHistory.map((p) => (
                                      <div
                                      key={p.id}
                                      className="flex justify-between items-center text-sm"
                                      >
                                      <div>
                                          <p className="font-medium text-gray-800">{p.method}</p>
                                          <p className="text-gray-500">{p.date}</p>
                                      </div>
      
                                      <div className="flex items-center gap-2">
                                          <p className="font-medium text-gray-800">{p.amount}</p>
                                          <button
                                                onClick={() => setPaymentToDelete(p)}
                                                className="text-red-500 hover:text-red-700"
                                                >
                                                <Trash2 size={16} />
                                                </button>

                                      </div>
                                      
                                      </div>
                                  ))}
                              </div>
      
                              <button onClick={() => setIsPaymentModalOpen(true)} className="w-full mt-4 bg-[#7E51FF] cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                                  + Record Payment
                              </button>
                          </InfoCard>
      
                          <InfoCard title="Order Summary">
                              <div className="space-y-2">
                                  <div className="flex justify-between"><p className="text-gray-600">Subtotal</p><p className="font-medium text-gray-900">{order.summary.subtotal}</p></div>
                                  <div className="flex justify-between"><p className="text-gray-600">Tax</p><p className="font-medium text-gray-900">{order.summary.tax} ({order.summary.tax_percentage}%)</p></div>
                                  <div className="flex justify-between text-primary-600"><p>Discount</p><p className="font-medium">{order.summary.discount} ({order.summary.discount_percentage}%)</p></div>
                                  <div className="border-t my-2"></div>
                                  <div className="flex justify-between text-gray-600"><p>Total Paid</p><p className="font-medium text-gray-900">{order.summary.totalPaid}</p></div>
                                  <div className="flex justify-between text-lg font-bold text-gray-900"><p>Total</p><p>{order.summary.total}</p></div>
                                  <div className="flex justify-between text-red-600 font-medium"><p>Remaining Balance</p><p>{order.summary.remainingBalance}</p></div>
                              </div>
                          </InfoCard>
                          <InfoCard title="Notes">
                              <p className="text-gray-600 italic">{order.notes || "No notes for this order."}</p>
                          </InfoCard>
                      </div>
                  </div>

                  {/* Record Payment Modal */}
                  {isPaymentModalOpen && (
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
                            <option value="" disabled>
                              Select Method
                            </option>
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
                            onClick={() => setIsPaymentModalOpen(false)}
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
                  )}

          <DeleteConfirmModal
            isOpen={!!paymentToDelete}
            onCancel={() => setPaymentToDelete(null)}
            onConfirm={() => paymentToDelete && deletePaymentMutation.mutate(paymentToDelete.id)}
            title="Delete Payment"
            message={
                paymentToDelete
                ? `Are you sure you want to delete the payment of ${paymentToDelete.amount} on ${paymentToDelete.date}?`
                : ""
            }
            deleting={deletingId === paymentToDelete?.id} // ✅ only disables for the active payment
            />

        </>
      )}
    </DashboardLayout>
  );
}
