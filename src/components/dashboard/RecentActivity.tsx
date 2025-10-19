import React from "react";
import clsx from "clsx";

interface Activity {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  iconBgColor: string;
  iconColor: string;
}

interface Props {
  activities: Activity[];
}

export const RecentActivity: React.FC<Props> = ({ activities }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
      <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
        <option>Today</option>
        <option>This Week</option>
        <option>This Month</option>
      </select>
    </div>
    <div className="space-y-6">
      {activities.map((act, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className={clsx("p-3 rounded-full", act.iconBgColor)}>
            <act.icon className={clsx("h-5 w-5", act.iconColor)} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">{act.title}</p>
            <p className="text-sm text-gray-500">{act.description}</p>
          </div>
          <p className="text-sm text-gray-400">{act.time}</p>
        </div>
      ))}
    </div>
  </div>
);
