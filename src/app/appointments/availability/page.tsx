'use client';

import React, { useState, useEffect, FC, ReactNode } from 'react';
import { CheckCircle, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import clsx from 'clsx';
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";


// const HeaderTitleCard: FC<{ onGoBack?: () => void; title: string; description: string; children: ReactNode }> = ({ onGoBack, title, description, children }) => (
//     <div className="p-6 bg-white border-b border-gray-200">
//         <div className="flex justify-between items-start">
//             <div>
//                 {onGoBack && (
//                     <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2">
//                         <ArrowLeft className="w-4 h-4" />
//                         Back
//                     </button>
//                 )}
//                 <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
//                 <p className="mt-1 text-gray-500">{description}</p>
//             </div>
//             <div className="mt-4 sm:mt-0">{children}</div>
//         </div>
//     </div>
// );
// --- END OF PLACEHOLDERS ---


// --- Type Definitions ---
type DaySchedule = {
    name: string;
    isEnabled: boolean;
    startTime: string;
    endTime: string;
};

// --- Initial State for the Schedule ---
const initialSchedule: DaySchedule[] = [
    { name: 'Sunday', isEnabled: false, startTime: '09:00', endTime: '17:00' },
    { name: 'Monday', isEnabled: true, startTime: '09:00', endTime: '17:00' },
    { name: 'Tuesday', isEnabled: true, startTime: '09:00', endTime: '17:00' },
    { name: 'Wednesday', isEnabled: true, startTime: '09:00', endTime: '17:00' },
    { name: 'Thursday', isEnabled: true, startTime: '09:00', endTime: '17:00' },
    { name: 'Friday', isEnabled: true, startTime: '09:00', endTime: '17:00' },
    { name: 'Saturday', isEnabled: false, startTime: '09:00', endTime: '17:00' },
];

// --- Main Page Component ---
export default function AvailabilitySettingsPage() {
    const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
    const [overrideDates, setOverrideDates] = useState<string[]>([]);
    const [newOverrideDate, setNewOverrideDate] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    // --- Fetch Availability on Load ---
    useEffect(() => {
        const fetchAvailability = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BASE_URL}/professionals/appointments/showSetAvailability`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userToken}`,
                    },
                });

                if (response.status === 404) {
                    console.log("No availability found. Using default schedule.");
                    setSchedule(initialSchedule);
                    setOverrideDates([]);
                    return; 
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch availability.');
                }

                const data = await response.json();
                
                if (data && data.schedule) {
                    const formattedSchedule = initialSchedule.map(day => {
                        const apiDay = data.schedule.find((d: any) => d.day_of_week === day.name);
                        return apiDay ? {
                            name: apiDay.day_of_week,
                            isEnabled: !!apiDay.is_enabled,
                            startTime: apiDay.start_time.substring(0, 5),
                            endTime: apiDay.end_time.substring(0, 5),
                        } : day;
                    });
                    setSchedule(formattedSchedule);
                }
                if (data && data.overrideDates) {
                    setOverrideDates(data.overrideDates);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                setSchedule(initialSchedule);
            } finally {
                setIsLoading(false);
            }
        };

        if (userToken) {
            fetchAvailability();
        } else {
            setIsLoading(false);
        }
    }, [userToken, BASE_URL]);


    const handleToggleDay = (dayNameToToggle: string) => {
        setSchedule(currentSchedule =>
            currentSchedule.map(day =>
                day.name === dayNameToToggle
                    ? { ...day, isEnabled: !day.isEnabled }
                    : day
            )
        );
    };

    const handleTimeChange = (dayName: string, part: 'startTime' | 'endTime', value: string) => {
        setSchedule(
            schedule.map(day =>
                day.name === dayName ? { ...day, [part]: value } : day
            )
        );
    };
    
    const handleAddOverride = () => {
        if (newOverrideDate && !overrideDates.includes(newOverrideDate)) {
            setOverrideDates([...overrideDates, newOverrideDate].sort());
            setNewOverrideDate('');
        }
    };

    const handleRemoveOverride = (dateToRemove: string) => {
        setOverrideDates(overrideDates.filter(date => date !== dateToRemove));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        setError(null);

        // **MODIFIED PAYLOAD TO MATCH YOUR EXAMPLE**
        const payload = {
            schedule: schedule, // The state is already in the correct format
            overrideDates: overrideDates,
        };

        try {
            const response = await fetch(`${BASE_URL}/professionals/appointments/setAvailability`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save changes.');
            }

            setSaveStatus('success');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };
    
    if (isLoading) {
        return <DashboardLayout><div className="text-center p-12">Loading Availability...</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <a href="/appointments" className="flex items-center text-md text-gray-500 hover:text-purple-600 mb-2 w-fit">
                         <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Appointments
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
                    <p className="text-gray-500 mt-1">Set your weekly schedule and add specific dates you're unavailable.</p>
                </div>

                <div className="w-full max-w-4xl mx-auto space-y-8">
                    {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                    
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
                        <p className="text-sm text-gray-500 mb-6">Define your working hours for each day of the week.</p>
                        
                        <div className="space-y-6">
                            {schedule.map((day) => (
                                <div key={day.name} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${day.name}-check`}
                                            checked={day.isEnabled}
                                            onChange={() => handleToggleDay(day.name)}
                                            className="h-6 w-6 accent-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                        />
                                        <label htmlFor={`${day.name}-check`} className="ml-3 block font-medium text-gray-700 cursor-pointer">{day.name}</label>
                                    </div>
                                    
                                    <div className="md:col-span-3 flex flex-col md:flex-row items-center gap-4">
                                        {day.isEnabled ? (
                                            <>
                                                <input
                                                    type="time"
                                                    value={day.startTime}
                                                    onChange={(e) => handleTimeChange(day.name, 'startTime', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <span className="text-gray-500">-</span>
                                                <input
                                                    type="time"
                                                    value={day.endTime}
                                                    onChange={(e) => handleTimeChange(day.name, 'endTime', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </>
                                        ) : (
                                            <span className="text-gray-400 font-medium">Closed</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Overrides</h3>
                        <p className="text-sm text-gray-500 mb-6">Add specific dates you are unavailable, like holidays or vacation.</p>
                        <div className="flex items-end gap-4 mb-6">
                            <div className="w-full">
                                <label htmlFor="override-date" className="block text-sm font-medium text-gray-700 mb-1">Select a Date</label>
                                <input
                                    type="date"
                                    id="override-date"
                                    value={newOverrideDate}
                                    onChange={(e) => setNewOverrideDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button type="button" onClick={handleAddOverride} className="bg-purple-600 text-white p-3 rounded-lg shadow-sm hover:bg-purple-700 cursor-pointer"><Plus className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-2">
                            {overrideDates.map(date => (
                                <div key={date} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                                    <p className="font-medium text-gray-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <button onClick={() => handleRemoveOverride(date)} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                         <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Cancel</button>
                         <button onClick={handleSaveChanges} disabled={isSaving} className={clsx("flex items-center justify-center w-36 bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700 transition-colors", { 'bg-gray-400 cursor-not-allowed': isSaving, 'bg-green-600 hover:bg-green-700': saveStatus === 'success', 'bg-red-600 hover:bg-red-700': saveStatus === 'error' })}>
                             {isSaving ? (
                                 <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                             ) : saveStatus === 'success' ? (
                                 <CheckCircle className="w-5 h-5" />
                             ) : (
                                 <span>Save Changes</span>
                             )}
                         </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

