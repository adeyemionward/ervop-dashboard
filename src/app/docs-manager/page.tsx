'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";

export default function DocsManagerPage() {
  return (
    
    <DashboardLayout>
      
     {/* <main className="flex-1 p-8 overflow-y-auto"> */}

            {/* <!-- Page Header --> */}
            <div className="flex items-center justify-between mb-8">
                <div>
                        <h2 className="text-3xl font-bold text-gray-900">Document Manager</h2>
                        <p className="mt-1 text-gray-500">Your secure vault for all business and client documents.</p>
                    </div>
                
                {/* <Link href="/discounts/new"> */}
                    {/* <!-- This button will link to the Create Discount Page --> */}
                    <Link href="docs-manager/new" className="btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                        <span>Upload Document</span>
                    </Link>
                {/* </Link> */}
            </div>


                {/* <!-- Main Content Grid --> */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* <!-- Left Panel: Folder List --> */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Folders</h3>
                            <span className="text-sm text-gray-400">1 Business / 3 Clients</span>
                        </div>
                    
                        <div className="relative">
                            <i data-lucide="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                             <input type="text" placeholder="Search folders..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500" />
                        </div>

                        {/* <!-- Folder List Container --> */}
                        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                            {/* <!-- My Business Documents Card (Active State) --> */}
                            <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50 cursor-pointer">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                       <Icons.folder className="h-5 w-5 text-gray-400" />
                                        <span className="font-semibold text-purple-800">My Business Documents</span>
                                    </div>
                                    <span className="text-sm font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded-full">4 Docs</span>
                                </div>
                            </div>

                            {/* <!-- Client Card --> */}
                            <div className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Chioma Nwosu</span>
                                    <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">5 Docs</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Last activity: 2 days ago</p>
                            </div>

                            {/* <!-- Client Card --> */}
                            <div className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Tunde Adebayo</span>
                                    <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">2 Docs</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Last activity: 1 month ago</p>
                            </div>
                            
                            {/* <!-- Client Card --> */}
                            <div className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Funke Ojo</span>
                                    <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">8 Docs</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Last activity: 3 weeks ago</p>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Right Panel: Document List for Selected Folder --> */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold">My Business Documents</h3>
                                <p className="text-gray-500 mt-1">Your private library of templates and internal files.</p>
                            </div>
                        </div>

                        {/* <!-- Document List Table/Container --> */}
                        <div className="space-y-4">
                            
                            {/* <!-- Document Item 1: Contract Template --> */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="bg-gray-200 p-3 rounded-full mr-4">
                                        <i data-lucide="file-text" className="w-6 h-6 text-gray-600"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Standard Service Agreement.pdf</p>
                                        <p className="text-sm text-gray-500">Updated: July 10, 2025</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">Template</span>
                                    <button className="text-gray-400 hover:text-gray-600"><i data-lucide="more-vertical" className="w-5 h-5"></i></button>
                                </div>
                            </div>

                            {/* <!-- Document Item 2: Brochure --> */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="bg-gray-200 p-3 rounded-full mr-4">
                                        <i data-lucide="file-image" className="w-6 h-6 text-gray-600"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Company Brochure 2025.pdf</p>
                                        <p className="text-sm text-gray-500">Uploaded: June 05, 2025</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">Marketing</span>
                                    <button className="text-gray-400 hover:text-gray-600"><i data-lucide="more-vertical" className="w-5 h-5"></i></button>
                                </div>
                            </div>

                            {/* <!-- Document Item 3: CAC Certificate --> */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="bg-gray-200 p-3 rounded-full mr-4">
                                        <i data-lucide="shield-check" className="w-6 h-6 text-gray-600"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold">CAC Registration Certificate.pdf</p>
                                        <p className="text-sm text-gray-500">Uploaded: Jan 20, 2025</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">Official</span>
                                    <button className="text-gray-400 hover:text-gray-600"><i data-lucide="more-vertical" className="w-5 h-5"></i></button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            {/* </main> */}
            {/* </main> */}
    </DashboardLayout>
  );
}

