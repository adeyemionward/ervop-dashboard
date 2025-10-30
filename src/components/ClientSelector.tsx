"use client";

import { useEffect, useState } from "react";
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
  isLinked?: boolean;
}

export default function ClientSelector({
  selectedClient,
  setSelectedClient,
  selectedProject,
  setSelectedProject,
  selectedAppointment,
  setSelectedAppointment,
  contacts,
  isLinked = false,
}: ClientSelectorProps) {
  const {
    loadingContacts,
    clientProjects,
    projectsLoading,
    clientAppointments,
    appointmentsLoading,
  } = useClientData(selectedClient);

  // Purpose state now defaults to "project"
  const [purpose, setPurpose] = useState<"project" | "appointment">("project");

  // Reset selections when client changes
  useEffect(() => {
    setSelectedProject("");
    setSelectedAppointment("");
    setPurpose("project"); // always default to project when client changes
  }, [selectedClient]);

  return (
    <div className="space-y-4">
      {/* Client selector */}
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
            <option value="" disabled>
              Select Client
            </option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.firstname} {c.lastname} ({c.phone})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Show purpose only when client is selected and linking is enabled */}
      {selectedClient && isLinked && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            What is this meant for?
          </label>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="purpose"
                value="project"
                checked={purpose === "project"}
                onChange={() => setPurpose("project")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Project</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="purpose"
                value="appointment"
                checked={purpose === "appointment"}
                onChange={() => setPurpose("appointment")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Appointment</span>
            </label>
          </div>
        </div>
      )}

      {/* Project List (default view when client selected) */}
      {selectedClient && isLinked && purpose === "project" && (
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

      {/* Appointment List */}
      {selectedClient && isLinked && purpose === "appointment" && (
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
    </div>
  );
}
