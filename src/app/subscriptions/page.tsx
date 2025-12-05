'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import Link from "next/link";

import { CreditCard, Download, CheckCircle, ArrowRight, History } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Plan = {
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  features: string[];
};

type PaymentMethod = {
  cardType: string;
  last4: string;
  expiry: string;
};

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Failed';
};

type SubscriptionEvent = {
    id: string;
    date: string;
    description: string;
};

// --- MOCK DATA ---
const currentPlan: Plan = {
  name: 'Growth Plan',
  price: 7500,
  billingCycle: 'monthly',
  nextBillingDate: 'August 1, 2025',
  features: [
    'Custom Domain',
    'No Ervop Branding',
    'Up to 100 Products',
    'Up to 50 Bookings/month',
    'Basic Invoicing',
    'Premium Templates'
  ]
};

const paymentMethod: PaymentMethod = {
  cardType: 'Visa',
  last4: '4242',
  expiry: '12/26'
};

const billingHistory: Invoice[] = [
    { id: 'INV-2025-07', date: 'July 1, 2025', amount: 7500, status: 'Paid' },
    { id: 'INV-2025-06', date: 'June 1, 2025', amount: 7500, status: 'Paid' },
    { id: 'INV-2025-05', date: 'May 1, 2025', amount: 7500, status: 'Paid' },
    { id: 'INV-2025-04', date: 'April 1, 2025', amount: 7500, status: 'Paid' },
];

const subscriptionHistory: SubscriptionEvent[] = [
    { id: 'evt_1', date: 'May 1, 2025', description: 'Upgraded to Growth Plan' },
    { id: 'evt_2', date: 'April 1, 2025', description: 'Started Starter Plan' },
];


// --- MAIN PAGE COMPONENT ---
export default function SubscriptionPage() {
     const handleGoBack = useGoBack();
  return (
     <DashboardLayout> 
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <HeaderTitleCard onGoBack={handleGoBack} title="Subscription & Billing" description="Manage your plan, payment method, and view your billing history."></HeaderTitleCard>
        
            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Current Plan Details */}
                    <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                            <div>
                                <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">YOUR CURRENT PLAN</span>
                                <h2 className="mt-3 text-3xl font-bold text-gray-900">{currentPlan.name}</h2>
                                <p className="mt-2 text-4xl font-bold text-gray-900">₦{currentPlan.price.toLocaleString()}<span className="text-xl font-medium text-gray-500">/month</span></p>
                                <p className="mt-1 text-sm text-gray-500">Next bill is on {currentPlan.nextBillingDate}.</p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <Link href="subscriptions/pricing" className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-3 px-5 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                    <span>Change Plan</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Billing History Table */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
                            <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                                <Download className="w-4 h-4 mr-2"/>
                                <span>Download All Invoices</span>
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-left">Invoice ID</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-left">Date</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-left">Amount</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-left">Status</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {billingHistory.map(invoice => (
                                        <tr key={invoice.id}>
                                            <td className="px-4 py-3 font-medium text-gray-800">{invoice.id}</td>
                                            <td className="px-4 py-3 text-gray-600">{invoice.date}</td>
                                            <td className="px-4 py-3 text-gray-800 font-medium">₦{invoice.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <a href="#" className="text-purple-600 hover:text-purple-800">
                                                    <Download className="w-5 h-5 inline-block" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Plan Features Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features in Your Plan</h3>
                        <ul className="space-y-3">
                            {currentPlan.features.map(feature => (
                            <li key={feature} className="flex items-center text-gray-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                            ))}
                        </ul>
                    </div>

                    {/* Payment Method Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CreditCard className="w-8 h-8 text-gray-400 mr-4" />
                                <div>
                                    <p className="font-semibold">{paymentMethod.cardType} ending in {paymentMethod.last4}</p>
                                    <p className="text-sm text-gray-500">Expires {paymentMethod.expiry}</p>
                                </div>
                            </div>
                            <button className="text-sm font-semibold text-purple-600 hover:underline">Update</button>
                        </div>
                    </div>

                    {/* Subscription History Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription History</h3>
                        <div className="space-y-4">
                            {subscriptionHistory.map(event => (
                                <div key={event.id} className="flex items-start">
                                    <History className="w-5 h-5 text-gray-400 mr-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-800">{event.description}</p>
                                        <p className="text-sm text-gray-500">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center">
                        <button className="w-full bg-white text-red-600 border border-gray-300 hover:bg-red-50 hover:border-red-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </DashboardLayout>
  );
}
