import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { RecentProject } from "@/types/Dashboard";

interface Props {
  projects: RecentProject[];
}

export const RecentProjects: React.FC<Props> = ({ projects }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h3>

    <div className="space-y-4">
      {projects.map((project, i) => (
        <div key={i} className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">
              {project.id} - {project.name}
            </p>
            <p className="text-sm text-gray-500">
              {project.client} • Deadline: {project.deadline}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-800">{project.budget}</p>
            <span
              className={clsx(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                project.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              )}
            >
              {project.status}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 border-t pt-4">
      <Link
        href="/projects"
        className="text-sm font-semibold text-blue-600 hover:underline flex items-center"
      >
        View All Projects <ArrowUpRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </div>
);
