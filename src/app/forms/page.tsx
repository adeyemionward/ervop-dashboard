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

    // All Modals and Sidebars remain unchanged
    // const ViewFormModal = () => {
    //      const renderFieldPreview = (field: FormField) => {
    //         switch (field.type) {
    //             case 'textarea':
    //                 return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" rows={3} disabled />;
    //             case 'dropdown':
    //                 return <select className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled>{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
    //             case 'checkbox':
    //                 return <div className="flex items-center gap-2 mt-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600 cursor-not-allowed" disabled /><span>{field.label}</span></div>;
    //             case 'radio':
    //                 return <div className="space-y-2 mt-2">{field.options?.map((opt, i) => (<div key={i} className="flex items-center gap-2"><input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-purple-600 cursor-not-allowed" disabled /><label className="text-gray-700">{opt}</label></div>))}</div>;
    //             case 'date': return <input type="date" className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled />;
    //             case 'time': return <input type="time" className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled />;
    //             default:
    //                 return <input type={field.type} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled />;
    //         }
    //     };

    //     return (
    //         <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isViewFormModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
    //             <div className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ${isViewFormModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
    //                 {isViewingFormLoading ? (
    //                     <div className="p-8 text-center">Loading form...</div>
    //                 ) : templateToView && (
    //                     <>
    //                         <div className="p-6 border-b border-gray-200">
    //                             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
    //                                 <div>
    //                                     <h2 className="text-xl font-bold text-gray-900">{templateToView.title}</h2>
    //                                     <p className="text-sm text-gray-500 mt-1">Form Preview</p>
    //                                 </div>
    //                                 <button onClick={closeViewFormModal} className="absolute top-6 right-6 p-2 -m-2 rounded-full hover:bg-gray-100 sm:static sm:m-0"><X /></button>
    //                             </div>
    //                              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                                   
    //                                 <button 
                                    
    //                                     onClick={() =>  router.push(
    //                                     `/forms/submissions?templateId=${templateToView.id}`
    //                                     )} 
    //                                     className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 rounded-md hover:bg-gray-100">
    //                                     <Eye className="w-4 h-4"/> <span>View Submissions ({templateToView.submissions_count})</span>
    //                                 </button>

                                  

    //                                 <button
    //                                 onClick={() => router.push(`/forms/edit/${templateToView.id}`)}
    //                                 className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium p-2 rounded-md"
    //                                 >
    //                                 <Edit />
    //                                 <span>Edit Form</span>
    //                                 </button>
    //                             </div>
    //                         </div>
    //                         <div className="p-8 bg-gray-50 max-h-[60vh] overflow-y-auto">
    //                             <div className="space-y-6">
    //                                 {templateToView.fields.map((field) => (
    //                                     <div key={field.id}>
    //                                         <label className="font-semibold text-gray-700">
    //                                             {field.type !== 'checkbox' && field.label}
    //                                             {field.required && <span className="text-red-500 ml-1">*</span>}
    //                                         </label>
    //                                         <div className="mt-2">
    //                                             {renderFieldPreview(field)}
    //                                         </div>
    //                                     </div>
    //                                 ))}
    //                             </div>
    //                         </div>
    //                     </>
    //                 )}
    //             </div>
    //         </div>
    //     );
    // };
   
// const UseFormModal = () => {
//   // Local state for modal selections (isolated from page state until confirmed)
//   const [modalClient, setModalClient] = useState(selectedClient);
//   const [modalProject, setModalProject] = useState(selectedProject);
//   const [modalAppointment, setModalAppointment] = useState(selectedAppointment);

//   // Sync modal state when modal opens
//   useEffect(() => {
//     if (isUseModalOpen) {
//       setModalClient(selectedClient);
//       setModalProject(selectedProject);
//       setModalAppointment(selectedAppointment);
//     }
//   }, [isUseModalOpen]);

//   const handleProceed = () => {
//     // Update page-level state when proceeding
//     setSelectedClient(modalClient);
//     setSelectedProject(modalProject);
//     setSelectedAppointment(modalAppointment);

//     const token = localStorage.getItem("token");
//     router.push(
//       `/forms/fill-form?clientId=${modalClient}&projectId=${modalProject}&templateId=${templateToUse?.id}&token=${token}`
//     );
//   };

//   const closeModal = () => {
//     setUseModalOpen(false);
//     setTimeout(() => setTemplateToUse(null), 300);
//   };

//   return (
//     <div
//       className={`fixed inset-0 bg-black/40 bg-opacity-60 z-50 flex items-center justify-center transition-opacity duration-300 ${
//         isUseModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//       }`}
//     >
//     <div
//         className={`bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${
//           isUseModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
//         }`}
//       >
//         {templateToUse && (
//           <>
//             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {`Use "${templateToUse.title}"`}
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Select a client and project to proceed.
//                 </p>
//               </div>
//               <button
//                 onClick={closeModal}
//                 className="p-2 -m-2 rounded-full hover:bg-gray-100"
//               >
//                 <X />
//               </button>
//             </div>

//             {/* ClientSelector - uses modal-local state */}
//             <ClientSelector
//               selectedClient={modalClient}
//               setSelectedClient={setModalClient}
//               selectedProject={modalProject}
//               setSelectedProject={setModalProject}
//               selectedAppointment={modalAppointment}
//               setSelectedAppointment={setModalAppointment}
//               contacts={contacts || []}
//               showInvoices={false}
//             />

//             <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl grid grid-cols-2 gap-4">
//               <button
//                 onClick={handleProceed}
//                 className="w-full p-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={!modalProject}
//               >
//                 Fill on Behalf of Client
//               </button>

//               <button
//                 className="w-full p-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={!modalProject}
//               >
//                 Send to Client
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

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
                            onClick={() => setTemplateToDelete(template)}
                            className="flex items-center gap-2 text-sm text-red-400 bg-red-50 hover:text-red-600 cursor-pointer font-medium p-2 rounded-md hover:bg-red-100"
                            >
                            <Trash2 className="w-4 h-4" /> 
                            <span>Delete</span>
                        </button>

                        <button
                            onClick={() => handleViewFormClick(template)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 cursor-pointer rounded-md hover:bg-gray-100"
                        >
                            <Eye className="w-4 h-4" /> <span>View</span>
                        </button>
                        <button
                            onClick={() => handleUseClick(template)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-semibold cursor-pointer rounded-lg hover:bg-purple-100 transition-colors"
                        >
                            <Send /> <span>Use</span>
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