import { useState, useEffect } from "react";
import { DashboardData } from "@/types/Dashboard";

// 🧩 Mock dashboard data (no API calls)
export const mockDashboardData: DashboardData = {
  stats: {
    todayRevenue: "₦184,500",
    allTimeRevenue: "₦15.4M",
    todayProjects: 5,
    allTimeProjects: 320,
    upcomingAppointments: 8,
    totalAppointments: 100,
    newClientsThisWeek: 3,
    totalClients: 142,
  },
  upcomingAppointments: [
    {
      id: "1",
      client: "Chioma Nwosu",
      service: "Design Consultation",
      date: "Today",
      time: "10:00 AM",
    },
    {
      id: "2",
      client: "Tunde Adebayo",
      service: "Project Review",
      date: "Tomorrow",
      time: "01:00 PM",
    },
    {
      id: "3",
      client: "Funke Ojo",
      service: "Planning Session",
      date: "July 30, 2025",
      time: "03:30 PM",
    },
  ],
  recentProjects: [
    {
      id: "P-001",
      name: "Website Redesign",
      client: "Chioma Nwosu",
      budget: "₦850,000",
      status: "In Progress",
      deadline: "Aug 15, 2025",
    },
    {
      id: "P-002",
      name: "Marketing Campaign",
      client: "Tunde Adebayo",
      budget: "₦1.2M",
      status: "Completed",
      deadline: "July 25, 2025",
    },
    {
      id: "P-003",
      name: "App Development",
      client: "Funke Ojo",
      budget: "₦3.5M",
      status: "Pending",
      deadline: "Sept 10, 2025",
    },
  ],
};

// 🪝 Hook to use the mock data
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      setTimeout(() => {
        setData(mockDashboardData);
        setLoading(false);
      }, 500); // simulate delay
    };
    load();
  }, []);

  return { data, loading };
}
