'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";



// --- div Page Component ---
export default function CreateTransaction() {
    const handleGoBack = useGoBack();
    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">

                {/* <!-- Page Header --> */}
                 <HeaderTitleCard onGoBack={handleGoBack} title="Add Contact" description="Add a new client or customer to your unified contact hub."> 

                 </HeaderTitleCard>

                {/* <!-- htmlhtmlhtmlForm Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                     <form className="space-y-8">
            
                        {/* <!-- Profile Picture Section --> */}
                        <div className="mt-8 ">
                            <label htmlFor="file-upload" className="block text-xl font-medium text-gray-700 mb-2">Upload Contact Photo</label>
                            <div className="mt-1 flex justify-center items-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-lg transition-colors cursor-pointer hover:bg-gray-100 hover:border-blue-500">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only"/>
                            </div>
                        </div>

                        {/* <!-- Name Fields --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="discountName" className="block text-xl font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" id="discountName" placeholder="e.g. Summer Sale" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label htmlFor="discountName" className="block text-xl font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" id="discountName" placeholder="e.g. Summer Sale" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>

                        {/* <!-- Contact Info --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label htmlFor="discountName" className="block text-xl font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="discountName" placeholder="e.g. Summer Sale" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                             <div>
                                <label htmlFor="discountName" className="block text-xl font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" id="discountName" placeholder="e.g. Summer Sale" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>

                        {/* <!-- Additional Info --> */}

                         <div>
                                <label htmlFor="discountName" className="block text-xl font-medium text-gray-700 mb-1">Company (Optional)</label>
                                <input type="text" name="company" id="company" placeholder="e.g., Chioma's Designs Ltd." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                            <input type="text" name="tags" id="tags" placeholder="e.g., Service Client, High Value, Lead" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                            <p className="mt-2 text-xs text-gray-500">Separate tags with a comma.</p>
                            
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
