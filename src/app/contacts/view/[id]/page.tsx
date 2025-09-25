'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";

import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Mail, Phone, MapPin, Plus, ShoppingCart, 
    CheckCircle2, FileCheck2, CalendarCheck, Users, FolderKanban, FileText, LayoutDashboard 
} from 'lucide-react';

import clsx from "clsx";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";



// --- TYPE DEFINITIONS (for TypeScript) ---
// In a real app, these types would be in a separate file, e.g., types.ts
type Contact = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    avatarUrl: string;
    tags: string[];
    lifetimeValue: number;
    outstandingBalance: number;
};

type ActivityEvent = {
    type: 'order' | 'payment' | 'signature' | 'booking';
    title: string;
    description: string;
    date: string;
};

// --- MOCK DATA (Simulating data from your Laravel API) ---
const mockContact: Contact = {
    id: '1',
    name: 'Chioma Nwosu',
    email: 'info@chiomasdesigns.com',
    phone: '08098765432',
    address: 'Lekki Phase 1, Lagos',
    avatarUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=CN',
    tags: ['Service Client', 'Product Customer', 'High Value'],
    lifetimeValue: 875000,
    outstandingBalance: 50000,
};

const mockActivity: ActivityEvent[] = [
    { type: 'order', title: 'New Product Order #1025', description: 'An order for 2 items totaling ₦25,000.00 was placed.', date: 'July 22, 2025' },
    { type: 'payment', title: 'Invoice #INV-056 Paid', description: 'You received a payment of ₦150,000.00 via Bank Transfer.', date: 'July 21, 2025' },
    { type: 'signature', title: 'You requested a signature', description: '"Project Proposal Q3.pdf" was sent to Chioma for e-signature.', date: 'July 18, 2025' },
    { type: 'booking', title: 'New Booking Confirmed', description: '"Discovery Call" scheduled for Monday, July 14, 2025.', date: 'July 12, 2025' },
];

const ContactDetailsCard = ({ contact }: { contact: Contact }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Contact Details</h3>
        <div className="space-y-3 text-sm">
            <div className="flex"><Mail className="w-4 h-4 mr-3 mt-1 text-gray-400" /><span className="text-gray-600">{contact.email}</span></div>
            <div className="flex"><Phone className="w-4 h-4 mr-3 mt-1 text-gray-400" /><span className="text-gray-600">{contact.phone}</span></div>
            <div className="flex"><MapPin className="w-4 h-4 mr-3 mt-1 text-gray-400" /><span className="text-gray-600">{contact.address}</span></div>
        </div>
    </div>
);

const FinancialsCard = ({ contact }: { contact: Contact }) => (
     <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Financials</h3>
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-500">Lifetime Value</p>
                <p className="text-2xl font-bold text-green-600">₦{contact.lifetimeValue.toLocaleString()}</p>
            </div>
             <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">₦{contact.outstandingBalance.toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const ActivityIcon = ({ type }: { type: ActivityEvent['type'] }) => {
    const iconMap = {
        order: <ShoppingCart className="w-5 h-5 text-yellow-600" />,
        payment: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        signature: <FileCheck2 className="w-5 h-5 text-purple-600" />,
        booking: <CalendarCheck className="w-5 h-5 text-purple-600" />,
    };
    const bgMap = {
        order: 'bg-yellow-100',
        payment: 'bg-green-100',
        signature: 'bg-purple-100',
        booking: 'bg-purple-100',
    };
    return <div className={clsx("p-3 rounded-full h-fit", bgMap[type])}>{iconMap[type]}</div>;
};


