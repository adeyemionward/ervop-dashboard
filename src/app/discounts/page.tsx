'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import ActionTableCard from "@/components/ActionTableCard";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";




export default function DiscountPage() {
     const handleGoBack = useGoBack();
  return (
    
    <DashboardLayout>
      
     {/* <main className="flex-1 p-8 overflow-y-auto"> */}

                {/* <!-- Page Header --> */}
                {/* <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900"></h1>
                    
                        <Link href="discounts/new" className="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                            <span></span>
                        </Link>
                </div> */}

                {/* <button className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                               <span>Issue Refund</span>
                              </button> */}
                
                <HeaderTitleCard onGoBack={handleGoBack} title="Discounts" description="A complete history of all product transactions">
                    <div className="flex flex-col md:flex-row gap-2">
    
                        <Link href="orders/new" className="btn-primary flex items-center justify-center">
                            <Icons.plus /> 
                            <span>Create Discount</span>
                        </Link>
                                            
                    </div> 
                </HeaderTitleCard>

                {/* <!-- Filter Tabs --> */}
                <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex items-center justify-between gap-4" >
                    <nav className="flex space-x-4" aria-label="Tabs">
                        {/* <!-- Active Tab --> */}
                        <button className="flex items-center whitespace-nowrap py-2 px-4 rounded-lg font-medium text-sm bg-purple-600 text-white">
                            All
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">12</span>
                        </button>
                        {/* <!-- Inactive Tab --> */}
                        <button className="flex items-center whitespace-nowrap py-2 px-4 rounded-lg font-medium text-sm bg-green-100 text-green-800 hover:bg-green-200">
                            Active
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-900">5</span>
                        </button>
                         {/* <!-- Inactive Tab --> */}
                        <button className="flex items-center whitespace-nowrap py-2 px-4 rounded-lg font-medium text-sm bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Scheduled
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-900">2</span>
                        </button>
                         {/* <!-- Inactive Tab --> */}
                        <button className="flex items-center whitespace-nowrap py-2 px-4 rounded-lg font-medium text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">
                            Expired
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">5</span>
                        </button>
                    </nav>
                    
                    <div className="relative">
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search discounts..."
                            className="w-full max-w-xs pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    </div>


                </div>


                {/* <!-- Discounts Table --> */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto table-scrollbar">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <td scope="col" className="p-4">
                                        <input type="checkbox" className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                                    </td>
                                    <th scope="col" className="px-6 py-4 ">Discount Code</th>
                                    <th scope="col" className="px-6 py-4">Type</th>
                                    <th scope="col" className="px-6 py-4 ">Value</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4 ">Times Used</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="bg-white border-b hover:bg-gray-50">
                                    <td scope="col" className="w-4 p-4">
                                        <input type="checkbox" className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">Summer25</td>
                                    <td className="px-6 py-4 text-gray-600">Percentage</td>
                                    <td className="px-6 py-4 text-gray-600">25%</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span></td>
                                    <td className="px-6 py-4 text-gray-600">125</td>
                                    <ActionTableCard/>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td scope="col" className="w-4 p-4">
                                        <input type="checkbox" className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">New500</td>
                                    <td className="px-6 py-4 text-gray-600">Fixed Amount</td>
                                    <td className="px-6 py-4 text-gray-600">₦5,000</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Scheduled</span></td>
                                    <td className="px-6 py-4 text-gray-600">0</td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button className="p-2 rounded-full hover:bg-gray-200">
                                            <svg className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                        </button>
                                        {/* <!-- Dropdown would be hidden by default --> */}
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td scope="col" className="w-4 p-4">
                                        <input type="checkbox" className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">Flash100</td>
                                    <td className="px-6 py-4 text-gray-600">Percentage</td>
                                    <td className="px-6 py-4 text-gray-600">10%</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800">Expired</span></td>
                                    <td className="px-6 py-4 text-gray-600">543</td>
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
            {/* </main> */}
    </DashboardLayout>
  );
}

