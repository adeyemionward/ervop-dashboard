"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useClientData } from "@/hooks/useClientData";

type Contact = {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
};

interface Invoice {
  id: number;
  invoice_no: string;
  amount: number;
  outstanding_balance: number;
}

interface ClientSelectorProps {
  selectedClient: string;
  setSelectedClient: (id: string) => void;
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  selectedAppointment: string;
  setSelectedAppointment: (id: string) => void;
  selectedInvoice: string;
  setSelectedInvoice: (id: string) => void;
  contacts: Contact[];
  
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ClientSelector({
  selectedClient,
  setSelectedClient,
  selectedProject,
  setSelectedProject,
  selectedAppointment,
  setSelectedAppointment,
  selectedInvoice,
  setSelectedInvoice,
  contacts,
}: ClientSelectorProps) {
  const {
    loadingContacts,
    clientProjects,
    projectsLoading,
    clientAppointments,
    appointmentsLoading,
  } = useClientData(selectedClient);

  const [purpose, setPurpose] = useState<"project" | "appointment">("project");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Reset when client changes
  useEffect(() => {
    if (selectedClient) {
      setPurpose("project");
      setSelectedProject("");
      setSelectedAppointment("");
      setSelectedInvoice("");
      setInvoices([]);
    }
  }, [selectedClient]);

//   useEffect(() => {
//   // setSelectedInvoice(""); // reset invoice whenever purpose/project/appointment changes
// }, [purpose, selectedProject, selectedAppointment]);


  // Reset invoice when purpose/project/appointment changes
  useEffect(() => {
  setSelectedInvoice("");
  setInvoices([]);

  // Don't fetch if nothing is selected
  if (!selectedProject && !selectedAppointment) return;

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    const token = localStorage.getItem("token");

    const endpoint =
      purpose === "project"
        ? `${BASE_URL}/professionals/invoices/projectInvoices/${selectedProject}`
        : `${BASE_URL}/professionals/invoices/appointmentInvoices/${selectedAppointment}`;

    try {
      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
        return;
      }

      setInvoices(result.status ? result.data : []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  fetchInvoices();
}, [selectedProject, selectedAppointment, purpose]);


  return (
    <div className="space-y-6">
      {/* Client selector */}
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Choose Client
        </label>
        <Select
          isLoading={loadingContacts}
          options={contacts.map((c) => ({
            value: c.id.toString(),
            label: `${c.firstname} ${c.lastname} (${c.phone})`,
          }))}
          value={
            selectedClient
              ? {
                  value: selectedClient,
                  label:
                    contacts.find((c) => c.id.toString() === selectedClient)
                      ? `${contacts.find((c) => c.id.toString() === selectedClient)?.firstname} ${
                          contacts.find((c) => c.id.toString() === selectedClient)?.lastname
                        } (${contacts.find((c) => c.id.toString() === selectedClient)?.phone})`
                      : "",
                }
              : null
          }
          onChange={(option) => setSelectedClient(option?.value || "")}
          placeholder={loadingContacts ? "Loading clients..." : "Select Client"}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Purpose radio buttons */}
      {selectedClient && (
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

      {/* Project dropdown */}
      {selectedClient && purpose === "project" && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Project
          </label>
          <Select
            isLoading={projectsLoading}
            options={clientProjects.map((p) => ({
              value: p.id.toString(),
              label: p.title,
            }))}
            value={
              selectedProject
                ? {
                    value: selectedProject,
                    label:
                      clientProjects.find((p) => p.id.toString() === selectedProject)?.title || "",
                  }
                : null
            }
            onChange={(option) => setSelectedProject(option?.value || "")}
            placeholder={projectsLoading ? "Loading projects..." : "Select Project"}
          />
        </div>
      )}

      {/* Appointment dropdown */}
      {selectedClient && purpose === "appointment" && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Appointment
          </label>
          <Select
            isLoading={appointmentsLoading}
            options={clientAppointments.map((a) => {
              const dateObj = new Date(`${a.date}T${a.time}`);
              return {
                value: a.id.toString(),
                label: `${dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}, ${dateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })} (${a.appointment_status})`,
              };
            })}
            value={
              selectedAppointment
                ? {
                    value: selectedAppointment,
                    label: clientAppointments.find((a) => a.id.toString() === selectedAppointment)
                      ? (() => {
                          const a = clientAppointments.find(
                            (a) => a.id.toString() === selectedAppointment
                          )!;
                          const dateObj = new Date(`${a.date}T${a.time}`);
                          return `${dateObj.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}, ${dateObj.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })} (${a.appointment_status})`;
                        })()
                      : "",
                  }
                : null
            }
            onChange={(option) => setSelectedAppointment(option?.value || "")}
          />
        </div>
      )}

      {/* Invoice dropdown */}
      {selectedClient && (selectedProject || selectedAppointment) && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Invoice
          </label>
          <Select
        key={`${selectedProject || selectedAppointment}`} 
        isLoading={loadingInvoices} 
        options={
          (invoices || []).length > 0
            ? (invoices || []).map((inv) => ({
                value: inv.id.toString(),
                label: `${inv.invoice_no} — ₦${Number(inv.amount).toLocaleString()} (${Number(
                  inv.outstanding_balance
                ).toLocaleString()} outstanding)`,
              }))
            : []
        }
        value={
          selectedInvoice
            ? (() => {
                const inv = (invoices || []).find((i) => i.id.toString() === selectedInvoice);
                return inv
                  ? {
                      value: inv.id.toString(),
                      label: `${inv.invoice_no} — ₦${Number(inv.amount).toLocaleString()} (${Number(
                        inv.outstanding_balance
                      ).toLocaleString()} outstanding)`,
                    }
                  : null;
              })()
            : null
        }
        onChange={(option) => setSelectedInvoice(option?.value || "")}
        placeholder={loadingInvoices ? "Loading invoices..." : "Select Invoice"}
        noOptionsMessage={() =>
          loadingInvoices ? "Loading invoices..." : "No outstanding invoices"
        }
      />

      </div>
      )}


    </div>
  );
}
