// src/types/Dashboard.ts

// ----------------------
// Dashboard Data Types
// ----------------------

/**
 * Summary statistics for the dashboard overview section.
 */
export interface DashboardStats {
  /** Revenue earned today (formatted as currency, e.g., ₦120,000) */
  todayRevenue: string;

  /** Total revenue earned all time (formatted as currency) */
  allTimeRevenue: string;

  /** Percentage change in revenue compared to the previous day */
  revenueChange?: number;

  /** Number of projects currently active today */
  activeProjects: number;

  /** Total number of projects all time */
  allTimeProjects: number;

  /** Percentage change in project activity */
  projectsChange?: number;

  /** Number of upcoming appointments */
  upcomingAppointments: number;

  /** Total number of appointments all time */
  totalAppointments: number;

  /** Percentage change in appointment count */
  appointmentsChange?: number;

  /** Number of new clients gained this week */
  newClientsThisWeek: number;

  /** Total number of clients */
  totalClients: number;

  /** Percentage change in client growth */
  clientsChange?: number;
}

/**
 * Represents an upcoming appointment in the dashboard.
 */
export interface UpcomingAppointment {
  id: string;
  client: string;
  service: string;
  date: string; // ISO or human-readable format
  time: string; // e.g., "10:30 AM"
}

/**
 * Represents a recent project displayed in the dashboard.
 */
export interface RecentProject {
  id: string;
  name: string;
  client: string;
  budget: string; // e.g., "₦500,000"
  status: "In Progress" | "Completed" | "Pending";
  deadline: string; // e.g., "2025-10-22"
}

/**
 * Full structure of the dashboard response.
 */
export interface DashboardData {
  stats: DashboardStats;
  upcomingAppointments: UpcomingAppointment[];
  recentProjects: RecentProject[];
}
