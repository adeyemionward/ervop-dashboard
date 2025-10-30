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
import LoadingScreen from "@/components/LoadingScreen";

export default function DashboardPage() {
    
   const { data, loading } = useDashboardData();



  if (loading)
  return (
    <LoadingScreen text="Preparing your dashboard..." />
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

  // const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <DashboardLayout>
        <header className="mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome Back
      </h1>
      <p className="mt-1 text-gray-500">
        Here’s a snapshot of your workspace today.
      </p>
    </div>

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
  </div>

  {/* ✅ Compact Dashboard Widgets */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

  {/* Revenue Card */}
  <div className="p-4 bg-blue-50 text-blue-700 rounded-xl shadow flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Today's Revenue</p>
        <p className="text-2xl font-bold mt-1">₦184,500</p>
      </div>
      <div className="text-2xl">💰</div>
    </div>
    <p className="text-gray-500 text-xs mt-2">₦2000 Spent</p>
  </div>

  {/* Invoiced Card */}
  <div className="p-4 bg-green-50 text-green-700 rounded-xl shadow flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Today's Invoiced</p>
        <p className="text-2xl font-bold mt-1">₦184,500</p>
      </div>
      <div className="text-2xl">📄</div>
    </div>
    <p className="text-gray-500 text-xs mt-2">Outstanding</p>
  </div>

  {/* Appointments Card */}
  <div className="p-4 bg-purple-50 text-purple-700 rounded-xl shadow flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Upcoming Appointments</p>
        <p className="text-2xl font-bold mt-1">8</p>
      </div>
      <div className="text-2xl">📅</div>
    </div>
    <p className="text-gray-500 text-xs mt-2">2 Upcoming</p>
  </div>

  {/* New Clients Card */}
  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl shadow flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">New Clients (This Week)</p>
        <p className="text-2xl font-bold mt-1">3</p>
      </div>
      <div className="text-2xl">👤</div>
    </div>
    <p className="text-gray-500 text-xs mt-2">142 Total All-Time</p>
  </div>

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
