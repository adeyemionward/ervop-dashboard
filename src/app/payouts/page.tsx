'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { 
    Landmark, Edit, PlusCircle,  Download, X
} from 'lucide-react';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
type PayoutStatus = 'Completed' | 'Pending' | 'Failed';
type BankAccount = {
    bankName: string;
    accountNumber: string;
    accountName: string;
};
type Payout = {
    id: string;
    date: string;
    amount: number;
    status: PayoutStatus;
};

// --- MOCK DATA ---
const initialBankAccount: BankAccount | null = {
    bankName: 'Guaranty Trust Bank',
    accountNumber: '**** **** 6789',
    accountName: 'Adeyemi Adeshina'
};

const payoutHistory: Payout[] = [
    { id: 'PAY-07-2025', date: 'July 20, 2025', amount: 250000, status: 'Completed' },
    { id: 'PAY-06-2025', date: 'June 20, 2025', amount: 185500, status: 'Completed' },
    { id: 'PAY-05-2025', date: 'May 20, 2025', amount: 320000, status: 'Completed' },
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
export default function PayoutsPage() {
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

    return (
        <DashboardLayout>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payouts & Settlements</h1>
                <p className="mt-1 text-gray-500">Manage your payout bank account and view your settlement history.</p>
            </header>

            <div className="space-y-8">
                {/* Payout Account Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Payout Account</h2>
                    {bankAccount ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full mr-4">
                                    <Landmark className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{bankAccount.bankName}</p>
                                    <p className="text-sm text-gray-500">{bankAccount.accountName} - {bankAccount.accountNumber}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <button onClick={() => setIsModalOpen(true)} className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                                    <Edit className="w-4 h-4 mr-2"/>
                                    <span>Change</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center border-2 border-dashed border-gray-300 p-8 rounded-lg">
                            <p className="text-gray-500 mb-4">You have not added a bank account for payouts yet.</p>
                            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm mx-auto">
                                <PlusCircle className="w-4 h-4 mr-2"/>
                                <span>Add Bank Account</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Payout History Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Payout History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Payout ID</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Amount</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payoutHistory.map(payout => (
                                    <tr key={payout.id}>
                                        <td className="px-4 py-3 font-medium text-gray-800">{payout.id}</td>
                                        <td className="px-4 py-3 text-gray-600">{payout.date}</td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">₦{payout.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={clsx("text-xs font-semibold px-2 py-1 rounded-full",
                                                payout.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                payout.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            )}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <a href="#" className="text-blue-600 hover:text-blue-800">
                                                <Download className="w-5 h-5 inline-block" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
