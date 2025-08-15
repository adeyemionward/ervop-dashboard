'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import { SVGProps, useState, useMemo } from "react";
import Link from "next/link";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";

// --- Reusable Components for this page ---

// Stat Card for the overview section
const StatCard = ({ title, value, icon: Icon, mainBg, iconBg, mainText, iconText }: { title: string; value: string; icon: (props: SVGProps<SVGSVGElement>) => JSX.Element; mainBg: string; iconBg: string; mainText: string; iconText: string; }) => (
    <div className={`${mainBg} p-6 rounded-lg shadow-sm flex items-center space-x-4`}>
        <div className={`${iconBg} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div>
            <p className={`text-sm font-medium ${mainText} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${mainText}`}>{value}</p>
        </div>
    </div>
);

// Badge for Order Status
const OrderStatusBadge = ({ status }: { status: 'Pending' | 'Completed' | 'Cancelled' }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    const statusClasses = {
        'Pending': "bg-yellow-100 text-yellow-800",
        'Completed': "bg-green-100 text-green-800",
        'Cancelled': "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

// Badge for Payment Status
const PaymentStatusBadge = ({ status }: { status: 'Paid' | 'Unpaid' | 'Refunded' }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    const statusClasses = {
        'Paid': "bg-blue-100 text-blue-800",
        'Unpaid': "bg-gray-200 text-gray-800",
        'Refunded': "bg-purple-100 text-purple-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


// --- Dummy Data ---
const allOrders = [
    { id: 1, orderId: '#ERV-001', customerName: 'Chioma Nwosu', total: '₦75,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-01' },
    { id: 2, orderId: '#ERV-002', customerName: 'Bolanle Adebayo', total: '₦25,000', orderStatus: 'Pending', paymentStatus: 'Unpaid', date: '2024-07-03' },
    { id: 3, orderId: '#ERV-003', customerName: 'Musa Ibrahim', total: '₦15,000', orderStatus: 'Cancelled', paymentStatus: 'Refunded', date: '2024-07-04' },
    { id: 4, orderId: '#ERV-004', customerName: 'Aisha Bello', total: '₦12,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-05' },
    { id: 5, orderId: '#ERV-005', customerName: 'Emeka Okafor', total: '₦90,000', orderStatus: 'Pending', paymentStatus: 'Paid', date: '2024-07-06' },
    { id: 6, orderId: '#ERV-006', customerName: 'Fatima Aliyu', total: '₦22,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-07' },
    { id: 7, orderId: '#ERV-007', customerName: 'Ngozi Eze', total: '₦5,000', orderStatus: 'Pending', paymentStatus: 'Unpaid', date: '2024-07-08' },
    { id: 8, orderId: '#ERV-008', customerName: 'Tunde Bakare', total: '₦18,500', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-08' },
    { id: 9, orderId: '#ERV-009', customerName: 'Yemi Ojo', total: '₦32,000', orderStatus: 'Pending', paymentStatus: 'Paid', date: '2024-07-09' },
    { id: 10, orderId: '#ERV-010', customerName: 'Sade Okoro', total: '₦11,500', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-10' },
    { id: 11, orderId: '#ERV-011', customerName: 'Ibrahim Musa', total: '₦45,000', orderStatus: 'Cancelled', paymentStatus: 'Refunded', date: '2024-07-11' },
    { id: 12, orderId: '#ERV-012', customerName: 'Funke Akindele', total: '₦8,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-12' },
    { id: 13, orderId: '#ERV-013', customerName: 'David Adeleke', total: '₦150,000', orderStatus: 'Pending', paymentStatus: 'Unpaid', date: '2024-07-13' },
    { id: 14, orderId: '#ERV-014', customerName: 'Ayo Balogun', total: '₦250,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-14' },
    { id: 15, orderId: '#ERV-015', customerName: 'Tiwa Savage', total: '₦120,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-15' },
    { id: 16, orderId: '#ERV-016', customerName: 'Simi Ogunleye', total: '₦65,000', orderStatus: 'Pending', paymentStatus: 'Paid', date: '2024-07-16' },
    { id: 17, orderId: '#ERV-017', customerName: 'Adekunle Gold', total: '₦70,000', orderStatus: 'Completed', paymentStatus: 'Paid', date: '2024-07-17' },
   
];

const ITEMS_PER_PAGE = 15;

// --- Main Page Component ---
export default function OrdersPage() {
    const [orders, setOrders] = useState(allOrders);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // --- State for UI controls (no filtering logic) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [datePreset, setDatePreset] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');


    const handleClearFilters = () => {
        setSearchTerm('');
        setOrderStatusFilter('All');
        setPaymentStatusFilter('All');
        setDatePreset('All');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(orders.map(order => order.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    // Memoized pagination
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [orders, currentPage]);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

    const handleGoBack = useGoBack();
    return (
        
        <DashboardLayout>
            {/* Header Section */}
            <HeaderTitleCard onGoBack={handleGoBack} title="Orders" description="A complete history of all product transactions">
                <div className="flex flex-col md:flex-row gap-2">

                    <Link href="orders/new" className="btn-primary flex items-center justify-center">
                        <Icons.plus /> 
                        <span>Add New Order</span>
                    </Link>
                                        
                </div> 
            </HeaderTitleCard>

            {/* Overview Section */}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Sales" value="₦2.1M" icon={Icons.transactions} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-600" iconText="text-[#9333ea]" />
                <StatCard title="Total Orders" value={orders.length.toString()} icon={Icons.orders} mainBg="bg-white" iconBg="bg-blue-100" mainText="text-gray-600" iconText="text-blue-800" />
                <StatCard title="Completed" value={orders.filter(o => o.orderStatus === 'Completed').length.toString()} icon={Icons.completedOrders} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                <StatCard title="Cancelled" value={orders.filter(o => o.orderStatus === 'Cancelled').length.toString()} icon={Icons.cancelledOrders} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
                <StatCard title="Pending" value={orders.filter(o => o.orderStatus === 'Pending').length.toString()} icon={Icons.pendingOrders} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" />
            </div>

            {/* Filters Section */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex items-center gap-4">
                <div className="relative flex-shrink-0 w-64">
                    <input
                        type="text"
                        placeholder="Search by Order ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icons.search className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <select value={datePreset} onChange={(e) => setDatePreset(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-36 flex-shrink-0">
                    <option value="All">All Time</option>
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Last Quarter">Last Quarter</option>
                    <option value="This Year">This Year</option>
                    <option value="Last Year">Last Year</option>
                    <option value="Custom">Custom</option>
                </select>
                {datePreset === 'Custom' && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <span>-</span>
                        <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                )}
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-40 flex-shrink-0">
                    <option value="All">Order Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-44 flex-shrink-0">
                    <option value="All">Payment Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Refunded">Refunded</option>
                </select>
                <div className="flex-grow"></div> {/* This spacer pushes the buttons to the right */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={handleClearFilters} className="text-sm text-gray-600 hover:text-primary-600 p-2  cursor-pointer hover:bg-gray-200 bg-gray-100  font-medium">Clear Filters</button>
                        <button onClick={() => setOrders(allOrders)} className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                            <Icons.refresh className="h-6 w-6 " />
                        </button> 
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === orders.length && orders.length > 0} className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                                </th>
                                <th scope="col" className="px-6 py-4 ">Order ID</th>
                                <th scope="col" className="px-6 py-4">Customer Name</th>
                                <th scope="col" className="px-6 py-4">Total</th>
                                <th scope="col" className="px-6 py-4">Order Status</th>
                                <th scope="col" className="px-6 py-4">Payment Status</th>
                                <th scope="col" className="px-6 py-4">Date</th>
                                <th scope="col" className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="w-4 p-4">
                                        <input type="checkbox" checked={selectedRows.includes(order.id)} onChange={() => handleSelectRow(order.id)} className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{order.orderId}</th>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.total}</td>
                                    <td className="px-6 py-4"><OrderStatusBadge status={order.orderStatus as 'Pending' | 'Completed' | 'Cancelled'} /></td>
                                    <td className="px-6 py-4"><PaymentStatusBadge status={order.paymentStatus as 'Paid' | 'Unpaid' | 'Refunded'} /></td>
                                    <td className="px-6 py-4">{order.date}</td>
                                    <td className="px-6 py-4">
                                        {/* This div adds space between the buttons */}
                                        <div className="flex items-center space-x-2">

                                            {/* View Details Button */}
                                            <Link href={`/orders/${order.id}`}>
                                                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200 flex items-center gap-1.5">
                                                    {/* Replace with your actual icon component */}
                                                    <Icons.eye className="h-3.5 w-3.5" />
                                                    <span>View Details</span>
                                                </button>
                                            </Link>

                                            {/* Cancel Order Button */}
                                            <Link href={`/orders/${order.id}/cancel`}>
                                                {/* Using red colors for a destructive action */}
                                                <button className="bg-red-100 text-red-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-200 flex items-center gap-1.5">
                                                    {/* Replace with your actual icon component */}
                                                    <Icons.trash className="h-3.5 w-3.5" />
                                                    <span>Cancel Order</span>
                                                </button>
                                            </Link>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-4 border-t">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{Math.min(1 + (currentPage - 1) * ITEMS_PER_PAGE, orders.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, orders.length)}</span> of <span className="font-semibold">{orders.length}</span> Results
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}