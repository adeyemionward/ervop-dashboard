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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function useProfessionalData(type: "vendors" | "contractors") {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false); // <--- track if already loaded

  // Fetch contacts once
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/professionals/${type}/list/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = await res.json();
        setContacts(result.status ? result.data : []);
      } catch (err) {
        console.error(`Failed to fetch ${type}:`, err);
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [type]);

  // Fetch all projects **only once**
  const fetchProjectsOnce = async () => {
    if (projectsLoaded) return; // <--- skip if already loaded
    setProjectsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/professionals/projects/list/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      setProjects(result.status ? result.data : []);
      setProjectsLoaded(true); // <--- mark as loaded
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  return {
    contacts,
    loadingContacts,
    projects,
    projectsLoading,
    fetchProjectsOnce, // call this once when checkbox is first checked
  };
}
