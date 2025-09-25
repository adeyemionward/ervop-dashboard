'use client';

import React, { useState, useMemo, FC, ReactNode, useEffect, useRef } from 'react';
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
    submissionsCount: number;
    lastUsed: string;
    fields: FormField[];
    created_at: string;
}

interface Client { id: number; name: string; }
interface Project { id: number; clientId: number; name: string; }
interface Submission { id: number; clientName: string; projectName: string; submittedOn: string; answers: Record<string, string>; }

// --- MOCK COMPONENTS & HOOKS (for standalone functionality) ---
// In a real app, you would import these from your project structure.
const DashboardLayout: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="h-screen w-full bg-gray-50 font-sans text-gray-800">{children}</div>
);
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
const mockClients: Client[] = [ { id: 10, name: 'Jane Doe' }, { id: 11, name: 'Sam Wilson' }, { id: 12, name: 'Alice Johnson' }];
const mockProjects: Project[] = [ { id: 101, clientId: 10, name: 'ABC Corp Website Redesign' }, { id: 102, clientId: 11, name: 'Wilson Graphics Logo' }, { id: 103, clientId: 12, name: 'Johnson Consulting Strategy' }];
const mockSubmissions: Record<number, Submission[]> = { 1: [], 2: [] };


// --- REUSABLE FORM BUILDER COMPONENT ---
// This component is now used for both creating AND editing forms.
const FormBuilder: FC<{ formToEdit?: Template | null; onBack: () => void; }> = ({ formToEdit, onBack }) => {
    const [formFields, setFormFields] = useState<FormField[]>(formToEdit?.fields || []);
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
    const [formTitle, setFormTitle] = useState(formToEdit?.title || "New Client Intake Form");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
        const dragItemContent = newFields[dragItem.current];
        newFields.splice(dragItem.current, 1);
        newFields.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setFormFields(newFields);
    };

    const handleSaveForm = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        // In a real app, the endpoint and method would change for editing
        console.log("Saving form:", { title: formTitle, fields: formFields });
        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };

    const renderFieldPreview = (field: FormField) => {
        switch (field.type) {
            case 'textarea':
                return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" rows={3} readOnly />;
            case 'dropdown':
                return <select className="w-full p-2 border border-gray-300 rounded-md bg-white">{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
            case 'checkbox':
                return <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" /><span>{field.label}</span></div>;
            case 'radio':
                return <div className="space-y-2">{field.options?.map((opt, i) => (<div key={i} className="flex items-center gap-2"><input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-indigo-600" /><label>{opt}</label></div>))}</div>;
            case 'date': return <input type="date" className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />;
            case 'time': return <input type="time" className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />;
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
                <button onClick={handleSaveForm} disabled={isSaving} className={clsx("flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors", { 'bg-indigo-600 hover:bg-indigo-700': !isSaving && saveStatus === 'idle', 'bg-gray-400 cursor-not-allowed': isSaving, 'bg-green-600': saveStatus === 'success', 'bg-red-600': saveStatus === 'error' })}>
                    {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : (saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                    <span>{isSaving ? 'Saving...' : (saveStatus === 'success' ? 'Saved!' : (saveStatus === 'error' ? 'Error!' : 'Save Form'))}</span>
                </button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-72 bg-white border-r border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">FIELDS</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {FIELD_DEFINITIONS.map(field => (
                            <div key={field.type} draggable onDragStart={(e) => handleDragStart(e, field.type)} className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg text-gray-600 hover:text-indigo-600 transition-colors cursor-grab active:cursor-grabbing">
                                <div className="w-8 h-8">{field.icon}</div>
                                <span className="text-xs mt-1">{field.label}</span>
                            </div>
                        ))}
                    </div>
                </aside>
                <main className="flex-1 bg-gray-50 p-8 overflow-y-auto" onDragOver={(e) => e.preventDefault()} onDrop={handleCanvasDrop}>
                    <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-sm border border-gray-200">
                        <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="text-3xl font-bold w-full p-2 -m-2 mb-4 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <p className="text-gray-500 mb-8">Drag fields from the left panel or reorder them below.</p>
                        <div className="space-y-4">
                            {formFields.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500">Drop fields here</p>
                                </div>
                            ) : formFields.map((field, index) => (
                                <div key={field.id} onClick={() => setSelectedFieldId(field.id)} draggable onDragStart={() => dragItem.current = index} onDragEnter={() => dragOverItem.current = index} onDragEnd={handleFieldDropReorder} onDragOver={(e) => e.preventDefault()} className={clsx('p-4 rounded-lg cursor-pointer transition-all border-2', selectedFieldId === field.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white hover:border-gray-300 border-transparent')}>
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
                                <button onClick={() => updateField(selectedField.id, 'required', !selectedField.required)} className={clsx("relative inline-flex h-6 w-11 items-center rounded-full", selectedField.required ? 'bg-indigo-600' : 'bg-gray-200')}>
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


// --- MAIN PAGE COMPONENT (LIST VIEW) ---
export default function FormTemplatesPage() {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [formToEdit, setFormToEdit] = useState<Template | null>(null);
    
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingSubmissions, setViewingSubmissions] = useState<Template | null>(null);
    const [isSubmissionsSidebarOpen, setSubmissionsSidebarOpen] = useState(false);
    const [submissionSearch, setSubmissionSearch] = useState('');
    const [isUseModalOpen, setUseModalOpen] = useState(false);
    const [templateToUse, setTemplateToUse] = useState<Template | null>(null);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [isViewFormModalOpen, setViewFormModalOpen] = useState(false);
    const [templateToView, setTemplateToView] = useState<Template | null>(null);
    const [isViewingFormLoading, setIsViewingFormLoading] = useState(false);

    const handleGoBack = useGoBack();
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
    const BASE_URL = 'http://127.0.0.1:8000/api/v1';

    useEffect(() => { 
        const fetchForms = async () => {
            // ... API fetching logic ...
        };
        fetchForms();
     }, [userToken, BASE_URL]);

    const handleEditClick = (template: Template) => {
        // Here you would likely fetch the full template data again to ensure it's fresh
        setFormToEdit(template);
        setView('builder');
        setViewFormModalOpen(false); // Close modal before switching view
    };

    const handleCreateClick = () => {
        setFormToEdit(null); // Ensure we are in "create" mode
        setView('builder');
    };

    const handleBackToList = () => {
        setView('list');
        setFormToEdit(null);
    };

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
        setSelectedClientId(''); setSelectedProjectId('');
        setTimeout(() => setTemplateToUse(null), 300);
    };
    const handleViewFormClick = async (template: Template) => {
        setViewFormModalOpen(true);
        setIsViewingFormLoading(true);
        // In a real app, you would fetch the full template data here
        setTemplateToView({ ...template, fields: [{id: 1, label: "Sample Field", type: "text" as FieldType}]});
        setIsViewingFormLoading(false);
    };
    const closeViewFormModal = () => {
        setViewFormModalOpen(false);
        setTimeout(() => setTemplateToView(null), 300);
    };
    
    const ViewFormModal = () => {
         const renderFieldPreview = (field: FormField) => {
            switch (field.type) {
                case 'textarea':
                    return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" rows={3} disabled />;
                case 'dropdown':
                    return <select className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" disabled>{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
                case 'checkbox':
                    return <div className="flex items-center gap-2 mt-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-not-allowed" disabled /><span>{field.label}</span></div>;
                case 'radio':
                    return <div className="space-y-2 mt-2">{field.options?.map((opt, i) => (<div key={i} className="flex items-center gap-2"><input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-indigo-600 cursor-not-allowed" disabled /><label className="text-gray-700">{opt}</label></div>))}</div>;
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
                                    <button onClick={() => handleViewSubmissionsClick(templateToView)} className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium p-2 rounded-md">
                                        <Eye />
                                        <span>View Submissions ({templateToView.submissionsCount})</span>
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

    if (view === 'builder') {
        return (
            <DashboardLayout>
                <FormBuilder formToEdit={formToEdit} onBack={handleBackToList} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
           <HeaderTitleCard onGoBack={handleGoBack} title="Forms" description="Create a custom form for your need">
               <div className="flex flex-col md:flex-row gap-2">
                   <button onClick={handleCreateClick} className="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                       <Plus className="w-4 h-4" /> 
                       <span>Create Form</span>
                   </button>
               </div> 
           </HeaderTitleCard>

            {isLoading && <p className="text-center mt-8">Loading forms...</p>}
            {error && <p className="text-center mt-8 text-red-600">Error: {error}</p>}
            
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                            <div className="p-5 flex-grow">
                                <h2 className="text-lg font-semibold text-gray-900">{template.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {template.submissionsCount} submissions • Last used on {template.lastUsed}
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50/50">
                                <button onClick={() => handleViewFormClick(template)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium p-2 rounded-md hover:bg-gray-100">
                                    <FileText />
                                    <span>View</span>
                                </button>
                                <button onClick={() => handleUseClick(template)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
                                    <Send />
                                    <span>Use Form</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <ViewFormModal />
            {/* ... other modals and sidebars ... */}
        </DashboardLayout>
    );
}
