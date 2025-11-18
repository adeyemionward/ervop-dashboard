'use client';

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";

interface Project {
  id: number;
  contact_id: number;
  title: string;
}

interface Client {
  id: number;
  firstname: string;
  lastname: string;
}

interface Service {
  id: number;
  name: string;
  price: string;
  status: "active" | "inactive";
}


export default function CreateAppointmentModal({ onClose }: { onClose: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<{ id: number; name: string; price: number }[]>([]);

  const [title, setTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch clients
  useEffect(() => {
    if (!open || !userToken) return;
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const res = await fetch(`${BASE_URL}/professionals/contacts/list`, {
          headers: { Authorization: `Bearer ${userToken}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data.data || []);
      } catch (err) {
        console.error(err);
        setClients([]);
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, [open, BASE_URL, userToken]);

  // Fetch services
  useEffect(() => {
    if (!open || !userToken) return;
    const fetchServices = async () => {
      try {
        const res = await fetch(`${BASE_URL}/professionals/services/list`, {
          headers: { Authorization: `Bearer ${userToken}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        const active = data.services.filter((s: Service) => s.status === "active");
        setServices(active);
      } catch (err) {
        console.error(err);
        setServices([]);
      }
    };
    fetchServices();
  }, [open, BASE_URL, userToken]);

  // Fetch projects when a client is selected
  useEffect(() => {
    if (!selectedClientId || !userToken) return;
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const res = await fetch(
          `${BASE_URL}/professionals/projects/clientProjects/${selectedClientId}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data.data || []);
      } catch (err) {
        console.error(err);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [selectedClientId, BASE_URL, userToken]);

  // Fetch available slots
  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);
    if (!date || !userToken) return;
    setIsLoadingSlots(true);
    try {
      const res = await fetch(
        `${BASE_URL}/professionals/appointments/getAvailableSlots?date=${date}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setAvailableSlots(data.available_slots || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
      setError("Error fetching available slots.");
      toast.error("Error fetching available slots.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Format time (HH:mm → 12-hour format)
  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // Save appointment
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title,
      contact_id: Number(selectedClientId),
      project_id: selectedProjectId ? Number(selectedProjectId) : null,
      service_id: selectedServiceId ? Number(selectedServiceId) : null,
      amount,
      date: selectedDate,
      time: selectedSlot,
      notes,
    };

    try {
      const res = await fetch(`${BASE_URL}/professionals/appointments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save appointment.");
      }

      toast.success("Appointment saved successfully!");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  // --- Modal UI ---
  return (
    <div className="">
      
        {/* Body */}
        <div className="p-6">
          {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

          <form className="space-y-8" onSubmit={handleSaveAppointment}>
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-500 mt-1">{title.length}/50 characters</p>
            </div>

            {/* Client & Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={isLoadingClients}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                >
                  {isLoadingClients ? (
                    <option>Loading clients...</option>
                  ) : (
                    <>
                      <option value="">Select a client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstname} {c.lastname}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={!selectedClientId || isLoadingProjects}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">
                    {isLoadingProjects
                      ? "Loading projects..."
                      : selectedClientId
                      ? "Select a project"
                      : "Select a client first"}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Service & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service (Optional)</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                {isLoadingSlots ? (
                  <p className="text-gray-500 text-center py-2">Loading slots...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={clsx(
                          "w-full rounded-lg py-2 font-medium border transition",
                          selectedSlot === slot
                            ? "bg-purple-600 text-white border-purple-600"
                            : "border-purple-500 text-purple-600 hover:bg-purple-50"
                        )}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2 bg-gray-50 rounded-lg">
                    No available slots for this date.
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any details for this appointment..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title || !selectedClientId || !selectedDate || !selectedSlot}
                className={clsx(
                  "bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700",
                  { "opacity-50 cursor-not-allowed": isSaving }
                )}
              >
                {isSaving ? "Saving..." : "Save Appointment"}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
