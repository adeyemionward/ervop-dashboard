import { useState, useEffect } from "react";

// ----------------------
// TYPES
// ----------------------
export interface DashboardData {
  stats: {
    todayRevenue: string;
    allTimeRevenue: string;
    todayOrders: number;
    allTimeOrders: number;
    upcomingAppointments: number;
    totalAppointments: number;
    newClientsThisWeek: number;
    totalClients: number;
  };
  upcomingAppointments: {
    id: string;
    client: string;
    service: string;
    date: string;
    time: string;
  }[];
  recentProjects: {
    id: string;
    name: string;
    client: string;
    budget: string;
    status: "In Progress" | "Completed" | "Pending";
    deadline: string;
  }[];
}

// ----------------------
// MOCK DATA
// ----------------------
const mockDashboardData: DashboardData = {
  stats: {
    todayRevenue: "₦184,500",
    allTimeRevenue: "₦15.4M",
    todayOrders: 32,
    allTimeOrders: 1280,
    upcomingAppointments: 8,
    totalAppointments: 100,
    newClientsThisWeek: 3,
    totalClients: 142,
  },
  upcomingAppointments: [
    { id: "1", client: "Chioma Nwosu", service: "Initial Consultation", date: "Today", time: "10:00 AM" },
    { id: "2", client: "Tunde Adebayo", service: "Project Kick-off", date: "Tomorrow", time: "01:00 PM" },
    { id: "3", client: "Funke Ojo", service: "Strategy Session", date: "July 30, 2025", time: "03:30 PM" },
  ],
  recentProjects: [
    { id: "P-001", name: "Website Redesign", client: "Chioma Nwosu", budget: "₦850,000", status: "In Progress", deadline: "Aug 15, 2025" },
    { id: "P-002", name: "Marketing Campaign", client: "Tunde Adebayo", budget: "₦1.2M", status: "Completed", deadline: "July 25, 2025" },
    { id: "P-003", name: "App Development", client: "Funke Ojo", budget: "₦3.5M", status: "Pending", deadline: "Sept 10, 2025" },
  ],
};

// ----------------------
// HOOK (uses mock data)
// ----------------------
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockDashboardData);
      setLoading(false);
    }, 800); // Simulate async load
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}

// Optional: Export mock data directly for static components
export { mockDashboardData };
