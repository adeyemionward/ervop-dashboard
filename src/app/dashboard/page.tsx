"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/app/actions/mock/DashboardData";

import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { QuickActions } from "@/components/dashboard/QuickActions";


import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { Calendar, DollarSign, FolderKanban } from "lucide-react";

export default function DashboardPage() {
    
   const { data, loading } = useDashboardData();



  if (loading)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex flex-col items-center space-y-6">
        {/* Morphing / pulsing gradient loader */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-ping"></div>
        </div>

        {/* Loading text */}
        <p className="text-gray-700 font-semibold text-lg animate-pulse">
          Preparing your dashboard...
        </p>
      </div>
    </div>
  );


  const activities = [
    {
      icon: FolderKanban,
      title: "New Project Created",
      description: "Website Redesign for Chioma Nwosu",
      time: "10:45 AM",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Calendar,
      title: "New Appointment Scheduled",
      description: "Strategy session with Tunde Adebayo",
      time: "09:30 AM",
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: DollarSign,
      title: "Payment Received",
      description: "Invoice #INV-056 for ₦150,000",
      time: "08:15 AM",
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <DashboardLayout>
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back, {user.firstname}</h1>
                <p className="mt-1 text-gray-500">
                Here’s a snapshot of your workspace today.
                </p>
            </div>

            {/* Colorful Filter Dropdown */}
            <div className="mt-4 md:mt-0">
                <select
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer transition-all"
                defaultValue="thisMonth"
                >
                <option value="thisMonth" className="text-gray-800">This Month</option>
                <option value="lastMonth" className="text-gray-800">Last Month</option>
                <option value="thisWeek" className="text-gray-800">This Week</option>
                <option value="lastWeek" className="text-gray-800">Last Week</option>
                <option value="today" className="text-gray-800">Today</option>
                </select>
            </div>
        </header>

      {/* Overview Section */}
      {data && <OverviewStats data={data} />}

      {/* Top Section: Quick Actions, Appointments, Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <div className="lg:col-span-8">
        <RecentActivity activities={activities} />
        </div>

        {/* Quick Actions spans 4 columns */}
        <div className="lg:col-span-4">
        <QuickActions />
        </div>
        
      </section>

        {/* Bottom Section: Recent Projects & Appointments */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <RecentProjects projects={data?.recentProjects || []} />
            <UpcomingAppointments appointments={data?.upcomingAppointments || []} />
        </section>
    </DashboardLayout>
  );
}
