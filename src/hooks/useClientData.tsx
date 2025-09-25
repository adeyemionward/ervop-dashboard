"use client";

import { useEffect, useState } from "react";

export interface Contact {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
}

export interface Project {
  id: number;
  title: string;
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  appointment_status: string;
}

export function useClientData(selectedClient?: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://127.0.0.1:8000/api/v1/professionals/contacts/list/",
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const result = await res.json();
        if (result.status) {
          setContacts(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  // Fetch projects & appointments when client changes
  useEffect(() => {
    if (!selectedClient) return;

    const token = localStorage.getItem("token");

    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/professionals/projects/clientProjects/${selectedClient}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const result = await res.json();
        setClientProjects(result.status ? result.data : []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setClientProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/professionals/appointments/clientAppointments/${selectedClient}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const result = await res.json();
        setClientAppointments(result.status ? result.data : []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setClientAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchProjects();
    fetchAppointments();
  }, [selectedClient]);

  return {
    contacts,
    loadingContacts,
    clientProjects,
    projectsLoading,
    clientAppointments,
    appointmentsLoading,
  };
}
