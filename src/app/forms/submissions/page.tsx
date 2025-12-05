'use client';

import React, { useState, useEffect, useMemo,  ReactNode } from 'react';
import { Eye, Edit, Trash2, Search, Check, X as XIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from '@/components/HeaderTitleCard';
import Link from "next/link";
// Mocking the custom hook to make the component self-contained and runnable
const useGoBack = () => {
    return () => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
        console.log("Navigating back...");
    };
};

// --- TYPE DEFINITIONS ---
interface FormField {
    id: number;
    label: string;
    type: string;
}

interface Contact {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
}

interface Project {
    title: string;
}

interface Submission {
    id: number;
    contact: Contact;
    project: Project;
    submitted_at: string;
    answers: { form_field_id: number; value: string }[];
}

// --- MAIN COMPONENT ---
const FormSubmissions = () => {
    // Replaced useSearchParams with a standard browser API for compatibility
    const [form_id, setFormId] = useState<string | null>(null);
    
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [headers, setHeaders] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const userToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const BASE_URL = 'http://127.0.0.1:8000/api/v1';
    const handleGoBack = useGoBack();

    useEffect(() => {
        // This effect runs once to get the form_id from the URL
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setFormId(params.get("templateId"));
        }
    }, []);

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        if (!form_id) {
            setLoading(false);
            return;
        }

        const fetchSubmissions = async () => {
            setLoading(true);
            const query = debouncedSearchTerm ? `?search=${debouncedSearchTerm}` : '';
            
            try {
                const response = await fetch(`${BASE_URL}/professionals/forms/listFormSubmissions/${form_id}${query}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userToken}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch submissions");

                const data = await response.json();
                setHeaders(data.headers || []);
                // Safely access the nested data property
                setSubmissions(data?.submissions?.data || []);
            } catch (error) {
                console.error(error);
                setHeaders([]);
                setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [form_id, debouncedSearchTerm, userToken, BASE_URL]);

    // Logic to select which columns to display dynamically
    const displayedHeaders = useMemo(() => {
        return headers
            .filter(h => ['text', 'tel', 'number', 'email', 'date', 'time', 'checkbox'].includes(h.type))
            .slice(0, 3); // Max 3 custom fields, for a total of 6 columns
    }, [headers]);

    const getAnswerForField = (submission: Submission, header: FormField): ReactNode => {
        const answer = submission.answers.find(a => a.form_field_id === header.id);
        const value = answer ? answer.value : 'N/A';

        if (header.type === 'checkbox') {
            if (value === '1' || String(value).toLowerCase() === 'true') {
                return <Check className="w-5 h-5 text-green-600" />;
            }
            // For '0', 'false', or 'N/A', show an unchecked icon
            return <XIcon className="w-5 h-5 text-gray-400" />;
        }

        return value;
    };

    return (
        <DashboardLayout>
            
            <div className="flex justify-between items-center mb-6">
                {/* <button onClick={handleGoBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
                                
                <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
                 <p className="text-gray-500 mt-1">Submission Details</p> */}
                 <HeaderTitleCard onGoBack={handleGoBack} title="Form Submissions" description="Submission Details">
                                <div className="flex flex-col md:flex-row gap-2">
                                
                                </div> 
                            </HeaderTitleCard>
                                
                <div className="relative w-full max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search submissions..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {loading ? (
                 <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">Loading submissions...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No submissions found for this form.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">Client</th>
                                <th className="px-6 py-3 font-medium">Project</th>
                                <th className="px-6 py-3 font-medium">Submitted On</th>
                                {displayedHeaders.map(header => (
                                    <th key={header.id} className="px-6 py-3 font-medium">{header.label}</th>
                                ))}
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{`${sub.contact.firstname} ${sub.contact.lastname}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{sub.project.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                                    {displayedHeaders.map(header => (
                                        <td key={header.id} className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {header.type === 'checkbox' ? (
                                                <div className="flex items-center">{getAnswerForField(sub, header)}</div>
                                            ) : (
                                                <span className="truncate max-w-xs">{getAnswerForField(sub, header)}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                        <Link href={`/forms/submissions/view/${sub.id}`}>
                                                <button className="p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-500"><Eye className="w-4 h-4" /></button>
                                        </Link> 
                                        <Link href={`/forms/submissions/edit/${sub.id}`}>
                                                <button className="p-2 rounded hover:bg-gray-200 text-gray-500"><Edit className="w-4 h-4" /></button>
                                        </Link>
                                        
                                        <button className="p-2 rounded hover:bg-red-100 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FormSubmissions;
