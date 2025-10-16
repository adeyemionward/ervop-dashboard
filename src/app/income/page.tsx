'use client';

import React, { useState, useMemo, FC, ReactNode, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { Plus, Search, ChevronDown, ArrowUpRight, ArrowDownLeft, Trash2, Edit, DollarSign, RefreshCw } from 'lucide-react';
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";

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
    date: string; // YYYY-MM-DD
    title: string;
    category: string;
    type: TransactionType;
    amount: number;
    items?: TransactionItem[];
    contactName?: string;
    projectName?: string;
};

// --- REUSABLE COMPONENTS ---
const StatCard: FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-opacity-10 ${color.includes('green') ? 'bg-green-500' : color.includes('red') ? 'bg-red-500' : 'bg-blue-500'}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

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

// --- MAIN PAGE COMPONENT ---
export default function TransactionsListPage() {
    const handleGoBack = useGoBack();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
    const [datePreset, setDatePreset] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

     // 👇 useCallback memoizes the fetch function
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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

      const data = await res.json();

      const apiTransactions: Transaction[] = data.map((t: any) => ({
        id: t.id,
        date: t.date,
        title: t.title ?? "",
        category: t.category ?? "",
        type: t.type,
        amount: parseFloat(t.amount),
        items:
          t.items?.map((item: any) => ({
            id: item.id,
            description: item.description,
            amount: parseFloat(item.amount),
          })) || [],
        contactName: t.contact_id ? `Contact #${t.contact_id}` : undefined,
        projectName: t.project_id ? `Project #${t.project_id}` : undefined,
      }));

      setTransactions(apiTransactions);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load transactions.");
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
            <HeaderTitleCard onGoBack={handleGoBack} title="Transactions" description="Track all your income in one place.">
                <Link href="/income/new" className="btn-primary flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Income</span>
                </Link>
            </HeaderTitleCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Income" value={`₦${totalIncome.toLocaleString()}`} icon={ArrowUpRight} color="text-green-600" />
                <StatCard title="Total Expense" value={`₦${totalExpense.toLocaleString()}`} icon={ArrowDownLeft} color="text-red-600" />
                <StatCard title="Net Profit" value={`₦${netProfit.toLocaleString()}`} icon={DollarSign} color="text-blue-600" />
            </div>

            {/* Loading & Error */}
            {/* {isLoading && <div className="p-6 text-center">Loading transactions...</div>}
            {error && <div className="p-6 text-center text-red-600">{error}</div>} */}

            {/* --- FILTER BAR --- */}
            
                <>
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap items-center gap-4 border border-gray-200">
                        <div className="relative flex-shrink-0 w-full sm:w-64">
                            <input type="text" placeholder="Search by title or category..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                        </div>
                        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as TransactionType | 'all'); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto">
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select value={datePreset} onChange={handleDatePresetChange} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto">
                            <option value="All">All Time</option>
                            <option value="This Week">This Week</option>
                            <option value="Last Week">Last Week</option>
                            <option value="This Month">This Month</option>
                            <option value="Last Month">Last Month</option>
                            <option value="Custom">Custom</option>
                        </select>
                        {datePreset === 'Custom' && (
                            <div className="flex items-center space-x-2">
                                <input type="date" value={dateRange.start} onChange={e => handleManualDateChange(e, 'start')} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <span>-</span>
                                <input type="date" value={dateRange.end} onChange={e => handleManualDateChange(e, 'end')} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        )}
                        <div className="flex-grow"></div>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleClearFilters} className="text-sm text-gray-600 hover:text-purple-600 p-2 font-medium">Clear Filters</button>
                            <button onClick={fetchTransactions} className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-gray-100">
                                <RefreshCw className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Date</th>
                                        <th scope="col" className="px-6 py-4">Title / Description</th>
                                        <th scope="col" className="px-6 py-4">Category</th>
                                        <th scope="col" className="px-6 py-4">Type</th>
                                        <th scope="col" className="px-6 py-4 text-right">Amount</th>
                                        <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                               
                                <tbody>
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
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div>{transaction.title}</div>
                                                {transaction.type === "income" && transaction.contactName && (
                                                <div className="text-xs text-gray-500 font-normal mt-1">
                                                    For:{" "}
                                                    <a
                                                    href="#"
                                                    className="text-purple-600 hover:underline"
                                                    >
                                                    {transaction.contactName}
                                                    </a>
                                                    {transaction.projectName && (
                                                    <span> ({transaction.projectName})</span>
                                                    )}
                                                </div>
                                                )}
                                            </td>

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

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log("Edit transaction", transaction.id);
                                                }}
                                                className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
                                                >
                                                <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTransactionToDelete(transaction);
                                                    console.log("Delete transaction", transaction.id);
                                                }}
                                                className="p-2 rounded-full hover:bg-gray-200 text-red-500"
                                                >
                                                <Trash2 className="w-4 h-4" />
                                                </button>
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

                </>
          
        </DashboardLayout>
    );
}
