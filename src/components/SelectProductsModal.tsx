'use client';

import { useState } from 'react';
import { Icons } from './icons';
import Image from 'next/image';

// --- Type Definitions ---
type Product = { id: number; name: string; price: string; image: string; };

// --- Dummy Data (In a real app, you would fetch this) ---
const allProducts: Product[] = [
    { id: 1, name: 'Luxury Beaded Gown', price: '₦75,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P1' },
    { id: 2, name: 'Aso-Oke Head Tie', price: '₦15,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P2' },
    { id: 3, name: 'Handcrafted Leather Bag', price: '₦25,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P3' },
    { id: 4, name: 'Ankara Print Fabric', price: '₦12,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P4' },
    { id: 5, name: 'Men\'s Agbada Set', price: '₦90,000', image: 'https://placehold.co/80x80/dbb9fa/2c1045?text=P5' },
];

interface SelectProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProducts: (selected: Product[]) => void;
}

export default function SelectProductsModal({ isOpen, onClose, onAddProducts }: SelectProductsModalProps) {
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

    // Reset selection when modal is closed
    // useEffect(() => {
    //     if (!isOpen) {
    //         setSelectedProductIds([]);
    //     }
    // }, [isOpen]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProductIds(allProducts.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectProduct = (productId: number) => {
        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };


    const handleAddClick = () => {
        const selected = allProducts.filter(p => selectedProductIds.includes(p.id));
        onAddProducts(selected);
    };

    if (!isOpen) {
        return null;
    }

    const isAllSelected = selectedProductIds.length === allProducts.length && allProducts.length > 0;

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ height: '90vh', maxHeight: '700px' }}>
                {/* Modal Header */}
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">Select Products</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                            <Icons.close className="h-6 w-6 text-gray-600" />
                        </button>
                    </div>
                    <p className="text-gray-500 mb-6">Select the products you want to apply this discount to.</p>
                </div>

                {/* Search Bar & Select All */}
                <div className="flex-shrink-0 mb-4 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Icons.settings className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex items-center p-2 border-b">
                        <input
                            type="checkbox"
                            id="select-all-products"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="select-all-products" className="ml-3 font-medium text-gray-700">Select All</label>
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto -mx-8 px-8 py-2 space-y-3">
                    {allProducts.map(product => {
                        const isSelected = selectedProductIds.includes(product.id);
                        return (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product.id)}
                                className={`p-4 rounded-lg cursor-pointer flex items-center space-x-4 border ${
                                    isSelected ? 'bg-purple-50 border-purple-300' : 'hover:bg-gray-100 border-transparent hover:border-gray-200'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 pointer-events-none"
                                />
                                <Image src={product.image} alt={product.name} width={48} height={48} className="w-12 h-12 rounded-md object-cover" />
                                <div>
                                    <p className="font-semibold text-gray-800">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.price}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 pt-6 border-t">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-600">
                            {selectedProductIds.length} product(s) selected
                        </p>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="bg-white border border-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button
                                type="button"
                                onClick={handleAddClick}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={selectedProductIds.length === 0}
                            >
                                Add {selectedProductIds.length > 0 ? `${selectedProductIds.length} ` : ''}Product(s)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
