import React from "react";

interface DeleteConfirmModalProps {
 isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  deleting: boolean; // 👈 add this
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  deleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 transition-opacity  z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">
         {message}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className={`px-4 py-2 rounded-md text-white cursor-pointer ${
              deleting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
