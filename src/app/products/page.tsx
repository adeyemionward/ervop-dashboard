'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { Package, CheckCircle, XCircle, DollarSign, Search, Edit, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { Icons } from "@/components/icons";
import { useGoBack } from '@/hooks/useGoBack';
import HeaderTitleCard from '@/components/HeaderTitleCard';

// --- TYPE DEFINITIONS ---
type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type Product = {
    id: number;
    image: string;
    name: string;
    stock: number;
    status: ProductStatus;
    published: boolean;
    price: string;
    cost: string;
    selling: string;
};

// --- REUSABLE COMPONENTS (REDESIGNED) ---

const StatCard = ({ title, value, icon: Icon, iconBgColor, iconColor }: { title: string; value: string; icon: React.ElementType; iconBgColor: string; iconColor: string; }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center space-x-4">
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

const PublishedBadge = ({ isPublished }: { isPublished: boolean }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = isPublished
        ? "bg-blue-100 text-blue-800"
        : "bg-gray-100 text-gray-700";
    return <span className={clsx(baseClasses, statusClasses)}>{isPublished ? 'Published' : 'Draft'}</span>;
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; productName: string; }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-5">Delete Product</h3>
                    <div className="mt-2 px-4 py-3">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete {productName}? This action cannot be undone.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center gap-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DUMMY DATA ---
const allProducts: Product[] = [
    { id: 1, image: "https://placehold.co/80x80/e9d5ff/4c1d95?text=Gown", name: "Luxury Beaded Gown", stock: 120, status: "In Stock", published: true, price: "₦75,000", cost: "₦45,000", selling: "₦30,000" },
    { id: 2, image: "https://placehold.co/80x80/fef9c3/b45309?text=Bag", name: "Handcrafted Leather Bag", stock: 15, status: "Low Stock", published: true, price: "₦25,000", cost: "₦18,000", selling: "₦7,000" },
    { id: 3, image: "https://placehold.co/80x80/fee2e2/b91c1c?text=Aso-Oke", name: "Aso-Oke Head Tie", stock: 0, status: "Out of Stock", published: false, price: "₦15,000", cost: "₦10,000", selling: "₦5,000" },
    { id: 4, image: "https://placehold.co/80x80/dcfce7/166534?text=Fabric", name: "Ankara Print Fabric", stock: 250, status: "In Stock", published: true, price: "₦12,000", cost: "₦8,000", selling: "₦4,000" },
    { id: 5, image: "https://placehold.co/80x80/e0f2fe/0891b2?text=Agbada", name: "Men's Agbada Set", stock: 50, status: "In Stock", published: false, price: "₦90,000", cost: "₦60,000", selling: "₦30,000" },
];

const ITEMS_PER_PAGE = 5;

// --- MAIN PAGE COMPONENT ---
export default function ProductsPage() {
    const [products, setProducts] = useState(allProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [publishedFilter, setPublishedFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('All');
        setPublishedFilter('All');
        setCurrentPage(1);
    };

    const openDeleteModal = (product: { id: number; name: string }) => {
        setProductToDelete(product);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setProductToDelete(null);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
            closeDeleteModal();
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const searchMatch = searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            const statusMatch = statusFilter !== 'All' ? p.status === statusFilter : true;
            const publishedMatch = publishedFilter !== 'All' ? (publishedFilter === 'Published' ? p.published : !p.published) : true;
            return searchMatch && statusMatch && publishedMatch;
        });
    }, [products, searchTerm, statusFilter, publishedFilter]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const handleGoBack = useGoBack();
    return (
        <DashboardLayout>
            <HeaderTitleCard onGoBack={handleGoBack} title="Products" description="Manage your inventory and product catalog.">
                <div className="flex flex-col md:flex-row gap-2">
                    <Link href="products/new" className="btn-primary flex items-center justify-center">
                        <Icons.plus /> 
                        <span>Add New Product</span>
                    </Link>
                </div>
            </HeaderTitleCard>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Products" value={products.length.toString()} icon={Package} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                <StatCard title="Published" value={products.filter(p => p.published).length.toString()} icon={CheckCircle} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                <StatCard title="Out of Stock" value={products.filter(p => p.status === 'Out of Stock').length.toString()} icon={XCircle} iconBgColor="bg-red-100" iconColor="text-red-600" />
                <StatCard title="Total Revenue" value="₦15.4M" icon={DollarSign} iconBgColor="bg-green-100" iconColor="text-green-600" />
            </section>

            <section className="mb-4 p-4 bg-white rounded-xl border border-gray-200 flex flex-wrap items-center gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="All">All Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                </select>
                <select value={publishedFilter} onChange={(e) => { setPublishedFilter(e.target.value); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="All">All Publishing</option>
                    <option value="Published">Published</option>
                    <option value="Unpublished">Unpublished</option>
                </select>
                <div className="flex-grow"></div>
                <button onClick={handleClearFilters} className="text-sm text-gray-600 hover:text-blue-600 p-2 font-medium">Clear Filters</button>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /></th>
                                <th scope="col" className="px-6 py-3">Product</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Published</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedProducts.map((product) => (
                                <tr key={product.id} className="bg-white hover:bg-gray-50">
                                    <td className="w-4 p-4"><input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={product.image} alt={product.name} width={40} height={40} className="rounded-md" onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/e2e8f0/4a5568?text=Img'; }} />
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                                    <td className="px-6 py-4"><PublishedBadge isPublished={product.published} /></td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.price}</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                                        <Link href={`/products/edit/${product.id}`} className="text-gray-500 hover:text-blue-600">
                                            <Edit className="w-5 h-5"/>
                                        </Link>
                                        <button onClick={() => openDeleteModal(product)} className="text-gray-500 hover:text-red-600">
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{Math.min(1 + (currentPage - 1) * ITEMS_PER_PAGE, filteredProducts.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="font-semibold">{filteredProducts.length}</span> Results
                    </span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            </section>

            <DeleteConfirmationModal 
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                productName={productToDelete?.name || ''}
            />
        </DashboardLayout>
    );
}
