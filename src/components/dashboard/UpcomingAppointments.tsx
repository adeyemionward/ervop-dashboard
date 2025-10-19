import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { UpcomingAppointment } from "@/types/Dashboard";

interface Props {
  appointments: UpcomingAppointment[];
}

export const UpcomingAppointments: React.FC<Props> = ({ appointments }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h3>

    <div className="space-y-4">
      {appointments.map((appt, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg text-center">
            <p className="font-bold text-purple-700">
              {appt.time.split(" ")[0]}
            </p>
            <p className="text-xs text-purple-600">
              {appt.time.split(" ")[1]}
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-800">{appt.service}</p>
            <p className="text-sm text-gray-500">
              with {appt.client} —{" "}
              <span className="font-medium">{appt.date}</span>
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 border-t pt-4">
      <Link
        href="/appointments"
        className="text-sm font-semibold text-blue-600 hover:underline flex items-center"
      >
        View All Appointments
        <ArrowUpRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </div>
);
