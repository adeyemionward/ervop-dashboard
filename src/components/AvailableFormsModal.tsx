// components/AvailableFormsModal.tsx

import React, { FC, useState, useEffect, useMemo, useRef } from "react";
import { useMutation } from "@tanstack/react-query"; 
import { X, Save } from 'lucide-react';
import toast from "react-hot-toast";
import clsx from "clsx";
import { AvailableForm, AttachedForm } from "@/types/ProjectTypes"; 

interface AvailableFormsModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableForms: AvailableForm[];
    attachedForms: AttachedForm[]; 
    projectId: string; 
    onAttachSuccess: () => void; 
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

const AvailableFormsModal: FC<AvailableFormsModalProps> = ({ 
    isOpen, 
    onClose, 
    availableForms = [], 
    attachedForms = [], 
    projectId, 
    onAttachSuccess 
}) => {
    const [selectedFormIds, setSelectedFormIds] = useState<number[]>([]);
    
    // We use a Ref to ensure we only initialize ONCE when the modal opens,
    // preventing the selection from resetting if the parent re-renders.
    const hasInitialized = useRef(false);

    // Calculate initial IDs for comparison (Memoized by value)
    const initialIds = useMemo(() => {
        return attachedForms?.map(af => af.form_id).sort((a, b) => a - b) || [];
    }, [attachedForms]);

    // ✅ FIX: Only initialize state when Modal OPENS. 
    useEffect(() => {
        if (isOpen && !hasInitialized.current) {
            setSelectedFormIds(initialIds);
            hasInitialized.current = true;
        }
        if (!isOpen) {
            hasInitialized.current = false; // Reset flag when closed
            setSelectedFormIds([]);
        }
    }, [isOpen, initialIds]);

    // --- SYNC MUTATION ---
    const syncMutation = useMutation<string, Error, number[]>({
        mutationFn: async (formIds: number[]) => {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token missing.");

            const url = `${BASE_URL}/professionals/projects/forms/create/${projectId}`; 
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ form_ids: formIds }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to sync forms.");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success(`Project forms updated successfully.`);
            onAttachSuccess(); 
            onClose();
        },
        onError: (err) => toast.error(err.message)
    });

    const handleCheckboxChange = (id: number) => {
        setSelectedFormIds(prev => 
            prev.includes(id) ? prev.filter(formId => formId !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        if (selectedFormIds.length > 0) {
            syncMutation.mutate(selectedFormIds);
        }
    };

    // --- BUTTON DISABLE LOGIC ---
    const currentSelectionSorted = [...selectedFormIds].sort((a, b) => a - b);
    
    // 1. Check if selection is identical to what is already attached
    const isUnchanged = JSON.stringify(initialIds) === JSON.stringify(currentSelectionSorted);
    
    // 2. Check if selection is empty
    const isEmpty = selectedFormIds.length === 0;

    // 3. Disable if: Loading OR Unchanged OR Empty (if you want to forbid clearing)
    const isButtonDisabled = syncMutation.isPending || isUnchanged || isEmpty;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Manage Project Forms</h3>
                    <button onClick={onClose} disabled={syncMutation.isPending} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                    Check forms to attach. Uncheck to remove.
                </p>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {availableForms.length > 0 ? (
                        availableForms.map((form) => {
                            const isChecked = selectedFormIds.includes(form.id);
                            return (
                                <div key={form.id} className={clsx("flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors", {
                                    "border-purple-300 bg-purple-50": isChecked
                                })}>
                                    <input
                                        type="checkbox"
                                        id={`form-${form.id}`}
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange(form.id)}
                                        disabled={syncMutation.isPending}
                                        className="mt-1 mr-3 h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <label htmlFor={`form-${form.id}`} className="flex-1 cursor-pointer">
                                        <p className="font-medium text-gray-800">{form.title}</p>
                                    </label>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-400 text-center py-8">No available forms found.</p>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} disabled={syncMutation.isPending} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        // ✅ DISABLES if loading, unchanged, OR EMPTY
                        disabled={isButtonDisabled}
                        className={clsx("flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors", 
                            isButtonDisabled 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                        )}
                    >
                        <Save size={18} />
                        {syncMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailableFormsModal;