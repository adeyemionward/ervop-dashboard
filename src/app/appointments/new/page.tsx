'use client';

import React, { useState, useEffect, FC, ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout"; // Replaced with a mock component below
import { Icons } from "@/components/icons"; // Replaced with lucide-react icons
import Link from "next/link"; // Replaced with a standard <a> tag
import { Plus, Trash2 } from 'lucide-react'; // Added lucide-react for icons
import clsx from "clsx";
import { useFetchData } from "@/hooks/useFetchData";

// --- Type Definitions ---
interface Client {
    id: number;
    firstname: string;
    lastname: string;
}

interface Project {
    id: number;
    contact_id: number; // Used to link to a client
    title: string;
}

interface ClientResponse {
    status: boolean;
    clients: Client[]; // The array of services is inside this property
}

// --- Main Page Component ---
export default function CreateAppointmentPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    
     const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('1'); // Default to first service
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const professionalUserId = 1; // This should be dynamic, e.g., from your auth context
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    // Get the clients
        // const { data, loading } = useFetchData<ClientResponse>(`${BASE_URL}/professionals/contacts/list`);
        // // Correctly and safely access the 'services' array
        // const clients = data?.clients || [];

        const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const response = await fetch(`${BASE_URL}/professionals/contacts/list`, {
          headers: {
            "Authorization": `Bearer ${userToken}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }

        const result = await response.json();
        setClients(result.data || []); // Assuming API returns { data: [...] }
      } catch (err) {
        console.error("Error fetching clients:", err);
        setClients([]); // fallback to empty array
      } finally {
        setIsLoadingClients(false);
      }
    };

    if (userToken) {
      fetchClients();
    }
  }, [userToken, BASE_URL]);

    // Fetch projects whenever a client is selected
    useEffect(() => {
        if (selectedClientId) {
            const fetchProjectsForClient = async () => {
                setIsLoadingProjects(true);
                setProjects([]); // Clear previous projects
                try {
                    const response = await fetch(`${BASE_URL}/professionals/projects/clientProjects/${selectedClientId}`, {
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                            'Accept': 'application/json'
                        },
                    });
                    if (!response.ok) throw new Error('Failed to fetch projects for client');
                    const data = await response.json();
                    setProjects(data.data || []);
                } catch (err) {
                    console.error("Error fetching projects:", err);
                    setProjects([]); // Ensure projects is an empty array on error
                } finally {
                    setIsLoadingProjects(false);
                } 
            };
            fetchProjectsForClient();
            setSelectedProjectId(""); // Reset project selection
        } else {
            setProjects([]); // Clear projects if no client is selected
        }
    }, [selectedClientId, userToken, BASE_URL]);
    
    // Fetch available slots when a date is selected
    const handleDateChange = async (date: string) => {
        setSelectedDate(date);
        setSelectedSlot(null); // Reset selected slot when date changes
        if (!date) {
            setAvailableSlots([]);
            return;
        }

        setIsLoadingSlots(true);
        setAvailableSlots([]);
        try {
            const response = await fetch(`${BASE_URL}/professionals/appointments/getAvailableSlots?date=${date}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (!response.ok) throw new Error("Failed to fetch availability");
            const data = await response.json();
            setAvailableSlots(data.available_slots || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleSaveAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('idle');

        // Basic validation
        if (!selectedClientId || !selectedProjectId || !selectedDate || !selectedSlot) {
            setError("Please fill out all required fields.");
            setIsSaving(false);
            return;
        }

        const payload = {
            contact_id: Number(selectedClientId),
            project_id: Number(selectedProjectId),
            service_id: Number(selectedServiceId),
            date: selectedDate, // YYYY-MM-DD
            time: selectedSlot, // HH:mm
            notes: notes,
        };
        
        try {
            const response = await fetch(`${BASE_URL}/professionals/appointments/create`, {
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
                throw new Error(errorData.message || 'Failed to save appointment.');
            }
            
            setSaveStatus('success');
            // Optionally redirect or clear the form after success
            setTimeout(() => {
                  window.location.href = '/appointments'; 
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // Helper to format time from "HH:mm" to "hh:mm AM/PM"
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

   
    
    return (
        <DashboardLayout>
            <div className="w-full max-w-4xl mx-auto">
                <div className="mb-8">
                    <a href="/appointments" className="flex items-center text-md text-gray-500 hover:text-purple-600 mb-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Back to Appointments
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900">Schedule Appointment</h1>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <form className="space-y-8" onSubmit={handleSaveAppointment}>
                        {/* <!-- Customer & Project Section --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                <select id="customer" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">Select a customer</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.firstname} {client.lastname}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <select id="project" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} disabled={!selectedClientId || isLoadingProjects} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100">
                                    <option value="">
                                        {isLoadingProjects ? 'Loading projects...' : (selectedClientId ? "Select a project" : "Select a customer first")}
                                    </option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* <!-- Date Picker Section --> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>

                        {/* <!-- Time Slot Section --> */}
                        {selectedDate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                                {isLoadingSlots ? (
                                    <div className="text-center py-4 text-gray-500">Finding available slots...</div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {availableSlots.map(slot => (
                                            <button 
                                                key={slot}
                                                type="button" 
                                                onClick={() => setSelectedSlot(slot)}
                                                className={clsx(
                                                    "w-full text-center font-semibold rounded-lg py-2 transition-colors",
                                                    selectedSlot === slot 
                                                        ? 'border border-purple-600 bg-purple-600 text-white' 
                                                        : 'border border-purple-500 text-purple-600 hover:bg-purple-50'
                                                )}
                                            >
                                                {formatTime(slot)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                     <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No available slots for this date.</div>
                                )}
                            </div>
                        )}
                        
                        {/* <!-- Notes Section --> */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea id="notes" rows={4} placeholder="Add any specific details for this appointment..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>
                        
                        {/* <!-- Form Actions --> */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700">Save Appointment</button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

