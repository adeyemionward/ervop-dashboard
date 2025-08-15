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
                 <HeaderTitleCard onGoBack={handleGoBack} title="Add Transactions" description="Manually record income or expenses htmlFor your business."> 

                 </HeaderTitleCard>

                {/* <!-- htmlhtmlForm Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                      <form className="space-y-8">
            
                        {/* <!-- Step 1: Transaction Type Toggle --> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                            <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-100">
                                <input type="radio" id="type-income" name="transaction-type" value="income" className="sr-only" checked/>
                                <label htmlFor="type-income" className="w-1/2 text-center py-2 text-white rounded-md cursor-pointer bg-purple-600 font-semibold">
                                    Income
                                </label>
                                <input type="radio" id="type-expense" name="transaction-type" value="expense" className="sr-only"/>
                                <label htmlFor="type-expense" className="w-1/2 text-center py-2 rounded-md cursor-pointer transition-colors font-semibold text-gray-500">
                                    Expense
                                </label>
                            </div>
                        </div>

                        {/* <!-- Transaction Details --> */}
                        <div id="income-fields">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="income-amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <span className="text-gray-500 sm:text-sm">₦</span>
                                        </div>
                                        <input type="number" name="income-amount" id="income-amount" className="block w-full pl-7 pr-12 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="0.00"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="income-date" className="block text-sm font-medium text-gray-700">Transaction Date</label>
                                    <input type="date" name="income-date" id="income-date" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"/>
                                </div>
                            </div>
                        </div>

                        <div id="expense-fields" className="hidden-by-default space-y-6">
                            <div>
                                <label htmlFor="expense-description" className="block text-sm font-medium text-gray-700">Expense Title</label>
                                <input type="text" name="expense-description" id="expense-description" placeholder="e.g., Logistics htmlFor Lagos Trip" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:purple-purple-500 focus:border-purple-500 sm:text-sm"/>
                            </div>
                            {/* <!-- Grouped Expense Line Items --> */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-md font-semibold mb-3">Line Items</h4>
                                <div id="line-items-container" className="space-y-3">
                                    {/* <!-- Initial Line Item --> */}
                                    <div className="flex items-center space-x-2">
                                        <input type="text" placeholder="Item description (e.g., Fuel)" className="flex-grow border-gray-300 rounded-lg shadow-sm sm:text-sm"/>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">₦</span>
                                            <input type="number" placeholder="0.00" className="w-32 pl-7 border-gray-300 rounded-lg shadow-sm sm:text-sm line-item-amount"/>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" id="add-item-btn" className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center">
                                    <i data-lucide="plus-circle" className="w-4 h-4 mr-2"></i>
                                    Add Item
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="expense-total" className="block text-sm font-medium text-gray-700">Total Amount</label>
                                    <div className="mt-1 relative rounded-md">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <span className="text-gray-500 sm:text-sm">₦</span>
                                        </div>
                                        <input type="text" name="expense-total" id="expense-total" className="block w-full pl-7 pr-12 bg-gray-100 border-gray-300 rounded-lg sm:text-sm font-bold" placeholder="0.00"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700">Transaction Date</label>
                                    <input type="date" name="expense-date" id="expense-date" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"/>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description / Note</label>
                            <input type="text" name="description" id="description" placeholder="e.g., Cash payment htmlFor consultation" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="category" name="category" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg">
                                    <option>Manual Income</option>
                                    <option>Logistics</option>
                                    <option>Materials</option>
                                    <option>Software</option>
                                    <option>Other Expense</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer / Client (Optional)</label>
                                <select id="customer" name="customer" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg">
                                    <option>Select a contact...</option>
                                    <option>Chioma Nwosu</option>
                                    <option>Tunde Adebayo</option>
                                    <option>David Adeleke</option>
                                </select>
                            </div>
                        </div>

                        {/* <!-- Action Buttons --> */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button type="button" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg flex items-center transition-colors">
                                <i data-lucide="save" className="w-4 h-4 mr-2"></i>
                                <span>Save Transaction</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
