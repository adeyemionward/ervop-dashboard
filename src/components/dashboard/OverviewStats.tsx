import React from "react";
import { DollarSign, Folder, Users, Calendar, ArrowUpRight } from "lucide-react";
import { DashboardData } from "@/types/Dashboard";
import Link from "next/link";
import clsx from "clsx";

interface Props {
  data: DashboardData;
}

interface StatCardProps {
  title: string;
  small?: string;
  value: string | number; // ✅ allow both string and number
  allTimeValue?: string | number; // ✅ allow both string and number
  allTimeLink?: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  small,
  value,
  allTimeValue,
  allTimeLink,
  icon: Icon,
  iconBgColor,
  iconColor,
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center space-x-4">
    <div className={clsx("p-3 rounded-full", iconBgColor)}>
      <Icon className={clsx("h-6 w-6", iconColor)} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">
        {title} {small && <small>{small}</small>}
      </p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {allTimeValue && (
        allTimeLink ? (
          <Link
            href={allTimeLink}
            className="text-xs text-gray-500 mt-1 flex items-center hover:text-blue-600 group transition-colors"
          >
            <span>{allTimeValue} All-Time</span>
            <ArrowUpRight className="w-3 h-3 ml-1 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <p className="text-xs text-gray-500 mt-1">{allTimeValue} All-Time</p>
        )
      )}
    </div>
  </div>
);

export const OverviewStats: React.FC<Props> = ({ data }) => {
  const stats = data.stats;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Today's Revenue"
        value={stats.todayRevenue}
        allTimeValue={stats.allTimeRevenue}
        allTimeLink="/revenue"
        icon={DollarSign}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />

      <StatCard
        title="Today's Projects"
        value={stats.todayProjects}
        allTimeValue={`${stats.allTimeProjects} Total`}
        allTimeLink="/projects"
        icon={Folder}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Upcoming Appointments"
        value={stats.upcomingAppointments}
        allTimeValue={`${stats.totalAppointments} Total`}
        allTimeLink="/appointments"
        icon={Calendar}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
      />

      <StatCard
        title="New Clients (This Week)"
        value={stats.newClientsThisWeek}
        allTimeValue={`${stats.totalClients} Total`}
        allTimeLink="/clients"
        icon={Users}
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
      />
    </section>
  );
};
