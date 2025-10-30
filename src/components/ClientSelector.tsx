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
  selectedInvoice?: string;
  setSelectedInvoice?: (id: string) => void;
  contacts: Contact[];
  showInvoices?: boolean; // ✅ New optional prop
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
  showInvoices = true, // ✅ destructure here + set default value
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

  

  // When client changes, reset dependent fields
  useEffect(() => {
    if (selectedClient) {
      setSelectedInvoice?.("");
      setInvoices([]);
    }
  }, [selectedClient, setSelectedInvoice]);

  // Auto-stamp project when clientProjects are loaded
  useEffect(() => {
    if (selectedProject && clientProjects.length > 0) {
      const projectExists = clientProjects.find(
        (p) => p.id.toString() === selectedProject
      );
      if (projectExists) {
        setSelectedProject(projectExists.id.toString());
      }
    }
  }, [clientProjects, selectedProject, setSelectedProject]);

  // Auto-stamp appointment when clientAppointments are loaded
  useEffect(() => {
    if (selectedAppointment && clientAppointments.length > 0) {
      const apptExists = clientAppointments.find(
        (a) => a.id.toString() === selectedAppointment
      );
      if (apptExists) {
        setSelectedAppointment(apptExists.id.toString());
      }
    }
  }, [clientAppointments, selectedAppointment, setSelectedAppointment]);

  // Auto-select purpose based on preloaded project_id / appointment_id
  useEffect(() => {
  // ✅ Only auto-set the purpose if the user hasn't already selected one manually
  // or if both project and appointment are empty
  if (!selectedProject && !selectedAppointment) return;

  setPurpose((prev) => {
    // Don't override if the user manually selected a purpose
    if (prev === "appointment" && selectedAppointment) return prev;
    if (prev === "project" && selectedProject) return prev;

    if (selectedProject) return "project";
    if (selectedAppointment) return "appointment";
    return prev;
  });
}, [selectedProject, selectedAppointment]);

  // ✅ SINGLE SOURCE OF TRUTH: Reset and fetch invoices when purpose/project/appointment changes
  useEffect(() => {
    if (!showInvoices) return; // ✅ Skip invoice logic entirely
    // Reset invoice first
    setSelectedInvoice?.("");
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
        
        // ✅ FIX: Safe access to prevent "length" error
        const fetchedInvoices = result.status && Array.isArray(result.data) ? result.data : [];
        setInvoices(fetchedInvoices);

        // ✅ Auto-select invoice after invoices are loaded
        if (selectedInvoice && fetchedInvoices.length > 0) {
          const existingInvoice = fetchedInvoices.find(
            (inv: Invoice) => inv.id.toString() === selectedInvoice.toString()
          );
          if (existingInvoice) {
            setSelectedInvoice?.(existingInvoice.id.toString());
          }
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [selectedProject, selectedAppointment, purpose,  showInvoices]);

  // ✅ Additional safety: Auto-select invoice after invoices are loaded
  useEffect(() => {
    if (selectedInvoice && invoices.length > 0) {
      const inv = invoices.find(i => i.id.toString() === selectedInvoice.toString());
      if (inv && selectedInvoice !== inv.id.toString()) {
        setSelectedInvoice?.(inv.id.toString());
      }
    }
  }, [invoices, selectedInvoice, setSelectedInvoice]);

  return (
    <div className="space-y-6">
      {/* Client selector */}
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Choose Client
        </label>
        <Select inputId="client-select"
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
          <Select inputId="project-select"
            isLoading={projectsLoading}
            options={clientProjects.map((p) => ({
              value: p.id.toString(),
              label: p.title,
            }))}
            value={
              selectedProject
                ? clientProjects
                    .filter((p) => p.id.toString() === selectedProject)
                    .map((p) => ({ value: p.id.toString(), label: p.title }))[0] || null
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
          <Select inputId="appointment-select"
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
                ? clientAppointments
                    .filter(a => a.id.toString() === selectedAppointment) // ✅ FIXED: Changed from Number() to toString()
                    .map(a => {
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
                    })[0] || null
                : null
            }
            onChange={(option) => setSelectedAppointment(option?.value || "")}
            placeholder={appointmentsLoading ? "Loading appointments..." : "Select Appointment"}
          />
        </div>
      )}

      {/* Invoice dropdown */}
      {showInvoices && selectedClient && (selectedProject || selectedAppointment) && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">
            Invoice
          </label>
          <Select inputId="invoice-select"
            key={`${selectedProject || selectedAppointment}-${invoices.length}`}
            isLoading={loadingInvoices}
            options={(invoices || []).map((inv) => ({
              value: inv.id.toString(),
              label: `${inv.invoice_no} — ₦${Number(inv.amount).toLocaleString()} (${Number(
                inv.outstanding_balance
              ).toLocaleString()} outstanding)`,
            }))}
            value={
              selectedInvoice
                ? (() => {
                    const inv = (invoices || []).find(
                      (i) => i.id.toString() === selectedInvoice.toString() // ✅ FIXED: Consistent string comparison
                    );
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
            onChange={(option) => setSelectedInvoice?.(option?.value || "")}
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