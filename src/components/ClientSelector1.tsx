'use client';

import { useEffect, useState, useMemo } from "react";
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
  showInvoices?: boolean;
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
  showInvoices = true,
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

  // Reset invoices when client changes
  useEffect(() => {
    if (selectedClient) {
      setSelectedInvoice?.("");
      setInvoices([]);
    }
  }, [selectedClient, setSelectedInvoice]);

  // Clear invalid project if it no longer exists
  useEffect(() => {
    if (!selectedProject) return;
    const exists = clientProjects.some((p) => p.id.toString() === selectedProject);
    if (!exists) setSelectedProject("");
  }, [clientProjects]);

  // Clear invalid appointment if it no longer exists
  useEffect(() => {
    if (!selectedAppointment) return;
    const exists = clientAppointments.some(
      (a) => a.id.toString() === selectedAppointment
    );
    if (!exists) setSelectedAppointment("");
  }, [clientAppointments]);

  // Auto-set purpose if preloaded
  useEffect(() => {
    if (!selectedProject && !selectedAppointment) return;
    setPurpose((prev) => {
      if (prev === "appointment" && selectedAppointment) return prev;
      if (prev === "project" && selectedProject) return prev;
      if (selectedProject) return "project";
      if (selectedAppointment) return "appointment";
      return prev;
    });
  }, [selectedProject, selectedAppointment]);

  // Fetch invoices when project/appointment/purpose changes
  useEffect(() => {
    if (!showInvoices) return;
    setSelectedInvoice?.("");
    setInvoices([]);

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
        const fetchedInvoices = result.status && Array.isArray(result.data) ? result.data : [];
        setInvoices(fetchedInvoices);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [selectedProject, selectedAppointment, purpose, showInvoices, setSelectedInvoice]);

  // Memoized value objects to prevent dropdown flicker
  const projectValue = useMemo(() => {
    const p = clientProjects.find((p) => p.id.toString() === selectedProject);
    return p ? { value: p.id.toString(), label: p.title } : null;
  }, [clientProjects, selectedProject]);

  const appointmentValue = useMemo(() => {
    const a = clientAppointments.find((a) => a.id.toString() === selectedAppointment);
    if (!a) return null;
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
  }, [clientAppointments, selectedAppointment]);

  const invoiceValue = useMemo(() => {
    const inv = invoices.find((i) => i.id.toString() === selectedInvoice);
    if (!inv) return null;
    return {
      value: inv.id.toString(),
      label: `${inv.invoice_no} — ₦${Number(inv.amount).toLocaleString()} (${Number(
        inv.outstanding_balance
      ).toLocaleString()} outstanding)`,
    };
  }, [invoices, selectedInvoice]);

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">Choose Client</label>
        <Select
          inputId="client-select"
          isLoading={loadingContacts}
          options={contacts.map((c) => ({
            value: c.id.toString(),
            label: `${c.firstname} ${c.lastname} (${c.phone})`,
          }))}
          value={
            selectedClient
              ? contacts.find((c) => c.id.toString() === selectedClient)
                ? { value: selectedClient, label: `${contacts.find(c => c.id.toString() === selectedClient)?.firstname} ${contacts.find(c => c.id.toString() === selectedClient)?.lastname} (${contacts.find(c => c.id.toString() === selectedClient)?.phone})` }
                : null
              : null
          }
          onChange={(option) => setSelectedClient(option?.value || "")}
          placeholder={loadingContacts ? "Loading clients..." : "Select Client"}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Purpose */}
      {selectedClient && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">What is this meant for?</label>
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

      {/* Project Dropdown */}
      {selectedClient && purpose === "project" && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">Project</label>
          <Select
            inputId="project-select"
            isLoading={projectsLoading}
            options={clientProjects.map((p) => ({ value: p.id.toString(), label: p.title }))}
            value={projectValue}
            onChange={(option) => setSelectedProject(option?.value || "")}
            placeholder={projectsLoading ? "Loading projects..." : "Select Project"}
          />
        </div>
      )}

      {/* Appointment Dropdown */}
      {selectedClient && purpose === "appointment" && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">Appointment</label>
          <Select
            inputId="appointment-select"
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
            value={appointmentValue}
            onChange={(option) => setSelectedAppointment(option?.value || "")}
            placeholder={appointmentsLoading ? "Loading appointments..." : "Select Appointment"}
          />
        </div>
      )}

      {/* Invoice Dropdown */}
      {showInvoices && selectedClient && (selectedProject || selectedAppointment) && (
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">Invoice</label>
          <Select
            inputId="invoice-select"
            key={`${selectedProject || selectedAppointment}-${invoices.length}`}
            isLoading={loadingInvoices}
            options={invoices.map((inv) => ({
              value: inv.id.toString(),
              label: `${inv.invoice_no} — ₦${Number(inv.amount).toLocaleString()} (${Number(
                inv.outstanding_balance
              ).toLocaleString()} outstanding)`,
            }))}
            value={invoiceValue}
            onChange={(option) => setSelectedInvoice?.(option?.value || "")}
            placeholder={loadingInvoices ? "Loading invoices..." : "Select Invoice"}
            noOptionsMessage={() => (loadingInvoices ? "Loading invoices..." : "No outstanding invoices")}
          />
        </div>
      )}
    </div>
  );
}
