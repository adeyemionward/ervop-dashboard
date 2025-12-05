import React from "react";
import { DollarSign, Folder, Users, Calendar, ArrowUpRight, TrendingUp } from "lucide-react";
import { DashboardData } from "@/types/Dashboard";
import Link from "next/link";
import clsx from "clsx";

interface Props {
  data: DashboardData;
}

interface StatCardProps {
  title: string;
  value: string | number;
  allTimeValue?: string | number;
  allTimeLink?: string;
  icon: React.ElementType;
  colorTheme: "green" | "blue" | "purple" | "yellow";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  allTimeValue,
  allTimeLink,
  icon: Icon,
  colorTheme,
}) => {
  // Enhanced color styles for border, background, and text emphasis
  const colorStyles = {
    // Green Theme (Emerald)
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200", // Lighter border for card body
      valueText: "text-emerald-700", // Stronger color for the main value
    },
    // Blue Theme (Blue)
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      valueText: "text-blue-700",
    },
    // Purple Theme (Violet)
    purple: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-200",
      valueText: "text-violet-700",
    },
    // Yellow Theme (Amber)
    yellow: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      valueText: "text-amber-700",
    },
  };

  const currentStyle = colorStyles[colorTheme];

  return (
    // Card now uses the color-specific border on hover
    <div className={clsx(
        "group relative overflow-hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-0.5",
        `hover:${currentStyle.border}` // Dynamic hover border
    )}>

      {/* Header: Compact layout */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {title}
          </p>
        </div>
        {/* Icon Container: Uses bg and text color for a punch */}
        <div className={clsx(" rounded-lg border", currentStyle.bg, currentStyle.text, currentStyle.border)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Body: Value now uses a stronger color */}
      <div className="flex items-baseline gap-2">
        <h3 className={clsx("text-2xl font-bold tracking-tight", currentStyle.valueText)}>
          {value}
        </h3>
      </div>

      {/* Footer: Tighter spacing */}
      {allTimeValue && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Trending icon background subtly uses the theme color */}
            <div className={clsx("p-0.5 rounded-full", currentStyle.bg, currentStyle.text)}>
              <TrendingUp className="w-3 h-3" />
            </div>
            <span className="text-[12px] font-medium text-slate-500">
              {allTimeValue} <span className={clsx("font-normal", currentStyle.text)}>Total</span>
            </span>
          </div>

          {allTimeLink && (
            <Link
              href={allTimeLink}
              // Link color is now theme-specific for better contrast
              className={clsx(
                  "flex items-center text-[12px] font-semibold transition-colors",
                  currentStyle.text, // Use the theme's text color
                  `hover:${currentStyle.text}` // Optional: keep hover color the same or use a darker shade
              )}
            >
              View
              <ArrowUpRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export const OverviewStats: React.FC<Props> = ({ data }) => {
  const stats = data.stats;

  return (
    // Reduced Grid Gap to gap-4
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Revenue Month"
        value={stats.todayRevenue}
        allTimeValue={stats.allTimeRevenue}
        allTimeLink="/revenue"
        icon={DollarSign}
        colorTheme="green"
      />

      <StatCard
        title="Active Projects"
        value={stats.activeProjects}
        allTimeValue={stats.allTimeProjects}
        allTimeLink="/projects"
        icon={Folder}
        colorTheme="blue"
      />

      <StatCard
        title="Upcoming Appts"
        value={stats.upcomingAppointments}
        allTimeValue={stats.totalAppointments}
        allTimeLink="/appointments"
        icon={Calendar}
        colorTheme="purple"
      />

      <StatCard
        title="New Clients"
        value={stats.newClientsThisWeek}
        allTimeValue={stats.totalClients}
        allTimeLink="/clients"
        icon={Users}
        colorTheme="yellow"
      />
    </section>
  );
};