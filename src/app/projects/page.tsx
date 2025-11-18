"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import CreateProjectModal from "./new/page";
import Modal from "@/components/Modal";

import DataTable from "@/components/DataTable";

export default function ProjectsPage() {
  const handleGoBack = useGoBack();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  // Token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/professionals/projects/list/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.status) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filters
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (search.trim()) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          `${p.customer_firstname} ${p.customer_lastname}`
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (timeFilter !== "All") {
      const today = new Date();
      result = result.filter((p) => {
        const dueDate = new Date(p.end_date);

        if (timeFilter === "This Week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);
          return dueDate >= startOfWeek && dueDate <= endOfWeek;
        }

        if (timeFilter === "Last Week") {
          const startOfLastWeek = new Date(today);
          startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
          const endOfLastWeek = new Date(startOfLastWeek);
          endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
          return dueDate >= startOfLastWeek && dueDate <= endOfLastWeek;
        }

        if (timeFilter === "This Month") {
          return (
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getFullYear() === today.getFullYear()
          );
        }

        if (timeFilter === "Last Month") {
          const lastMonth = today.getMonth() - 1;
          return (
            dueDate.getMonth() === lastMonth &&
            dueDate.getFullYear() === today.getFullYear()
          );
        }

        return true;
      });
    }

    return result;
  }, [projects, search, statusFilter, timeFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTimeFilter("All");
  };

  return (
    <DashboardLayout>
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Client Works"
        description="Manage all your client works and track their progress."
      >
        <div className="flex flex-col md:flex-row gap-2">
          <Link
            href="appointments/calendar"
            className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2"
          >
            <Icons.calendar className="h-5 w-5" />
            <span>Create Project from Appointment</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center justify-center"
          >
            <Icons.plus />
            <span>Create New Project</span>
          </button>
        </div>
      </HeaderTitleCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Project"
      >
        <CreateProjectModal onClose={() => setIsModalOpen(false)}  onCreated={fetchProjects} />
      </Modal>

      {/* Filters */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-36"
        >
          <option value="All">All Time</option>
          <option value="This Week">Due This Week</option>
          <option value="Last Week">Due Last Week</option>
          <option value="This Month">Due This Month</option>
          <option value="Last Month">Due Last Month</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40"
        >
          <option value="All">All Statuses</option>
          <option value="On-Hold">Onhold</option>
          <option value="Completed">Completed</option>
          <option value="In-Progress">In-progress</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <div className="hidden md:block md:flex-grow"></div>

        <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium rounded-lg"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchProjects}
            className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-gray-100"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

    
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
  <DataTable
    columns={[
      {
        label: "Project Name",
        field: "title",
        render: (project) => (
          <span className="font-semibold text-gray-900">{project.title}</span>
        ),
      },
      {
        label: "Customer",
        field: "customer",
        render: (project) => (
          <span className="text-gray-600">
            {project.customer_firstname} {project.customer_lastname}
          </span>
        ),
      },
      {
        label: "Due Date",
        field: "end_date",
        render: (project) => (
          <span className="text-sm text-gray-600">
            {new Date(project.end_date).toLocaleDateString()}
          </span>
        ),
      },
      {
        label: "Status",
        field: "status",
        render: (project) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              project.status === "Completed"
                ? "bg-green-100 text-green-800"
                : project.status === "On-Hold"
                ? "bg-gray-200 text-gray-800"
                : project.status === "In-Progress"
                ? "bg-blue-100 text-blue-800"
                : project.status === "Cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {project.status}
          </span>
        ),
      },
      {
        label: "Progress",
        field: "progress_status",
        render: (project) => (
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${project.progress_status}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700">
              {project.progress_status}%
            </span>
          </div>
        ),
      },
    ]}
    data={filteredProjects}
    loading={loading}
    error={null}
  
    actions={(project) => (
      <>
        <Link
          href={`/projects/view/${project.id}`}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
        >
          <Eye className="w-4 h-4 text-gray-500" /> View
        </Link>
        <Link
          href={`/projects/edit/${project.id}`}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
        >
          <Pencil className="w-4 h-4 text-gray-500" /> Edit
        </Link>
        <button
         
          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4 text-red-500" /> Delete
        </button>
      </>
    )}
  />
</div>

    </DashboardLayout>
  );
}
