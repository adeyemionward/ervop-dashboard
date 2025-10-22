'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { SVGProps, useState, useEffect, useMemo } from "react";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, mainBg, iconBg, mainText, iconText }: { title: string; value: string; icon: (props: SVGProps<SVGSVGElement>) => JSX.Element; mainBg: string; iconBg: string; mainText: string; iconText: string; }) => (
    <div className={`${mainBg} p-8 rounded-lg shadow-sm flex items-center space-x-4`}>
        <div className={`${iconBg} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div>
            <p className={`text-sm font-medium ${mainText} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${mainText}`}>{value}</p>
        </div>
    </div>
);

export default function ProjectsPage() {
    const handleGoBack = useGoBack();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [overview, setOverview] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                 const token = localStorage.getItem("token");
                const res = await fetch(
                "http://127.0.0.1:8000/api/v1/professionals/invoices/list/",
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
                );

           
                const data = await res.json();
                if (data.status) {
                    setInvoices(data.data);
                    setOverview(data.overview);
                }
            } catch (error) {
                console.error("Failed to fetch invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    
    // ✅ Memoized filter/search logic
    const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
        const matchesSearch =
            inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
            `${inv.customer?.firstname} ${inv.customer?.lastname}`
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus = statusFilter === "All" ? true : inv.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
}, [invoices, search, statusFilter]);



    const clearFilters = () => {
        setSearch("");
        setStatusFilter("All");
    };

    return (
        <DashboardLayout>
            {/* PAGE TITLE */}
            <HeaderTitleCard onGoBack={handleGoBack} title="Invoices" description="Track and manage all your invoices in one place.">
                <div className="flex flex-col md:flex-row gap-2">
                    <Link href="invoices/new" className="btn-primary flex items-center justify-center">
                        <Icons.plus /> 
                        <span>Generate Invoice</span>
                    </Link>
                </div> 
            </HeaderTitleCard>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Billed" value={overview ? `₦${overview.total_billed.toLocaleString()}` : "₦0"}  icon={Icons.arrowUp} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                <StatCard title="Paid" value={overview ? `₦${overview.total_paid.toLocaleString()}` : "₦0"} icon={Icons.cash} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                <StatCard title="Unpaid" value={overview ? `₦${overview.total_unpaid.toLocaleString()}` : "₦0"} icon={Icons.cashPending} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" />
                <StatCard title="Overdue" value={overview ? `₦${overview.total_overdue.toLocaleString()}` : "₦0"} icon={Icons.arrowDown} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
                <StatCard title="Partially Paid"  value={overview ? `₦${overview.total_partially_paid.toLocaleString()}` : "₦0"} icon={Icons.refresh} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
            </div>

            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-64">
                <input
                    type="text"
                    placeholder="Search invoice or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.search className="h-5 w-5 text-gray-400" />
                </div>
                </div>

                {/* Status Filter */}
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40"
                >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
                <option value="Partially Paid">Partially Paid</option>
                </select>

                <div className="hidden md:block md:flex-grow"></div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
                <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium rounded-lg"
                >
                    Clear Filters
                </button>
                <button
                    
                    className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full"
                >
                    <Icons.refresh className="h-6 w-6 " />
                </button>
                </div>
            </div>
          
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                               
                                <th scope="col" className="px-6 py-4">Invoice #</th>
                                <th scope="col" className="px-6 py-4">Customer</th>
                                {/* <th scope="col" className="px-6 py-4">Source</th> */}
                                <th scope="col" className="px-6 py-4">Issue Date</th>
                                <th scope="col" className="px-6 py-4">Due Date</th>
                                <th scope="col" className="px-6 py-4">Total</th>
                                <th scope="col" className="px-6 py-4">Amount Paid</th>
                                <th scope="col" className="px-6 py-4">Balance</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                <td colSpan={9} className="text-center py-6">Loading...</td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                <td colSpan={9} className="text-center py-6">No invoices found</td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{invoice.invoice_no}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                    {invoice.customer.firstname} {invoice.customer.lastname}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{invoice.issue_date}</td>
                                    <td className="px-6 py-4 text-gray-600">{invoice.due_date}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                    ₦{invoice.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                    ₦{invoice.paid_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                    ₦{Number(invoice.remaining_balance).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        invoice.status === "Paid"
                                            ? "bg-green-100 text-green-800"
                                            : invoice.status === "Unpaid"
                                            ? "bg-red-100 text-red-800"
                                            : invoice.status === "Partially Paid"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : invoice.status === "Overdue"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-black text-white"
                                        }`}
                                    >
                                        {invoice.status}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-800 font-semibold">
                                        View
                                    </button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