// --- div Page Component ---
export default function ViewContactPage() {
    const handleGoBack = useGoBack();
    const [activeTab, setActiveTab] = useState('activity');
    const TABS = ['activity', 'orders', 'projects', 'documents', 'invoices'];
    return (
        <DashboardLayout>
            {/* <div className="w-full  max-w-4xl mx-auto"> */}

                {/* <!-- Page Header --> */}
                <HeaderTitleCard onGoBack={handleGoBack} title="Contact Profile" description="View your contact profile and their personalized details."/>
                <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <ContactDetailsCard contact={mockContact} />
                            <FinancialsCard contact={mockContact} />
                        </div>
                        <div className="lg:col-span-2 bg-red rounded-xl border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <nav className="flex space-x-4">
                                    {TABS.map(tab => (
                                        <button 
                                            key={tab} 
                                            onClick={() => setActiveTab(tab)}
                                            className={clsx(
                                                "px-3 py-2 font-semibold text-sm border-b-2 capitalize",
                                                activeTab === tab 
                                                    ? 'text-purple-600 border-purple-600' 
                                                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'activity' && (
                                    <div className="space-y-6">
                                        {mockActivity.map((event, index) => (
                                            <div key={index} className="flex">
                                                <ActivityIcon type={event.type} />
                                                <div className="ml-4">
                                                    <p className="font-medium">{event.title}</p>
                                                    <p className="text-sm text-gray-500">{event.description}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'orders' && <div className="text-gray-500">
                                    <div id="orders-content" className="tab-content">
                                        <table className="w-full text-sm">
                                            <thead className="text-gray-500">
                                                <tr><th className="py-2 font-medium text-left">Order #</th><th className="py-2 font-medium text-left">Date</th><th className="py-2 font-medium text-left">Amount</th><th className="py-2 font-medium text-left">Status</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr><td className="py-3 font-medium">#1025</td><td>July 22, 2025</td><td className="font-medium">₦25,000.00</td><td><span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">Processing</span></td></tr>
                                                <tr><td className="py-3 font-medium">#1019</td><td>July 1, 2025</td><td className="font-medium">₦12,500.00</td><td><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Delivered</span></td></tr>
                                                <tr><td className="py-3 font-medium">#1012</td><td>June 15, 2025</td><td className="font-medium">₦35,000.00</td><td><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Delivered</span></td></tr>
                                                <tr><td className="py-3 font-medium">#1007</td><td>May 28, 2025</td><td className="font-medium">₦8,000.00</td><td><span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Cancelled</span></td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    </div>}
                                {activeTab === 'projects' && 
                                    <div className="text-gray-500">
                                        <div id="projects-content" className="tab-content space-y-4">
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-semibold text-gray-800">New Website Design</h4>
                                                    <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">In Progress</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">Budget: ₦750,000 | Deadline: Aug 30, 2025</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                                </div>
                                            </div>
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-semibold text-gray-800">Q2 Social Media Campaign</h4>
                                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Completed</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">Budget: ₦125,000 | Completed: Jun 28, 2025</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {activeTab === 'documents' && 
                                    <div className="text-gray-500">
                                        <div id="documents-content" className="tab-content">
                                            <table className="w-full text-sm">
                                                <thead className="text-gray-500">
                                                    <tr><th className="py-2 font-medium text-left">Name</th><th className="py-2 font-medium text-left">Date</th><th className="py-2 font-medium text-left">Status</th></tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr><td className="py-3 font-medium">Service Agreement - Final.pdf</td><td>July 16, 2025</td><td><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Signed</span></td></tr>
                                                    <tr><td className="py-3 font-medium">Project Proposal Q3.pdf</td><td>July 18, 2025</td><td><span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">Awaiting Signature</span></td></tr>
                                                    <tr><td className="py-3 font-medium">Passport Scan - Chioma.jpg</td><td>July 15, 2025</td><td><span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Client Upload</span></td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                }
                                {activeTab === 'invoices' && 
                                    <div className="text-gray-500">
                                        <div id="invoices-content" className="tab-content">
                                            <table className="w-full text-sm">
                                                <thead className="text-gray-500">
                                                    <tr><th className="py-2 font-medium text-left">Invoice #</th><th className="py-2 font-medium text-left">Amount</th><th className="py-2 font-medium text-left">Due Date</th><th className="py-2 font-medium text-left">Status</th></tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr><td className="py-3 font-medium">INV-056</td><td className="font-medium">₦150,000.00</td><td>July 20, 2025</td><td><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Paid</span></td></tr>
                                                    <tr><td className="py-3 font-medium">INV-057</td><td className="font-medium">₦50,000.00</td><td>Aug 1, 2025</td><td><span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Overdue</span></td></tr>
                                                    <tr><td className="py-3 font-medium">INV-058</td><td className="font-medium">₦375,000.00</td><td>Aug 15, 2025</td><td><span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">Draft</span></td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
        {/* </div> */}
        </DashboardLayout>
    );
}
