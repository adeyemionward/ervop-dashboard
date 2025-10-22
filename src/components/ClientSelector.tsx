'use client';

import { useState } from "react";
import { useClientData } from "@/hooks/useClientData";

type Contact = {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
};

interface ClientSelectorProps {
  selectedClient: string;
  setSelectedClient: (id: string) => void;
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  selectedAppointment: string;
  setSelectedAppointment: (id: string) => void;
  contacts: Contact[];
}

export default function ClientSelector({
  selectedClient,
  setSelectedClient,
  selectedProject,
  setSelectedProject,
  selectedAppointment,
  setSelectedAppointment,
}: ClientSelectorProps) {
  const {
    loadingContacts,
    clientProjects,
    projectsLoading,
    clientAppointments,
    appointmentsLoading,
    contacts,
  } = useClientData(selectedClient);

  // State for "What is this meant for"
  const [purpose, setPurpose] = useState<"project" | "appointment" | "">("");

  return (
    <div className="space-y-4">
      {/* Clients */}
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Choose Client
        </label>
        {loadingContacts ? (
          <p>Loading clients...</p>
        ) : (
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          >
            <option value="" disabled>Select Client</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.firstname} {c.lastname} ({c.phone})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* What is this meant for */}
      {selectedClient && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            What is this meant for?
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as "project" | "appointment")}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          >
            <option value="" disabled>Select purpose</option>
            <option value="project">Project</option>
            <option value="appointment">Appointment</option>
          </select>
        </div>
      )}

      {/* Conditionally show Projects or Appointments */}
      {selectedClient && purpose === "appointment" && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Appointment
          </label>
          <select
            value={selectedAppointment}
            onChange={(e) => setSelectedAppointment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          >
            <option value="">
              {appointmentsLoading
                ? "Loading appointments..."
                : "Select Appointment"}
            </option>
            {!appointmentsLoading && clientAppointments.length > 0 ? (
              clientAppointments.map((a) => {
                const dateObj = new Date(`${a.date}T${a.time}`);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <option key={a.id} value={a.id.toString()}>
                    {formattedDate}, {formattedTime} ({a.appointment_status})
                  </option>
                );
              })
            ) : (
              <option disabled>No Appointment found</option>
            )}
          </select>
        </div>
      )}

      {selectedClient && purpose === "project" && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          >
            <option value="">
              {projectsLoading ? "Loading projects..." : "Select Project"}
            </option>
            {!projectsLoading && clientProjects.length > 0 ? (
              clientProjects.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.title}
                </option>
              ))
            ) : (
              <option disabled>No Project found</option>
            )}
          </select>
        </div>
      )}
    </div>
  );
}
