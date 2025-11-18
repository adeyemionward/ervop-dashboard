'use client';

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface Contact {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  service_type: string;
  status: string;
  price: string;
}

interface Task {
  id: number;
  description: string;
}

export default function CreateProject() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const [projectTitle, setProjectTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch contacts
  useEffect(() => {
    setLoadingContacts(true);
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch("http://127.0.0.1:8000/api/v1/professionals/contacts/list/", { headers });
        const result = await res.json();
        setContacts(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load clients.");
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  // Fetch services
  useEffect(() => {
    setLoadingServices(true);
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch("http://127.0.0.1:8000/api/v1/professionals/services/list", { headers });
        const result = await res.json();
        setServices(Array.isArray(result.services) ? result.services : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load services.");
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Task handlers
  const addTask = () => setTasks([...tasks, { id: Date.now(), description: "" }]);
  const removeTask = (id: number) => setTasks(tasks.filter((t) => t.id !== id));
  const updateTask = (id: number, value: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, description: value } : t)));

  const generateAITasks = async () => {
    if (!projectTitle) {
      toast.error("Please enter a project title first!");
      return;
    }
    setLoadingAI(true);
    try {
      // Fake AI response, replace with your OpenAI API call
      const aiTasks = [
        `Analyze requirements for ${projectTitle}`,
        `Design a solution for ${projectTitle}`,
        `Develop initial prototype for ${projectTitle}`,
      ];
      setTasks(aiTasks.map((desc, idx) => ({ id: Date.now() + idx, description: desc })));
      toast.success("AI generated tasks!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI tasks.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedServiceId || !projectTitle) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        contact_id: selectedClientId,
        service_id: selectedServiceId,
        title: projectTitle,
        start_date: (document.getElementById("startDate") as HTMLInputElement)?.value,
        end_date: (document.getElementById("dueDate") as HTMLInputElement)?.value,
        status: "On-Hold",
        description: (document.getElementById("description") as HTMLTextAreaElement)?.value,
        cost: (document.getElementById("projectValue") as HTMLInputElement)?.value,
        tasks: tasks.map((t) => t.description),
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/professionals/projects/create/", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status) {
        toast.success("Project created successfully!");
        // Optionally redirect or clear form
      } else {
        toast.error(result.message || "Failed to create project.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/projects" className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-2 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Project Title */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <input type="text" id="projectName" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Feasibility analysis and market entry"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Client & Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Choose Client */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Choose Client</label>
                {loadingContacts ? <p>Loading clients...</p> : (
                  <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}
                    className="border w-full border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                    <option value="" disabled>Select Client</option>
                    {contacts.map((c) => <option key={c.id} value={c.id.toString()}>{c.firstname} {c.lastname} ({c.phone})</option>)}
                  </select>
                )}
              </div>

              {/* Choose Service */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">Choose Service</label>
                {loadingServices ? <p>Loading services...</p> : (
                  <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="border w-full border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500">
                    <option value="" disabled>Select Service</option>
                    {services.map((s) => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Dates & Value */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" id="startDate" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" id="dueDate" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label htmlFor="projectValue" className="block text-sm font-medium text-gray-700 mb-1">Project Value (₦)</label>
                <input type="text" id="projectValue" placeholder="e.g. 450,000" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
              <textarea id="description" rows={4} placeholder="Add a detailed description..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            {/* Tasks Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Tasks</h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input type="text" placeholder="Enter a task description..." value={task.description}
                      onChange={(e) => updateTask(task.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button type="button" onClick={() => removeTask(task.id)} className="text-red-500 hover:text-red-700 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={addTask} className="flex-1 border-2 border-dashed border-gray-300 text-gray-500 px-4 py-2 rounded-lg hover:border-purple-500 hover:text-purple-500">+ Add Task</button>
                <button type="button" onClick={generateAITasks} disabled={loadingAI}
                  className={`flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 ${loadingAI ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {loadingAI ? "Generating..." : "Generate AI Tasks"}
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 border-t pt-6">
                <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 font-medium rounded-sm hover:bg-gray-300">Cancel</button>
                <button
                    type="submit"
                    disabled={submitting}
                    className={`btn-secondary text-white font-medium px-6 py-3 rounded-sm shadow-lg ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    >
                    {submitting ? "Submitting..." : "Save Project"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
