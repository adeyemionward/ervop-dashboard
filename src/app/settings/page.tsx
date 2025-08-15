'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    User, Building, Bell, Globe, Lock, Trash2, Package
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type SettingsTab = 'profile' | 'business' | 'products' | 'notifications' | 'account';

// --- MAIN PAGE COMPONENT ---
export default function GeneralSettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    const settingsNav = [
        { id: 'profile', title: 'My Profile', icon: User },
        { id: 'business', title: 'Business Profile', icon: Building },
        { id: 'products', title: 'Products & Inventory', icon: Package },
        { id: 'notifications', title: 'Notifications', icon: Bell },
        { id: 'account', title: 'Account', icon: Lock },
    ];

    return (
        <DashboardLayout>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
                <p className="mt-1 text-gray-500">Manage your account, business profile, and notification preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                
                {/* Left Column: Settings Navigation */}
                <aside className="lg:col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <nav className="space-y-1">
                        {settingsNav.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id as SettingsTab)}
                                className={clsx(
                                    "w-full flex items-center px-4 py-2 rounded-lg text-left font-medium text-sm transition-colors",
                                    activeTab === item.id 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.title}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Right Column: Settings Content */}
                <main className="lg:col-span-3">
                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">My Profile</h2>
                            <form className="space-y-6 max-w-lg">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" id="fullName" defaultValue="Adeyemi Adeshina" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" id="email" defaultValue="adeyemi@ervop.com" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input type="tel" id="phone" defaultValue="08012345678" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div className="pt-4 border-t">
                                    <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Business Profile Settings */}
                    {activeTab === 'business' && (
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Business Profile</h2>
                            <form className="space-y-6 max-w-lg">
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                                    <input type="text" id="businessName" defaultValue="Adeyemi's Designs" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="ervopUrl" className="block text-sm font-medium text-gray-700">Your Ervop URL</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" id="ervopUrl" defaultValue="adeyemi-designs" className="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">.ervop.com</span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                                    <select id="currency" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option>NGN - Nigerian Naira</option>
                                        <option>USD - US Dollar</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t">
                                    <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Products & Inventory Settings */}
                    {activeTab === 'products' && (
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Products & Inventory</h2>
                            <form className="space-y-8 max-w-lg">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Inventory Settings</h3>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">Allow Overselling</p>
                                                <p className="text-sm text-gray-500">Continue selling products even when they are out of stock.</p>
                                            </div>
                                            <button type="button" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200">
                                                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"/>
                                            </button>
                                        </div>
                                        <div>
                                            <label htmlFor="stock-threshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                                            <p className="text-sm text-gray-500 mb-2">Define what "low stock" means for your inventory status badges.</p>
                                            <input type="number" id="stock-threshold" defaultValue="10" className="mt-1 block w-24 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t pt-8">
                                    <h3 className="text-lg font-semibold text-gray-800">Storefront Settings</h3>
                                    <div className="mt-4 space-y-6">
                                        <div>
                                            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700">Default Product Sort Order</label>
                                            <select id="sort-order" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                                <option>Newest First</option>
                                                <option>Oldest First</option>
                                                <option>Price: Low to High</option>
                                                <option>Price: High to Low</option>
                                            </select>
                                        </div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">Auto-hide Out of Stock</p>
                                                <p className="text-sm text-gray-500">Automatically hide products from your storefront when they sell out.</p>
                                            </div>
                                            <button type="button" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-blue-600">
                                                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"/>
                                            </button>
                                        </div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">Show Out of Stock Items</p>
                                                <p className="text-sm text-gray-500">When this is activated, your customers will be able to see out of stock items on your website.</p>
                                            </div>
                                            <button type="button" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200">
                                                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
                            <div className="space-y-6 max-w-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800">New Order</p>
                                        <p className="text-sm text-gray-500">Get an email when a customer places a new order.</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-blue-600">
                                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"/>
                                    </button>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800">New Appointment</p>
                                        <p className="text-sm text-gray-500">Get an email when a client books a new appointment.</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-blue-600">
                                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"/>
                                    </button>
                                </div>
                                <div className="flex items-start justify-between border-t pt-6">
                                    <div>
                                        <p className="font-medium text-gray-800">Low Stock Alerts</p>
                                        <p className="text-sm text-gray-500">Get an email when a product's stock falls below your threshold.</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-blue-600">
                                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"/>
                                    </button>
                                </div>
                                <div className="flex items-start justify-between border-t pt-6">
                                    <div>
                                        <p className="font-medium text-gray-800">Weekly Summary</p>
                                        <p className="text-sm text-gray-500">Receive a summary of your business performance every Monday.</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200">
                                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Account</h2>
                            <div className="space-y-6 max-w-lg">
                                <div>
                                    <h3 className="font-medium text-gray-800">Change Password</h3>
                                    <button className="mt-2 text-sm font-semibold text-blue-600 hover:underline">Send password reset link</button>
                                </div>
                                <div className="border-t pt-6 border-red-200">
                                    <h3 className="font-medium text-red-700">Danger Zone</h3>
                                    <p className="text-sm text-gray-500 mt-1">These actions are permanent and cannot be undone.</p>
                                    <button className="mt-4 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                                        <Trash2 className="w-4 h-4 mr-2"/>
                                        <span>Delete My Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </DashboardLayout>
    );
}
