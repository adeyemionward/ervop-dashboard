'use client';

import React, { useState, useEffect, DragEvent } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded?: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const canSubmit = files.length > 0 && documentTitle.trim() !== "";

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setDocumentTitle("");
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);

    try {
    const formData = new FormData();
    formData.append("title", documentTitle);
    files.forEach((file) => formData.append("business_docs[]", file));

    // 🔹 Extract ID from URL
    const pathParts = window.location.pathname.split("/"); 
    const pageType = pathParts[1]; // "appointments" or "projects"
    const entityId = pathParts[pathParts.length - 1]; // e.g. 7

    if (pageType === "appointments") {
      formData.append("appointment_id", entityId);
    } else if (pageType === "projects") {
      formData.append("project_id", entityId);
    }

    // 🔹 API call
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(
      "http://127.0.0.1:8000/api/v1/professionals/appointments/uploadDocument",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const result = await res.json();
    if (!res.ok || result.status === false) throw new Error(result.message || "Upload failed");

    toast.success(result.message || "Document uploaded successfully!");
    setFiles([]);
    setDocumentTitle("");
    onClose();
    onFileUploaded?.();
  } catch (err) {
    console.error(err);
    toast.error("Failed to upload file");
  } finally {
    setLoading(false);
  }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md md:max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Upload File</h2>

        {/* Drag & Drop area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-4 transition-colors ${
            isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-white"
          }`}
        >
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="sr-only"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </label>
        </div>

        {/* Preview selected files */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((file, idx) => (
              <div key={idx} className="relative border p-2 rounded text-sm">
                {file.name}
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-0 right-0 text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Document Name */}
        <input
          type="text"
          placeholder="Document Name"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className={`px-4 py-2 rounded-lg text-white ${
              loading || !canSubmit
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
