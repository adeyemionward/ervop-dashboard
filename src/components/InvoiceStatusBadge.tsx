import React from "react";

type StatusType = "Paid" | "Unpaid" | "Partially Paid" | "Overdue" | string;

interface InvoiceStatusBadgeProps {
  status: StatusType;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    Paid: "bg-green-100 text-green-800",
    Unpaid: "bg-red-100 text-red-800",
    "Partially Paid": "bg-yellow-100 text-yellow-800",
    Overdue: "bg-blue-100 text-blue-800",
  };

  const classes =
    statusStyles[status] || "bg-gray-800 text-white";

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>
      {status}
    </span>
  );
};

export default InvoiceStatusBadge;
