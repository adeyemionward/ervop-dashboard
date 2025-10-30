"use client";

import React from "react";
import { X, Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Template, FormField } from "@/types/formTypes";

interface ViewFormModalProps {
  isViewFormModalOpen: boolean;
  closeViewFormModal: () => void;
  templateToView: Template | null;
  isViewingFormLoading: boolean;
}

const ViewFormModal: React.FC<ViewFormModalProps> = ({
  isViewFormModalOpen,
  closeViewFormModal,
  templateToView,
  isViewingFormLoading,
}) => {
  const router = useRouter();

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            rows={3}
            disabled
          />
        );

      case "dropdown":
        return (
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            disabled
          >
            {field.options?.map((opt, i) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 cursor-not-allowed"
              disabled
            />
            <span>{field.label}</span>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2 mt-2">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={String(field.id)}
                  className="h-4 w-4 border-gray-300 text-purple-600 cursor-not-allowed"
                  disabled
                />
                <label className="text-gray-700">{opt}</label>
              </div>
            ))}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            disabled
          />
        );

      case "time":
        return (
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            disabled
          />
        );

      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            disabled
          />
        );
    }
  };

  if (!isViewFormModalOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/40 bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isViewFormModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ${
          isViewFormModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {isViewingFormLoading ? (
          <div className="p-8 text-center">Loading form...</div>
        ) : (
          templateToView && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {templateToView.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Form Preview</p>
                  </div>

                  <button
                    onClick={closeViewFormModal}
                    className="absolute top-6 right-6 p-2 -m-2 rounded-full hover:bg-gray-100 sm:static sm:m-0"
                  >
                    <X />
                  </button>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/forms/submissions?templateId=${templateToView.id}`)
                    }
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 font-medium p-2 rounded-md hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4" />{" "}
                    <span>
                      View Submissions ({templateToView.submissions_count})
                    </span>
                  </button>

                  <button
                    onClick={() => router.push(`/forms/edit/${templateToView.id}`)}
                    className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium p-2 rounded-md"
                  >
                    <Edit />
                    <span>Edit Form</span>
                  </button>
                </div>
              </div>

              <div className="p-8 bg-gray-50 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {templateToView.fields.map((field) => (
                    <div key={field.id}>
                      <label className="font-semibold text-gray-700">
                        {field.type !== "checkbox" && field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      <div className="mt-2">{renderFieldPreview(field)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default ViewFormModal;
