'use client';

import React, { useState, useEffect, FC, ReactNode } from 'react';
import {  User, Briefcase, Calendar as CalendarIcon, Save, CheckCircle, ArrowLeft } from "lucide-react";
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";


const HeaderTitleCard: FC<{ onGoBack?: () => void; title: string; description: string; children: ReactNode }> = ({ onGoBack, title, description, children }) => (
    <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex justify-between items-start">
            <div>
                {onGoBack && (
                    <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-1 text-gray-500">{description}</p>
            </div>
            <div className="mt-4 sm:mt-0">{children}</div>
        </div>
    </div>
);

const useGoBack = () => {
    return () => {
        // In a real Next.js app, you'd use router.back()
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };
};
// --- END OF PLACEHOLDERS ---


// --- TYPE DEFINITIONS ---
interface FormField {
    id: number;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
}

interface Contact {
    firstname: string;
    lastname: string;
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
    form: {
        title: string;
        fields: FormField[];
    };
}

// --- MAIN PAGE COMPONENT ---
export default function EditSubmissionPage() {
    const [submission_id, setSubmissionId] = useState<string | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [formData, setFormData] = useState<Record<string, string | boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    
    const handleGoBack = useGoBack();
    const userToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    const router = useRouter();

    // Effect to get the submission ID from the URL path
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/');
            // Assumes URL is like /.../edit/123
            const id = pathParts[pathParts.length - 1];
            if (id && !isNaN(Number(id))) {
                setSubmissionId(id);
            } else {
                setError("Invalid Submission ID in URL.");
                setLoading(false);
            }
        }
    }, []);

    // Effect to fetch the submission data
    useEffect(() => {
        if (!submission_id) return;

        const fetchSubmission = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BASE_URL}/professionals/forms/viewFormSubmissions/${submission_id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch submission details.");
                }
                const data: Submission = await response.json();
                setSubmission(data);

                // Pre-populate the formData state with existing answers
                const initialFormData: Record<string, string | boolean> = {};
                if (data.answers && data.form?.fields) {
                    data.answers.forEach(answer => {
                        const field = data.form.fields.find(f => f.id === answer.form_field_id);
                        if (field?.type === 'checkbox') {
                            initialFormData[answer.form_field_id] = answer.value === '1' || String(answer.value).toLowerCase() === 'true';
                        } else {
                            initialFormData[answer.form_field_id] = answer.value;
                        }
                    });
                }
                setFormData(initialFormData);

            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submission_id, userToken, BASE_URL]);

    const handleInputChange = (fieldId: number, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSave = async () => {
        if (!submission) return;

        setIsSaving(true);
        setSaveStatus('idle');

        // Transform formData back into the array format the API expects
        const answers = Object.entries(formData).map(([fieldId, value]) => ({
            form_field_id: Number(fieldId),
            value: typeof value === 'boolean' ? (value ? '1' : '0') : String(value),
        }));

        try {
            const response = await fetch(`${BASE_URL}/professionals/forms/updateFormSubmissions/${submission.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${userToken}`,
                },
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update submission.");
            }

            setSaveStatus('success');
            router.push(`/forms/submissions/view/${submission.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // Helper to render the correct input for each field type
    const renderFieldInput = (field: FormField) => {
        const value = formData[field.id];

        switch (field.type) {
            case 'textarea':
                return <textarea value={String(value || '')} onChange={(e) => handleInputChange(field.id, e.target.value)} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md" rows={4} />;
            
            case 'dropdown':
                return <select value={String(value || '')} onChange={(e) => handleInputChange(field.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                    {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>;

            case 'checkbox':
                return <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={!!value} onChange={(e) => handleInputChange(field.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600" />
                    <span>{field.label}</span>
                </div>;

            case 'radio':
                return <div className="space-y-2 mt-2">
                    {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="radio" name={String(field.id)} value={opt} checked={value === opt} onChange={(e) => handleInputChange(field.id, e.target.value)} className="h-4 w-4 border-gray-300 text-purple-600" />
                            <label className="text-gray-700">{opt}</label>
                        </div>
                    ))}
                </div>;
            
            default:
                return <input type={field.type} value={String(value || '')} onChange={(e) => handleInputChange(field.id, e.target.value)} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md" />;
        }
    };

    if (loading) return <DashboardLayout><p className="text-center p-12">Loading submission...</p></DashboardLayout>;
    if (error) return <DashboardLayout><p className="text-center p-12 text-red-600">Error: {error}</p></DashboardLayout>;
    if (!submission) return <DashboardLayout><p className="text-center p-12">No submission data found.</p></DashboardLayout>;

    return (
        <DashboardLayout>
            <HeaderTitleCard onGoBack={handleGoBack} title={`Edit Submission: ${submission.form.title}`} description="Update the answers for this submission.">
                <button onClick={handleSave} disabled={isSaving} className={clsx("flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors", { 'bg-purple-600 hover:bg-purple-700': !isSaving && saveStatus === 'idle', 'bg-gray-400 cursor-not-allowed': isSaving, 'bg-green-600': saveStatus === 'success', 'bg-red-600': saveStatus === 'error' })}>
                    {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : (saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                    <span>{isSaving ? 'Saving...' : (saveStatus === 'success' ? 'Saved!' : (saveStatus === 'error' ? 'Error!' : 'Save Changes'))}</span>
                </button>
            </HeaderTitleCard>

            <div className="max-w-4xl mx-auto mt-8">
                 {/* Meta Information */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg"><User className="w-5 h-5 text-purple-700" /></div>
                        <div><p className="text-sm text-gray-500">Client</p><p className="font-semibold">{`${submission.contact.firstname} ${submission.contact.lastname}`}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="bg-blue-100 p-3 rounded-lg"><Briefcase className="w-5 h-5 text-blue-700" /></div>
                         <div><p className="text-sm text-gray-500">Project</p><p className="font-semibold">{submission.project.title}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="bg-green-100 p-3 rounded-lg"><CalendarIcon className="w-5 h-5 text-green-700" /></div>
                         <div><p className="text-sm text-gray-500">Submitted On</p><p className="font-semibold">{new Date(submission.submitted_at).toLocaleDateString()}</p></div>
                    </div>
                </div>

                {/* Editable Answers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                   {submission.form.fields.map(field => (
                       <div key={field.id} className="p-6">
                           <label className="font-semibold text-gray-700">
                               {field.type !== 'checkbox' && field.label}
                               {field.required && <span className="text-red-500 ml-1">*</span>}
                           </label>
                           <div className="mt-2">
                               {renderFieldInput(field)}
                           </div>
                       </div>
                   ))}
                </div>
            </div>
        </DashboardLayout>
    );
};


