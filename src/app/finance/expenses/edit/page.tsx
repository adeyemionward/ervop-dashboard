'use client';

import { useState} from "react";
import Link from "next/link";

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

// --- COMPONENT 2: The Main Page ---
// (In a real app, this would be in its own file: /pages/TransactionsListPage.tsx)

// const TransactionsListPage = () => {
export default function TransactionsListPage() {
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

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedTransaction(null), 300); // Clear data after transition
    };

    return (
        <div className="bg-gray-50 p-8 min-h-screen font-sans">
            <h2 className="text-3xl font-bold text-gray-900">Transactions List</h2>
            <p className="mt-1 text-gray-500">Click a transaction to view its details.</p>
            <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
                <div className="space-y-4">
                    {mockTransactions.map(tx => (
                        <button 
                            key={tx.id} 
                            onClick={() => handleViewTransaction(tx)}
                            className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <p className="font-semibold">{tx.type}: {tx.reference}</p>
                            <p className="text-sm text-gray-600">{tx.customerName} - ₦{tx.amount.toLocaleString()}</p>
                        </button>
                    ))}
                </div>
            </div>

            <TransactionSlideOver 
                isOpen={isPanelOpen} 
                onClose={handleClosePanel} 
                transaction={selectedTransaction} 
            />
        </div>
    );
}

// --- COMPONENT 3: The Main App Wrapper ---
// (This is the main entry point of your application, e.g., App.tsx)

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* This sets up the main page to render at the root URL */}
//         <Route path="/" element={<TransactionsListPage />} />
//         {/* You would add other routes for other pages here */}
//         {/* <Route path="/orders/:id" element={<OrderDetailPage />} /> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }
