'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    DollarSign, ShoppingCart, Users, Calendar, BarChart2, MoreHorizontal, ArrowUp, ArrowDown, Eye, MousePointerClick, Target, Briefcase, MapPin
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type UserType = 'seller' | 'professional' | 'hybrid';
type ChartView = 'Revenue' | 'Orders' | 'Customers';

// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, change, isPositive }: { title: string; value: string; change: string; isPositive: boolean; }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <span className={clsx("flex items-center text-sm font-semibold", isPositive ? 'text-green-600' : 'text-red-600')}>
                {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {change}
            </span>
        </div>
    </div>
);

const BarChart = ({ view }: { view: ChartView }) => (
    <div className="mt-4 h-80 flex items-end space-x-2 sm:space-x-4 animate-fade-in">
        {/* This is a placeholder. A real chart library like Recharts or Chart.js would be used here */}
        <div className="flex-1 h-[60%] bg-blue-200 rounded-t-lg" title="Feb"></div>
        <div className="flex-1 h-[75%] bg-blue-200 rounded-t-lg" title="Mar"></div>
        <div className="flex-1 h-[50%] bg-blue-200 rounded-t-lg" title="Apr"></div>
        <div className="flex-1 h-[85%] bg-blue-500 rounded-t-lg" title="May"></div>
        <div className="flex-1 h-[65%] bg-blue-200 rounded-t-lg" title="Jun"></div>
        <div className="flex-1 h-[95%] bg-blue-200 rounded-t-lg" title="Jul"></div>
    </div>
);

const FunnelStep = ({ icon: Icon, title, value, rate, iconBgColor, iconColor }: { icon: React.ElementType; title: string; value: string; rate: string; iconBgColor: string; iconColor: string; }) => (
    <div className="relative flex items-start space-x-4">
        <div className={clsx("p-3 rounded-full flex-shrink-0", iconBgColor)}>
            <Icon className={clsx("h-6 w-6", iconColor)} />
        </div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-green-600 font-medium">{rate} Conversion</p>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function AnalyticsPage() {
    const [userType, setUserType] = useState<UserType>('hybrid');
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [chartView, setChartView] = useState<ChartView>('Revenue');

    const renderSellerStats = () => (
        <>
            <StatCard title="Sales Revenue" value="₦1,250,800" change="+12.5%" isPositive={true} />
            <StatCard title="Product Orders" value="152" change="+8.2%" isPositive={true} />
            <StatCard title="Avg. Order Value" value="₦8,228" change="+1.5%" isPositive={true} />
        </>
    );

    const renderProfessionalStats = () => (
        <>
            <StatCard title="Service Revenue" value="₦850,000" change="+15.1%" isPositive={true} />
            <StatCard title="Total Bookings" value="48" change="+5.5%" isPositive={true} />
            <StatCard title="New Clients" value="12" change="+10%" isPositive={true} />
        </>
    );

    return (
        <DashboardLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="mt-1 text-gray-500">Track your business performance and get valuable insights.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                     <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-gray-300 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500">
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
            </header>

            {/* Overview Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userType === 'seller' && renderSellerStats()}
                {userType === 'professional' && renderProfessionalStats()}
                {userType === 'hybrid' && (
                    <>
                        <StatCard title="Total Revenue" value="₦2,100,800" change="+13.2%" isPositive={true} />
                        <StatCard title="Total Orders & Bookings" value="200" change="+7.1%" isPositive={true} />
                        <StatCard title="New Customers & Clients" value="57" change="+1.8%" isPositive={true} />
                    </>
                )}
            </section>

            {/* Main Content Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
                
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{chartView} Over Time</h2>
                        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg mt-3 sm:mt-0">
                            {(['Revenue', 'Orders', 'Customers'] as ChartView[]).map(view => (
                                <button key={view} onClick={() => setChartView(view)} className={clsx("px-3 py-1 text-sm font-semibold rounded-md transition-colors", chartView === view ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800')}>
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>
                    <BarChart view={chartView} />
                </div>

                {/* Right Column: Funnels */}
                <div className="space-y-8">
                    { (userType === 'seller' || userType === 'hybrid') && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Funnel</h3>
                            <div className="space-y-6">
                                <FunnelStep icon={Eye} title="Visitors" value="4,820" rate="+22%" iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                                <FunnelStep icon={ShoppingCart} title="Added to Cart" value="312" rate="6.5%" iconBgColor="bg-yellow-100" iconColor="text-yellow-600" />
                                <FunnelStep icon={Target} title="Purchased" value="152" rate="48.7%" iconBgColor="bg-green-100" iconColor="text-green-600" />
                            </div>
                        </div>
                    )}
                     { (userType === 'professional' || userType === 'hybrid') && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Funnel</h3>
                            <div className="space-y-6">
                                <FunnelStep icon={Eye} title="Booking Page Views" value="980" rate="+15%" iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                                <FunnelStep icon={Calendar} title="Bookings Made" value="48" rate="4.9%" iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Detailed Breakdowns Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {/* Top Products/Services */}
                { (userType === 'seller' || userType === 'hybrid') && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3">
                                <Image src="https://placehold.co/40x40/dbeafe/1e3a8a?text=P1" width={40} height={40} className="w-10 h-10 rounded-md object-cover" alt="Product"/>
                                <div className="flex-1"><p className="font-medium text-gray-800">Ankara Print Dress</p></div>
                                <p className="font-semibold text-gray-800">₦2.4m</p>
                            </li>
                        </ul>
                    </div>
                )}
                { (userType === 'professional' || userType === 'hybrid') && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services by Revenue</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between">
                                <p className="font-medium text-gray-800">Initial Consultation</p>
                                <p className="font-semibold text-gray-800">₦850k</p>
                            </li>
                        </ul>
                    </div>
                )}
                
                {/* Top Traffic Sources */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Traffic Sources</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">Instagram</p>
                            <p className="font-semibold text-gray-800">2,892 <span className="text-sm font-normal text-gray-500">Visitors</span></p>
                        </li>
                    </ul>
                </div>
                
                {/* Sales by Location */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Location</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">Lagos</p>
                            <p className="font-semibold text-gray-800">₦1,200,500</p>
                        </li>
                         <li className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">Abuja</p>
                            <p className="font-semibold text-gray-800">₦450,000</p>
                        </li>
                         <li className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">Port Harcourt</p>
                            <p className="font-semibold text-gray-800">₦210,300</p>
                        </li>
                    </ul>
                </div>

                 {/* Top Customers */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Value</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                            <Image src="https://placehold.co/40x40/E2E8F0/4A5568?text=CN" width={40} height={40} className="w-10 h-10 rounded-full object-cover" alt="Customer"/>
                            <div className="flex-1"><p className="font-medium text-gray-800">Chioma Nwosu</p></div>
                            <p className="font-semibold text-gray-800">₦250,000</p>
                        </li>
                    </ul>
                </div>

            </section>
        </DashboardLayout>
    );
}
