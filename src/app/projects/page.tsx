"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ProjectsPage() {
  const handleGoBack = useGoBack();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 🔑 now dynamic

  // ✅ Get token once on mount
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Correct fetchProjects definition
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(
        "http://127.0.0.1:8000/api/v1/professionals/projects/list/",
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

  // ✅ Call it once on mount (or when token changes)
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Memoized filters
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

  // Pagination slice
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTimeFilter("All");
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <HeaderTitleCard
        onGoBack={handleGoBack}
        title="Client Work"
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
          <Link
            href="projects/new"
            className="btn-primary flex items-center justify-center"
          >
            <Icons.plus />
            <span>Create New Project</span>
          </Link>
        </div>
      </HeaderTitleCard>

      {/* Filters */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
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

        {/* Time Filter */}
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

        {/* Status Filter */}
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

        {/* Action Buttons */}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium">Project Name</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading projects...
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No projects found.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {project.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {project.customer_firstname} {project.customer_lastname}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(project.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full 
                          ${
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${project.progress_status}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {project.progress_status}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/projects/${project.id}`}>
                        <button className="text-primary-600 hover:text-primary-800 font-semibold">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
        {filteredProjects.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t mt-4 bg-white rounded-b-lg">
                {/* Showing count */}
                <span className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-semibold">
                    {Math.min(1 + (currentPage - 1) * pageSize, filteredProjects.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                    {Math.min(currentPage * pageSize, filteredProjects.length)}
                </span>{" "}
                of <span className="font-semibold">{filteredProjects.length}</span> Results
                </span>

                {/* Navigation */}
                <div className="flex items-center space-x-2">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
                </div>
            </div>
        )}

    </DashboardLayout>
  );
}
