import React, { FC } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  mainBg?: string;    // Optional for background of the card
  iconBg?: string;    // Optional for background of the icon circle
  mainText?: string;  // Optional for main text color
  iconText?: string;  // Optional for icon color
  valueTextSize?: string; // ✅ New optional prop for font size of the main value
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  mainBg = "bg-white",
  iconBg = "bg-blue-100",
  mainText = "text-gray-900",
  iconText = "text-blue-600",
  valueTextSize = "text-2xl", // ✅ Default font size
}) => {
  return (
    <div className={`${mainBg} p-6 rounded-xl shadow-sm border border-gray-200`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`${valueTextSize} font-bold ${mainText}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
