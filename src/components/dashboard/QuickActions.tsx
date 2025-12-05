import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export const QuickActions: React.FC = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="space-y-3">
      <Link
        href="/pr/new"
        className="w-full bg-gray-50 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg flex items-center transition-colors text-gray-700"
      >
        <Plus className="w-5 h-5 mr-3 text-blue-600" /> Start New Project
      </Link>
      <Link
        href="/appointments/new"
        className="w-full bg-gray-50 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg flex items-center transition-colors text-gray-700"
      >
        <Plus className="w-5 h-5 mr-3 text-purple-600" /> Schedule Appointment
      </Link>
      <Link
        href="/invoices/new"
        className="w-full bg-gray-50 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg flex items-center transition-colors text-gray-700"
      >
        <Plus className="w-5 h-5 mr-3 text-green-600" /> Create Invoice
      </Link>
    </div>
  </div>
);
