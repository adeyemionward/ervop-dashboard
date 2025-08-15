'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

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

// --- div Page Component ---
export default function AvailabilitySettingsPage() {
    const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
    const [overrideDates, setOverrideDates] = useState<string[]>(['2024-12-25']);
    const [newOverrideDate, setNewOverrideDate] = useState('');

    const handleToggleDay = (dayName: string) => {
        setSchedule(
            schedule.map(day =>
                day.name === dayName ? { ...day, isEnabled: !day.isEnabled } : day
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

    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">
                <div className="mb-8">
                     <Link href="/appointments" className="flex items-center text-md text-gray-500 hover:text-purple-600 mb-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Back to Appointments
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
                    <p className="text-gray-500 mt-1">Set your weekly schedule and add specific dates you're unavailable.</p>
                </div>

                <div className="w-full max-w-4xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm">
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
            
            {/* THIS IS THE CORRECTED LINE */}
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

                    <div className="bg-white p-8 rounded-xl shadow-sm">
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
                            <button type="button" onClick={handleAddOverride} className="bg-purple-600 text-white px-4 py-3 rounded-lg shadow-sm hover:bg-purple-700 cursor-pointer"><Icons.plus className="h-5 w-5 cursor-pointer" /></button>
                        </div>
                        <div className="space-y-2">
                            {overrideDates.map(date => (
                                <div key={date} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                                    <p className="font-medium text-gray-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <button onClick={() => handleRemoveOverride(date)} className="text-red-500 hover:text-red-700 p-1">
                                        <Icons.trash className="h-5 w-5 cursor-pointer" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700">Save Changes</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
