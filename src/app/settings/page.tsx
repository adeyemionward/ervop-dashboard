'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { 
    User, Building, Bell, Lock, Trash2, Package,Eye, EyeOff
} from 'lucide-react';
import clsx from 'clsx';

import Select from "react-select";
import { countryOptions, customStyles } from "@/components/CountryOptions";
import { industryOptions, customStyles as industryStyles } from "@/components/IndustryOptions";
import { currencyOptions, customStyles as currencyStyles } from "@/components/CurrencyOptions";

// --- TYPE DEFINITIONS ---
type SettingsTab = 'profile' | 'business' | 'business_logo' | 'business_location' | 'notifications' | 'password' | 'account';
type NotificationTab = "general" | "payments" | "reviews" | "reports";
type OptionType = { value: string; label: string };

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`${
      enabled ? "bg-purple-600" : "bg-gray-200"
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={`${
        enabled ? "translate-x-5" : "translate-x-0"
      } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

// --- MAIN PAGE COMPONENT ---
export default function GeneralSettingsPage() {
  const [selectedCountry, setSelectedCountry] = useState<OptionType | null>(null);

  const [industry, setIndustry] = useState(''); // New state for industry
  const [currency, setCurrency] = useState(''); // New state for industry

 
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [notificationTab, setNotificationTab] = useState<NotificationTab>("general");
  const [toggles, setToggles] = useState({
    newAppointment: true,
    paymentReminder: true,
    projectReview: true,
    reviewAppearance: false,
    weeklySummary: false,
  });

  const settingsNav = [
    { id: 'profile', title: 'My Profile', icon: User },
    { id: 'business', title: 'Business Profile', icon: Building },
    { id: 'business_logo', title: 'Business Logo', icon: Building },
    { id: 'business_location', title: 'Business Location', icon: Building },
    // { id: 'products', title: 'Products & Inventory', icon: Package },
    { id: 'notifications', title: 'Notifications', icon: Bell },
    { id: 'password', title: 'Change Password', icon: Bell },
    { id: 'account', title: 'Account', icon: Lock },
  ];

   const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
                    ? 'bg-purple-100 text-purple-700' 
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
                    {activeTab === 'profile' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h2>
                            
                            <form>
                                {/* Full Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                        First Name
                                        </label>
                                        <input
                                        type="text"
                                        id="firstName"
                                        defaultValue="Adeyemi"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                        Last Name
                                        </label>
                                        <input
                                        type="text"
                                        id="lastName"
                                        defaultValue="Adeshina"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Email */}
                                    <div>
                                        <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                        Email Address
                                        </label>
                                        <input
                                        type="email"
                                        id="email"
                                        defaultValue="adeyemi@ervop.com"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                        Phone Number
                                        </label>
                                        <input
                                        type="tel"
                                        id="phone"
                                        defaultValue="08012345678"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="col-span-2 flex justify-end pt-6 border-t">
                                <button 
                                    type="submit" 
                                    className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
                                >
                                    Save Changes
                                </button>
                                </div>
                            </form>
                        </div>

                    )}

                    {/* Business Profile Settings */}
                    {activeTab === 'business' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Business Profile</h2>

                            <form>
                            {/* Business Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name
                                    </label>
                                    <input
                                    type="text"
                                    id="businessName"
                                    defaultValue="Adeyemi's Designs"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Ervop URL */}
                                <div>
                                    <label htmlFor="ervopUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Ervop URL
                                    </label>
                                    <div className="flex rounded-lg shadow-sm">
                                    <input
                                        type="text"
                                        id="ervopUrl"
                                        defaultValue="adeyemi-designs" 
                                        className="flex-1 min-w-0 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        .ervop.com
                                    </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                    This is your unique business URL on Ervop.
                                    </p>
                                </div>
                            </div>
                           

                            {/* Currency */}
                            <div className="grid grid-cols-1 mt-4 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                            Industry
                                            </label>
                                            <Select
                                                id="industry"
                                                name="industry"
                                                value={industryOptions.find((opt) => opt.value === industry) || null}
                                                onChange={(selectedOption) => setIndustry(selectedOption?.value || "")}
                                                options={industryOptions}
                                                styles={industryStyles}
                                                placeholder="Select an industry"
                                                isClearable
                                            />
                                </div>

                                {/* Industry */}
                                <div>
                                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                                    Default Currency
                                    </label>
                                    <Select
                                        id="currency"
                                        name="currency"
                                        value={currencyOptions.find((opt) => opt.value === currency) || null}
                                        onChange={(selectedOption) => setCurrency(selectedOption?.value || "")}
                                        options={currencyOptions}
                                        styles={currencyStyles}
                                        placeholder="Select a currency"
                                        isClearable
                                    />
                                </div>
                            </div>

                            {/* Business Description */}
                            <div className="col-span-2 mt-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Business Description
                                </label>
                                <textarea
                                id="description"
                                rows={3}
                                placeholder="Briefly describe your business..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                            </div>


                            {/* Save Button */}
                            <div className="col-span-2 flex justify-end pt-6 border-t">
                                <button
                                type="submit"
                                className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
                                >
                                Save Changes
                                </button>
                            </div>
                            </form>
                        </div>
                    )}

                     {activeTab === 'business_logo' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Business Logo</h2>

                            <form>
        
                                {/* Profile Picture Upload */}
                                <div className="col-span-2">
                                <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-2">Select a Business Logo</label>
                                <input 
                                    type="file" 
                                    id="profilePic" 
                                    accept="image/*" 
                                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100"
                                />
                                </div>

                                {/* Save Button */}
                                <div className="col-span-2 flex justify-end pt-6 border-t">
                                    <button
                                    type="submit"
                                    className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
                                    >
                                    Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}


                    {/* Business Profile Settings */}
                    {activeTab === 'business_location' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Business Location</h2>

                            <form >
                            
                                <div  className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Country */}
                                        
                                        <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Country
                                        </label>
                                        <Select
                                            options={countryOptions}
                                            value={selectedCountry}
                                            onChange={(newValue) => setSelectedCountry(newValue)} // works now
                                            placeholder="Search and select a country..."
                                            className="text-sm"
                                                    styles={customStyles}
                                        />
                                        </div>

                                    {/* Industry */}
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                        </label>
                                        <input
                                        type="text"
                                        id="city"
                                        placeholder="e.g., Lagos"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                </div>

                                {/* Address */}
                                <div className="col-span-2 mt-4">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        placeholder="Enter your business address"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    ></textarea>
                                </div>

                                {/* Save Button */}
                                <div className="col-span-2 flex justify-end pt-6 border-t">
                                    <button
                                    type="submit"
                                    className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
                                    >
                                    Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Products & Inventory Settings */}
                    {/* {activeTab === 'products' && (
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
                                            <input type="number" id="stock-threshold" defaultValue="10" className="mt-1 block w-24 border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t pt-8">
                                    <h3 className="text-lg font-semibold text-gray-800">Storefront Settings</h3>
                                    <div className="mt-4 space-y-6">
                                        <div>
                                            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700">Default Product Sort Order</label>
                                            <select id="sort-order" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
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
                                            <button type="button" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-purple-600">
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
                                    <button type="submit" className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )} */}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav
                                className="-mb-px flex space-x-8 overflow-x-auto whitespace-nowrap px-2 scrollbar-hide"
                                aria-label="Tabs"
                            >
                                {["general", "payments", "reviews", "reports"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setNotificationTab(tab as NotificationTab)}
                                    className={`inline-block pb-2 px-4 border-b-2 text-sm font-medium capitalize ${
                                    notificationTab === tab
                                        ? "border-purple-600 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab}
                                </button>
                                ))}
                            </nav>
                        </div>



                        {/* Tab Content */}
                        <div className="space-y-6 max-w-lg">
                            {notificationTab === "general" && (
                            <div className="flex items-start justify-between">
                                <div>
                                <p className="font-medium text-gray-800">New Appointment</p>
                                <p className="text-sm text-gray-500">
                                    Get an email when a client books a new appointment.
                                </p>
                                </div>
                                <ToggleSwitch
                                enabled={toggles.newAppointment}
                                onToggle={() => handleToggle("newAppointment")}
                                />
                            </div>
                            )}

                            {notificationTab === "payments" && (
                            <div className="flex items-start justify-between">
                                <div>
                                <p className="font-medium text-gray-800">Payment Reminder</p>
                                <p className="text-sm text-gray-500">
                                    Send reminders for unpaid invoices before and on the due date.
                                </p>
                                </div>
                                <ToggleSwitch
                                enabled={toggles.paymentReminder}
                                onToggle={() => handleToggle("paymentReminder")}
                                />
                            </div>
                            )}

                            {notificationTab === "reviews" && (
                            <>
                                <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">Project Review</p>
                                    <p className="text-sm text-gray-500">
                                    Client should review project/work after completion.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    enabled={toggles.projectReview}
                                    onToggle={() => handleToggle("projectReview")}
                                />
                                </div>

                                <div className="flex items-start justify-between border-t pt-6">
                                <div>
                                    <p className="font-medium text-gray-800">Review Appearance</p>
                                    <p className="text-sm text-gray-500">
                                    Reviews should automatically appear on your website.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    enabled={toggles.reviewAppearance}
                                    onToggle={() => handleToggle("reviewAppearance")}
                                />
                                </div>
                            </>
                            )}

                            {notificationTab === "reports" && (
                            <div className="flex items-start justify-between">
                                <div>
                                <p className="font-medium text-gray-800">Weekly Summary</p>
                                <p className="text-sm text-gray-500">
                                    Receive a summary of your business performance every Monday.
                                </p>
                                </div>
                                <ToggleSwitch
                                enabled={toggles.weeklySummary}
                                onToggle={() => handleToggle("weeklySummary")}
                                />
                            </div>
                            )}
                        </div>
                        </div>
                    )}


                    {/* Password Settings */}
                    {activeTab === 'password' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Current Password</label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                id="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                id="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Save Button */}
                                <div className="col-span-2 flex justify-end pt-6 border-t">
                                    <button 
                                        type="submit" 
                                        className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                        </div>
                    )}

                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Account</h2>
                            <div className="space-y-6 max-w-lg">
                                
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

          {/* Keep other sections (profile, business, products, account) as they are... */}
        </main>
      </div>
    </DashboardLayout>
  );
}
