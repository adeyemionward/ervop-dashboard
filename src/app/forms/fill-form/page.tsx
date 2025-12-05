"use client";

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Contact } from "@/hooks/useClientData";

interface Project {
  title: string;
}

interface FormField {
  id: number;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormType {
  title: string;
  fields: FormField[];
}

export const dynamic = "force-dynamic"; // prevents SSR/build errors

export default function FillForm() {
  const handleGoBack = useGoBack();
  //  if (typeof window !== 'undefined') {
            // const searchParams = new URLSearchParams(window.location.search);
           
        // }

  // const searchParams = useSearchParams();
  const router = useRouter();

  const [params, setParams] = useState<{
    clientId: string | null;
    projectId: string | null;
    templateId: string | null;
  }>({ clientId: null, projectId: null, templateId: null });

  const [token, setToken] = useState<string | null>(null);
  const [client, setClient] = useState<Contact | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<FormType | null>(null);
  const [formData, setFormData] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get params and token on client
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      clientId: searchParams.get("clientId"),
      projectId: searchParams.get("projectId"),
      templateId: searchParams.get("templateId"),
    });
    setToken(localStorage.getItem("token"));
  }, []);

  // Fetch form template
  useEffect(() => {
    if (!token || !params.templateId) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/professionals/forms/show/${params.templateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("Error fetching form:", err);
        toast.error("Failed to load form");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [token, params.templateId]);

  // Fetch client
  useEffect(() => {
    if (!token || !params.clientId) return;

    const fetchClient = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/professionals/contacts/show/${params.clientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClient(data.client || null);
      } catch (err) {
        console.error("Client fetch error:", err);
      }
    };

    fetchClient();
  }, [token, params.clientId]);

  // Fetch project
  useEffect(() => {
    if (!token || !params.projectId) return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/professionals/projects/show/${params.projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProject(data.project || null);
      } catch (err) {
        console.error("Project fetch error:", err);
      }
    };

    fetchProject();
  }, [token, params.projectId]);

  const handleChange = (fieldId: number, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSubmitting(true);

    const answers = Object.entries(formData).map(([fieldId, value]) => ({
      form_field_id: Number(fieldId),
      value,
    }));

    const payload = {
      form_id: params.templateId,
      project_id: params.projectId,
      contact_id: params.clientId,
      action: "fill_on_behalf",
      answers,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/professionals/forms/submitForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.status === false) throw new Error(result.message || "Submission failed");

      toast.success(result.message || "Form submitted successfully!");
      router.push("/forms");
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 text-lg font-medium">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Fill a Form"
          description="Add files to your business library or a specific client folder."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-2xl font-bold">{form?.title}</h2>
              <p className="text-gray-500">{project?.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <input
                type="text"
                value={client ? `${client.firstname} ${client.lastname}` : ""}
                className="w-full border p-2 rounded-lg text-gray-300"
                disabled
              />
            </div>

            {form?.fields?.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>

                {(field.type === "text" ||
                  field.type === "tel" ||
                  field.type === "number" ||
                  field.type === "email") && (
                  <input
                    type="text"
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                )}

                {field.type === "dropdown" && (
                  <select
                    required={field.required}
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">-- Select --</option>
                    {field.options?.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.checked ? "1" : "0")}
                      className="mr-2"
                    />
                    <span>{field.label}</span>
                  </div>
                )}

                {field.type === "radio" &&
                  field.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`field-${field.id}`}
                        value={opt}
                        checked={formData[field.id] === opt}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                      />
                      <span>{opt}</span>
                    </div>
                  ))}

                {field.type === "date" && (
                  <input
                    type="date"
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required={field.required}
                  />
                )}

                {field.type === "time" && (
                  <input
                    type="time"
                    value={formData[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full p-3 rounded-lg font-semibold ${
                submitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
