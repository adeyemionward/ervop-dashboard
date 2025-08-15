'use client';

import React, { useState, useMemo, SVGProps } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    DollarSign, ShoppingCart, Users, Clock, Package, Calendar, BarChart2, Plus, ArrowUpRight, TrendingUp 
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type UserType = 'seller' | 'professional' | 'hybrid';

// --- MOCK DATA ---
const sellerData = {
    todayRevenue: "₦184,500",
    todayOrders: "32",
    allTimeRevenue: "₦15.4M",
    allTimeOrders: "1,280",
    topProducts: [
        { img: "https://placehold.co/40x40/dbeafe/1e3a8a?text=P1", name: "Ankara Print Dress", sales: "120 sales", revenue: "₦2.4m" },
        { img: "https://placehold.co/40x40/d1fae5/064e3b?text=P2", name: "Beaded Necklace", sales: "98 sales", revenue: "₦980k" },
        { img: "https://placehold.co/40x40/fee2e2/7f1d1d?text=P3", name: "Leather Handbag", sales: "74 sales", revenue: "₦1.8m" },
    ],
    recentOrders: [
        { id: "#1025", customer: "Tunde Adebayo", amount: "₦25,000", status: "Pending", date: "Today" },
        { id: "#1024", customer: "Funke Ojo", amount: "₦12,500", status: "Shipped", date: "Yesterday" },
        { id: "#1023", customer: "David Adeleke", amount: "₦8,000", status: "Delivered", date: "July 26, 2025" },
    ]
};

const professionalData = {
    upcomingAppointments: "8",
    totalAppointments: "100",
    newClientsThisWeek: "3",
    totalClients: "142",
    allTimeRevenue: "₦22.1M",
    upcomingAppointmentsList: [
        { time: "10:00 AM", service: "Initial Consultation", client: "Chioma Nwosu", date: "Today" },
        { time: "01:00 PM", service: "Project Kick-off", client: "Tunde Adebayo", date: "Tomorrow" },
        { time: "03:30 PM", service: "Strategy Session", client: "Funke Ojo", date: "July 30, 2025" },
    ]
};


// --- REUSABLE COMPONENTS (REDESIGNED) ---

const StatCard = ({ title, small, value, allTimeValue, allTimeLink, icon: Icon, iconBgColor, iconColor }: { title: string; small?: string; value: string; allTimeValue?: string; allTimeLink?: string; icon: React.ElementType; iconBgColor: string; iconColor: string; }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center space-x-4">
        <div className={clsx("p-3 rounded-full", iconBgColor)}>
            <Icon className={clsx("h-6 w-6", iconColor)} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title} <small>{small}</small></p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {allTimeValue && (
                allTimeLink ? (
                    <Link href={allTimeLink} className="text-xs text-gray-500 mt-1 flex items-center hover:text-blue-600 group transition-colors">
                        <span>{allTimeValue} All-Time</span>
                        <ArrowUpRight className="w-3 h-3 ml-1 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ) : (
                    <p className="text-xs text-gray-500 mt-1">{allTimeValue} All-Time</p>
                )
            )}
        </div>
    </div>
);

