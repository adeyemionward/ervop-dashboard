// QuotationDetailsPage.jsx
// Adapted from Invoice page — replace labels, endpoints, and fields for Quotation

"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
// import { formatDate } from "@/app/utils/formatDate";
import LoadingScreen from "@/components/LoadingScreen";

// --- Types ---
type Item = { id: number; description: number; quantity: number; rate: number };

type OrderType = {
  id: string;
  quoteId: string;
  createdAt: string;
  expiryDate: string;
  customer: { name: string; email: string; phone: string };
  professional: { 
    name: string; 
    address: string; 
    business_name: string; 
    business_logo: string;
    phone: string,
    email: string,
    };
  items: Item[];
  summary: {
    subtotal: string;
    tax: string;
    discount: string;
    total: string;
  };
  notes: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

// Fetch Quotation
async function fetchQuotation(id: string): Promise<OrderType> {
  const res = await fetch(`${BASE_URL}/professionals/finances/quotations/show/${id}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
  });

  const data = await res.json();
  if (!res.ok || !data.status) throw new Error("Failed to fetch quotation");

  const q = data.data;
  return {
    id: q.id.toString(),
    quoteId: q.quotation_no,
    createdAt: q.issue_date,
    expiryDate: q.valid_until,
    customer: {
      name: `${q.customer.firstname} ${q.customer.lastname}`,
      email: q.customer.email,
      phone: q.customer.phone,
    },
    professional: {
      name: q?.professional?.name ?? "",
      business_name: q?.professional?.business_name ?? "",
      address: q?.professional?.address ?? "",
      business_logo: q?.professional?.business_logo ?? "",
      phone: q.professional.phone,
      email: q.professional.email,
    },
    items: q.items.map((item: Item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
    })),
    summary: {
      subtotal: `₦${Number(q.summary.subtotal).toLocaleString()}`,
      tax: `₦${Number(q.summary.tax).toLocaleString()}`,
      discount: `₦${Number(q.summary.discount).toLocaleString()}`,
      total: `₦${Number(q.summary.total).toLocaleString()}`,
    },
    notes: q.notes,
  };
}


export default function QuotationDetailsPage() {
  const params = useParams();
  const quoteId = params.id as string;
  const handleGoBack = useGoBack();

  const { data: order, isLoading, isError } = useQuery<OrderType>({
    queryKey: ["quotation", quoteId],
    queryFn: () => fetchQuotation(quoteId),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingScreen text="Fetching quotation..." />
      ) : isError || !order ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">No quotation found.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <HeaderTitleCard onGoBack={handleGoBack} title="" description="" />
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Quotation {order.quoteId}</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">Created on: {order.createdAt}</p>
              <p className="text-sm text-gray-500">Valid until: {order.expiryDate}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center space-x-2">
                <Icons.export className="h-5 w-5" /> <span>Download PDF</span>
              </button>
              <button className="bg-[#7E51FF] text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.5l7.997 3.384A1 1 0 0019 4.5v.445l-7.997 3.384-7.997-3.384z" /><path d="M19 8.118l-8 3.384L3 8.118V15.5a1 1 0 001 1h12a1 1 0 001-1V8.118z" /></svg>
                <span>Send Quotation</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white p-10 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <img src={order.professional.business_logo ?? ""} className="w-24 h-24 object-contain" />
              <div className="text-right">
                <h1 className="text-4xl font-bold text-gray-800 uppercase">Quotation</h1>
                <p>{order.quoteId}</p>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900">{order.professional.business_name}</h2>
              <p className="text-sm text-gray-500">{order.professional.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="font-semibold text-gray-500 text-sm mb-1">QUOTE FOR</p>
                <p className="font-bold text-gray-800">{order.customer.name}</p>
                <p className="text-gray-600">{order.customer.email}</p>
                <p className="text-gray-600">{order.customer.phone}</p>
              </div>

              <div className="text-right">
                <p className="text-gray-500">Issue Date: {order.createdAt}</p>
                <p className="text-gray-500">Expiry Date: {order.expiryDate}</p>
              </div>
            </div>

            {/* Items */}
            <table className="w-full mt-10">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600">Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">₦{item.rate.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">₦{(item.rate * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-8 w-1/3 ml-auto space-y-2">
              <div className="flex justify-between"><p className="text-gray-600">Subtotal</p><p>{order.summary.subtotal}</p></div>
              <div className="flex justify-between"><p className="text-gray-600">Tax</p><p>{order.summary.tax}</p></div>
              <div className="flex justify-between text-primary-600"><p>Discount</p><p>{order.summary.discount}</p></div>
              <hr />
              <div className="flex justify-between text-lg font-bold"><p>Total</p><p>{order.summary.total}</p></div>
            </div>

            <p className="mt-10 text-sm text-gray-500 italic">{order.notes || "No notes added."}</p>

            <div className="mt-6 text-center text-sm text-gray-500 border-t pt-4">
              Thank you for considering our services!
              <p>{order.professional.business_name} | {order.professional.phone} | {order.professional.email}</p>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}