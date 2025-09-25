'use client';

import React, { useState, useMemo, FC, ReactNode, useEffect, useRef } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { 
    Edit, 
    Eye, 
    Plus, 
    X, 
    Search, 
    Send, 
    FileText, 
    Sparkles,
    Type as TextIcon, 
    Pilcrow as ParagraphIcon, 
    Phone as PhoneIcon, 
    Hash as HashIcon, 
    ChevronDown, 
    CheckSquare, 
    CircleDot as RadioIcon,
    GripVertical,
    Trash2,
    Save,
    CheckCircle,
    Calendar as CalendarIcon,
    Clock as ClockIcon
} from 'lucide-react';
import clsx from 'clsx';
import Link from "next/link";
import { useFetchData } from '@/hooks/useFetchData';

import { useRouter } from "next/navigation"; // If using app router



// --- TYPE DEFINITIONS ---
type FieldType = 'text' | 'textarea' | 'tel' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'time';

interface FormField {
    id: number;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: string[];
}

interface Template {
    id: number;
    title: string;
    submissions_count :number;
    last_used: string;
    fields: FormField[];
    created_at: string;
    updated_at: string;
}

interface Client {
  id: number;
  firstname: string;
  lastname: string;
}

interface Project {
  id: number;
  title: string;
}
interface ClientResponse {
    status: boolean;
    clients: Client[]; // The array of services is inside this property
}



interface Submission { id: number; clientName: string; projectName: string; submittedOn: string; answers: Record<string, string>; }

const HeaderTitleCard: FC<{ onGoBack?: () => void; title: string; description: string; children: ReactNode }> = ({ title, description, children }) => (
    <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div><h1 className="text-3xl font-bold">{title}</h1><p className="mt-1 text-gray-500">{description}</p></div>
            <div className="mt-4 md:mt-0">{children}</div>
        </div>
    </div>
);
const useGoBack = () => () => console.log("Navigating back...");

// --- MOCK DATA ---


const mockSubmissions: Record<number, Submission[]> = { 1: [], 2: [] };


// --- REUSABLE FORM BUILDER COMPONENT ---
// This component now receives its data and functions via props.
interface FormBuilderProps {
    formToEdit?: Template | null;
    onBack: () => void;
    handleSaveForm: () => void;
    // State and setters from parent
    formTitle: string;
    setFormTitle: (title: string) => void;
    formFields: FormField[];
    setFormFields: (fields: FormField[] | ((prevFields: FormField[]) => FormField[])) => void;
    isSaving: boolean;
    saveStatus: 'idle' | 'success' | 'error';
}

