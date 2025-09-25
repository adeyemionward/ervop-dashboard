'use client';

import React, { useState, useRef, FC, ReactNode } from 'react';
// In your actual project, you would import your DashboardLayout like this:
import DashboardLayout from "@/components/DashboardLayout";
import { 
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
import { useRouter } from 'next/navigation';


// --- TYPE DEFINITIONS ---
type FieldType = 'text' | 'textarea' | 'tel' | 'number' | 'dropdown' | 'checkbox' | 'radio'| 'date' | 'time';

type FormField = {
    id: number;
    type: FieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
};




// --- REUSABLE COMPONENTS ---

const FieldToolboxItem: FC<{ type: FieldType; label: string; icon: ReactNode; onDragStart: (e: React.DragEvent, type: FieldType) => void }> = ({ type, label, icon, onDragStart }) => (
    <div 
        draggable 
        onDragStart={(e) => onDragStart(e, type)} 
        className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-gray-600 hover:text-purple-600 transition-colors cursor-grab active:cursor-grabbing"
    >
        <div className="w-8 h-8">{icon}</div>
        <span className="text-xs mt-1">{label}</span>
    </div>
);

const FormFieldCanvasItem: FC<{ field: FormField; isSelected: boolean; onClick: () => void; onDelete: () => void; onDragStart: (e: React.DragEvent) => void; onDragEnter: (e: React.DragEvent) => void; onDragEnd: (e: React.DragEvent) => void; }> = ({ field, isSelected, onClick, onDelete, ...dragProps }) => {
    
    const renderFieldPreview = () => {
        switch (field.type) {
            case 'textarea':
                return <textarea placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" rows={3} readOnly />;
            case 'dropdown':
                return (
                    <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
                        {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                    </select>
                );
            case 'checkbox':
                return (
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600" />
                        <span>{field.label}</span>
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="radio" name={String(field.id)} className="h-4 w-4 border-gray-300 text-purple-600" />
                                <label>{opt}</label>
                            </div>
                        ))}
                    </div>
                );
            case 'date':
                return <input type="date" className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />;
            case 'time':
                return <input type="time" className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />;
            default:
                return <input type={field.type} placeholder={field.placeholder} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />;
           
        }
    };

    return (
        <div 
            onClick={onClick}
            draggable
            {...dragProps}
            onDragOver={(e) => e.preventDefault()}
            className={clsx(
                'p-4 rounded-lg cursor-pointer transition-all border-2',
                isSelected ? 'bg-purple-50 border-purple-500' : 'bg-white hover:border-gray-300 border-transparent'
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <label className="font-semibold text-gray-700 block mb-2">
                        {field.type !== 'checkbox' && field.label} 
                        {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderFieldPreview()}
                </div>
                <div className="flex items-center ml-4">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                    <div className="cursor-grab text-gray-400 active:cursor-grabbing"><GripVertical /></div>
                </div>
            </div>
        </div>
    );
};

const PropertyInput: FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <input type="text" value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function FormBuilderPage() {
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
    const [formTitle, setFormTitle] = useState("New Client Intake Form");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

     const router = useRouter();

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
        const baseField: FormField = {
            id: Date.now(),
            type,
            label: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            placeholder: '',
            required: false,
        };
        if (type === 'dropdown' || type === 'radio') {
            baseField.options = ['Option 1', 'Option 2', 'Option 3'];
        }
        if (type === 'checkbox') {
            baseField.label = 'Checkbox Label';
        }
        return baseField;
    };

    const handleDragStart = (e: React.DragEvent, type: FieldType) => {
        e.dataTransfer.setData('field-type', type);
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fieldType = e.dataTransfer.getData('field-type') as FieldType;
        if (fieldType) {
            const newField = createNewField(fieldType);
            setFormFields(prev => [...prev, newField]);
            setSelectedFieldId(newField.id);
        }
    };

    const updateField = (id: number, prop: keyof FormField, value: any) => {
        setFormFields(prev => prev.map(f => f.id === id ? { ...f, [prop]: value } : f));
    };
    
    const deleteField = (id: number) => {
        setFormFields(prev => prev.filter(f => f.id !== id));
        if (selectedFieldId === id) {
            setSelectedFieldId(null);
        }
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

        const payload = {
            title: formTitle,
            fields: formFields.map(({ id, ...field }) => field) // Remove temporary frontend ID
        };

        try {
            const userToken = localStorage.getItem('token'); 
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
            // Replace with your actual auth token logic
            
            const response = await fetch(`${BASE_URL}/professionals/forms/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // You can get more specific error messages from the response body
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error('Failed to save form');
            }

            const result = await response.json();
            console.log('Form saved successfully:', result);
            setSaveStatus('success');
             router.push('/forms');

        } catch (error) {
            console.error(error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            // Reset button state after a few seconds
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col">
                <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 flex-shrink-0">
                    <div className="">
                        <button className="text-gray-600 hover:text-gray-900">&larr; Back to Templates</button>
                        
                        <h1 className="text-xl font-bold text-gray-800">Form Builder</h1>
                    </div>
                    <button 
                        onClick={handleSaveForm}
                        disabled={isSaving}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors",
                            {
                                'bg-purple-800 hover:bg-purple-700': !isSaving && saveStatus === 'idle',
                                'bg-gray-400 cursor-not-allowed': isSaving,
                                'bg-green-600': saveStatus === 'success',
                                'bg-red-600': saveStatus === 'error',
                            }
                        )}
                    >
                        {isSaving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : (saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                        <span>
                            {isSaving ? 'Saving...' : (saveStatus === 'success' ? 'Saved!' : (saveStatus === 'error' ? 'Error!' : 'Save Form'))}
                        </span>
                    </button>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Field Toolbox */}
                    <aside className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4">STANDARD FIELDS</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {FIELD_DEFINITIONS.map(field => (
                                <FieldToolboxItem key={field.type} {...field} onDragStart={handleDragStart} />
                            ))}
                        </div>
                    </aside>

                    {/* Form Canvas */}
                    <main className="flex-1 bg-gray-50 p-8 overflow-y-auto" onDragOver={(e) => e.preventDefault()} onDrop={handleCanvasDrop}>
                        <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-sm border border-gray-200">
                            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="text-3xl font-bold w-full p-2 -m-2 mb-4 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <p className="text-gray-500 mb-8">Drag fields from the left panel or reorder them below.</p>
                            
                            {formFields.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500">Drop fields here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formFields.map((field, index) => (
                                        <FormFieldCanvasItem 
                                            key={field.id} 
                                            field={field}
                                            isSelected={selectedFieldId === field.id}
                                            onClick={() => setSelectedFieldId(field.id)}
                                            onDelete={() => deleteField(field.id)}
                                            onDragStart={(e) => (dragItem.current = index)}
                                            onDragEnter={(e) => (dragOverItem.current = index)}
                                            onDragEnd={handleFieldDropReorder}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Properties Sidebar */}
                    <aside className={clsx("w-80 bg-white border-l border-gray-200 p-6 transition-all duration-300", selectedFieldId ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Field Properties</h3>
                        {selectedField && (
                            <div className="space-y-4">
                                <PropertyInput label="Label" value={selectedField.label} onChange={(e) => updateField(selectedField.id, 'label', e.target.value)} />
                                
                                {['text', 'textarea', 'number', 'tel'].includes(selectedField.type) && (
                                    <PropertyInput label="Placeholder" value={selectedField.placeholder || ''} onChange={(e) => updateField(selectedField.id, 'placeholder', e.target.value)} />
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
        </DashboardLayout>
    );
}
