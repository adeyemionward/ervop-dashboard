
'use client';

import React, { useState, useRef, DragEvent } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
    Pilcrow, AlignJustify, CheckSquare, RadioTower, ChevronDownSquare, 
    Calendar as CalendarIcon, Clock, Eye, Save, Trash2, GripVertical, Plus
} from 'lucide-react';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
type FieldType = 'short-text' | 'text-area' | 'checkbox' | 'radio-group' | 'dropdown' | 'date' | 'time';

type FormField = {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    options?: string[];
};

// --- REUSABLE COMPONENTS ---

const FieldButton = ({ type, icon: Icon, label }: { type: FieldType; icon: React.ElementType; label: string; }) => (
    <button 
        draggable 
        onDragStart={(e) => e.dataTransfer.setData('field-type', type)}
        className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-500 rounded-lg transition-colors cursor-grab"
    >
        <Icon className="w-6 h-6 text-gray-500" />
        <span className="text-sm font-medium mt-2">{label}</span>
    </button>
);

const FormFieldComponent = ({ field, onUpdate, onDelete }: { field: FormField; onUpdate: (id: string, newField: Partial<FormField>) => void; onDelete: (id: string) => void; }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempLabel, setTempLabel] = useState(field.label);
    const [tempOptions, setTempOptions] = useState(field.options?.join('\n') || '');

    const handleSave = () => {
        const newOptions = (field.type === 'dropdown' || field.type === 'radio-group') 
            ? tempOptions.split('\n').filter(opt => opt.trim() !== '') 
            : undefined;
        onUpdate(field.id, { label: tempLabel, options: newOptions });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold">Label</label>
                        <input 
                            className="block w-full border-gray-300 rounded-md sm:text-sm p-2" 
                            type="text" 
                            value={tempLabel}
                            onChange={(e) => setTempLabel(e.target.value)}
                        />
                    </div>
                    {(field.type === 'dropdown' || field.type === 'radio-group') && (
                        <div>
                            <label className="text-xs font-semibold">Options (one per line)</label>
                            <textarea 
                                className="block w-full border-gray-300 rounded-md sm:text-sm p-2" 
                                rows={3}
                                value={tempOptions}
                                onChange={(e) => setTempOptions(e.target.value)}
                            ></textarea>
                        </div>
                    )}
                </div>
                <div className="mt-3 text-right">
                    <button onClick={handleSave} className="text-sm font-semibold text-blue-600">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div onClick={() => setIsEditing(true)} className="p-4 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    {field.type === 'short-text' && <input type="text" placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" disabled />}
                    {field.type === 'text-area' && <textarea rows={3} placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" disabled />}
                    {field.type === 'date' && <input type="date" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" disabled />}
                    {field.type === 'time' && <input type="time" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" disabled />}
                    {field.type === 'checkbox' && <div className="mt-2"><input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" /></div>}
                    {field.type === 'dropdown' && <select className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm"><option>{field.options?.[0] || 'Option 1'}</option></select>}
                    {field.type === 'radio-group' && <div className="mt-2 space-y-2">{field.options?.map((opt, i) => <div key={i} className="flex items-center"><input type="radio" name={field.id} className="h-4 w-4 text-blue-600 border-gray-300" /><label className="ml-3 text-sm text-gray-700">{opt}</label></div>)}</div>}
                </div>
                <div className="flex items-center ml-2">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(field.id); }} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    <button className="text-gray-400 cursor-grab p-1"><GripVertical className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function CreateFormPage() {
    const [formTitle, setFormTitle] = useState('New Client Intake Form');
    const [formDescription, setFormDescription] = useState('Please fill out the details below before our first meeting.');
    const [fields, setFields] = useState<FormField[]>([]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const fieldType = e.dataTransfer.getData('field-type') as FieldType;
        if (fieldType) {
            const newField: FormField = {
                id: `field-${Date.now()}`,
                type: fieldType,
                label: 'New Question',
                options: ['Option 1', 'Option 2'],
            };
            setFields(prev => [...prev, newField]);
        }
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newFields = [...fields];
        const draggedItemContent = newFields.splice(dragItem.current, 1)[0];
        newFields.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setFields(newFields);
    };

    const updateField = (id: string, newField: Partial<FormField>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...newField } : f));
    };

    const deleteField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    return (
        <DashboardLayout>
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Create New Form</h1>
                        <p className="text-sm text-gray-500">Build a custom form for your clients.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                            <Eye className="w-4 h-4 mr-2" /><span>Preview</span>
                        </button>
                        <button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                            <Save className="w-4 h-4 mr-2" /><span>Save Form</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-grow container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <aside className="lg:col-span-1 space-y-6 lg:sticky top-28">
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="form-title" className="block text-sm font-medium text-gray-700">Form Title</label>
                                    <input type="text" id="form-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="form-description" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea id="form-description" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Fields</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <FieldButton type="short-text" icon={Pilcrow} label="Short Text" />
                                <FieldButton type="text-area" icon={AlignJustify} label="Text Area" />
                                <FieldButton type="checkbox" icon={CheckSquare} label="Checkbox" />
                                <FieldButton type="radio-group" icon={RadioTower} label="Radio Group" />
                                <FieldButton type="dropdown" icon={ChevronDownSquare} label="Dropdown" />
                                <FieldButton type="date" icon={CalendarIcon} label="Date" />
                                <FieldButton type="time" icon={Clock} label="Time" />
                            </div>
                        </div>
                    </aside>

                    <main 
                        className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 min-h-[80vh]"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    draggable
                                    onDragStart={() => (dragItem.current = index)}
                                    onDragEnter={() => (dragOverItem.current = index)}
                                    onDragEnd={handleDragSort}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <FormFieldComponent field={field} onUpdate={updateField} onDelete={deleteField} />
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}
