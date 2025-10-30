"use client";

import SideModal from "@/components/SideModal";
import { FileText, Printer, Receipt } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
// import { formatDate } from "@/app/utils/formatDate";

export type Transaction = {
  id: string | number;
  amount: number;
  type?: string;
  status?: string;
  paymentMethod?: string;
  contactName?: string;
  contactEmail?: string;
  email?: string;
  createdAt?: string;
  title?: string;
  subType?:string;
    category?:string;
};

type TransactionActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
};

export default function TransactionActivityModal({
  transaction,
  isOpen,
  onClose,
}: TransactionActivityModalProps) {
  if (!transaction) return null;

    const isIncome = transaction.type?.toLowerCase() === "income";
    const isExpense = transaction.type?.toLowerCase() === "expense";

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      
      widthClass="sm:w-[460px]"
      footer={
        <div className="flex justify-end  space-x-3 w-full">
          <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
            <Printer className="w-4 h-4 mr-2" />
            <span>Print</span>
          </button>
          <button className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
            <Receipt className="w-4 h-4 mr-2" />
            <span>Issue Refund</span>
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ✅ Transaction Amount */}
        <section>
          <p className="text-sm text-gray-500">Amount</p>
          
            <p
            className={clsx(
                "text-4xl font-bold",
                isIncome ? "text-green-600" : isExpense ? "text-red-600" : "text-gray-600"
            )}
            >
            {isIncome ? "+" : isExpense ? "-" : ""}
            ₦{Math.abs(transaction.amount).toLocaleString()}
            </p>


          <div className="mt-4">
            {transaction.contactName && (
              <p className="font-semibold text-gray-800">
                {transaction.contactName}
              </p>
            )}
            {transaction.email && (
              <p className="text-sm text-gray-500">
                {transaction.email}
              </p>
            )}
            {transaction.contactEmail && (
              <p className="text-sm text-gray-500">
                {transaction.contactEmail}
              </p>
            )}
          </div>
        </section>

        {/* ✅ Related To */}
        {transaction.title && (
          <section className="border-t border-gray-200 pt-6 space-y-4">
            <h4 className="font-semibold text-gray-800 mb-2">Title</h4>
            <p className="text-sm">
             
                {transaction.title}
            </p>
          </section>
        )}

        {/* ✅ Transaction Info */}
        <section className="border-t border-gray-200 pt-6 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Transaction Info</h4>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Transaction ID:</span>{" "}
              <span className="font-medium text-gray-800">{transaction.id}</span>
            </p>
            <p>
              <span className="text-gray-500">Payment Method:</span>{" "}
              <span className="font-medium text-gray-800">
                {transaction.paymentMethod || "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Category:</span>{" "}
              <span className="font-semibold text-gray-800">
                {transaction.category || "—"}
              </span>
            </p>

            <p>
                <span className="text-gray-500">Type:</span>{" "}
                <span
                    className={`font-semibold capitalize ${
                        transaction.subType ? "text-red-600" : "text-green-700"
                    }`}
                    >
                    {transaction.type}
                    {transaction.subType ? ` - ${transaction.subType}` : ""}
                </span>


            </p>


            <p>
              <span className="text-gray-500">Created On:</span>{" "}
              <span className="font-semibold text-gray-800">
                {transaction.createdAt || "—"}
              </span>
            </p>
          </div>
        </section>

        

        {/* ✅ View Order Details */}
        <section className="mt-6 border-t border-gray-200 pt-6 space-y-4">
          <Link
            href=""
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FileText className="w-5 h-5 mr-3" />
            <span>View Full Order Details</span>
          </Link>
        </section>
      </div>
    </SideModal>
  );
}
