'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    CreditCard, Landmark, Wallet, CheckCircle, PlusCircle, Power, PowerOff, Banknote, Edit,
    X
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type GatewayStatus = 'Connected' | 'Not Connected';
type BankAccount = {
    bankName: string;
    accountNumber: string;
    accountName: string;
};

// --- MOCK DATA ---
const initialBankAccount: BankAccount | null = {
    bankName: 'Guaranty Trust Bank',
    accountNumber: '**** **** 6789',
    accountName: 'Adeyemi Adeshina'
};

// --- MOCK DATA ---
const initialPaymentGateways = [
    { 
        name: 'Paystack', 
        description: 'Accept card, bank, and USSD payments directly on your site.', 
        logo: 'https://placehold.co/100x40/011B33/FFFFFF?text=Paystack',
        status: 'Connected' as GatewayStatus
    },
    { 
        name: 'Flutterwave', 
        description: 'Enable a wide range of local and international payment options.', 
        logo: 'https://placehold.co/100x40/FB923C/FFFFFF?text=Flutterwave',
        status: 'Not Connected' as GatewayStatus
    },
];

const initialManualMethods = [
    {
        name: 'Direct Bank Transfer',
        description: 'Provide your bank details for customers to pay you directly.',
        enabled: true,
        details: "GTBank - 0123456789" // Example bank details
    },
    {
        name: 'Pay on Delivery',
        description: 'Accept cash or transfer on delivery. Ideal for local orders.',
        enabled: false,
        details: null
    }
];

// --- REUSABLE MODAL COMPONENT ---
const AddBankAccountModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (account: BankAccount) => void; }) => {
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        // Basic validation
        if (!bankName || !accountNumber || !accountName) {
            alert('Please fill all fields.');
            return;
        }
        onSave({ bankName, accountNumber, accountName });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Bank Account Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <select id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">Select a bank...</option>
                            <option>Guaranty Trust Bank (GTB)</option>
                            <option>Access Bank</option>
                            <option>Zenith Bank</option>
                            <option>United Bank for Africa (UBA)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input type="text" id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
                        <input type="text" id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Save Account</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function PaymentMethodsPage() {
    const [paymentGateways, setPaymentGateways] = useState(initialPaymentGateways);
    const [manualMethods, setManualMethods] = useState(initialManualMethods);

    const [bankAccount, setBankAccount] = useState<BankAccount | null>(initialBankAccount);
        const [isModalOpen, setIsModalOpen] = useState(false);
    
        const handleSaveAccount = (account: BankAccount) => {
            // In a real app, you'd make an API call here to save the details securely
            setBankAccount({
                ...account,
                accountNumber: `**** **** ${account.accountNumber.slice(-4)}` // Mask the number for display
            });
            setIsModalOpen(false);
        };

    const handleToggleGateway = (name: string) => {
        setPaymentGateways(gateways => 
            gateways.map(gw => 
                gw.name === name 
                ? { ...gw, status: gw.status === 'Connected' ? 'Not Connected' : 'Connected' } 
                : gw
            )
        );
    };

    const handleToggleManual = (name: string) => {
        setManualMethods(methods =>
            methods.map(method =>
                method.name === name
                ? { ...method, enabled: !method.enabled }
                : method
            )
        );
    };
    
    return (
        <DashboardLayout>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
                <p className="mt-1 text-gray-500">Configure how you receive payments from your customers and clients.</p>
            </header>

            <div className="space-y-8">
                {/* Online Payment Gateways Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Online Payment Gateways</h2>
                    <p className="text-sm text-gray-500 mb-6">Connect a gateway to automate payments on your website and invoices.</p>
                    
                    <div className="space-y-4">
                        {paymentGateways.map(gateway => (
                            <div key={gateway.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center">
                                    <img src={gateway.logo} alt={`${gateway.name} logo`} className="h-10 w-24 object-contain mr-6" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x40/cccccc/333333?text=Logo'; }} />
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-gray-800">{gateway.name}</p>
                                            {gateway.status === 'Connected' && (
                                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-1.5"/>
                                                    Connected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{gateway.description}</p>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex items-center space-x-3 flex-shrink-0">
                                    {gateway.status === 'Connected' ? (
                                        <button onClick={() => handleToggleGateway(gateway.name)} className="text-sm font-semibold text-red-600 hover:text-red-800">Disconnect</button>
                                    ) : (
                                        <button onClick={() => handleToggleGateway(gateway.name)} className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                                            <PlusCircle className="w-4 h-4 mr-2"/>
                                            <span>Connect</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Manual Payment Methods Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Manual Payment Methods</h2>
                    <p className="text-sm text-gray-500 mb-6">For payments made outside the Ervop platform (e.g., cash, direct transfer).</p>

                     <div className="space-y-4">
                        {manualMethods.map(method => (
                            <div key={method.name} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-gray-800">{method.name}</p>
                                            <span className={clsx(
                                                "text-xs font-semibold px-2 py-1 rounded-full",
                                                method.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {method.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                                    </div>
                                    <div className="mt-4 sm:mt-0">
                                         <button onClick={() => handleToggleManual(method.name)} className={clsx(
                                             "font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm",
                                             method.enabled 
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                         )}>
                                            {method.enabled ? <PowerOff className="w-4 h-4 mr-2"/> : <Power className="w-4 h-4 mr-2"/>}
                                            <span>{method.enabled ? 'Disable' : 'Enable'}</span>
                                        </button>
                                    </div>
                                </div>
                                {method.name === 'Direct Bank Transfer' && method.enabled && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        {method.details ? (
                                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                                <div className="flex items-center">
                                                    <Banknote className="w-5 h-5 text-gray-500 mr-3"/>
                                                    <p className="text-sm font-medium text-gray-700">{method.details}</p>
                                                </div>
                                                <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
                                                    <Edit className="w-3 h-3 mr-1.5"/>
                                                    Edit
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">
                                                <PlusCircle className="w-4 h-4 mr-2"/>
                                                <span>Add Bank Details</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <AddBankAccountModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAccount}
            />
        </DashboardLayout>
    );
}
