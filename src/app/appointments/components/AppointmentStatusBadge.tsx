import { FC } from "react";
import clsx from "clsx";

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Converted' | 'Cancelled' | 'Inprogress';

export const AppointmentStatusBadge: FC<{ status: AppointmentStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses: Record<AppointmentStatus, string> = {
        'Upcoming': "bg-purple-100 text-purple-800",
        'Completed': "bg-green-100 text-green-800",
        'Converted': "bg-purple-100 text-purple-800",
        'Cancelled': "bg-red-100 text-red-800",
        'Inprogress': "bg-yellow-100 text-yellow-800",
    };
    return (
        <span className={clsx(baseClasses, statusClasses[status] || 'bg-gray-100 text-gray-800')}>
            {status}
        </span>
    );
};
