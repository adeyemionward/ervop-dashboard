'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { SVGProps, useState, useMemo, Children } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


import { X, FileText, Printer, Receipt } from 'lucide-react';
import clsx from 'clsx';

// --- TYPE DEFINITIONS (Should be in a separate /types folder) ---
type Transaction = {
  id: string;
  type: 'Product Sale' | 'Service Payment';
  reference: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  date: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Failed';
};

// --- COMPONENT 1: The Reusable Slide-Over Panel ---
// (In a real app, this would be in its own file: /components/TransactionSlideOver.tsx)

type TransactionSlideOverProps = {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
};

const TransactionSlideOver: React.FC<TransactionSlideOverProps> = ({ transaction, isOpen, onClose }) => {
  if (!transaction) return null;

  const isIncome = transaction.amount >= 0;

  return (
    <div className={clsx("fixed inset-0 overflow-hidden z-50", !isOpen && "hidden")}>
      {/* Backdrop with transition */}
      <div 
        onClick={onClose} 
        className={clsx(
          "absolute inset-0 bg-gray-500 transition-opacity",
          isOpen ? "opacity-75" : "opacity-0"
        )}
      ></div>
      
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className={clsx(
          "w-screen max-w-md transform transition ease-in-out duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <header className="p-6 bg-gray-50">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Details for {transaction.type}: {transaction.reference}</p>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <section className="pb-6">
                <p className="text-sm text-gray-500">Amount</p>
                <p className={clsx("text-4xl font-bold", isIncome ? "text-green-600" : "text-red-600")}>
                  {isIncome ? '+' : '-'} ₦{Math.abs(transaction.amount).toLocaleString()}
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-800">{transaction.customerName}</p>
                  <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </section>

              <section className="border-t border-gray-200 pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Transaction Info</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="text-gray-500">Transaction ID:</span> <span className="font-medium text-gray-800">{transaction.id}</span></p>
                    <p><span className="text-gray-500">Payment Method:</span> <span className="font-medium text-gray-800">{transaction.paymentMethod}</span></p>
                    <p><span className="text-gray-500">Status:</span> <span className="font-semibold text-green-700">{transaction.status}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Related To</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="text-gray-500">Customer:</span> <Link href="#" className="font-medium text-blue-600 hover:underline">{transaction.customerName}</Link></p>
                  </div>
                </div>
              </section>
              
              <section className="mt-8 border-t border-gray-200 pt-6">
                <Link href={`/orders/${transaction.reference}`} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
                  <FileText className="w-5 h-5 mr-3" />
                  <span>View Full Order Details ({transaction.reference})</span>
                </Link>
              </section>
            </div>

            {/* Footer */}
            <footer className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                <Printer className="w-4 h-4 mr-2" /><span>Print</span>
              </button>
              <button className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                <Receipt className="w-4 h-4 mr-2" /><span>Issue Refund</span>
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};


const StatCard = ({ title, value, icon: Icon, mainBg, iconBg, mainText, iconText }: { title: string; value: string; icon: (props: SVGProps<SVGSVGElement>) => JSX.Element; mainBg: string; iconBg: string; mainText: string; iconText: string; }) => (
    <div className={`${mainBg} p-8 rounded-lg shadow-sm flex items-center space-x-4`}>
        <div className={`${iconBg} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div>
            <p className={`text-sm font-medium ${mainText} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${mainText}`}>{value}</p>
        </div>
    </div>
);



export default function ProjectsPage() {
    const handleGoBack = useGoBack();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
        const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    
        const mockTransactions: Transaction[] = [
            { id: 'txn_1a2b3c4d5e', type: 'Product Sale', reference: '#1024', amount: 25000, customerName: 'Tunde Adebayo', customerEmail: 'tunde.a@example.com', date: 'July 22, 2025', paymentMethod: 'Paystack Card', status: 'Completed' },
            { id: 'txn_9f8g7h6i5j', type: 'Service Payment', reference: '#INV-056', amount: 150000, customerName: 'Chioma Nwosu', customerEmail: 'chioma.n@example.com', date: 'July 21, 2025', paymentMethod: 'Bank Transfer', status: 'Completed' },
        ];
    
        const handleViewTransaction = (transaction: Transaction) => {
            setSelectedTransaction(transaction);
            setIsPanelOpen(true);
        };
        const tx = 1;
    
        const handleClosePanel = () => {
            setIsPanelOpen(false);
            setTimeout(() => setSelectedTransaction(null), 300); // Clear data after transition
        };

    return (
        <DashboardLayout>
            
                {/* PAGE TITLE */}
                <HeaderTitleCard onGoBack={handleGoBack} title="Transactions" description="A complete history of all money in and out of your business.">
                   <div className="flex flex-col md:flex-row gap-2">

                      

                        <Link href="#" className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2">
                        <Icons.export />
                            <span>Export Transactions</span>
                        </Link>

                        <Link href="transactions/new" className="btn-primary flex items-center justify-center">
                            <Icons.plus /> 
                            <span>Add New Transaction</span>
                        </Link>
                        
                    </div> 
                </HeaderTitleCard>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Revenue (This Month)" value="200000"  icon={Icons.arrowUp} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                    <StatCard title="Expenses" value="25000" icon={Icons.cashPending} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                    <StatCard title="Total Expenses (This Month)"value="22000000" icon={Icons.arrowUp} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
                    
                </div>

                

                <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">

                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Name..."
                            value=""
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Time Filter Select */}
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-36">
                        <option value="All">All Time</option>
                        <option value="This Week">This Week</option>
                        <option value="Last Week">Last Week</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                        <option value="Custom">Custom</option>
                    </select>
                    
                    {/* Status Filter Select */}
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40">
                        <option value="All">All Statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>

                     <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40">
                        <option value="All">All Method</option>
                        <option value="Online">Online</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Cash">Cash</option>
                    </select>

                    {/* This spacer is now only active on larger screens */}
                    <div className="hidden md:block md:flex-grow"></div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
                        <button className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium">Clear Filters</button>
                        <button className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                            <Icons.refresh className="h-6 w-6 " />
                        </button> 
                    </div>
                </div>
                {/* <!-- Filter Tabs --> */}
                <div className="mt-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-purple-600 text-purple-600 font-semibold text-sm whitespace-nowrap">All Transactions</a>
                            {/* <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Product Sales</a>
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Service Payments</a> */}
                            {/* <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Settlements</a> */}
                            <a href="#" className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">Expenses</a>
                        </nav>
                    </div>
                </div>
              
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm w-12"><input type="checkbox" className="rounded border-gray-300"/></th>
                                    <th  scope="col" className="px-6 py-4 ">Transaction</th>
                                    <th  scope="col" className="px-6 py-4 ">Date</th>
                                    <th  scope="col" className="px-6 py-4 ">Customer/Client</th>
                                    <th  scope="col" className="px-6 py-4 ">Type</th>
                                    <th  scope="col" className="px-6 py-4 ">Amount</th>
                                    <th  scope="col" className="px-6 py-4 ">Status</th>
                                    <th  scope="col" className="px-6 py-4 "></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* <!-- Row 1: Product Sale --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300"/></td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900">Order #1024</p>
                                        <p className="text-sm text-gray-500">via Paystack Card</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">July 22, 2025</td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">Tunde Adebayo</td>
                                    <td className="p-4"><span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Product Sale</span></td>
                                    <td className="p-4 font-semibold text-green-600">+ ₦25,000.00</td>
                                    <td className="p-4"><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Completed</span></td>
                                    <td className="p-4"><button className="text-gray-400 hover:text-gray-600"><i data-lucide="more-horizontal"></i></button></td>
                                </tr>
                                {/* <!-- Row 2: Service Payment --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300"/></td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900">Invoice #INV-056</p>
                                        <p className="text-sm text-gray-500">via Bank Transfer</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">July 21, 2025</td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">Chioma Nwosu</td>
                                    <td className="p-4"><span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Service Payment</span></td>
                                    <td className="p-4 font-semibold text-green-600">+ ₦150,000.00</td>
                                    <td className="p-4"><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Completed</span></td>
                                    <td className="p-4">
                                            {mockTransactions.map(tx => (
                                            <button 
                                                key={tx.id} 
                                                onClick={() => handleViewTransaction(tx)}
                                                className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                
                                            </button>
                                        ))}

                                    </td>
                                    
                                </tr>
                               
                                {/* <!-- Row 3: Settlement --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300"/></td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900">Settlement to GTBank</p>
                                        <p className="text-sm text-gray-500">Payout ID: P-58392</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">July 20, 2025</td>
                                    <td className="p-4 text-sm text-gray-400 italic">N/A</td>
                                    <td className="p-4"><span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Settlement</span></td>
                                    <td className="p-4 font-semibold text-gray-800">- ₦250,000.00</td>
                                    <td className="p-4"><span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">Pending</span></td>
                                    <td className="p-4"><button className="text-gray-400 hover:text-gray-600"><i data-lucide="more-horizontal"></i></button></td>
                                </tr>
                                {/* <!-- Row 4: Expense --> */}
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300"/></td>
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900">Logistics Fee</p>
                                        <p className="text-sm text-gray-500">GIG Logistics</p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">July 19, 2025</td>
                                    <td className="p-4 text-sm text-gray-400 italic">N/A</td>
                                    <td className="p-4"><span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Expense</span></td>
                                    <td className="p-4 font-semibold text-red-600">- ₦15,000.00</td>
                                    <td className="p-4"><span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Completed</span></td>
                                    <td className="p-4"><button className="text-gray-400 hover:text-gray-600"><i data-lucide="more-horizontal"></i></button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                        <TransactionSlideOver 
                isOpen={isPanelOpen} 
                onClose={handleClosePanel} 
                transaction={selectedTransaction} 
            />
                </div>
        </DashboardLayout>

        
    );
}