const FormBuilder: FC<FormBuilderProps> = ({ 
    formToEdit, 
    onBack, 
    handleSaveForm,
    formTitle,
    setFormTitle,
    formFields,
    setFormFields,
    isSaving,
    saveStatus
}) => {
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const selectedField = formFields.find(f => f.id === selectedFieldId);

    const FIELD_DEFINITIONS = [
        { type: 'text' as FieldType, label: 'Text', icon: <TextIcon /> },
        { type: 'textarea' as FieldType, label: 'Paragraph', icon: <ParagraphIcon /> },
        { type: 'tel' as FieldType, label: 'Phone', icon: <PhoneIcon /> },
        { type: 'number' as FieldType, label: 'Number', icon: <HashIcon /> },
        { type: 'date' as FieldType, label: 'Date', icon: <CalendarIcon /> },
        { type: 'time' as FieldType, label: 'Time', icon: <ClockIcon /> },
        { type: 'dropdown' as FieldType, label: 'Dropdown', icon: <ChevronDown /> },
        { type: 'checkbox' as FieldType, label: 'Checkbox', icon: <CheckSquare /> },
        { type: 'radio' as FieldType, label: 'Radio Group', icon: <RadioIcon /> },
    ];

    const createNewField = (type: FieldType): FormField => {
        const baseField: FormField = { id: Date.now(), type, label: `Untitled ${type}`, required: false };
        if (type === 'dropdown' || type === 'radio') baseField.options = ['Option 1', 'Option 2'];
        if (type === 'checkbox') baseField.label = 'Checkbox Label';
        return baseField;
    };

    const handleDragStart = (e: React.DragEvent, type: FieldType) => e.dataTransfer.setData('field-type', type);
    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fieldType = e.dataTransfer.getData('field-type') as FieldType;
        if (fieldType) {
            const newField = createNewField(fieldType);
            setFormFields(prev => [...prev, newField]);
            setSelectedFieldId(newField.id);
        }
    };
    const updateField = (id: number, prop: keyof FormField, value: any) => setFormFields(prev => prev.map(f => f.id === id ? { ...f, [prop]: value } : f));
    const deleteField = (id: number) => {
        setFormFields(prev => prev.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };
    const handleFieldDropReorder = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newFields = [...formFields];
        const [draggedItem] = newFields.splice(dragItem.current, 1);
        newFields.splice(dragOverItem.current, 0, draggedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setFormFields(newFields);
    };

    const renderFieldPreview = (field: FormField) => {
        switch (field.type) {
            case 'textarea':
                return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" rows={3} readOnly />;
            case 'dropdown':
                return <select className="w-full p-2 border border-gray-300 rounded-md bg-white">{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
            case 'checkbox':
                return <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600" /><span>{field.label}</span></div>;
            case 'radio':
                return <div className="space-y-2">{field.options?.map((opt, i) => (<div key={i} className="flex items-center gap-2"><input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-purple-600" /><label>{opt}</label></div>))}</div>;
            default:
                return <input type={field.type} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />;
        }
    };

    return (
       <div className="h-full flex flex-col">
            <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-600 hover:text-gray-900">&larr; Back to Templates</button>
                    <h1 className="text-xl font-bold text-gray-800">{formToEdit ? 'Edit Form' : 'Create Form'}</h1>
                </div>
                <button onClick={handleSaveForm} disabled={isSaving} className={clsx("flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors", { 'bg-purple-600 hover:bg-purple-700': !isSaving && saveStatus === 'idle', 'bg-gray-400 cursor-not-allowed': isSaving, 'bg-green-600': saveStatus === 'success', 'bg-red-600': saveStatus === 'error' })}>
                    {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : (saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                    <span>{isSaving ? 'Saving...' : (saveStatus === 'success' ? 'Saved!' : (saveStatus === 'error' ? 'Error!' : 'Save Form'))}</span>
                </button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">FIELDS</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {FIELD_DEFINITIONS.map(field => (
                            <div key={field.type} draggable onDragStart={(e) => handleDragStart(e, field.type)} className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-gray-600 hover:text-purple-600 transition-colors cursor-grab active:cursor-grabbing">
                                <div className="w-8 h-8">{field.icon}</div>
                                <span className="text-xs mt-1">{field.label}</span>
                            </div>
                        ))}
                    </div>
                </aside>
                <main className="flex-1 bg-gray-50 p-8 overflow-y-auto" onDragOver={(e) => e.preventDefault()} onDrop={handleCanvasDrop}>
                    <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-sm border border-gray-200">
                        <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="text-3xl font-bold w-full p-2 -m-2 mb-4 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <p className="text-gray-500 mb-8">Drag fields from the left panel or reorder them below.</p>
                        <div className="space-y-4">
                            {formFields.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500">Drop fields here</p>
                                </div>
                            ) : formFields.map((field, index) => (
                                <div key={field.id} onClick={() => setSelectedFieldId(field.id)} draggable onDragStart={() => dragItem.current = index} onDragEnter={() => dragOverItem.current = index} onDragEnd={handleFieldDropReorder} onDragOver={(e) => e.preventDefault()} className={clsx('p-4 rounded-lg cursor-pointer transition-all border-2', selectedFieldId === field.id ? 'bg-purple-50 border-purple-500' : 'bg-white hover:border-gray-300 border-transparent')}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <label className="font-semibold text-gray-700 block mb-2">{field.type !== 'checkbox' && field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                            {renderFieldPreview(field)}
                                        </div>
                                        <div className="flex items-center ml-4">
                                            <button onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                                            <div className="cursor-grab text-gray-400 active:cursor-grabbing"><GripVertical /></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                <aside className={clsx("w-80 bg-white border-l border-gray-200 p-6 transition-all duration-300", selectedFieldId ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Field Properties</h3>
                    {selectedField && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Label</label>
                                <input type="text" value={selectedField.label} onChange={(e) => updateField(selectedField.id, 'label', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                            </div>
                            {['text', 'textarea', 'number', 'tel', 'date', 'time'].includes(selectedField.type) && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Placeholder</label>
                                    <input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, 'placeholder', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                                </div>
                            )}
                            {['dropdown', 'radio'].includes(selectedField.type) && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Options (one per line)</label>
                                    <textarea value={selectedField.options?.join('\n')} onChange={(e) => updateField(selectedField.id, 'options', e.target.value.split('\n'))} className="w-full mt-1 p-2 border border-gray-300 rounded-md" rows={4} />
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-4">
                                <label className="text-sm font-medium text-gray-600">Required</label>
                                <button onClick={() => updateField(selectedField.id, 'required', !selectedField.required)} className={clsx("relative inline-flex h-6 w-11 items-center rounded-full", selectedField.required ? 'bg-purple-600' : 'bg-gray-200')}>
                                    <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition", selectedField.required ? 'translate-x-6' : 'translate-x-1')} />
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function FormTemplatesPage() {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [formToEdit, setFormToEdit] = useState<Template | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for the Form Builder - lifted up to the parent
    const [formTitle, setFormTitle] = useState("");
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Modals and sidebars state
    const [viewingSubmissions, setViewingSubmissions] = useState<Template | null>(null);
    const [isSubmissionsSidebarOpen, setSubmissionsSidebarOpen] = useState(false);
    const [submissionSearch, setSubmissionSearch] = useState('');
    const [isUseModalOpen, setUseModalOpen] = useState(false);
    const [templateToUse, setTemplateToUse] = useState<Template | null>(null);

    const [isViewFormModalOpen, setViewFormModalOpen] = useState(false);
    const [templateToView, setTemplateToView] = useState<Template | null>(null);
    const [isViewingFormLoading, setIsViewingFormLoading] = useState(false);

    
    // const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const handleGoBack = useGoBack();
    const router = useRouter();
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
    
    // This is the working save function, now located correctly in the parent component
    const handleSaveForm = async () => {
        setIsSaving(true);
        setSaveStatus('idle');

       const endpoint = `${BASE_URL}/professionals/forms/update/${formToEdit.id}`;
        const method = 'PUT';

        const payload = {
            title: formTitle,
            fields: formFields.map(field => {
                const { id, ...rest } = field;
                // This logic helps differentiate between new fields (with a timestamp ID)
                // and existing fields (with a database ID).
                const isExistingField = String(id).length < 10;
                return isExistingField ? { id, ...rest } : rest;
            })
        };

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.message || 'Failed to save form');
            }

            await response.json();
            setSaveStatus('success');
            setTimeout(handleBackToList, 1500); // Go back to list after success

        } catch (error) {
            console.error(error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
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
            const formattedTemplates = data.map((form: any) => ({
                ...form,
                submissionsCount: form.submissions_count || 0,
                lastUsed: new Date(form.last_used).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                fields: [], // fields are intentionally empty for the list view
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

    const handleEditClick = async (template: Template) => {
        setViewFormModalOpen(false);
        // CRITICAL FIX: Fetch the full form details, including fields, before editing.
        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/professionals/forms/show/${template.id}`, {
                 headers: { 'Authorization': `Bearer ${userToken}`, 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Could not load form for editing.');
            const fullFormData = await response.json();
            
            setFormToEdit(fullFormData);
            setFormTitle(fullFormData.title);
            setFormFields(fullFormData.fields);
            setView('builder');
        } catch (error) {
             setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        setFormToEdit(null);
        // Reset the form builder state for a new form
        setFormTitle("New Client Intake Form");
        setFormFields([]);
        setView('builder');
    };

    const handleBackToList = () => {
        setView('list');
        setFormToEdit(null);
        fetchAndSetForms(); // Refresh the list to see changes
    };

    // All other handlers (handleViewSubmissionsClick, etc.) remain unchanged
    const handleViewSubmissionsClick = (template: Template) => {
        setViewingSubmissions(template);
        setSubmissionsSidebarOpen(true);
        setViewFormModalOpen(false);
    };
    const closeSubmissionsSidebar = () => {
        setSubmissionsSidebarOpen(false);
        setSubmissionSearch('');
        setTimeout(() => setViewingSubmissions(null), 300);
    };
    const handleUseClick = (template: Template) => {
        setTemplateToUse(template);
        setUseModalOpen(true);
    };
    const closeUseModal = () => {
        setUseModalOpen(false);
        setSelectedClientId(''); 
        setSelectedProjectId('');
        setTimeout(() => setTemplateToUse(null), 300);
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



// Get the clients
    const { data, loading } = useFetchData<ClientResponse>('/professionals/contacts/list');
    // Correctly and safely access the 'services' array
    const clients = data?.clients || [];

  // Fetch projects whenever client changes
  useEffect(() => {
  if (selectedClientId) {
    const token = localStorage.getItem("token"); // 👈 adjust if you store token elsewhere (cookies, context, etc.)

    fetch(
      `http://127.0.0.1:8000/api/v1/professionals/projects/clientProjects/${selectedClientId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 attach token here
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setProjects(data.data);
        } else {
          console.error("Unexpected projects response:", data);
          setProjects([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setProjects([]);
      });
  } else {
    setProjects([]);
    setSelectedProjectId("");
  }
}, [selectedClientId]);



    const closeViewFormModal = () => {
        setViewFormModalOpen(false);
        setTimeout(() => setTemplateToView(null), 300);
    };

    // All Modals and Sidebars remain unchanged
    const ViewFormModal = () => {
         const renderFieldPreview = (field: FormField) => {
            switch (field.type) {
                case 'textarea':
                    return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" rows={3} disabled />;
                case 'dropdown':
                    return <select className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled>{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
                case 'checkbox':
                    return <div className="flex items-center gap-2 mt-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600 cursor-not-allowed" disabled /><span>{field.label}</span></div>;
                case 'radio':
                    return <div className="space-y-2 mt-2">{field.options?.map((opt, i) => (<div key={i} className="flex items-center gap-2"><input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-purple-600 cursor-not-allowed" disabled /><label className="text-gray-700">{opt}</label></div>))}</div>;
                case 'date': return <input type="date" className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled />;
                case 'time': return <input type="time" className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled />;
                default:
                    return <input type={field.type} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled />;
            }
        };

        return (
            <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isViewFormModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ${isViewFormModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                    {isViewingFormLoading ? (
                        <div className="p-8 text-center">Loading form...</div>
                    ) : templateToView && (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{templateToView.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">Form Preview</p>
                                    </div>
                                    <button onClick={closeViewFormModal} className="absolute top-6 right-6 p-2 -m-2 rounded-full hover:bg-gray-100 sm:static sm:m-0"><X /></button>
                                </div>
                                 <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                                    {/* <button onClick={() => handleViewSubmissionsClick(templateToView)} className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium p-2 rounded-md">
                                        <Eye />
                                        <span>View Submissions ({templateToView.submissions_count})</span>
                                    </button> */}
                                    <button 
                                    
                                        onClick={() =>  router.push(
                                        `/forms/submissions?templateId=${templateToView.id}`
                                        )} 
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 rounded-md hover:bg-gray-100">
                                        <Eye className="w-4 h-4"/> <span>View Submissions ({templateToView.submissions_count})</span>
                                    </button>

                                    <button onClick={() => handleEditClick(templateToView)} className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium p-2 rounded-md">
                                        <Edit />
                                        <span>Edit Form</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 bg-gray-50 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-6">
                                    {templateToView.fields.map((field) => (
                                        <div key={field.id}>
                                            <label className="font-semibold text-gray-700">
                                                {field.type !== 'checkbox' && field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <div className="mt-2">
                                                {renderFieldPreview(field)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };
   
    const UseFormModal = () => (
         <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center transition-opacity duration-300 ${isUseModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${isUseModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {templateToUse && (
                    <>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Use "{templateToUse.title}"</h2>
                                <p className="text-sm text-gray-500 mt-1">Select a client and project to proceed.</p>
                            </div>
                            <button onClick={closeUseModal} className="p-2 -m-2 rounded-full hover:bg-gray-100"><X /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label
                                htmlFor="client-select"
                                className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                Select Client
                                </label>
                                <select
                                id="client-select"
                                value={selectedClientId}
                                onChange={(e) => {
                                    setSelectedClientId(e.target.value);
                                    setSelectedProjectId("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                <option value="">Choose a client...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                    {c.firstname} {c.lastname}
                                    </option>
                                ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                                <select
                                    id="project-select"
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={!selectedClientId}
                                    >
                                    <option value="">
                                        {selectedClientId ? "Choose a project..." : "Select a client first"} 
                                    </option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.title}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl grid grid-cols-2 gap-4">
                          
                            <button
                                onClick={() => {
                                    const token = localStorage.getItem("token"); 
                                    router.push(
                                    `/forms/fill-form?clientId=${selectedClientId}&projectId=${selectedProjectId}&templateId=${templateToUse.id}&token=${token}`
                                    );
                                }}
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedProjectId}
                                >
                                Fill on Behalf of Client
                            </button>

                            <button className="w-full p-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!selectedProjectId}>Send to Client</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // const SubmissionsSidebar = () => (
    //     <aside className={clsx("fixed top-0 right-0 h-full bg-white w-[90vw] max-w-[800px] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out", isSubmissionsSidebarOpen ? 'translate-x-0' : 'translate-x-full')}>
    //         {viewingSubmissions && (
    //             <div className="flex flex-col h-full">
    //                 <div className="p-6 border-b border-gray-200 flex justify-between items-start">
    //                     <div>
    //                         <h2 className="text-xl font-bold text-gray-900">{viewingSubmissions.title}</h2>
    //                         <p className="text-sm text-gray-500">Viewing all submissions</p>
    //                     </div>
    //                     <button onClick={closeSubmissionsSidebar} className="p-2 -m-2 rounded-full hover:bg-gray-100"><X /></button>
    //                 </div>
    //                 <div className="p-6 border-b border-gray-200">
    //                     <div className="relative">
    //                         <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Search /></span>
    //                         <input type="text" placeholder="Search submissions..." value={submissionSearch} onChange={(e) => setSubmissionSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
    //                     </div>
    //                 </div>
    //                 <div className="flex-1 overflow-auto">
    //                     <table className="w-full text-sm text-left">
    //                        {/* ... table content ... */}
    //                     </table>
    //                 </div>
    //             </div>
    //         )}
    //     </aside>
    // );


    if (view === 'builder') {
        return (
            <DashboardLayout>
                <FormBuilder 
                    formToEdit={formToEdit} 
                    onBack={handleBackToList}
                    handleSaveForm={handleSaveForm}
                    // Pass state down to the builder
                    formTitle={formTitle}
                    setFormTitle={setFormTitle}
                    formFields={formFields}
                    setFormFields={setFormFields}
                    isSaving={isSaving}
                    saveStatus={saveStatus}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <HeaderTitleCard title="Forms" description="Create a custom form for your needs">
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
                            onClick={() => handleEditClick(template)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 rounded-md hover:bg-gray-100"
                        >
                            <Trash2 className="w-4 h-4" /> <span>Delete</span>
                        </button>
                        <button
                            onClick={() => handleViewFormClick(template)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 rounded-md hover:bg-gray-100"
                        >
                            <Eye className="w-4 h-4" /> <span>View</span>
                        </button>
                        <button
                            onClick={() => handleUseClick(template)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors"
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
            <ViewFormModal />
            <UseFormModal />
            {/* <SubmissionsSidebar /> */}
        </DashboardLayout>
    );
}