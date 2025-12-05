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
