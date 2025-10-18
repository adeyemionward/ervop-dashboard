import React, { useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AppointmentStatusModalProps {
  isOpen: boolean;
  currentStatus: string;
  appointmentId: number;
  onClose: () => void;
  onStatusUpdated: (newStatus: string) => void;
}

const statuses = ["Upcoming", "Inprogress", "Completed", "Converted", "Cancelled"];

const AppointmentStatusModal: React.FC<AppointmentStatusModalProps> = ({
  isOpen,
  currentStatus,
  appointmentId,
  onClose,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const payload = { status: selectedStatus };

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/professionals/appointments/updateStatus/${appointmentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      onStatusUpdated(selectedStatus);
      toast.success("Status updated successfully 🎉");
      onClose();
    } catch (error: unknown) {

      if (error instanceof Error) {
        toast.error(error.message || "Failed to update status ❌");
      } else {
        toast.error("Failed to update status ❌");
      }
      
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Update Appointment Status
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a new status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={clsx(
                "w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
                {
                  "bg-gray-100 border-gray-300": !isUpdating,
                  "bg-gray-300 border-gray-400 cursor-not-allowed": isUpdating,
                }
              )}
              disabled={isUpdating}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUpdating}
            className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-300"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Updating...
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatusModal;
