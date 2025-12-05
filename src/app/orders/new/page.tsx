'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";

// --- Type Definitions ---
type Customer = { id: number; name: string; email: string; };
type Product = { id: number; name: string; price: string; image: string; stock: number; };
type SelectedProduct = Product & { quantity: number };
type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

// --- Dummy Data ---
const allCustomers: Customer[] = [
    { id: 1, name: 'Chioma Nwosu', email: 'chioma.n@example.com' },
    { id: 2, name: 'Bolanle Adebayo', email: 'bolanle.a@example.com' },
    { id: 3, name: 'Musa Ibrahim', email: 'musa.i@example.com' },
    { id: 4, name: 'Aisha Bello', email: 'aisha.b@example.com' },
];

const allProducts: Product[] = [
    { id: 1, name: 'Luxury Beaded Gown', price: '₦75,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P1', stock: 12 },
    { id: 2, name: 'Aso-Oke Head Tie', price: '₦15,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P3', stock: 50 },
    { id: 3, name: 'Handcrafted Leather Bag', price: '₦25,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P2', stock: 5 },
    { id: 4, name: 'Ankara Print Fabric', price: '₦12,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P4', stock: 100 },
];

// --- Reusable Slide-Over Panel Component ---
const SlideOverPanel = ({ title, isOpen, onClose, children }: { title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    return (
        <div className={clsx("fixed inset-0 z-50 transition-all duration-300", { "pointer-events-none": !isOpen })}>
            {/* Backdrop */}
            <div className={clsx("absolute inset-0 bg-black bg-opacity-50 transition-opacity", { "opacity-100": isOpen, "opacity-0": !isOpen })} onClick={onClose}></div>
            
            {/* Panel */}
            <div className={clsx("absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300", { "translate-x-0": isOpen, "translate-x-full": !isOpen })}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                                <Icons.close className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
export default function CreateOrderPage() {
    const [openPanel, setOpenPanel] = useState<'addcustomer' | 'customer' | 'product' | 'discount' | 'shipping' | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setOpenPanel(null);
    };
    
    const handleProductSelection = (product: Product) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id); // Deselect
            } else {
                return [...prev, { ...product, quantity: 1 }]; // Select with default quantity
            }
        });
    };

    const updateQuantity = (productId: number, amount: number) => {
        setSelectedProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, quantity: Math.max(1, p.quantity + amount) } : p
            ).filter(p => p.quantity > 0)
        );
    };

    const removeProduct = (productId: number) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    const subtotal = useMemo(() => {
        return selectedProducts.reduce((acc, product) => {
            const price = parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
            return acc + price * product.quantity;
        }, 0);
    }, [selectedProducts]);

    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">
                {/* <!-- Page Header --> */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/orders" className="flex items-center text-md text-gray-500 hover:text-purple-600 mb-2 w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Back to Orders
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Create Orders</h1>
                    </div>
                    <button className="bg-white border border-gray-300 text-gray-800 px-6 py-3 cursor-pointer font-medium rounded-sm  hover:bg-gray-50 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
                        <span>Watch Tutorial</span>
                    </button>
                </div>

                {/* Form Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {/* Customer Selection */}
                        <div>
                            <button type="button" onClick={() => setOpenPanel('customer')} className="w-full flex justify-between items-center text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                {selectedCustomer ? (
                                    <div>
                                        <p className="font-medium">{selectedCustomer.name}</p>
                                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">Select a customer</span>
                                )}
                                <Icons.chevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                            </button>

                            
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                            <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                                {selectedProducts.length > 0 ? (
                                    selectedProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" />
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.price}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button type="button" onClick={() => updateQuantity(product.id, -1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
                                                <span>{product.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(product.id, 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">+</button>
                                                <button type="button" onClick={() => removeProduct(product.id)} className="text-red-500 hover:text-red-700 ml-2"><Icons.expenses className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No products selected</p>
                                )}
                                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                                    <p className="font-medium">Subtotal</p>
                                    <p className="font-semibold text-lg">₦{subtotal.toLocaleString()}</p>
                                </div>
                                <button type="button" onClick={() => setOpenPanel('product')} className="w-full mt-4 border-2 border-dashed border-gray-300 text-gray-500 px-4 py-2 rounded-lg hover:border-purple-500 hover:text-purple-500">
                                    + Add Products
                                </button>
                            </div>
                        </div>

                        {/* Discount & Shipping */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                                <button type="button" onClick={() => setOpenPanel('discount')} className="w-full text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <span className="text-gray-500">Add Discount</span>
                                </button>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping</label>
                                <button type="button" onClick={() => setOpenPanel('shipping')} className="w-full text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <span className="text-gray-500">Add Shipping Details</span>
                                </button>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
                            <div className="flex items-center gap-x-6 mb-4">
                                {(['Unpaid', 'Partially Paid', 'Paid'] as PaymentStatus[]).map(status => (
                                    <div key={status} className="flex items-center">
                                        <input id={status} name="payment-option" type="radio" checked={paymentStatus === status} onChange={() => setPaymentStatus(status)} className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500" />
                                        <label htmlFor={status} className="ml-2 block text-sm text-gray-900">{status}</label>
                                    </div>
                                ))}
                            </div>
                            {paymentStatus !== 'Unpaid' && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₦)</label>
                                        <input type="text" id="amountPaid" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                    </div>
                                    <div>
                                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                        <input type="text" id="paymentMethod" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                            <textarea id="notes" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2"></textarea>
                        </div>

                         <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 font-medium rounded-sm hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="btn-secondary text-white  font-medium  px-6 py-3 rounded-sm shadow-lg">Save Order</button>
                        </div>
                    </div>
                </div>
            </div>
            

            {/* Customer Slide-Over */}
            <SlideOverPanel title="Select a Customer" isOpen={openPanel === 'customer'} onClose={() => setOpenPanel(null)}>
                <div className="space-y-3">
                    {allCustomers.map(customer => (
                        <div key={customer.id} onClick={() => handleSelectCustomer(customer)} className="p-4 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center space-x-4 border border-transparent hover:border-gray-200">
                             <input type="radio" name="customer-selection" checked={selectedCustomer?.id === customer.id} readOnly className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500" />
                            <div>
                                <p className="font-semibold">{customer.name}</p>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </SlideOverPanel>

            {/* Product Slide-Over */}
            <SlideOverPanel title="Select Products" isOpen={openPanel === 'product'} onClose={() => setOpenPanel(null)}>
                 <div className="space-y-3">
                    {allProducts.map(product => (
                        <div key={product.id} onClick={() => handleProductSelection(product)} className="p-4 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center space-x-4 border border-transparent hover:border-gray-200">
                            <input type="checkbox" checked={selectedProducts.some(p => p.id === product.id)} readOnly className="h-4 w-4 text-purple-600 border-gray-300 rounded-lg focus:ring-purple-500" />
                            <Image src={product.image} alt={product.name} width={48} height={48} className="rounded-md" />
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </SlideOverPanel>
            
            {/* Discount Slide-Over */}
            <SlideOverPanel title="Add Discount" isOpen={openPanel === 'discount'} onClose={() => setOpenPanel(null)}>
                {/* Discount form fields would go here */}
                <p>Discount form fields will be here.</p>
            </SlideOverPanel>

            {/* Shipping Slide-Over */}
            <SlideOverPanel title="Add Shipping" isOpen={openPanel === 'shipping'} onClose={() => setOpenPanel(null)}>
                {/* Shipping form fields would go here */}
                <p>Shipping form fields will be here.</p>
            </SlideOverPanel>
        </DashboardLayout>
    );
}
