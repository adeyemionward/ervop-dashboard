"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Folder,
  Plus,
  FileText,
  FileImage,
  Download,
  Trash2,
} from "lucide-react";
import { downloadFile } from "@/app/utils/downloadFile";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { formatDate } from "@/app/utils/formatDate";
import toast from "react-hot-toast";

// ---------- Types ----------
type DocumentFile = {
  id: number;
  user_id: number;
  contact_id: number | null;
  document_id: number;
  file_path: string;
  file_type: string;
  document_title: string;
  created_at: string;
  updated_at: string;
};

type DocumentItem = {
  id: number;
  contact_id: number | null;
  title: string | null;
  document_path: string | null;
  tags: string | null;
  customer_id: number | null;
  customer_firstname: string | null;
  customer_lastname: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  count: number;
  created_at: string;
};

type ApiResponse = {
  status: boolean;
  my_documents: DocumentItem[] | null;
  client_documents: DocumentItem[] | null;
};

type Selected =
  | { scope: "business"; idParam: number }
  | { scope: "client"; idParam: number };

// ---------- Component ----------
export default function DocsManagerPage() {
  const [allDocuments, setAllDocuments] = useState<ApiResponse | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(true);

  const [selected, setSelected] = useState<Selected | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // modal state
  const [fileToDelete, setFileToDelete] = useState<DocumentFile | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';
 
  // Helpers
  const fileNameFromPath = (p: string) =>
    p ? p.split("/").pop() || p : "file";
  const isImage = (t: string) => t?.toLowerCase().startsWith("image/");
  // const isPdf = (t: string) => t?.toLowerCase().includes("pdf");

  // ---------- Fetch Folders ----------
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${BASE_URL}/professionals/documents/list/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error(`Folders HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        setAllDocuments(data);

        // Default select business or first client
        const myDocs = data.my_documents ?? [];
        const clientDocs = data.client_documents ?? [];

        if (myDocs.length > 0) {
          const biz = myDocs[0];
          const nextSelected: Selected = { scope: "business", idParam: biz.id };
          setSelected(nextSelected);
          fetchFiles(nextSelected.idParam);
        } else if (clientDocs.length > 0) {
          const c = clientDocs[0];
          if (c.customer_id != null) {
            const nextSelected: Selected = { scope: "client", idParam: c.customer_id };
            setSelected(nextSelected);
            fetchFiles(nextSelected.idParam);
          }
        }
      } catch (err) {
        console.error("Error fetching folders:", err);
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Fetch Files ----------
  const fetchFiles = async (idParam: number) => {
    try {
      setLoadingFiles(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/professionals/documents/userDocs/${idParam}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error(`Files HTTP ${res.status}`);
      const data = await res.json();
      setFiles(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  // ---------- Delete File ----------
  const handleDelete = async (fileId: number) => {
    setDeletingId(fileId); // ✅ must happen before await
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/professionals/documents/delete/${fileId}`,
        { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Delete failed");
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File deleted successfully");
    } catch (err: unknown) {
    if (err instanceof Error) {
      toast.error(err.message || "An error occurred while deleting the file.");
    } else {
      toast.error("An unexpected error occurred while deleting the file.");
    }
  } finally {
    setDeletingId(null);
    setFileToDelete(null);
  }

  };

  // ---------- Filter Folders ----------
  const filteredDocuments = useMemo(() => {
    const src = allDocuments;
    if (!src) return { my_documents: [], client_documents: [] };

    const term = searchTerm.trim().toLowerCase();
    if (!term) return { my_documents: src.my_documents ?? [], client_documents: src.client_documents ?? [] };

    const filteredMy = (src.my_documents ?? []).filter((d) => {
      const title = d.title ?? "";
      const tags = d.tags ?? "";
      return title.toLowerCase().includes(term) || tags.toLowerCase().includes(term);
    });

    const filteredClients = (src.client_documents ?? []).filter((c) => {
      const first = c.customer_firstname ?? "";
      const last = c.customer_lastname ?? "";
      const email = c.customer_email ?? "";
      const phone = c.customer_phone ?? "";
      return (
        first.toLowerCase().includes(term) ||
        last.toLowerCase().includes(term) ||
        `${first} ${last}`.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term)
      );
    });

    return { my_documents: filteredMy, client_documents: filteredClients };
  }, [allDocuments, searchTerm]);

  // ---------- Panel Title ----------
  const panelTitle = (() => {
    if (!selected) return "Documents";
    if (selected.scope === "business") return "My Business Documents";
    const client = allDocuments?.client_documents?.find(
      (c) => c.customer_id === selected.idParam
    );
    if (!client) return "Client Documents";
    const name =
      client.customer_firstname && client.customer_lastname
        ? `${client.customer_firstname} ${client.customer_lastname}`
        : "Client";
    return `${name}'s Documents`;
  })();

  // ---------- Render ----------
  return (
    <DashboardLayout>
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Document Manager</h2>
          <p className="mt-1 text-gray-500">
            Your secure vault for all business and client documents.
          </p>
        </div>
        <Link href="docs-manager/new" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          <span>Upload Document</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* left: folders */}
        <div className="w-full bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Folders</h3>
            <span className="text-sm text-gray-400">
              {allDocuments?.my_documents?.length ?? 0} Business /{" "}
              {allDocuments?.client_documents?.length ?? 0} Clients
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <i
              data-lucide="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            ></i>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search folders..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {loadingFolders ? (
            <p className="text-gray-500 text-sm">Loading folders...</p>
          ) : (
            <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {/* Business */}
              {(filteredDocuments.my_documents ?? []).map((doc) => {
                const active = selected?.scope === "business" && selected.idParam === doc.id;
                return (
                  <div
                    key={`biz-${doc.id}`}
                    onClick={() => {
                      const nextSelected: Selected = { scope: "business", idParam: doc.id };
                      setSelected(nextSelected);
                      fetchFiles(nextSelected.idParam);
                    }}
                    className={`p-4 rounded-lg cursor-pointer ${
                      active ? "border-2 border-purple-500 bg-purple-50" : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-purple-800">My Business Documents</span>
                      </div>
                      <span className="text-sm font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
                        {doc.count ?? 0} Docs
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Clients */}
              {(filteredDocuments.client_documents ?? []).map((client) => {
                const cid = client.customer_id;
                const active = selected?.scope === "client" && cid != null && selected.idParam === cid;
                return (
                  <div
                    key={`client-${client.id}-${cid ?? Math.random()}`}
                    onClick={() => {
                      if (cid == null) return;
                      const nextSelected: Selected = { scope: "client", idParam: cid };
                      setSelected(nextSelected);
                      fetchFiles(nextSelected.idParam);
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      active ? "border-2 border-purple-500 bg-purple-50" : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        {client.customer_firstname && client.customer_lastname
                          ? `${client.customer_firstname} ${client.customer_lastname}`
                          : "Unnamed Client"}
                      </span>
                      <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {client.count ?? 0} Docs
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Last activity: {formatDate(client.created_at)}
                    </p>
                  </div>
                );
              })}

              {/* If no results after filtering */}
              {(filteredDocuments.my_documents ?? []).length === 0 &&
                (filteredDocuments.client_documents ?? []).length === 0 && (
                  <p className="text-gray-500 text-sm">No folders found.</p>
                )}
            </div>
          )}
        </div>

        {/* right: files */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-6">{panelTitle}</h3>

          {loadingFiles ? (
            <p className="text-gray-500 text-sm">Loading files...</p>
          ) : files.length > 0 ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="bg-gray-200 p-3 rounded-full mr-4">
                      {isImage(file.file_type) ? (
                        <FileImage className="w-6 h-6 text-gray-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <a
                        href={file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {fileNameFromPath(file.file_path)}
                      </a>

                      {file.document_title && (
                        <p className="text-xs text-gray-400">{file.document_title}</p>
                      )}

                      <p className="text-sm text-gray-500">
                        Uploaded: {formatDate(file.created_at)} • {file.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* download */}
                    <button
                      onClick={() => downloadFile(file.file_path)}
                      className="p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
                      aria-label={`Download ${fileNameFromPath(file.file_path)}`}
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>

                    {/* delete */}
                    <button
                      onClick={() => setFileToDelete(file)}
                      disabled={deletingId === file.id}
                      className={`p-2 rounded-md text-red-600 hover:bg-red-50 cursor-pointer ${
                        deletingId === file.id ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No files found.</p>
          )}
        </div>
      </div>

      {/* delete modal */}
      <DeleteConfirmModal
        isOpen={!!fileToDelete}
        onCancel={() => setFileToDelete(null)}
        onConfirm={() => fileToDelete && handleDelete(fileToDelete.id)}
        title="Delete File"
        message={
          fileToDelete
            ? `Are you sure you want to delete "${fileNameFromPath(fileToDelete.file_path)}"?`
            : ""
        }
        deleting={deletingId === fileToDelete?.id}
      />
    </DashboardLayout>
  );
}
