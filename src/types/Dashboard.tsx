// src/types/Dashboard.tsx

// ----------------------
// Dashboard Data Types
// ----------------------

export interface DashboardStats {
  todayRevenue: string;
  allTimeRevenue: string;
  todayProjects: number;
  allTimeProjects: number;
  upcomingAppointments: number;
  totalAppointments: number;
  newClientsThisWeek: number;
  totalClients: number;
}

export interface UpcomingAppointment {
  id: string;
  client: string;
  service: string;
  date: string;
  time: string;
}

export interface RecentProject {
  id: string;
  name: string;
  client: string;
  budget: string;
  status: "In Progress" | "Completed" | "Pending";
  deadline: string;
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingAppointments: UpcomingAppointment[];
  recentProjects: RecentProject[];
}
