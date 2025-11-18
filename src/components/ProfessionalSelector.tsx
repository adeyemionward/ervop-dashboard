"use client";

import { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { useProfessionalData, Contact, Project } from "@/hooks/useProfessionalData";

interface Props {
  type: "vendors" | "contractors";
  showProjectsByDefault?: boolean;
  selectedClient?: string;
  setSelectedClient?: (id: string) => void;
  selectedProject?: string;
  setSelectedProject?: (id: string) => void;
}

export default function ProfessionalSelector({
  type,
  showProjectsByDefault = false,
  selectedClient,
  setSelectedClient,
  selectedProject,
  setSelectedProject,
}: Props) {
  const [showProjects, setShowProjects] = useState(showProjectsByDefault);

  const { contacts, loadingContacts, projects, projectsLoading, fetchProjectsOnce } = useProfessionalData(type);

  // Automatically fetch projects if the checkbox is default-checked
  useEffect(() => {
    if (showProjects && projects.length === 0) {
      fetchProjectsOnce();
    }
  }, [showProjects, projects.length, fetchProjectsOnce]);

  // Memoized contact options
  const contactOptions = useMemo(
    () =>
      contacts.map((c: Contact) => ({
        value: c.id.toString(),
        label: `${c.firstname} ${c.lastname} (${c.phone})`,
      })),
    [contacts]
  );

  const selectedContactOption = useMemo(() => {
    if (!selectedClient) return null;
    return contactOptions.find((c) => c.value === selectedClient) || null;
  }, [selectedClient, contactOptions]);

  // Memoized project options
  const projectOptions = useMemo(
    () => projects.map((p: Project) => ({ value: p.id.toString(), label: p.title })),
    [projects]
  );

  const selectedProjectOption = useMemo(() => {
    if (!selectedProject) return null;
    return projectOptions.find((p) => p.value === selectedProject) || null;
  }, [selectedProject, projectOptions]);

  // Handle checkbox toggle and fetch projects once
  const handleToggleProjects = () => {
    setShowProjects((prev) => !prev);
    if (!projects.length) fetchProjectsOnce();
  };

  return (
    <div className="professional-selector">
      {/* Contacts dropdown */}
      <div className="mb-4">
        <Select
          inputId="client-select"
          isLoading={loadingContacts}
          options={contactOptions}
          value={selectedContactOption}
          onChange={(option) => setSelectedClient?.(option?.value || "")}
          placeholder={loadingContacts ? "Loading clients..." : "Select contact"}
          className="react-select-container"
          classNamePrefix="react-select"
          isClearable
        />
      </div>

      {/* Show projects checkbox */}
      <div className="mb-2">
        <label>
          <input
            type="checkbox"
            checked={showProjects}
            onChange={handleToggleProjects}
            className="mr-2"
          />
          Show Projects
        </label>
      </div>

      {/* Project dropdown */}
      {showProjects && (
        <div className="mb-4">
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : projects.length > 0 ? (
            <Select
              inputId="project-select"
              options={projectOptions}
              value={selectedProjectOption}
              onChange={(option) => setSelectedProject?.(option?.value || "")}
              placeholder="Select Project"
              isClearable ={ false}
            />
          ) : (
            <p>No projects found</p>
          )}
        </div>
      )}
    </div>
  );
}
