'use client';

import React, { useState, useEffect, FC } from 'react';
import { Check, X as XIcon, User, Briefcase, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";

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

// --- HELPER COMPONENT FOR DISPLAYING FIELDS ---
const FieldDisplay: FC<{ field: FormField; answerValue?: string }> = ({ field, answerValue }) => {
    const renderField = () => {
        switch (field.type) {
            case 'textarea':
                return <p className="text-gray-700 whitespace-pre-wrap">{answerValue || '-'}</p>;
            
            case 'checkbox':
                const isChecked = answerValue === '1' || String(answerValue).toLowerCase() === 'true';
                return isChecked 
                    ? <Check className="w-5 h-5 text-green-600" /> 
                    : <XIcon className="w-5 h-5 text-gray-400" />;

            case 'radio':
            case 'dropdown':
                 return <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">{answerValue || 'Not selected'}</span>;
            
            case 'date':
                return <span>{answerValue ? new Date(answerValue).toLocaleDateString() : '-'}</span>;

            default:
                return <p className="text-gray-700">{answerValue || '-'}</p>;
        }
    };

    return (
        <div className="py-4">
            <label className="text-sm font-semibold text-gray-500">{field.label}</label>
            <div className="mt-2 text-base text-gray-800">
                {renderField()}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const ViewSubmissionPage = () => {
    // State to hold the submission ID from the URL
    const [submission_id, setSubmissionId] = useState<string | null>(null);

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const userToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const BASE_URL = 'http://127.0.0.1:8000/api/v1';

    const handleGoBack = useGoBack();

    // Effect to get the submission ID from the URL path on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            if (id && !isNaN(Number(id))) {
                 setSubmissionId(id);
            }
        }
    }, []);

    useEffect(() => {
        if (!submission_id) {
            // This will now only set an error if the ID is truly missing after checking the path
            if (!loading) setError("Submission ID is missing or invalid in the URL.");
            setLoading(false);
            return;
        }

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
                const data = await response.json();
                setSubmission(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submission_id, userToken, BASE_URL]);

    if (loading) {
        return <DashboardLayout><p className="text-center p-12">Loading submission...</p></DashboardLayout>;
    }

    if (error) {
        return <DashboardLayout><p className="text-center p-12 text-red-600">Error: {error}</p></DashboardLayout>;
    }

    if (!submission) {
        return <DashboardLayout><p className="text-center p-12">No submission data found.</p></DashboardLayout>;
    }

    const getAnswerForField = (fieldId: number): string | undefined => {
        return submission.answers.find(a => a.form_field_id === fieldId)?.value;
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                     <button onClick={handleGoBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{submission.form.title}</h1>
                    <p className="text-gray-500 mt-1">Submission Details</p>
                </div>
                
                {/* Meta Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg"><User className="w-5 h-5 text-purple-700" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Client</p>
                            <p className="font-semibold">{`${submission.contact.firstname} ${submission.contact.lastname}`}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg"><Briefcase className="w-5 h-5 text-blue-700" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Project</p>
                            <p className="font-semibold">{submission.project.title}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg"><CalendarIcon className="w-5 h-5 text-green-700" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Submitted On</p>
                            <p className="font-semibold">{new Date(submission.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Answers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                   {submission.form.fields.map(field => (
                       <div key={field.id} className="p-6">
                           <FieldDisplay 
                               field={field} 
                               answerValue={getAnswerForField(field.id)}
                           />
                       </div>
                   ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ViewSubmissionPage;

