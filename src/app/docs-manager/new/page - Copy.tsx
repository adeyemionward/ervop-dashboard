'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { useClientData } from "@/hooks/useClientData";
import {  useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import ClientSelector from "@/components/ClientSelector";



export default function CreateAppointment() {
  const handleGoBack = useGoBack();

  // const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients, projects, appointments using custom hook
  const { contacts } = useClientData(selectedClient);
 const [selectedType, setSelectedType] = useState("");

  const [showClientDocuments, setShowClientDocuments] = useState(true);


  const canSubmit = files.length > 0 && selectedType && documentTitle.trim() !== "";

 
  //DOCUMENT TYPES
  const types = [
    "Proposal",
    "Contract",
    "NDA",
    "General",
  ];

  // Handle multiple file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';
 

  // Submit document
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("project_id", selectedProject || "");
    formData.append("type", selectedType || "");
    formData.append("contact_id", selectedClient || "");
    formData.append("appointment_id", selectedAppointment || "");
    formData.append("title", documentTitle);
    formData.append("tags", tags.join(", "));
    files.forEach((file) => formData.append("business_docs[]", file));

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("User not authenticated");

      const res = await fetch(
        `${BASE_URL}/professionals/documents/create/`,
        { method: "POST", headers: { Authorization: `Bearer ${userToken}` }, body: formData }
      );
      const result = await res.json();

      if (!res.ok || result.status === false) {
        throw new Error(result.message || "Failed to create document");
      }

      toast.success(result.message || "Document uploaded successfully!");

      // Reset form
      setFiles([]);
      setDocumentTitle("");
      setTags([]);
      setSelectedClient("");
      setSelectedProject("");
      setSelectedAppointment("");
    } 
    catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong");
        console.error(error);
      } else {
        toast.error("Something went wrong");
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Add New Document"
          description="Add files to your business library or a specific client folder."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
           <form onSubmit={handleSubmit} className="space-y-8">
              {/* Upload Section */}
              <div>
                <label htmlFor="file-upload" className="block text-xl font-medium text-gray-700 mb-2">
                  Upload Documents
                </label>
                <div className="mt-1 flex flex-col items-center justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-lg transition-colors cursor-pointer hover:bg-gray-100 hover:border-purple-500">
                  <input id="file-upload" type="file" multiple onChange={handleFileChange} className="sr-only" />
                  <label htmlFor="file-upload" className="cursor-pointer text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>

                {/* Preview selected files */}
                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {files.map((file, idx) => {
                      const isImage = file.type.startsWith("image/");
                      const fileURL = URL.createObjectURL(file);

                      return (
                        <div key={idx} className="relative w-3/5 h-24 flex items-center justify-center border rounded-md text-xs text-gray-600 truncate p-1">
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-red-100"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>

                          {isImage ? (
                            <img
                              src={fileURL}
                              alt={file.name}
                              className="max-h-full max-w-full object-cover rounded"
                            />
                          ) : (
                            <span className="truncate">{file.name}</span>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label htmlFor="title" className="block text-md font-medium text-gray-700 mb-1">
                    Document Name
                  </label>
                  <input
                    type="text"
                    id="title"
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    value={documentTitle}
                    placeholder="e.g., Standard Service Agreement.pdf"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {/* flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 */}

                <div>
                  <label htmlFor="title" className="block text-md font-medium text-gray-700 mb-1">
                     Document Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border w-full border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" disabled>
                      Select Type
                    </option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Document Type Selection */}
              {selectedType === "General" && (
              <div>
                <label
                  htmlFor="title"
                  className="block text-md font-medium text-gray-700 mb-1"
                >
                  Select Document Destination
                </label>

                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="documentType"
                      checked={showClientDocuments}
                      onChange={() => setShowClientDocuments(true)}
                      className="px-4 py-3"
                    />
                    Client Document
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="documentType"
                      checked={!showClientDocuments}
                      onChange={() => setShowClientDocuments(false)}
                      className="h-4 w-4"
                    />
                    My Business Document
                  </label>
                </div>
              </div>
            )}

            {/* Show ClientSelector only if Client Document is selected */}
            {showClientDocuments && (
              <div className="mt-4">
                <ClientSelector
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                  selectedAppointment={selectedAppointment}
                  setSelectedAppointment={setSelectedAppointment}
                  contacts={contacts}
                />

                {/* Validation message if client not selected */}
                {!selectedClient && (
                  <p className="text-red-500 text-sm mt-2">
                    Please select a client before proceeding.
                  </p>
                )}
              </div>
            )}


            {/* Optional: Show placeholder if My Business Document selected */}
            {!showClientDocuments && (
            <p className="text-gray-600 mb-4">NOTE: Files will be uploaded to My Business Document</p>
            )}

             

              {/* Document Name */}
              

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button type="button" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !canSubmit} className="bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-6 rounded-lg flex items-center transition-colors disabled:opacity-50">
                  {isSubmitting ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
