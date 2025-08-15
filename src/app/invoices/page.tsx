'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { SVGProps, useState, useMemo, Children } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Billed" value="200000"  icon={Icons.arrowUp} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                    <StatCard title="Paid" value="45000" icon={Icons.cash} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                    <StatCard title="Outstanding" value="98765" icon={Icons.cashPending} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" />
                    <StatCard title="Overdue"value="22000000" icon={Icons.arrowDown} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
                    
                </div>

                

                <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">

                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Name..."
                            value=""
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Time Filter Select */}
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-36">
                        <option value="All">All Time</option>
                        <option value="This Week">This Week</option>
                        <option value="Last Week">Last Week</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                        <option value="Custom">Custom</option>
                    </select>
                    
                    {/* Status Filter Select */}
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40">
                        <option value="All">All Statuses</option>
                        <option value="Completed">Paid</option>
                        <option value="Pending">Due</option>
                        <option value="Failed">Overdue</option>
                    </select>

                  

                    {/* This spacer is now only active on larger screens */}
                    <div className="hidden md:block md:flex-grow"></div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
                        <button className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium">Clear Filters</button>
                        <button className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                            <Icons.refresh className="h-6 w-6 " />
                        </button> 
                    </div>
                </div>
                {/* <!-- Filter Tabs --> */}
                <div className="mt-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-purple-600 text-purple-600 font-semibold text-sm whitespace-nowrap">All Invoices</a>
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Project Invoices</a>
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Order Invoices</a>
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Unspecified Invoices</a>
                        </nav>
                    </div>
                </div>
              
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm w-12"><input type="checkbox" className="rounded border-gray-300"/></th>
                                    <th  scope="col" className="px-6 py-4 ">Invoice #</th>
                                    <th  scope="col" className="px-6 py-4 ">Customer</th>
                                    <th  scope="col" className="px-6 py-4 ">Source</th>
                                    <th  scope="col" className="px-6 py-4 ">Issue Date</th>
                                    <th  scope="col" className="px-6 py-4 ">Due Date</th>
                                    <th  scope="col" className="px-6 py-4 ">Amount</th>
                                    <th  scope="col" className="px-6 py-4 ">Status</th>
                                    <th  scope="col" className="px-6 py-4 ">Actions</th>
                                </tr>
                            </thead>
                              <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" /></td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">#INV-001</td>
                                    <td className="px-6 py-4 text-gray-600">Chioma Nwosu</td>
                                    <td className="px-6 py-4 text-gray-600">Project</td>
                                    <td className="px-6 py-4 text-gray-600">July 15, 2024</td>
                                    <td className="px-6 py-4 text-gray-600">July 30, 2024</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">₦225,000</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Paid</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-600 hover:text-primary-800 font-semibold">View</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" /></td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">#INV-002</td>
                                    <td className="px-6 py-4 text-gray-600">Bolanle Adebayo</td>
                                    <td className="px-6 py-4 text-gray-600">Order</td>
                                    <td className="px-6 py-4 text-gray-600">July 18, 2024</td>
                                    <td className="px-6 py-4 text-gray-600">August 02, 2024</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">₦150,000</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Due</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-600 hover:text-primary-800 font-semibold">View</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" /></td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">#INV-003</td>
                                    <td className="px-6 py-4 text-gray-600">Musa Ibrahim</td>
                                    <td className="px-6 py-4 text-gray-600">Unspecified</td>
                                    <td className="px-6 py-4 text-gray-600">June 10, 2024</td>
                                    <td className="px-6 py-4 text-gray-600">June 25, 2024</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">₦150,000</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Overdue</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-600 hover:text-primary-800 font-semibold">View</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                </div>
        </DashboardLayout>
    );
}
