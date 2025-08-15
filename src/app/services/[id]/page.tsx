'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import { SVGProps, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useParams } from "next/navigation";

// --- Type definitions ---
type OrderType = {
    id: string;
    createdAt: string;
    orderStatus: string;
   
};


// --- Dummy Data (Expanded to match the new design) ---
const getOrderDetails = (id: string): OrderType => {
    // This simulates fetching data for a specific order.
    return {
        id: id,
        createdAt: '2024-07-14',
        orderStatus: 'Active', // Current status for the timeline
    };
};


// --- Reusable Components for this new design ---

// A generic card component for different sections
const InfoCard = ({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) => (
    <div className={clsx("bg-white p-6 rounded-xl shadow-sm", className)}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);



// --- Main Page Component ---
export default function ServiceDetailsPage() {
    const params = useParams();
    const orderId = params.id as string;
    const initialOrder = getOrderDetails(orderId);

    const [order, setOrder] = useState(initialOrder);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOrder(prevOrder => ({ ...prevOrder, orderStatus: e.target.value }));
    };


    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/services" className="w-35 p-2 flex items-center text-sm hover:bg-gray-200 text-gray-500 font-medium hover:text-primary-600 mb-2">
                        <Icons.chevronDown className="w-4 h-4 mr-1 rotate-90" />
                        Back to Service
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Service Name Here...</h1>
                        <span className={clsx("px-3 py-1 text-sm font-medium rounded-full", {
                            'bg-green-100 text-green-800': order.orderStatus === 'Active',
                            'bg-red-100 text-red-800': order.orderStatus === 'Inactive',
                        })}>
                            {order.orderStatus}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Created on: {order.createdAt}</p>
                </div>
                <div className="flex items-center space-x-2">
                    
                </div>

                <div className="flex items-center space-x-2">
                        <button className="bg-white border border-purple-300 cursor-pointer text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center space-x-2">
                            <Icons.edit className="h-5 w-5" />
                            <span>Edit Service</span>
                        </button> 
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                        <InfoCard title="Service Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-500">Duration</p>
                                    <p className="font-medium text-gray-800 mt-1">2 hours</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Price</p>
                                    <p className="font-medium text-gray-800 mt-1">5000</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Service Type</p>
                                    <p className="font-medium text-gray-800 mt-1">In-Person</p>
                                </div>
                            </div>
                            <div className="w-full mt-5">
                                <p className="font-bold">Description</p>
                                <p className="text-gray-600">Client wants to discuss options for a traditional wedding gown. Mentioned she likes beaded lace and silk materials. Please prepare fabric samples for the meeting.</p>
                            </div>
                        </InfoCard>
                        


                       
                    
                    
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <InfoCard title="Update Status">
                        <div>
                            <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">Update Order Status</label>
                            <select id="order-status" value={order.orderStatus} onChange={handleStatusChange} className="w-full border bg-gray-100 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </InfoCard>

                    {/* <!-- Upcoming Appointments Card --> */}
                    <InfoCard title="Upcoming Appointments">
                        <div className="space-y-3">
                            {/* <!-- Appointment Item --> */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {/* <img className="h-10 w-10 rounded-full object-cover" src="https://i.pravatar.cc/150?u=chioma" alt="Chioma Nwosu"> */}
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">Chioma Nwosu</p>
                                        <p className="text-xs text-gray-500">July 25, 2024 - 10:00 AM</p>
                                    </div>
                                </div>
                                <a href="#" className="text-purple-600 hover:text-purple-800 font-semibold text-sm">View</a>
                            </div>
                            {/* <!-- Appointment Item --> */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {/* <img className="h-10 w-10 rounded-full object-cover" src="https://i.pravatar.cc/150?u=emeka" alt="Emeka Okafor"> */}
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">Emeka Okafor</p>
                                        <p className="text-xs text-gray-500">July 28, 2024 - 01:00 PM</p>
                                    </div>
                                </div>
                                <a href="#" className="text-purple-600 hover:text-purple-800 font-semibold text-sm">View</a>
                            </div>
                        </div>
                    </InfoCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
