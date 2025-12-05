'use client';

import React, { useState,useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import {  
    Eye, 
    Plus, 
    Send, 
    Trash2,
} from 'lucide-react';
import Link from "next/link";

import { useClientData } from '@/hooks/useClientData';
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from '@/hooks/useGoBack';
import UseFormModal from '@/components/FormBuilder/UseFormModal';
import ViewFormModal from '@/components/FormBuilder/ViewFormModal';
import { Template } from '@/types/formTypes';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import toast from 'react-hot-toast';
 

// --- MAIN PAGE COMPONENT ---
export default function FormTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    
  
    const [isUseModalOpen, setUseModalOpen] = useState(false);
    const [templateToUse, setTemplateToUse] = useState<Template | null>(null);

    const [isViewFormModalOpen, setViewFormModalOpen] = useState(false);
    const [templateToView, setTemplateToView] = useState<Template | null>(null);
    const [isViewingFormLoading, setIsViewingFormLoading] = useState(false);

  
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
    
     const [selectedClient, setSelectedClient] = useState("");
      const [selectedProject, setSelectedProject] = useState("");
      const [selectedAppointment, setSelectedAppointment] = useState("");

      const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
      const [deletingFormId, setDeletingFormId] = useState<number | null>(null);

      

    // 1. Destructure and use the data
   const { contacts } = useClientData(selectedClient);
    const handleGoBack = useGoBack();

    const deleteForm = async (id: number) => {
    if (!userToken) {
        console.error("No token.");
        return;
    }

    setDeletingFormId(id);

    try {
        const res = await fetch(`${BASE_URL}/professionals/forms/delete/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to delete form`);
        }

        // remove from UI
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast.success("Form deleted successfully");

    } catch (error) {
        console.error("Error deleting form:", error);
    } finally {
        setDeletingFormId(null);
        setTemplateToDelete(null); // close modal
    }
};


    const fetchAndSetForms = async () => {
         try {
            const response = await fetch(`${BASE_URL}/professionals/forms/list`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch forms');
            const data = await response.json();
            const formattedTemplates: Template[] = data.map((form: Template) => ({
            ...form,
            submissionsCount: form.submissions_count ?? 0,
            lastUsed: form.last_used
                ? new Date(form.last_used).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : 'N/A',
            fields: [],
            }));

            setTemplates(formattedTemplates);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { 
        if(userToken) {
            fetchAndSetForms();
        } 
    }, [userToken, BASE_URL]);

 
   
    const handleUseClick = (template: Template) => {
        setTemplateToUse(template);
        setUseModalOpen(true);
    };
   
    const handleViewFormClick = async (template: Template) => {
        setViewFormModalOpen(true);
        setIsViewingFormLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/professionals/forms/show/${template.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch form details');
            const data = await response.json();
            setTemplateToView(data);
        } catch (err) {
            console.error(err);
            closeViewFormModal();
        } finally {
            setIsViewingFormLoading(false);
        }
    };

    const closeViewFormModal = () => {
        setViewFormModalOpen(false);
        setTimeout(() => setTemplateToView(null), 300);
    };

   
    return (
        <DashboardLayout>
            <HeaderTitleCard onGoBack={handleGoBack} title="Forms" description="Create a custom form for your needs">
                <div className="flex flex-col md:flex-row gap-2">
                   
                    <Link href="/forms/new" className="btn-primary">
                        <Plus className="w-4 h-4" /> 
                        <span>Create Form</span>
                    </Link>
                </div> 
                 
            </HeaderTitleCard>

            {isLoading && <p className="text-center mt-8">Loading form...</p>}
            {error && <p className="text-center mt-8 text-red-600">Error: {error}</p>}
            
           {!isLoading && !error && (
            <>
                {templates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">No templates found</p>
                    <p className="text-sm">Try creating a new template to get started.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {templates.map((template) => (
                    <div
                        key={template.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
                    >
                        <div className="p-5 flex-grow">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {template.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {template.submissionsCount} submissions • Last used on{" "}
                            {template.lastUsed}
                        </p>
                        </div>
                        <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50/50">
                        
                            <button
                                onClick={() => handleUseClick(template)}
                                className="flex items-center gap-2  bg-purple-50 text-purple-700 font-semibold cursor-pointer rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <Send /> <span>Use Form</span>
                            </button>

                            <button
                                onClick={() => handleViewFormClick(template)}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 cursor-pointer rounded-md hover:bg-gray-100"
                            >
                                <Eye className="w-4 h-4" /> <span>View</span>
                            </button>
                        
                            <button
                                onClick={() => setTemplateToDelete(template)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-50 hover:text-red-600 cursor-pointer font-medium p-2 rounded-md hover:bg-red-100"
                                >
                                <Trash2 className="w-4 h-4" /> 
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </>
            )}

            
            {/* I have omitted the full code for your modals for brevity, but they should remain in your file as they were */}
            <ViewFormModal
                isViewFormModalOpen={isViewFormModalOpen}
                closeViewFormModal={closeViewFormModal}
                templateToView={templateToView}
                isViewingFormLoading={isViewingFormLoading}
            />

            <UseFormModal
                isOpen={isUseModalOpen}
                onClose={() => setUseModalOpen(false)}
                template={templateToUse}
                contacts={contacts || []}
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedAppointment={selectedAppointment}
                setSelectedAppointment={setSelectedAppointment}
            />

            <DeleteConfirmModal
                isOpen={!!templateToDelete}
                onCancel={() => setTemplateToDelete(null)}
                title="Delete Form"
                message={
                    templateToDelete
                    ? `Are you sure you want to delete the form "${templateToDelete.title}"?`
                    : ""
                }
                onConfirm={() => templateToDelete && deleteForm(templateToDelete.id)}
                deleting={deletingFormId === templateToDelete?.id}
            />


            {/* <SubmissionsSidebar /> */}
        </DashboardLayout>
    );
}