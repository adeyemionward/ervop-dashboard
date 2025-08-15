'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout"; // Assuming a layout component
import Link from "next/link";
import { 
    ArrowLeft, Edit, Trash2, CheckCircle, Clock, DollarSign, Paperclip, 
    FileText, MessageSquare, Plus, Calendar, Landmark, CreditCard, ChevronDown,
    Share2, Download,
    Edit2
} from 'lucide-react';
import { Icons } from "@/components/icons";
import clsx from 'clsx';
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
type TaskStatus = 'To Do' | 'In Progress' | 'Done';
type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

type Task = {
    id: number;
    title: string;
    status: TaskStatus;
    dueDate: string | null;
};

type ProjectFile = {
    id: number;
    name: string;
    size: string;
    type: 'PDF' | 'Image' | 'Doc';
};

type Invoice = {
    id: string;
    date: string;
    amount: number;
    status: InvoiceStatus;
};

type Payment = {
    id: string;
    date: string;
    amount: number;
    method: 'Paystack Card' | 'Bank Transfer' | 'Manual Entry';
};

type Project = {
    id: number;
    title: string;
    clientName: string;
    status: ProjectStatus;
    startDate: string;
    deadline: string;
    budget: number;
    tasks: Task[];
    files: ProjectFile[];
    invoices: Invoice[];
    payments: Payment[];
    description: string;
};

// --- MOCK DATA ---
const projectData: Project = {
    id: 1,
    title: "Custom Beaded Wedding Gown",
    clientName: "Chioma Nwosu",
    status: "In Progress",
    startDate: "2025-07-15",
    deadline: "2025-08-30",
    budget: 450000,
    description: "Design and create a custom-fit beaded wedding gown for Chioma Nwosu. The design should incorporate traditional Nigerian lace with modern silk. Final fitting scheduled for August 15th.",
    tasks: [
        { id: 1, title: "Source and purchase lace fabric", status: "Done", dueDate: "2025-07-16" },
        { id: 2, title: "Complete initial beadwork (Est. 40 hours)", status: "In Progress", dueDate: "2025-07-25" },
        { id: 3, title: "Final Design Mockups", status: "To Do", dueDate: "2025-08-05" },
    ],
    files: [
        { id: 1, name: "Contract_Chioma_Nwosu.pdf", size: "1.2 MB", type: "PDF" },
    ],
    invoices: [
        { id: "INV-001", date: "2025-07-15", amount: 225000, status: "Paid" },
    ],
    payments: [
        { id: "txn_1a2b3c", date: "2025-07-16", amount: 225000, method: "Paystack Card" },
    ]
};

// --- REUSABLE COMPONENTS ---
const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center";
    const statusClasses = {
        'In Progress': "bg-yellow-100 text-yellow-800",
        'Completed': "bg-green-100 text-green-800",
        'On Hold': "bg-gray-100 text-gray-700",
        'Not Started': "bg-red-100 text-red-800",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};

