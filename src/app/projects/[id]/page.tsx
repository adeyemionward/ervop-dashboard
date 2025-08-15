'use client';

import React, {useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout"; // Assuming a layout component
import Link from "next/link";
import { 
    ArrowLeft, Edit, Trash2, CheckCircle, Clock, DollarSign, Paperclip, 
    FileText, MessageSquare, Plus, Calendar, Landmark, CreditCard, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

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
    method: 'Paystack Card' | 'Bank Transfer';
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
};

// --- MOCK DATA ---
const projectData: Project = {
    id: 1,
    title: "New Website Design",
    clientName: "Chioma Nwosu",
    status: "In Progress",
    startDate: "2025-07-15",
    deadline: "2025-08-30",
    budget: 750000,
    tasks: [
        { id: 1, title: "Initial Consultation & Brief", status: "Done", dueDate: "2025-07-16" },
        { id: 2, title: "Deliver Wireframes & User Flow", status: "In Progress", dueDate: "2025-07-25" },
        { id: 3, title: "Final Design Mockups", status: "To Do", dueDate: "2025-08-05" },
        { id: 4, title: "Client Review & Feedback Session", status: "To Do", dueDate: "2025-08-10" },
    ],
    files: [
        { id: 1, name: "design_brief_final.pdf", size: "1.2 MB", type: "PDF" },
        { id: 2, name: "inspiration_moodboard.png", size: "3.4 MB", type: "Image" },
        { id: 3, name: "meeting_notes_1.docx", size: "88 KB", type: "Doc" },
    ],
    invoices: [
        { id: "INV-056", date: "2025-07-15", amount: 250000, status: "Paid" },
        { id: "INV-059", date: "2025-08-01", amount: 250000, status: "Pending" },
    ],
    payments: [
        { id: "txn_1a2b3c", date: "2025-07-16", amount: 250000, method: "Paystack Card" },
    ]
};

// --- REUSABLE COMPONENTS ---
const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        'In Progress': "bg-yellow-100 text-yellow-800",
        'Completed': "bg-green-100 text-green-800",
        'On Hold': "bg-gray-100 text-gray-700",
        'Not Started': "bg-red-100 text-red-800",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};

const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-gray-100 text-gray-700",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        'Paid': "bg-green-100 text-green-800",
        'Pending': "bg-yellow-100 text-yellow-800",
        'Overdue': "bg-red-100 text-red-800",
        'Draft': "bg-gray-100 text-gray-700",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};


// --- MAIN PAGE COMPONENT ---
export default function ViewClientWorkPage() {
    const [project, setProject] = useState(projectData);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const totalInvoiced = project.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = project.payments.reduce((sum, pmt) => sum + pmt.amount, 0);

    const handleStatusChange = (newStatus: ProjectStatus) => {
        setProject(prev => ({ ...prev, status: newStatus }));
        setIsStatusDropdownOpen(false);
        // In a real app, you would also make an API call here to save the change.
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="mb-8">
                <Link href="/projects" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 w-fit transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Back to All Client Work</span>
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <div className="flex items-center gap-3">
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
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Delete</span>
                        </button>
                        <Link href={`/projects/edit/${project.id}`}>
                            <button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm">
                                <Edit className="w-4 h-4 mr-2" />
                                <span>Edit Project</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Tasks and Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Task List Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                            <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-2 px-3 rounded-lg flex items-center transition-colors text-sm">
                                <Plus className="w-4 h-4 mr-2"/>
                                <span>Add Task</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {project.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center">
                                        <input type="checkbox" className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked={task.status === 'Done'} />
                                        <p className="ml-4 font-medium text-gray-800">{task.title}</p>
                                    </div>
                                    <TaskStatusBadge status={task.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Notes Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Internal Notes</h2>
                        <textarea 
                            rows={5} 
                            placeholder="Add any private notes about this project..."
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                    </div>
                </div>

                {/* Right Column: Project Info */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Project Details Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
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
                    </div>

                    {/* Financials Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financials</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><p className="text-gray-600">Budget:</p><p className="font-bold text-gray-900">₦{project.budget.toLocaleString()}</p></div>
                            <div className="flex justify-between items-center"><p className="text-gray-600">Total Invoiced:</p><p className="font-medium text-gray-800">₦{totalInvoiced.toLocaleString()}</p></div>
                            <div className="flex justify-between items-center border-t pt-4"><p className="text-gray-600">Total Paid:</p><p className="font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></div>
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <button className="w-full bg-green-50 text-green-700 hover:bg-green-100 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">
                                <Landmark className="w-4 h-4 mr-2"/>
                                <span>Record a Payment</span>
                            </button>
                        </div>
                    </div>

                    {/* Invoice History Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h3>
                        <div className="space-y-3">
                            {project.invoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between text-sm">
                                    <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">{invoice.id}</Link>
                                    <p className="text-gray-600">₦{invoice.amount.toLocaleString()}</p>
                                    <InvoiceStatusBadge status={invoice.status} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment History Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                        <div className="space-y-3">
                            {project.payments.map(payment => (
                                <div key={payment.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-800">₦{payment.amount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{payment.method}</p>
                                    </div>
                                    <p className="text-gray-500">{payment.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Files Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Files</h3>
                        <div className="space-y-3">
                            {project.files.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center overflow-hidden">
                                        <Paperclip className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                                        <div className="truncate">
                                            <p className="font-medium text-gray-800 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
