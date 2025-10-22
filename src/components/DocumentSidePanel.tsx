"use client";

import SideModal from "@/components/SideModal";
import { Send, RefreshCcw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/app/utils/formatDate";

export type DocumentFile = {
  id: number;
  file_path?: string;
  document_title?: string;
  document_type?: string;
  document_status?: string;
  created_at?: string;
  updated_at?: string;
};

type DocumentActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  file?: DocumentFile | null;
  onStatusUpdate?: (id: number, newStatus: string) => Promise<void>;
  onSendReminder?: (id: number) => Promise<void>;
};

export default function DocumentActivityModal({
  file,
  isOpen,
  onClose,
  onStatusUpdate,
  onSendReminder,
}: DocumentActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [reminding, setReminding] = useState(false);

  if (!file) return null;

  const handleUpdate = async (status: string) => {
    if (!onStatusUpdate) return;
    try {
      setLoading(true);
      await onStatusUpdate(file.id, status);
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleReminder = async () => {
    if (!onSendReminder) return;
    try {
      setReminding(true);
      await onSendReminder(file.id);
      toast.success("Reminder sent!");
    } catch {
      toast.error("Failed to send reminder");
    } finally {
      setReminding(false);
    }
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title="Document Activity">
      <div className="space-y-4">
        {/* ✅ Document Title (optional) */}
        {file.document_title && (
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p className="font-semibold text-gray-800">{file.document_title}</p>
          </div>
        )}

        {/* ✅ Document Type (optional) */}
        {file.document_type && (
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {file.document_type}
            </span>
          </div>
        )}

        {/* ✅ Document Status (optional) */}
        {file.document_status && (
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {file.document_status}
            </span>
          </div>
        )}

        {/* ✅ Uploaded Date (optional) */}
        {file.created_at && (
          <div>
            <p className="text-sm text-gray-500">Uploaded</p>
            <p className="text-gray-800">{formatDate(file.created_at)}</p>
          </div>
        )}

        {/* ✅ Update Status */}
        {onStatusUpdate && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              {["Sent", "Viewed", "Accepted", "Needs Revision", "Declined"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdate(s)}
                    disabled={loading}
                    className={`px-3 py-1 text-xs rounded-full border transition ${
                      file.document_status === s
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* ✅ Send Reminder Button (moved here) */}
        {onSendReminder && (
          <div>
            <button
              onClick={handleReminder}
              disabled={reminding}
              className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {reminding ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Reminder
            </button>
          </div>
        )}

        {/* ✅ Activity Log (optional) */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-2">Activity Log</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>📤 Document sent to client</li>
            <li>👁️ Client viewed document</li>
            <li>✅ Client accepted proposal</li>
          </ul>
        </div>
      </div>
    </SideModal>
  );
}
