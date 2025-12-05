'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import {  useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useParams } from "next/navigation";

// --- Type definitions ---
type OrderItemType = { id: number; name: string; sku: string; quantity: number; price: string; image: string; };
type PaymentHistoryItem = { id: number; date: string; amount: string; method: string; };
type OrderType = {
    id: string;
    orderId: string;
    createdAt: string;
    date: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    customer: { name: string; email: string; phone: string; };
    shippingAddress: { street: string; city: string; state: string; zip: string; };
    items: OrderItemType[];
    summary: { subtotal: string; shipping: string; tax: string; discount: string; total: string; totalPaid: string; remainingBalance: string; };
    paymentHistory: PaymentHistoryItem[];
    notes: string;
};


// --- Dummy Data (Expanded to match the new design) ---
const getOrderDetails = (id: string): OrderType => {
    // This simulates fetching data for a specific order.
    return {
        id: id,
        orderId: `#ERV-${id.padStart(3, '0')}`,
        createdAt: '2024-07-14',
        date: '2024-07-15',
        orderStatus: 'Shipped', // Current status for the timeline
        paymentStatus: 'Partially Paid',
        paymentMethod: 'Card (**** 4242)',
        customer: {
            name: 'Chioma Nwosu',
            email: 'chioma.n@example.com',
            phone: '+234 801 234 5678',
        },
        shippingAddress: {
            street: '123 Allen Avenue',
            city: 'Ikeja',
            state: 'Lagos',
            zip: '100282',
        },
        items: [
            { id: 1, name: 'Luxury Beaded Gown', sku: 'LBG-001-RED-M', quantity: 1, price: '₦75,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P1' },
            { id: 2, name: 'Aso-Oke Head Tie', sku: 'AHT-002-BLU-OS', quantity: 2, price: '₦15,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P3' },
            { id: 3, name: 'Handcrafted Leather Bag', sku: 'HLB-003-BRN-L', quantity: 1, price: '₦25,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P2' },
        ],
        summary: {
            subtotal: '₦115,000',
            shipping: '₦5,000',
            tax: '₦0.00',
            discount: '-₦10,000',
            total: '₦110,000',
            totalPaid: '₦55,000',
            remainingBalance: '₦55,000'
        },
        paymentHistory: [
            { id: 1, date: '2024-07-14', amount: '₦55,000', method: 'Card (**** 4242)' }
        ],
        notes: "Customer requested gift wrapping for the beaded gown. Please ensure it is handled with care."
    };
};


// --- Reusable Components for this new design ---

