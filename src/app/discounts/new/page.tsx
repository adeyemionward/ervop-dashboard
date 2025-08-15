'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import SelectProductsModal from "@/components/SelectProductsModal"; // Import the modal

// --- Type Definitions ---
type Product = { id: number; name: string; price: string; image: string; };

export default function CreateDiscountPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const handleAddProducts = (products: Product[]) => {
        // This function receives the selected products from the modal
        setSelectedProducts(products);
        setIsModalOpen(false); // Close the modal
    };

    const removeProduct = (productId: number) => { 
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };
  return (
    <DashboardLayout>
      
     <div className="w-full  max-w-4xl mx-auto">

                {/* <!-- Page Header --> */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/discounts" className="flex items-center text-md text-gray-500 hover:text-purple-600 mb-2 w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Back to Discounts
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Create Discount</h1>
                    </div>
                    <button className="bg-white border border-gray-300 text-gray-800 px-6 py-3 cursor-pointer font-medium rounded-sm  hover:bg-gray-50 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
                        <span>Watch Tutorial</span>
                    </button>
                </div>

                {/* <!-- htmlForm Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="discountName" className="block text-xl font-medium text-gray-700 mb-1">Discount Name</label>
                                <input type="text" id="discountName" placeholder="e.g. Summer Sale" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label htmlFor="discountCode" className="block text-xl font-medium text-gray-700 mb-1">Discount Code</label>
                                <input type="text" id="discountCode" placeholder="e.g. SUMMER25" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <p className="text-xs text-purple-500 mt-1">Customers will use this code at checkout.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xl font-medium text-gray-700 mb-2">Discount Type</label>
                            <div className="flex items-center gap-x-6">
                                <div className="flex items-center"><input id="percentage" name="discount-type" type="radio" checked className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="percentage" className="ml-2 block text-md text-gray-900">Percentage</label></div>
                                <div className="flex items-center"><input id="fixed" name="discount-type" type="radio" className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="fixed" className="ml-2 block text-md text-gray-900">Fixed Amount</label></div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="discountValue" className="block text-xl font-medium text-gray-700 mb-1">Discount Value</label>
                            <input type="text" id="discountValue" placeholder="e.g. 25 or 5000" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        
                        <div>
                            <label className="block text-xl font-medium text-gray-700 mb-2">Applies To</label>
                            <div className="flex items-center gap-x-6">
                                <div className="flex items-center"><input id="all-products" name="applies-to" type="radio" checked className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="all-products" className="ml-2 block text-md text-gray-900">All Products</label></div>
                                <div className="flex items-center"><input id="specific-products" name="applies-to" type="radio" className="h-5 w-5 accent-purple-600 border-gray-300 focus:ring-purple-500" /><label htmlFor="specific-products" className="ml-2 block text-md text-gray-900">Specific Products</label></div>
                            </div>
                        </div>
                        
                        {/* <!-- This section would be shown conditionally in your React component --> */}
                        <div>
                            <label className="block text-xl font-medium text-gray-700 mb-1">Products</label>
                            {/* <button type="button" className="w-full flex justify-between items-center text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500 hover:border-primary-500">
                                <span>Select products</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button> */}
                            <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full flex justify-between items-center text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500 hover:border-primary-500"
                                >
                                    <span>Select products</span>
                                    <Icons.chevronDown className="h-5 w-5 text-gray-400 transform -rotate-90" />
                                </button>
                        </div>
                        {/* Display selected products */}
                            {selectedProducts.length > 0 && (
                                <div className="space-y-2 pt-4 border-t">
                                     <h4 className="font-medium text-gray-800">Selected Products:</h4>
                                     {selectedProducts.map(product => (
                                         <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                             <div className="flex items-center space-x-3">
                                                 <Image src={product.image} alt={product.name} width={32} height={32} className="rounded-md" />
                                                 <div>
                                                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                                                    <p className="text-xs text-gray-500">{product.price}</p>
                                                 </div>
                                             </div>
                                             <button type="button" onClick={() => removeProduct(product.id)} className="text-red-500 hover:text-red-700">
                                                 <Icons.close className="w-4 h-4" />
                                             </button>
                                         </div>
                                     ))}
                                </div>
                            )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label htmlFor="startDate" className="block text-xl font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" id="startDate" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500" />
                            </div>
                             <div>
                                <label htmlFor="endDate" className="block text-xl font-medium text-gray-700 mb-1">End Date</label>
                                <input type="date" id="endDate" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500" />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 font-medium rounded-sm hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="btn-secondary text-white  font-medium  px-6 py-3 rounded-sm shadow-lg">Save Discount</button>
                        </div>
                    </form>
                </div>
            </div>
      {/* 3. Render the modal conditionally */}
            <SelectProductsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddProducts={handleAddProducts}
            />
    </DashboardLayout>
  );
}

