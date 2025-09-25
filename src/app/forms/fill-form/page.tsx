"use client";

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CreateAppointment() {
  const handleGoBack = useGoBack();
  const searchParams = useSearchParams();

  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  const templateId = searchParams.get("templateId");
  const token = localStorage.getItem('token'); // 🔹 If you decide to use it again later

  const [client, setClient] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{ [key: number]: any }>({});

 const router = useRouter();
  useEffect(() => {
  if (!token) return ;

  fetch(`http://127.0.0.1:8000/api/v1/professionals/forms/show/${templateId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      const text = await res.text(); // get raw text
      console.log("Raw response:", text);

      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }

      return JSON.parse(text); // try parsing JSON manually
    })
    .then((data) => {
      console.log("Form data:", data);
      setForm(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching form:", err);
      setLoading(false);
    });
}, [token]);



  const handleChange = (fieldId: number, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;


    setSubmitting(true); // disable button and show loading

    // Transform formData into answers array
    const answers = Object.entries(formData).map(([fieldId, value]) => ({
        form_field_id: Number(fieldId),
        value,
    }));

    const payload = {
        form_id: templateId,
        project_id: projectId,   // assuming you got this from query or props
        contact_id: clientId,    // assuming you got this from query or props
        action: "fill_on_behalf",
        answers,
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/professionals/forms/submitForm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        });

        const result = await response.json()

        if (!response.ok || result.status === false) {
            throw new Error("Failed to submit form");
        }else{
            
            console.log("Form submitted:", result);
            toast.success(result.message || 'Form created successfully!');
            // Optionally redirect or reset form
            router.push('/forms');
            
        }

    } catch (error: any) {
        console.error('Registration failed:', error);
        toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
        setSubmitting(false); // re-enable button
    }
}


  // Fetch client details
 useEffect(() => {
  if (clientId && token) {
    fetch(`http://127.0.0.1:8000/api/v1/professionals/contacts/show/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Client API response:", data); // ✅ log the actual API payload
        setClient(data.client); // adjust depending on backend shape
      })
      .catch((err) => console.error("Client fetch error:", err));
  }
}, [clientId, token]);


  // Fetch project details
  useEffect(() => {
    if (projectId && token) {
      fetch(`http://127.0.0.1:8000/api/v1/professionals/projects/show/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setProject(data.project))
        .catch((err) => console.error("Project fetch error:", err));
    }
  }, [projectId, token]);

//  if (!client || !project) return <p className="p-6">Loading...</p>;

  return (
    <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto">
            {/* Page Header */}
            <HeaderTitleCard
                onGoBack={handleGoBack}
                title="Fill a Form"
                description="Add files to your business library or a specific client folder."
            />

            {/* Form Container */}
            <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
            
                {!client || !project ? (
                // ⏳ Centered Loading
                <div className="flex items-center justify-center min-h-[200px]">
                    <p className="text-gray-500 text-lg font-medium">Loading...</p>
                </div>
                ) : (
                    
                <form className="space-y-8" onSubmit={handleSubmit}>
                      {/* Client Info */}
                      <div>
                        <h2 className="text-2xl font-bold ">{form?.title}</h2>
                        <p className=" text-gray-500">{project?.title}</p>
                      </div>
                    <div>
                      
                      
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <input
                        type="text"
                        value={`${client.firstname} ${client.lastname}`}
                        className="w-full border p-2 rounded-lg text-gray-300"
                        disabled
                    />
                    </div>

                    {/* Project Info */}
                    {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Project</label>
                    <input
                        type="text"
                        value={project.title}
                        className="w-full border p-2 rounded text-gray-800"
                        disabled
                    />
                    </div> */}
                    {form?.fields?.map((field: any) => (
                    <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500"> *</span>}
                        </label>

                        {/* Render field by type */}
                        {(field.type === "text" || field.type === "tel" || field.type === "number" || field.type === "email") && (
                        <input
                            type="text"
                            placeholder={field.placeholder || ""}
                            required={field.required}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                        )}

                        {field.type === "dropdown" && (
                        <select
                            required={field.required}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={formData[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            {field.options?.map((opt: string, idx: number) => (
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
                            required={field.required}
                            checked={!!formData[field.id]}
                            onChange={(e) => handleChange(field.id, e.target.checked ? "1" : "0")}
                            />
                            <span>{field.label}</span>
                        </div>
                        )}

                        {/* Date */}
                        {field.type === "date" && (
                        <input
                            type="date"
                            required={field.required}
                            value={formData[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                        )}

                        {/* Time */}
                        {field.type === "time" && (
                        <input
                            type="time"
                            required={field.required}
                            value={formData[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                        )}

                        {/* Radio */}
                        {field.type === "radio" && field.options?.map((option: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                            type="radio"
                            name={`field-${field.id}`}
                            required={field.required}
                            value={option}
                            checked={formData[field.id] === option}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                            <span>{option}</span>
                        </div>
                        ))}

                        {/* Textarea */}
                        {field.type === "textarea" && (
                        <textarea
                            placeholder={field.placeholder || ""}
                            required={field.required}
                            value={formData[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                        )}
                    </div>
                    ))}

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full p-3 rounded-lg font-semibold 
                        ${submitting 
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                            : "bg-purple-600 text-white hover:bg-purple-700"}
                        `}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
                
                )}
            </div>
        </div>

    </DashboardLayout>
  );
  }