// A generic card component for different sections
const InfoCard = ({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) => (
    <div className={clsx("bg-white p-6 rounded-xl shadow-sm", className)}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

// The visual timeline tracker for order status
const OrderTimeline = ({ currentStatus }: { currentStatus: string }) => {
    const statuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
            {statuses.map((status, index) => (
                <div key={status} className="flex items-center w-full">
                    <div className={clsx("flex flex-col items-center", { 'text-primary-600': index <= currentIndex, 'text-gray-400': index > currentIndex })}>
                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-semibold", { 'bg-primary-600 text-white': index <= currentIndex, 'bg-gray-200': index > currentIndex })}>
                            {index < currentIndex ? <Icons.close className="w-5 h-5" /> : index + 1}
                        </div>
                        <p className="text-xs font-medium mt-2 text-center">{status}</p>
                    </div>
                    {index < statuses.length - 1 && (
                        <div className={clsx("flex-1 h-0.5 mx-4", { 'bg-primary-600': index < currentIndex, 'bg-gray-200': index >= currentIndex })}></div>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- Main Page Component ---
export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const initialOrder = getOrderDetails(orderId);

    const [order, setOrder] = useState(initialOrder);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOrder(prevOrder => ({ ...prevOrder, orderStatus: e.target.value }));
    };

    const handleRecordPayment = () => {
        const amount = parseFloat(paymentAmount.replace(/[^0-9.-]+/g,""));
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        const newPayment: PaymentHistoryItem = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: `₦${amount.toLocaleString()}`,
            method: 'Manual Entry'
        };
        
        // In a real app, you'd make an API call here to save the payment
        setOrder(prev => {
            const currentPaid = parseFloat(prev.summary.totalPaid.replace(/[^0-9.-]+/g,""));
            const newTotalPaid = currentPaid + amount;
            const total = parseFloat(prev.summary.total.replace(/[^0-9.-]+/g,""));
            const newRemaining = total - newTotalPaid;

            return {
                ...prev,
                paymentHistory: [...prev.paymentHistory, newPayment],
                summary: {
                    ...prev.summary,
                    totalPaid: `₦${newTotalPaid.toLocaleString()}`,
                    remainingBalance: `₦${newRemaining.toLocaleString()}`
                },
                paymentStatus: newRemaining <= 0 ? 'Paid' : 'Partially Paid'
            }
        });

        setPaymentAmount('');
        setIsPaymentModalOpen(false);
    };

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/orders" className="w-35 p-2 flex items-center text-sm hover:bg-gray-200 text-gray-500 font-medium hover:text-primary-600 mb-2">
                        <Icons.chevronDown className="w-4 h-4 mr-1 rotate-90" />
                        Back to Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Order {order.orderId}</h1>
                        <span className={clsx("px-3 py-1 text-sm font-medium rounded-full", {
                            'bg-green-100 text-green-800': order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' || order.orderStatus === 'Completed',
                            'bg-yellow-100 text-yellow-800': order.orderStatus === 'Processing' || order.orderStatus === 'Pending',
                            'bg-red-100 text-red-800': order.orderStatus === 'Cancelled',
                        })}>
                            {order.orderStatus}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Created on: {order.createdAt}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="bg-[#7E51FF] border border-gray-300 text-white px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Icons.calendar className="h-5 w-5" />
                        <span>Download Invoice</span>
                    </button>
                </div>
            </div>

             {/* Order Timeline */}
             <div className="mb-8">
                <OrderTimeline currentStatus={order.orderStatus} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title="Order Items">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="pb-2">Product</th>
                                    <th className="pb-2">SKU</th>
                                    <th className="pb-2 text-center">Quantity</th>
                                    <th className="pb-2 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-4 flex items-center space-x-4">
                                            <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md" />
                                            <span className="font-medium text-gray-800">{item.name}</span>
                                        </td>
                                        <td className="py-4 text-gray-500">{item.sku}</td>
                                        <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                                        <td className="py-4 text-right font-medium text-gray-800">{item.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </InfoCard>

                    <InfoCard title="Customer & Shipping Info">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <p className="font-semibold text-gray-800 mb-2">{order.customer.name}</p>
                                <p className="text-sm text-gray-500">{order.customer.email}</p>
                                <p className="text-sm text-gray-500">{order.customer.phone}</p>
                            </div>
                            <address className="not-italic text-gray-600 leading-relaxed">
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                            </address>
                        </div>
                    </InfoCard>
                </div>

                {/* Right Column (Order Summary & Notes) */}
                <div className="lg:col-span-1 space-y-8">
                    <InfoCard title="Update Status">
                        <div>
                            <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">Update Order Status</label>
                            <select id="order-status" value={order.orderStatus} onChange={handleStatusChange} className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option>Processing</option>
                                <option>Shipped</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                    </InfoCard>

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
                        <div className="space-y-3">
                            {order.paymentHistory.map(p => (
                                <div key={p.id} className="flex justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-800">{p.method}</p>
                                        <p className="text-gray-500">{p.date}</p>
                                    </div>
                                    <p className="font-medium text-gray-800">{p.amount}</p>
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
                            <div className="flex justify-between"><p className="text-gray-600">Shipping</p><p className="font-medium text-gray-900">{order.summary.shipping}</p></div>
                            <div className="flex justify-between"><p className="text-gray-600">Tax</p><p className="font-medium text-gray-900">{order.summary.tax}</p></div>
                            <div className="flex justify-between text-primary-600"><p>Discount</p><p className="font-medium">{order.summary.discount}</p></div>
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
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Payment</h3>
                        <div>
                            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                            <input type="number" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. 55000" />
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer">Cancel</button>
                            <button onClick={handleRecordPayment} className="px-4 py-2 bg-[#7E51FF] text-white rounded-md hover:bg-primary-700 cursor-pointer">Record Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