const ActivityItem = ({ icon: Icon, title, description, time, iconBgColor, iconColor }: { icon: React.ElementType; title: string; description: string; time: string; iconBgColor: string; iconColor: string; }) => (
    <div className="flex items-center space-x-4">
        <div className={clsx("p-3 rounded-full", iconBgColor)}>
            <Icon className={clsx("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1">
            <p className="font-medium text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <p className="text-sm text-gray-400">{time}</p>
    </div>
);


// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
    // This state determines what the dashboard shows.
    // In a real app, this would be fetched from the user's profile.
    const [userType, setUserType] = useState<UserType>('hybrid');

    const renderSellerStats = () => (
        <>
            <StatCard title="Today's Sales" value={sellerData.todayRevenue} allTimeValue={sellerData.allTimeRevenue} allTimeLink="/transactions" icon={DollarSign} iconBgColor="bg-green-100" iconColor="text-green-600" />
            <StatCard title="Today's Orders" value={sellerData.todayOrders} allTimeValue={sellerData.allTimeOrders} allTimeLink="/orders" icon={ShoppingCart} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
            
        </>
    );

    const renderProfessionalStats = () => (
        <>
            <StatCard title="Upcoming Appointments"     value={professionalData.upcomingAppointments} allTimeValue={`${professionalData.totalAppointments} Appointments`} allTimeLink="/appointments" icon={Calendar} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
        </>
    );

    const renderGeneralStats = () => (
        <>
           <StatCard title="New Contacts" small="(This Week)"   value={professionalData.newClientsThisWeek}   allTimeValue={`${professionalData.totalAppointments} Total Contacts`} allTimeLink="/contacts" icon={Users} iconBgColor="bg-yellow-100" iconColor="text-yellow-600" />
    
        </>
    );

    const user = JSON.parse(localStorage.getItem('user') || '{}');


            
    return (
        <DashboardLayout>
            
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {user.firstname}</h1>
                <p className="mt-1 text-gray-500">Here's a snapshot of your business today.</p>
            </header>

            {/* Dynamic Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {userType === 'seller' && renderSellerStats()}
                {userType === 'professional' && renderProfessionalStats()}
                {userType === 'hybrid' && (
                    <>
                        {renderSellerStats()} 
                        {renderProfessionalStats()}
                    </>
                )}
                {(userType === 'seller' || userType === 'professional' || userType === 'hybrid') && renderGeneralStats()}
            </section>

            {/* Main Content Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
                
                {/* Left Column: Recent Activity */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                        <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="space-y-6">
                        {userType !== 'professional' && (
                             <ActivityItem 
                                icon={ShoppingCart} 
                                title="New Order #1025"
                                description="From Tunde Adebayo for ₦25,000"
                                time="10:45 AM"
                                iconBgColor="bg-blue-100"
                                iconColor="text-blue-600"
                            />
                        )}
                        {userType !== 'seller' && (
                            <ActivityItem 
                                icon={Calendar} 
                                title="New Booking: Discovery Call"
                                description="With Chioma Nwosu"
                                time="09:30 AM"
                                iconBgColor="bg-purple-100"
                                iconColor="text-purple-600"
                            />
                        )}
                         <ActivityItem 
                            icon={DollarSign} 
                            title="Payment Received"
                            description="Invoice #INV-056 for ₦150,000"
                            time="08:15 AM"
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {userType !== 'professional' && (
                                <Link href="/products/new" className="w-full bg-gray-50 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg flex items-center transition-colors text-gray-700">
                                    <Plus className="w-5 h-5 mr-3 text-blue-600"/> Add New Product
                                </Link>
                            )}
                             {userType !== 'seller' && (
                                <Link href="/appointments/new" className="w-full bg-gray-50 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg flex items-center transition-colors text-gray-700">
                                    <Plus className="w-5 h-5 mr-3 text-purple-600"/> Schedule Appointment
                                </Link>
                            )}
                             <Link href="/invoices/new" className="w-full bg-gray-50 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg flex items-center transition-colors text-gray-700">
                                <Plus className="w-5 h-5 mr-3 text-green-600"/> Create Invoice
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Orders & Upcoming Appointments Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
                {userType !== 'professional' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
                        <div className="space-y-4">
                            {sellerData.recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800">{order.id} - {order.customer}</p>
                                        <p className="text-sm text-gray-500">{order.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">{order.amount}</p>
                                        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full", 
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        )}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <Link href="/orders" className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
                                View All Orders <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                )}
                {userType !== 'seller' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
                        <div className="space-y-4">
                            {professionalData.upcomingAppointmentsList.map((appt, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="bg-purple-100 p-3 rounded-lg text-center">
                                        <p className="font-bold text-purple-700">{appt.time.split(' ')[0]}</p>
                                        <p className="text-xs text-purple-600">{appt.time.split(' ')[1]}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{appt.service}</p>
                                        <p className="text-sm text-gray-500">with {appt.client} - <span className="font-medium">{appt.date}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="mt-6 border-t pt-4">
                            <Link href="/appointments" className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
                                View Full Appointments <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </DashboardLayout>
    );
}
