'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout"; 
import clsx from "clsx";
import toast from "react-hot-toast";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";

// --- Type Definitions ---

interface Project {
    id: number;
    contact_id: number; // Used to link to a client
    title: string;
}

interface Client {
  id: number;
  firstname: string;
  lastname: string;
}

// --- Main Page Component ---
export default function CreateAppointmentPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    
    const [title, setTitle] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [services, setServices] = useState<{id: number; name: string; price: number;}[]>([]);
    const [amount, setAmount] = useState<number>(0);
    const [notes, setNotes] = useState('');

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const [isSaving, setIsSaving] = useState(false);
    const handleGoBack = useGoBack();
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

   
    const [clients, setClients] = useState<Client[]>([]);

    //fecth services
    interface Service {
    id: number;
    name: string;
    price: string;
    status: "active" | "inactive";
}


useEffect(() => {
    const fetchServices = async () => {
        try {
            const response = await fetch(`${BASE_URL}/professionals/services/list`, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Accept": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch services");
            const result = await response.json();
            // Filter only active services
            const activeServices = result.services.filter((s: Service) => s.status === "active");
            setServices(activeServices);
        } catch (err) {
            console.error("Error fetching services:", err);
            setServices([]);
        }
    };

    if (userToken) fetchServices();
}, [userToken, BASE_URL]);



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
        setSelectedSlot(null); // Reset selected slot
        setAvailableSlots([]);
        if (!date) return;

        setIsLoadingSlots(true);

        try {
            const response = await fetch(`${BASE_URL}/professionals/appointments/getAvailableSlots?date=${date}`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });

            if (!response.ok) throw new Error("Failed to fetch availability");

            const data = await response.json();
            setAvailableSlots(data.available_slots || []);
            setError(null); // Clear previous errors

        } catch (err) {
            console.error(err);
            setAvailableSlots([]);
            setError("Error fetching available slots. Please try again.");
            toast.error("Error fetching available slots."); // Toast notification
        } finally {
            setIsLoadingSlots(false);
        }
    };


    const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
  

    const payload = {
        title,
        contact_id: Number(selectedClientId),
        project_id: selectedProjectId ? Number(selectedProjectId) : null,
        service_id: selectedServiceId ? Number(selectedServiceId): null,
        amount: Number(amount),
        date: selectedDate,
        time: selectedSlot,
        notes,
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

        // setSaveStatus('success');
        setError(null);
        toast.success("Appointment saved successfully!"); // Success toast
        setTimeout(() => {
            window.location.href = '/appointments';
        }, 1500);

    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        // setSaveStatus('error');
        toast.error(message); // Error toast
    } finally {
        setIsSaving(false);
        // setTimeout(() => setSaveStatus('idle'), 3000);
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
                <HeaderTitleCard onGoBack={handleGoBack} title="Schedule an Appointment" description="Easily schedule and manage your appointments with clients."/>
               
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    {error && (
                        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                            {error}
                        </div>
                        )}

                    <form className="space-y-8" onSubmit={handleSaveAppointment}>
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                What is the appointment about?
                            </label>

                            <div className="flex items-center">
                                <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    if (e.target.value.length <= 50) {
                                    setTitle(e.target.value);
                                    }
                                }}
                                maxLength={50}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <p className="text-sm text-gray-500 ml-3 whitespace-nowrap">
                                {title.length}/50 characters
                                </p>
                        </div>

                        {/* <!-- Customer & Project Section --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Clients</label>
                                <select
                                    id="customer"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    disabled={isLoadingClients} // disable while loading
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                >
                                    {isLoadingClients ? (
                                    <option>Loading clients...</option>
                                    ) : (
                                    <>
                                        <option value="">Select a client</option>
                                        {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.firstname} {client.lastname}
                                        </option>
                                        ))}
                                    </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                                <select id="project" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} disabled={!selectedClientId || isLoadingProjects} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100">
                                    <option value="">
                                        {isLoadingProjects ? 'Loading projects...' : (selectedClientId ? "Select a project" : "Select a client first")}
                                    </option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service (Optional)</label>
                                <select
                                    id="service"
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select a service</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    min={0}
                                    step={0.01}
                                />
                            </div>

                        </div>


                        {/* <!-- Date Picker Section --> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Appointment Date (select one)</label>
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
                            <textarea
                                id="notes"
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any specific details for this appointment..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />

                        </div>
                        
                        {/* <!-- Form Actions --> */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Cancel</button>
                            <button 
                                type="submit" 
                                disabled={isSaving || !title || !selectedClientId || !selectedDate || !selectedSlot} 
                                className={clsx(
                                    "bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700",
                                    { "opacity-50 cursor-not-allowed": isSaving || !title || !selectedClientId || !selectedDate || !selectedSlot }
                                )}
                            >
                                {isSaving ? "Saving..." : "Save Appointment"}
                            </button>


                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

