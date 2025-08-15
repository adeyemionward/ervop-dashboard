'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import { SVGProps, useState } from "react";
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
        orderStatus: 'Paid', // Current status for the timeline
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



// --- Main Page Component ---
export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const initialOrder = getOrderDetails(orderId);

    const [order, setOrder] = useState(initialOrder);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

   

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
                        <h1 className="text-3xl font-bold text-gray-900">Invoice #INV-001</h1>
                        <span className={clsx("px-3 py-1 text-sm font-medium rounded-full", {
                            'bg-green-100 text-green-800': order.orderStatus === 'Paid',
                            'bg-yellow-100 text-yellow-800': order.orderStatus === 'Due',
                            'bg-red-100 text-red-800': order.orderStatus === 'Overdue',
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
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 2.5l7.997 3.384A1 1 0 0019 4.5v.445l-7.997 3.384-7.997-3.384z" /><path d="M19 8.118l-8 3.384L3 8.118V15.5a1 1 0 001 1h12a1 1 0 001-1V8.118z" /></svg>
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
                            <h2 className="text-2xl font-bold text-gray-900">Ervop Fashion House</h2>
                            <p className="text-sm text-gray-500">123 Allen Avenue, Ikeja, Lagos</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-bold text-gray-800 uppercase">Invoice</h1>
                            <p className="text-sm text-gray-500">#INV-001</p>
                        </div>
                    </div>

                    {/* <!-- Billed To and Dates --> */}
                    <div className="grid grid-cols-2 gap-8 mt-12">
                        <div>
                            <p className="font-semibold text-gray-500 text-sm mb-1">BILLED TO</p>
                            <p className="font-bold text-gray-800">Chioma Nwosu</p>
                            <p className="text-gray-600">chioma.n@example.com</p>
                        </div>
                        <div className="text-right">
                            <div className="flex justify-end">
                                <p className="font-semibold text-gray-500 text-sm w-32">Issue Date:</p>
                                <p className="text-gray-800 w-32">July 15, 2024</p>
                            </div>
                            <div className="flex justify-end mt-1">
                                <p className="font-semibold text-gray-500 text-sm w-32">Due Date:</p>
                                <p className="text-gray-800 w-32">July 30, 2024</p>
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
                                <tr>
                                    <td className="px-6 py-4">Custom Wedding Dress - Deposit</td>
                                    <td className="px-6 py-4 text-center">1</td>
                                    <td className="px-6 py-4 text-right">₦225,000</td>
                                    <td className="px-6 py-4 text-right">₦225,000</td>
                                </tr>
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
