'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";

// --- Reusable Components for this new design ---

// A generic card component for different sections
const headerTitleCard = ({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) => (
    <div className={clsx("bg-white p-6 rounded-xl shadow-sm", className)}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

// --- div Page Component ---
export default function CreateAppointment() {
    const handleGoBack = useGoBack();
    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">

                {/* <!-- Page Header --> */}
                <HeaderTitleCard onGoBack={handleGoBack} title="Add New Document" description="Add files to your business library or a specific client folder."> </HeaderTitleCard>

                {/* <!-- Form Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <form className="space-y-8">
            
                        <div className="mt-8 ">
                            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload a Photo</label>
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
                            <p className="mt-4 text-lg font-semibold text-gray-800">Chief Joshua Akporowho Denila</p>
                        </div>

                        {/* <!-- Step 2: Choose Destination Folder --> */}
                        <div>
                            <label htmlFor="folder" className="block text-sm font-medium text-gray-700">Choose a destination</label>
                            <select id="folder" name="folder" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg">
                                <option selected>📂 My Business Documents</option>
                                <optgroup label="Clients">
                                    <option>Chioma Nwosu</option>
                                    <option>Tunde Adebayo</option>
                                    <option>Funke Ojo</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* <!-- Step 3: Document Details --> */}
                        <div> 
                            <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700">Document Name</label>
                            <input type="text" name="doc-name" id="doc-name" placeholder="e.g., Standard Service Agreement.pdf" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            
                        </div>

                        <div>
                            <label htmlFor="doc-tags" className="block text-sm font-medium text-gray-700">Tags (Optional)</label>
                            <input type="text" name="doc-tags" id="doc-tags" placeholder="e.g., Template, Contract, Official" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            <p className="mt-2 text-xs text-gray-500">Separate tags with a comma.</p>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button type="button" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-6 rounded-lg flex items-center transition-colors">
                                <i data-lucide="upload" className="w-4 h-4 mr-2"></i>
                                <span>Upload File</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
