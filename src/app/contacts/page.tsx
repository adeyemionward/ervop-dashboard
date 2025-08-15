'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import ActionTableCard from "@/components/ActionTableCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { SVGProps, useState, useMemo, Children } from "react";
import Link from "next/link";


export default function ContactsPage() {
    const handleGoBack = useGoBack();
    return (
        <DashboardLayout>
            
                {/* PAGE TITLE */}
                <HeaderTitleCard onGoBack={handleGoBack} title="Contact Manager" description="Your unified hub for all clients and customers.">
                   <div className="flex flex-col md:flex-row gap-2">

                      

                        <Link href="#" className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2">
                        <Icons.export />
                            <span>Export Contact</span>
                        </Link>

                        <Link href="contacts/new" className="btn-primary flex items-center justify-center">
                            <Icons.plus /> 
                            <span>Add New Contact</span>
                        </Link>
                        
                    </div> 
                </HeaderTitleCard>
                

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
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>

                     <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40">
                        <option value="All">All Method</option>
                        <option value="Online">Online</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Cash">Cash</option>
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
                    <nav className="-mb-px flex space-x-6">
                        <a href="#" className="flex items-center py-2 px-1 border-b-2 border-purple-600 text-purple-600 font-semibold text-sm">
                            <span>All Contacts</span>
                            <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium">128</span>
                        </a>
                        <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <span>Service Clients</span>
                            <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">42</span>
                        </a>
                        <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <span>Product Customers</span>
                             <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">85</span>
                        </a>
                        <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <span>Leads</span>
                             <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">1</span>
                        </a>
                    </nav>
                </div>
            </div>
              
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="p-4 text-sm"><input type="checkbox" className="rounded"/></th>
                                    <th scope="col" className="p-4 text-sm">Name</th>
                                    <th scope="col" className="p-4 text-sm">Status</th>
                                    <th scope="col" className="p-4 text-sm">Tags</th>
                                    <th scope="col" className="p-4 text-sm">Last Activity</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* <!-- Table Row 1 --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded"/></td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <img className="w-10 h-10 rounded-full object-cover" src="https://placehold.co/100x100/E2E8F0/4A5568?text=CN" alt="Chioma Nwosu"/>
                                            <div>
                                                <p className="font-semibold text-gray-900">Chioma Nwosu</p>
                                                <p className="text-sm text-gray-500">info@chiomasdesigns.com</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Active</span></td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Service Client</span>
                                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">High Value</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">July 20, 2025</td>
                                    {/* <td> */}
                                        <ActionTableCard/>
                                    {/* </td> */}
                                </tr>
                                {/* <!-- Table Row 2 --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded"/></td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <img className="w-10 h-10 rounded-full object-cover" src="https://placehold.co/100x100/E2E8F0/4A5568?text=TA" alt="Tunde Adebayo"/>
                                            <div>
                                                <p className="font-semibold text-gray-900">Tunde Adebayo</p>
                                                <p className="text-sm text-gray-500">08012345678</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Active</span></td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Product Customer</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">July 18, 2025</td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button className="p-2 rounded-full hover:bg-gray-200">
                                             <svg className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                                {/* <!-- Table Row 3 --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded"/></td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">FO</span>
                                            <div>
                                                <p className="font-semibold text-gray-900">Funke Ojo</p>
                                                <p className="text-sm text-gray-500">funke.ojo@example.com</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Lead</span></td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Service Client</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">June 25, 2025</td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button className="p-2 rounded-full hover:bg-gray-200">
                                             <svg className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                                {/* <!-- Table Row 4 --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded"/></td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <img className="w-10 h-10 rounded-full object-cover" src="https://placehold.co/100x100/E2E8F0/4A5568?text=DA" alt="David Adeleke"/>
                                            <div>
                                                <p className="font-semibold text-gray-900">David Adeleke</p>
                                                <p className="text-sm text-gray-500">david.a@music.com</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">Inactive</span></td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Product Customer</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">March 12, 2025</td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button className="p-2 rounded-full hover:bg-gray-200">
                                             <svg className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> 
                </div>
        </DashboardLayout>
    );
}
