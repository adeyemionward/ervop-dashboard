'use client';

import React, { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { Search, ChevronDown, ArrowUpRight, ArrowDownLeft, Trash2, Edit, DollarSign, RefreshCw, Wallet, CreditCard, MoreVertical, Eye} from 'lucide-react';
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import StatCard from "@/components/StatCard";
import clsx from "clsx";
import Link from "next/link";
import TransactionActivityModal from "@/components/TransactionSlideOver";

const useGoBack = () => () => { if (typeof window !== 'undefined') window.history.back(); };
// --- TYPE DEFINITIONS ---
type TransactionType = 'income' | 'expense';

type TransactionItem = {
  id: number;
  description: string;
  amount: number;
};

type Transaction = {
  id: number;
  date: string;
  title: string;
  category: string;
  paymentMethod: string;
  type: TransactionType;
  createdAt: string;
  subType: string;
  amount: number;
  items?: TransactionItem[];
  contactName?: string;
  contactEmail?: string;
  projectName?: string;
  appointmentName?: string;
};

// Type for the raw API response
type ApiTransactionItem = {
  id: number;
  description: string;
  amount: string | number;
};

type ApiTransaction = {
  id: number;
  date: string;
  title?: string | null;
  category?: string | null;
  payment_method?:string | null;
  type: TransactionType;
  sub_type:string;
  amount: string | number;
  created_at:string;
  items?: ApiTransactionItem[];
  contact_name?: string | null;
  contact_email?: string | null; 
  project_id?: number | null;
  appointment_id?: number | null;
};


const ITEMS_PER_PAGE = 10;

// --- DATE HELPER FUNCTIONS ---
const formatDate = (date: Date): string => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const getDateRangeForPreset = (preset: string): { start: string, end: string } => {
    const now = new Date();
    let start: Date, end: Date;

    switch (preset) {
        case 'This Week':
            start = new Date(now.setDate(now.getDate() - now.getDay()));
            end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
        case 'Last Week':
            end = new Date();
            end.setDate(end.getDate() - end.getDay() - 1);
            start = new Date(end);
            start.setDate(start.getDate() - 6);
            break;
        case 'This Month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'Last Month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        default:
            return { start: '', end: '' };
    }
    return { start: formatDate(start), end: formatDate(end) };
};


export default function TransactionsListPage() {
    const handleGoBack = useGoBack();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
    const [datePreset, setDatePreset] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    
    const [isOpen, setIsOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    // const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);


    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';



// ✅ function that opens the modal
const handleViewTransaction = (transaction: Transaction) => {
  setSelectedTransaction(transaction);
  setIsOpen(true);
};

const handleClose = () => {
  setSelectedTransaction(null);
  setIsOpen(false);
};


     // 👇 useCallback memoizes the fetch function
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    // setError(null);

    try {
      if (!userToken) {
        throw new Error("No authentication token found.");
      }

      const res = await fetch(`${BASE_URL}/professionals/transactions/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }


    // Assuming your response looks like: { data: [...] }
    const { data }: { data: ApiTransaction[] } = await res.json();

    const apiTransactions: Transaction[] = data.map((t) => ({
    id: t.id,
    date: t.date,
    title: t.title ?? "",
    category: t.category ?? "",
    paymentMethod: t.payment_method ?? "",
    type: t.type,
    subType: t.sub_type,
    amount: typeof t.amount === "string" ? parseFloat(t.amount) : t.amount,
    createdAt: t.created_at
        ? new Date(t.created_at).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
        : "",
    items:
        t.items?.map((item) => ({
        id: item.id,
        description: item.description,
        amount:
            typeof item.amount === "string" ? parseFloat(item.amount) : item.amount,
        })) ?? [],
    contactName: t.contact_name || undefined,
    contactEmail: t.contact_email || undefined,
    projectName: t.project_id ? `Project #${t.project_id}` : undefined,
    appointmentName: t.appointment_id ? `Appointment #${t.appointment_id}` : undefined,
    }));

    setTransactions(apiTransactions);
    } catch (err) {
      console.error(err);
    //   setError(err instanceof Error ? err.message : "Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [userToken]); // 🔑 dependency

  // 👇 safe to use in useEffect now
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

    const deleteTransaction = async (id: number) => {
        if (!userToken) {
            throw new Error("No authentication token found.");
        }

        setDeletingId(id);

        try {
            const res = await fetch(`${BASE_URL}/professionals/transactions/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to delete: ${res.status} ${res.statusText}`);
            }

            // ✅ Remove transaction from UI
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeletingId(null);
            setTransactionToDelete(null); // close modal
        }
    };


    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleToggleRow = (id: number) => {
        setExpandedRowId(prevId => (prevId === id ? null : id));
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setDatePreset('All');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    

   
    const handleDatePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const preset = e.target.value;
        setDatePreset(preset);
        setCurrentPage(1);
        if (preset === 'Custom') {
            setDateRange({ start: '', end: '' });
            return;
        }
        setDateRange(getDateRangeForPreset(preset));
    };

    const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'start' | 'end') => {
        setDateRange(prev => ({ ...prev, [part]: e.target.value }));
        setDatePreset('Custom');
        setCurrentPage(1);
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchTerm === '' ||
                transaction.title.toLowerCase().includes(searchLower) ||
                transaction.contactName?.toLowerCase().includes(searchLower) ||
                transaction.category.toLowerCase().includes(searchLower);

            const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;

            const dateMatch = !dateRange.start || !dateRange.end || (transaction.date >= dateRange.start && transaction.date <= dateRange.end);

            return searchMatch && typeMatch && dateMatch;
        });
    }, [transactions, searchTerm, typeFilter, dateRange]);

    const { totalIncome, totalExpense, netProfit } = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return {
            totalIncome: income,
            totalExpense: expense,
            netProfit: income - expense
        };
    }, [filteredTransactions]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    return (
        <DashboardLayout>

            <HeaderTitleCard
                onGoBack={handleGoBack}
                title="Transactions"
                description="Track all your incomes & expenses in one place."
                >
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                        >
                        <span>Quick Actions</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <Link
                        href="/finance/income/new"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                        >
                        <Wallet className="w-4 h-4 text-purple-600" />
                        <span>Add Income</span>
                        </Link>

                     

                        <Link
                        href="/finance/expenses/new"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                        >
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span>Add Expense</span>
                        </Link>

                        
                    </div>
                    )}
                </div>
            </HeaderTitleCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Income" value={`₦${totalIncome.toLocaleString()}`} icon={ArrowDownLeft} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                <StatCard title="Total Expense" value={`₦${totalExpense.toLocaleString()}`} icon={ArrowUpRight} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
                <StatCard title="Net Profit" value={`₦${netProfit.toLocaleString()}`} icon={DollarSign} mainBg="bg-white" iconBg="bg-blue-100" mainText="text-gray-900" iconText="text-blue-800" />
            </div>

            {/* Loading & Error */}
            {/* {isLoading && <div className="p-6 text-center">Loading transactions...</div>}
            {error && <div className="p-6 text-center text-red-600">{error}</div>} */}

            {/* --- FILTER BAR --- */}
            
                <>
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* 🔍 Filters Group (left side) */}
                            <div className="flex flex-wrap items-center gap-3 flex-grow">
                            {/* Search */}
                            <div className="relative w-full sm:w-64 lg:w-80">
                                <input
                                type="text"
                                placeholder="Search by contact, title or category..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                setTypeFilter(e.target.value as TransactionType | 'all');
                                setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>

                            {/* Date Preset */}
                            <select
                                value={datePreset}
                                onChange={handleDatePresetChange}
                                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="All">All Time</option>
                                <option value="This Week">This Week</option>
                                <option value="Last Week">Last Week</option>
                                <option value="This Month">This Month</option>
                                <option value="Last Month">Last Month</option>
                                <option value="Custom">Custom</option>
                            </select>

                            {/* Custom Date Range */}
                            {datePreset === "Custom" && (
                                <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => handleManualDateChange(e, "start")}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => handleManualDateChange(e, "end")}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                </div>
                            )}
                            </div>

                            {/* ⚙️ Actions (right side) */}
                            <div className="flex items-center space-x-2">
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-gray-600 hover:text-purple-600 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={fetchTransactions}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-200 bg-gray-100 rounded-full transition"
                            >
                                <RefreshCw size={20} />
                            </button>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Pay Date</th>
                                        {/* <th scope="col" className="px-6 py-4">Title </th> */}
                                        <th scope="col" className="px-6 py-4">Contact</th>
                                        <th scope="col" className="px-6 py-4">Category</th>
                                        <th scope="col" className="px-6 py-4">Type</th>
                                        <th scope="col" className="px-6 py-4 text-right">Amount</th>
                                        <th scope="col" className="px-6 py-4 ">Created On</th>
                                        <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                               
                                <tbody className="divide-y divide-gray-200">
                                    {/* Loading state */}
                                    {isLoading && (
                                        <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">
                                            Loading transactions...
                                        </td>
                                        </tr>
                                    )}

                                    {/* Empty state */}
                                    {!isLoading && paginatedTransactions.length === 0 && (
                                        <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">
                                            No transactions found.
                                        </td>
                                        </tr>
                                    )}

                                    {/* Data rows */}
                                    {!isLoading &&
                                        paginatedTransactions.map((transaction) => (
                                        <React.Fragment key={transaction.id}>
                                            <tr
                                            className={clsx("bg-white border-b", {
                                                "hover:bg-gray-50 cursor-pointer": transaction.type === "expense",
                                            })}
                                            onClick={() =>
                                                transaction.type === "expense" &&
                                                handleToggleRow(transaction.id)
                                            }
                                            >
                                            {/* Date + Dropdown Icon */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                {transaction.type === "expense" && (
                                                    <ChevronDown
                                                    className={clsx(
                                                        "w-4 h-4 mr-2 text-gray-400 transition-transform",
                                                        { "rotate-180": expandedRowId === transaction.id }
                                                    )}
                                                    />
                                                )}
                                                {new Date(transaction.date + "T00:00:00").toLocaleDateString(
                                                    "en-US",
                                                    { month: "short", day: "numeric", year: "numeric" }
                                                )}
                                                </div>
                                            </td>

                                            {/* Title + Contact */}
                                            
                                            <td className="px-6 py-4"><a
                                                    href="#"
                                                    className="text-purple-600 hover:underline"
                                                    >
                                                    {transaction.contactName} 
                                                    </a></td>

                                            {/* Category */}
                                            <td className="px-6 py-4">{transaction.category}</td>

                                            {/* Type Badge */}
                                            <td className="px-6 py-4">
                                                <span
                                                className={clsx(
                                                    "px-2.5 py-1 text-xs font-semibold rounded-full",
                                                    {
                                                    "bg-green-100 text-green-800":
                                                        transaction.type === "income",
                                                    "bg-red-100 text-red-800":
                                                        transaction.type === "expense",
                                                    }
                                                )}
                                                >
                                                {transaction.type}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td
                                                className={clsx(
                                                "px-6 py-4 text-right font-semibold",
                                                {
                                                    "text-green-600": transaction.type === "income",
                                                    "text-red-600": transaction.type === "expense",
                                                }
                                                )}
                                            >
                                                {transaction.type === "expense" ? "-" : ""}₦
                                                {transaction.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">{transaction.createdAt}</td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right relative">
                                                <div className="inline-block text-left">
                                                    {/* More (⋮) Button */}
                                                    <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenu(openMenu === transaction.id ? null : transaction.id);
                                                    }}
                                                    className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                                    >
                                                    <MoreVertical className="w-5 h-5 text-gray-500" />
                                                    </button>

                                                    {/* Dropdown Menu (opens to the left) */}
                                                    {openMenu === transaction.id && (
                                                    <div
                                                        className="absolute top-1/2 -translate-y-1/2 right-full mr-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                                                    >
                                                        <button
                                                            onClick={() => handleViewTransaction(transaction)}

                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-purple-50"
                                                            >
                                                            <Eye className="w-4 h-4 text-gray-500" /> View
                                                        </button>
                                                        <Link
                                                            href={
                                                                transaction.type === "income"
                                                                ? `/finance/income/edit/${transaction.id}`
                                                                : `/finance/expenses/edit/${transaction.id}`
                                                            }
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                            onClick={(e) => e.stopPropagation()} // optional, if inside a clickable row
                                                            >
                                                            <Edit className="w-4 h-4 text-gray-500" /> Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => console.log("Delete transaction", transaction.id)}
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50"
                                                            >
                                                            <Trash2 className="w-4 h-4 text-red-500" /> Delete
                                                        </button>
                                                    </div>
                                                    )}
                                                </div>
                                            </td>

                                            </tr>

                                            {/* Expandable Line Items */}
                                            {transaction.type === "expense" &&
                                            expandedRowId === transaction.id && (
                                                <tr className="bg-gray-50">
                                                <td colSpan={6} className="p-4">
                                                    <div className="pl-12 pr-6">
                                                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
                                                        Line Items
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {transaction.items?.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between text-sm text-gray-700"
                                                        >
                                                            <span>{item.description}</span>
                                                            <span className="font-medium">
                                                            ₦{item.amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        ))}
                                                    </div>
                                                    </div>
                                                </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                        ))}
                                </tbody>

                            </table>
                        </div>
                        {/* pagination */}
                        {filteredTransactions.length > 0 && (
                            <div className="flex items-center justify-between p-4 border-t">
                                <span className="text-sm text-gray-700">
                                    Showing <span className="font-semibold">{Math.min(1 + (currentPage - 1) * ITEMS_PER_PAGE, filteredTransactions.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of <span className="font-semibold">{filteredTransactions.length}</span> Results
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Previous</button>
                                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <DeleteConfirmModal
                    isOpen={!!transactionToDelete}
                    onCancel={() => setTransactionToDelete(null)}
                    onConfirm={() => transactionToDelete && deleteTransaction(transactionToDelete.id)}
                    title="Delete Transaction"
                    message={
                      transactionToDelete
                        ? `Are you sure you want to delete the transaction of ₦${transactionToDelete.amount.toLocaleString()} on ${transactionToDelete.date}?`
                        : ""
                    }
                    deleting={deletingId === transactionToDelete?.id}
                  />
      <TransactionActivityModal
  isOpen={isOpen}
  onClose={handleClose}
  transaction={selectedTransaction}
/>


                </>
          
        </DashboardLayout>
    );
}
