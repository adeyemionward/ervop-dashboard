'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout"; // Assuming a layout component
import Link from "next/link";
import { 
    ArrowLeft, Edit, Trash2, CheckCircle, XCircle, DollarSign, Package, 
    TrendingUp, ShoppingCart, History, Plus, Check, Save, Share2
} from 'lucide-react';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type Product = {
    id: number;
    image: string;
    name: string;
    description: string;
    stock: number;
    status: ProductStatus;
    published: boolean;
    price: number;
    sku: string;
};
type InventoryEvent = {
    id: number;
    date: string;
    type: 'Initial Stock' | 'Sale' | 'Restock' | 'Return';
    change: number;
    balance: number;
};
type OrderHistory = {
    id: string;
    customerName: string;
    date: string;
    amount: number;
    status: 'Delivered' | 'Processing' | 'Cancelled';
};

// --- MOCK DATA ---
const productData: Product = {
    id: 2,
    image: "https://placehold.co/600x600/fef9c3/b45309?text=Bag",
    name: "Handcrafted Leather Bag",
    description: "A beautifully handcrafted genuine leather bag, perfect for daily use. Made with locally sourced materials in Lagos, Nigeria. Features a durable inner lining and a secure zip closure.",
    stock: 15,
    status: "Low Stock",
    published: true,
    price: 25000,
    sku: "HLB-002",
};

const inventoryHistory: InventoryEvent[] = [
    { id: 1, date: '2025-07-20', type: 'Sale', change: -1, balance: 15 },
    { id: 2, date: '2025-07-18', type: 'Sale', change: -2, balance: 16 },
    { id: 3, date: '2025-07-15', type: 'Restock', change: 10, balance: 18 },
    { id: 4, date: '2025-07-10', type: 'Initial Stock', change: 8, balance: 8 },
];

const orderHistory: OrderHistory[] = [
    { id: '#1024', customerName: 'Tunde Adebayo', date: '2025-07-20', amount: 25000, status: 'Delivered' },
    { id: '#1019', customerName: 'Chioma Nwosu', date: '2025-07-18', amount: 50000, status: 'Delivered' },
    { id: '#1012', customerName: 'Funke Ojo', date: '2025-07-15', amount: 25000, status: 'Cancelled' },
];


// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, iconBgColor, iconColor }: { title: string; value: string; icon: React.ElementType; iconBgColor: string; iconColor: string; }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center space-x-4">
        <div className={clsx("p-3 rounded-full", iconBgColor)}>
            <Icon className={clsx("h-6 w-6", iconColor)} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: ProductStatus }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        'In Stock': "bg-green-100 text-green-800",
        'Low Stock': "bg-yellow-100 text-yellow-800",
        'Out of Stock': "bg-red-100 text-red-800",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};

const OrderStatusBadge = ({ status }: { status: OrderHistory['status'] }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        'Delivered': "bg-green-100 text-green-800",
        'Processing': "bg-yellow-100 text-yellow-800",
        'Cancelled': "bg-red-100 text-red-800",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};

// --- MAIN PAGE COMPONENT ---
export default function ViewProductPage() {
    const [product, setProduct] = useState(productData);
    const [isPublished, setIsPublished] = useState(product.published);
    const [currentStock, setCurrentStock] = useState(product.stock);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const handleStockUpdate = () => {
        // In a real app, you'd make an API call here
        setProduct(prev => ({ ...prev, stock: currentStock }));
        console.log("Stock updated to:", currentStock);
    };

    const handleShareLink = () => {
        const productUrl = `https://yourstore.ervop.com/products/${product.id}`;
        navigator.clipboard.writeText(productUrl).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="mb-8">
                <Link href="/products" className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-4 w-fit transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Back to All Products</span>
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="mt-1 text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                        <button onClick={handleShareLink} className={clsx("bg-white text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors", isLinkCopied ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-100")}>
                            {isLinkCopied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                            <span>{isLinkCopied ? 'Link Copied!' : 'Share'}</span>
                        </button>
                        <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Delete</span>
                        </button>
                        <Link href={`/products/edit/${product.id}`}>
                            <button className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm">
                                <Edit className="w-4 h-4 mr-2" />
                                <span>Edit Product</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Overview Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Revenue" value="₦1.2M" icon={DollarSign} iconBgColor="bg-green-100" iconColor="text-green-600" />
                <StatCard title="Total Orders" value="48" icon={ShoppingCart} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                <StatCard title="Conversion Rate" value="3.4%" icon={TrendingUp} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Product Details */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <img src={product.image} alt={product.name} className="w-full rounded-lg aspect-square object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/e2e8f0/4a5568?text=Image'; }} />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                                <p className="text-3xl font-bold text-purple-600 mt-2">₦{product.price.toLocaleString()}</p>
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</h3>
                                <p className="mt-2 text-gray-600">{product.description}</p>
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {isPublished ? <CheckCircle className="w-5 h-5 text-green-500"/> : <XCircle className="w-5 h-5 text-red-500"/>}
                                        <span className="font-medium">{isPublished ? 'Published' : 'Draft'}</span>
                                    </div>
                                    <button onClick={() => setIsPublished(!isPublished)} className={clsx("relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2", isPublished ? 'bg-purple-600' : 'bg-gray-200')}>
                                        <span className={clsx("inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", isPublished ? 'translate-x-5' : 'translate-x-0')}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Inventory History */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
                        <StatusBadge status={product.status} />
                    </div>
                    <div className="space-y-4">
                        <label htmlFor="stock-quantity" className="text-sm font-medium text-gray-600">Available Stock:</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                id="stock-quantity"
                                type="number"
                                value={currentStock}
                                onChange={(e) => setCurrentStock(parseInt(e.target.value, 10))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-lg font-bold"
                            />
                             <button onClick={handleStockUpdate} className="bg-purple-700 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors">
                                <Save className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">History</h4>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {inventoryHistory.map(event => (
                                <div key={event.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-800">{event.type}</p>
                                        <p className="text-xs text-gray-400">{event.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={clsx("font-semibold", event.change > 0 ? "text-green-600" : "text-red-600")}>
                                            {event.change > 0 ? `+${event.change}` : event.change}
                                        </p>
                                        <p className="text-xs text-gray-500">Balance: {event.balance}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History Table */}
            <section className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-600">Order ID</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Amount</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orderHistory.map(order => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3 font-medium text-purple-600 hover:underline"><Link href={`/orders/${order.id}`}>{order.id}</Link></td>
                                    <td className="px-4 py-3 text-gray-800 font-medium">{order.customerName}</td>
                                    <td className="px-4 py-3 text-gray-600">{order.date}</td>
                                    <td className="px-4 py-3 text-gray-800">₦{order.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

        </DashboardLayout>
    );
}