const InfoCard = ({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) => (
    <div className={clsx("bg-white p-6 rounded-xl border border-gray-200 shadow-sm", className)}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ViewClientWorkPage() {
    const [project, setProject] = useState(projectData);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    const totalPaid = project.payments.reduce((sum, pmt) => sum + pmt.amount, 0);
    const outstandingBalance = project.budget - totalPaid;

    const handleStatusChange = (newStatus: ProjectStatus) => {
        setProject(prev => ({ ...prev, status: newStatus }));
        setIsStatusDropdownOpen(false);
    };

    const handleRecordPayment = () => {
        const amount = parseFloat(paymentAmount.replace(/[^0-9.-]+/g,""));
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        const newPayment: Payment = {
            id: `txn_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            method: 'Manual Entry'
        };
        
        setProject(prev => ({
            ...prev,
            payments: [...prev.payments, newPayment],
        }));

        setPaymentAmount('');
        setIsPaymentModalOpen(false);
    };

    return (
        <DashboardLayout>
            <header className="mb-8">
                <Link href="/projects" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 w-fit transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Back to All Client Work</span>
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                            <div className="relative">
                                <button 
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <ProjectStatusBadge status={project.status} />
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>
                                {isStatusDropdownOpen && (
                                    <div className="absolute top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        {(['Not Started', 'In Progress', 'Completed', 'On Hold'] as ProjectStatus[]).map(status => (
                                            <button 
                                                key={status}
                                                onClick={() => handleStatusChange(status)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="mt-1 text-gray-500">
                            For Client: <Link href={`/contacts/${project.clientName}`} className="text-blue-600 hover:underline font-medium">{project.clientName}</Link>
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                        <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Share2 className="w-4 h-4 mr-2" />
                            <span>Share Project</span>
                        </button>
                        <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Delete</span>
                        </button>
                        <button className="bg-purple-600 text-white hover:bg-purple-700border border-gray-300 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Edit Project</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title="Project Description">
                        <p className="text-gray-600">{project.description}</p>
                    </InfoCard>

                    <InfoCard title="Tasks" action={<button className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800">+ Add Task</button>}>
                        <div className="space-y-4">
                            {project.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between group">
                                    <div className="flex items-center">
                                        <input type="checkbox" defaultChecked={task.status === 'Done'} className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                                        <label className={`ml-3 ${task.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</label>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-full hover:bg-gray-200"><Edit className="h-4 w-4 text-gray-500" /></button>
                                        <button className="p-2 rounded-full hover:bg-gray-200 text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                    
                    <InfoCard title="Project Files" action={<button className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800">+ Upload File</button>}>
                        <div className="space-y-3">
                            {project.files.map(file => (
                                <div key={file.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg group">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-6 w-6 text-gray-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-full hover:bg-gray-200"><Download className="h-5 w-5 text-gray-500" /></button>
                                        <button className="p-2 rounded-full hover:bg-gray-200 text-red-600"><Trash2 className="h-5 w-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InfoCard>

                    <InfoCard title="Invoices" action={<button className="text-sm bg-purple-100 font-medium text-purple-600 py-2 px-3 rounded-lg hover:text-purple-800">+ Create Invoice</button>}>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg group">
                                    <div>
                                        <p className="font-semibold text-gray-800">Invoice #INV-001</p>
                                        <p className="text-xs text-gray-500">Issued: July 15, 2024</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">₦225,000</p>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Paid</span>
                                        </div>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button className="p-2 rounded-full hover:bg-gray-200"><Icons.edit className="h-5 w-5" /></button>
                                            <button className="p-2 rounded-full hover:bg-gray-200 text-red-600"><Icons.delete className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </InfoCard>

                     <InfoCard title="Project Notes">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Image  alt="User avatar" src="https://i.pravatar.cc/150?u=ervop-admin" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                    <div className="w-full">
                                        <textarea rows={2} placeholder="Add a note..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                                        <div className="flex justify-end mt-2">
                                            <button className="bg-[#7E51FF] cursor-pointer text-white font-medium px-4 py-2 rounded-lg hover:bg-primary-700">+ Add Note</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 pt-4 border-t group relative">
                                    <Image alt="User avatar" src="https://i.pravatar.cc/150?u=ervop-admin" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                                    <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Customer confirmed they love the lace fabric selected. Proceeding with beadwork.</p>
                                        <p className="text-xs text-gray-400 mt-1">Chioma Nwosu - July 22, 2024</p>
                                    </div>
                                    <div className="absolute top-4 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-full hover:bg-gray-200"><Icons.edit className="h-4 w-4" /></button>
                                        <button className="p-2 rounded-full hover:bg-gray-200 text-red-600"><Icons.delete className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </InfoCard>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <InfoCard title="Details">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-3 text-gray-400"/>
                                <span className="text-gray-600">Start Date: <span className="font-medium text-gray-800">{project.startDate}</span></span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-3 text-gray-400"/>
                                <span className="text-gray-600">Deadline: <span className="font-medium text-gray-800">{project.deadline}</span></span>
                            </div>
                        </div>
                    </InfoCard>

                    <InfoCard title="Financials">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><p className="text-gray-600">Budget:</p><p className="font-bold text-gray-900">₦{project.budget.toLocaleString()}</p></div>
                            <div className="flex justify-between items-center"><p className="text-gray-600">Total Paid:</p><p className="font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></div>
                            <div className="flex justify-between items-center border-t pt-4"><p className="text-gray-600">Outstanding:</p><p className="font-bold text-red-600">₦{outstandingBalance.toLocaleString()}</p></div>
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <button onClick={() => setIsPaymentModalOpen(true)} className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">+ Record Payment</button>
                        </div>
                    </InfoCard>

                    <InfoCard title="Payment History">
                        <div className="space-y-3">
                            {project.payments.map(p => (
                                <div key={p.id} className="flex justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-800">{p.method}</p>
                                        <p className="text-gray-500 text-xs">{p.date}</p>
                                    </div>
                                    <p className="font-medium text-gray-800">₦{p.amount.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                </div>
            </div>

            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Payment</h3>
                        <div>
                            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                            <input type="number" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. 55000" />
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer">Cancel</button>
                            <button onClick={handleRecordPayment} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">Record Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
