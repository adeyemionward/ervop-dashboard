'use client';

import React, { useState, FC, ReactNode } from "react";
import { 
    CheckCircle, 
    Circle, 
    FileText, 
    UploadCloud, 
    Paperclip, 
    Calendar, 
    Clock, 
    DollarSign, 
    ArrowRight,
    Download
} from 'lucide-react';
import clsx from "clsx";

// --- MOCK/PLACEHOLDER COMPONENTS (to resolve import errors) ---
// In a real app, the client would have their own simple layout, not the professional's DashboardLayout.
const ClientPortalLayout: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="bg-gray-50 min-h-screen font-sans">
        <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-600">Ervop</div>
                <div>
                    <img className="h-8 w-8 rounded-full" src="https://i.pravatar.cc/150?u=client" alt="Client Avatar" />
                </div>
            </nav>
        </header>
        <main className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
    </div>
);

const Link: FC<{ href: string; children: ReactNode; className?: string }> = ({ href, children, className }) => <a href={href} className={className}>{children}</a>;
// --- END OF MOCKS ---


// --- TYPE DEFINITIONS ---
type Task = { id: number; text: string; isCompleted: boolean; };
type ProjectFile = { id: number; name: string; size: string; uploadedBy: string; };
type Appointment = { id: number; service: string; date: string; time: string; };
type Invoice = { id: number; invoiceNumber: string; amount: string; status: 'Paid' | 'Due'; dueDate: string; };

// --- MOCK DATA FOR THE CLIENT PORTAL ---
const projectData = {
    title: "Adebayo Wedding Gown Design",
    status: "In Progress",
    tasks: [
        { id: 1, text: "Initial Consultation & Sketching", isCompleted: true },
        { id: 2, text: "Fabric Selection & Sourcing", isCompleted: true },
        { id: 3, text: "First Fitting & Adjustments", isCompleted: false },
        { id: 4, text: "Beadwork & Embellishments", isCompleted: false },
        { id: 5, text: "Final Fitting", isCompleted: false },
    ],
    files: [
        { id: 1, name: "Initial_Sketches.pdf", size: "2.5 MB", uploadedBy: "Abiola The Designer" },
        { id: 2, name: "Fabric_Inspiration_Board.png", size: "4.1 MB", uploadedBy: "You" },
        { id: 3, name: "Measurement_Sheet.pdf", size: "800 KB", uploadedBy: "Abiola The Designer" },
    ],
    appointments: [
        { id: 1, service: "First Fitting", date: "September 15, 2025", time: "02:00 PM" },
    ],
    invoices: [
        { id: 1, invoiceNumber: "#INV-001", amount: "₦150,000", status: 'Paid', dueDate: "August 20, 2025" },
        { id: 2, invoiceNumber: "#INV-002", amount: "₦150,000", status: 'Due', dueDate: "October 01, 2025" },
    ]
};

// --- REUSABLE COMPONENTS ---
const PortalCard: FC<{ title: string; children: ReactNode; className?: string; action?: ReactNode }> = ({ title, children, className, action }) => (
    <div className={clsx("bg-white p-6 rounded-xl shadow-sm border border-gray-200", className)}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ClientPortalPage() {
    const [tasks, setTasks] = useState<Task[]>(projectData.tasks);

    const handleToggleTask = (taskId: number) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        ));
    };

    return (
        <ClientPortalLayout>
            {/* Page Header */}
            <div className="mb-8">
                <p className="text-sm font-medium text-purple-600">Client Portal</p>
                <div className="flex items-center gap-4 mt-1">
                    <h1 className="text-3xl font-bold text-gray-900">{projectData.title}</h1>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">{projectData.status}</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column (Tasks & Files) */}
                <div className="lg:col-span-2 space-y-8">
                    <PortalCard title="Project Checklist">
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div key={task.id} onClick={() => handleToggleTask(task.id)} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    {task.isCompleted ? (
                                        <CheckCircle className="w-6 h-6 text-purple-600" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-300" />
                                    )}
                                    <span className={clsx("ml-3 text-gray-700", { 'line-through text-gray-500': task.isCompleted })}>
                                        {task.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </PortalCard>

                    <PortalCard title="Shared Files">
                         <div className="space-y-3 mb-6">
                            {projectData.files.map(file => (
                                <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium text-gray-800">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size} - Uploaded by {file.uploadedBy}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-full hover:bg-gray-200">
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <UploadCloud className="w-10 h-10 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">Drag & drop files here or</p>
                            <button className="mt-2 text-sm font-semibold text-purple-600 hover:underline">
                                Click to upload
                            </button>
                        </div>
                    </PortalCard>
                </div>

                {/* Right Column (Appointments & Invoices) */}
                <div className="lg:col-span-1 space-y-8">
                    <PortalCard title="Upcoming Appointment">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-700" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{projectData.appointments[0].service}</p>
                                <p className="text-sm text-gray-600 mt-1">{projectData.appointments[0].date}</p>
                                <p className="text-sm text-gray-500">{projectData.appointments[0].time}</p>
                            </div>
                        </div>
                    </PortalCard>

                    <PortalCard title="Invoices & Payments" action={<Link href="#" className="text-sm font-medium text-purple-600 hover:underline">View All</Link>}>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">Total Billed</p>
                                <p className="text-2xl font-bold text-gray-900">₦300,000</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-green-50">
                                    <p className="text-sm text-green-700">Paid</p>
                                    <p className="text-lg font-bold text-green-800">₦150,000</p>
                                </div>
                                <div className="p-4 rounded-lg bg-red-50">
                                    <p className="text-sm text-red-700">Balance Due</p>
                                    <p className="text-lg font-bold text-red-800">₦150,000</p>
                                </div>
                            </div>
                             <div className="pt-4 border-t">
                                {projectData.invoices.map(invoice => (
                                    <div key={invoice.id} className="flex justify-between items-center py-2">
                                        <div>
                                            <p className="font-medium text-gray-800">{invoice.invoiceNumber}</p>
                                            <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                                        </div>
                                        <span className={clsx("px-2.5 py-0.5 text-xs font-semibold rounded-full", {
                                            'bg-green-100 text-green-800': invoice.status === 'Paid',
                                            'bg-yellow-100 text-yellow-800': invoice.status === 'Due',
                                        })}>{invoice.status}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </PortalCard>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
