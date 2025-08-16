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
                 <HeaderTitleCard onGoBack={handleGoBack} title="Generate Invoice" description="Create and send a professional invoice to your customers."/>

                {/* <!-- htmlhtmlhtmlForm Container --> */}
                 <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-5xl mx-auto">
                    <form className="space-y-8">
                        
                        {/* <!-- From / To Section --> */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                            {/* <div>
                                <h3 className="font-semibold text-gray-800">From</h3>
                                <p className="text-gray-600">Ervop Fashion House</p>
                                <p className="text-sm text-gray-500">123 Allen Avenue, Ikeja, Lagos</p>
                            </div> */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">To</h3>
                                <select id="service" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option>In-Progress</option>
                                    <option>On-Hold</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* <!-- Invoice htmlFor Section --> */}
                        {/* <div className="border-t pt-6">
                             <label className="block text-sm font-medium text-gray-700 mb-2">This invoice is For:</label>
                             <div className="flex items-center gap-x-6">
                                <div className="flex items-center"><input id="For-project" name="invoice-For" type="radio" checked className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="htmlFor-project" className="ml-2 block text-sm text-gray-900">A Project</label></div>
                                <div className="flex items-center"><input id="For-order" name="invoice-For" type="radio" className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="htmlFor-order" className="ml-2 block text-sm text-gray-900">An Order</label></div>
                                <div className="flex items-center"><input id="For-unspecified" name="invoice-For" type="radio" className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="htmlFor-unspecified" className="ml-2 block text-sm text-gray-900">Unspecified</label></div>
                            </div>
                        </div> */}

                        {/* <!-- Conditional Project/Order Selection --> */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Link to Project</label>
                                <select id="service" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option>In-Progress</option>
                                    <option>On-Hold</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                             
                        </div>


                        {/* <!-- Invoice Details --> */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                            <div>
                                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                <input type="text" id="invoiceNumber" value="#INV-003" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" />
                            </div>
                            <div>
                                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                <input type="date" id="issueDate" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input type="date" id="dueDate" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                            </div>
                        </div>

                        {/* <!-- Line Items Table --> */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="text-left text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="pb-2 font-medium w-1/2">Description</th>
                                            <th className="pb-2 font-medium text-center">Qty</th>
                                            <th className="pb-2 font-medium text-right">Rate</th>
                                            <th className="pb-2 font-medium text-right">Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="py-2"><input type="text" placeholder="Item or service description" className="w-full border-gray-200 rounded-md p-2" /></td>
                                            <td className="py-2 px-2"><input type="number" value="1" className="w-20 text-center border-gray-200 rounded-md p-2" /></td>
                                            <td className="py-2 px-2"><input type="text" placeholder="0.00" className="w-32 text-right border-gray-200 rounded-md p-2" /></td>
                                            <td className="py-2 px-2 text-right font-medium text-gray-800">₦0.00</td>
                                            <td className="py-2 pl-2 text-right">
                                                <button type="button" className="p-1 text-gray-400 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                             <button type="button" className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-800">+ Add Line Item</button>
                        </div>
                        
                        {/* <!-- Summary & Notes --> */}
                        <div className="border-t pt-6 space-y-6">
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Terms</label>
                                <textarea id="notes" rows={3} placeholder="e.g. Thank you For your business!" className="w-full border border-gray-300 rounded-lg px-4 py-2"></textarea>
                            </div>
                            <div className="flex justify-end">
                                <div className="w-full max-w-sm space-y-3">
                                    <div className="flex justify-between"><p className="text-gray-600">Subtotal</p><p className="font-medium text-gray-900">₦0.00</p></div>
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="discount" className="text-gray-600">Discount (%)</label>
                                        <input type="number" id="discount" className="w-24 text-right border-gray-200 rounded-md p-1" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="tax" className="text-gray-600">Tax (%)</label>
                                        <input type="number" id="tax" className="w-24 text-right border-gray-200 rounded-md p-1" />
                                    </div>
                                    <div className="border-t my-2 pt-2"></div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900"><p>Total</p><p>₦0.00</p></div>
                                </div>
                            </div>
                        </div>

                        {/* <!-- htmlForm Actions --> */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Save Draft</button>
                            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700">Send Invoice</button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
