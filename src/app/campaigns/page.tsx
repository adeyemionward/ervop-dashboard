'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    Megaphone, Mail, MessageSquare, Plus, ArrowUpRight, BarChart2, CheckCircle, Clock,
    MousePointerClick,
    DollarSign,
    MoreHorizontal,
    Users,
    Edit
} from 'lucide-react';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
type CampaignStatus = 'Sent' | 'Draft' | 'Scheduled';
type Campaign = {
    id: string;
    name: string;
    type: 'Email' | 'SMS';
    status: CampaignStatus;
    sentTo: number;
    openRate: number;
    clickRate: number;
    sentDate: string;
};

// --- MOCK DATA ---
const campaigns: Campaign[] = [
    { id: 'CAMP-001', name: "July Flash Sale", type: 'Email', status: 'Sent', sentTo: 1250, openRate: 25.4, clickRate: 4.8, sentDate: '2025-07-15' },
    { id: 'CAMP-002', name: "New Arrivals Announcement", type: 'Email', status: 'Sent', sentTo: 1180, openRate: 32.1, clickRate: 6.2, sentDate: '2025-07-01' },
    { id: 'CAMP-003', name: "August Promo (SMS)", type: 'SMS', status: 'Scheduled', sentTo: 850, openRate: 0, clickRate: 0, sentDate: '2025-08-01' },
    { id: 'CAMP-004', name: "End of Season Newsletter", type: 'Email', status: 'Draft', sentTo: 0, openRate: 0, clickRate: 0, sentDate: 'N/A' },
];

// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, iconBgColor, iconColor }: { title: string; value: string; icon: React.ElementType; iconBgColor: string; iconColor: string; }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center space-x-4">
        <div className={clsx("p-3 rounded-full", iconBgColor)}>
            <Icon className={clsx("h-6 w-6", iconColor)} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const CampaignStatusBadge = ({ status }: { status: CampaignStatus }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1.5";
    const statusClasses = {
        'Sent': "bg-green-100 text-green-800",
        'Draft': "bg-gray-100 text-gray-700",
        'Scheduled': "bg-blue-100 text-blue-800",
    };
    const icon = {
        'Sent': <CheckCircle className="w-3 h-3"/>,
        'Draft': <Edit className="w-3 h-3"/>, // Assuming Edit icon exists
        'Scheduled': <Clock className="w-3 h-3"/>,
    }
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};


// --- MAIN PAGE COMPONENT ---
export default function CampaignsPage() {
    return (
        <DashboardLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                    <p className="mt-1 text-gray-500">Engage your customers with email and SMS marketing.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link href="/campaigns/new">
                        <button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm">
                            <Plus className="w-5 h-5 mr-2" />
                            <span>Create Campaign</span>
                        </button>
                    </Link>
                </div>
            </header>

            {/* Overview Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Subscribers" value="1,480" icon={Users} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                <StatCard title="Avg. Open Rate" value="28.5%" icon={Mail} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                <StatCard title="Avg. Click Rate" value="5.1%" icon={MousePointerClick} iconBgColor="bg-yellow-100" iconColor="text-yellow-600" />
                <StatCard title="Revenue from Campaigns" value="₦842,500" icon={DollarSign} iconBgColor="bg-green-100" iconColor="text-green-600" />
            </section>

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-bold text-gray-900">All Campaigns</h2>
                     <div className="flex items-center space-x-2">
                        <button className="text-sm font-medium text-gray-600 p-2 hover:bg-gray-100 rounded-md">Email</button>
                        <button className="text-sm font-medium text-gray-600 p-2 hover:bg-gray-100 rounded-md">SMS</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-600">Campaign Name</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Sent To</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Open Rate</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Click Rate</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {campaigns.map(campaign => (
                                <tr key={campaign.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{campaign.name}</td>
                                    <td className="px-6 py-4"><CampaignStatusBadge status={campaign.status} /></td>
                                    <td className="px-6 py-4 text-gray-600">{campaign.sentTo > 0 ? campaign.sentTo.toLocaleString() : '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{campaign.openRate > 0 ? `${campaign.openRate}%` : '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{campaign.clickRate > 0 ? `${campaign.clickRate}%` : '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{campaign.sentDate}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
