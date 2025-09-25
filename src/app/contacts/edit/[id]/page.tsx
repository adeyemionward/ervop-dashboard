'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EditContact() {
  const handleGoBack = useGoBack();
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id; // /contacts/[id]/edit

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  // form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // ui state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // fetch existing contact
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/professionals/contacts/show/${contactId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();

        if (result.status && result.client) {
          setFirstName(result.client.firstname || "");
          setLastName(result.client.lastname || "");
          setEmail(result.client.email || "");
          setPhone(result.client.phone || "");
          setCompany(result.client.company || "");
          setTags(result.client.tags ? result.client.tags.split(",").map((t: string) => t.trim()) : []);
        } else {
          toast.error("Failed to load contact");
        }
      } catch (err) {
        console.error("Failed to fetch contact:", err);
      } finally {
        setLoading(false);
      }
    };

    if (contactId) fetchContact();
  }, [contactId]);

  // tags handling
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const payload = {
        firstname: firstName,
        lastname: lastName,
        email,
        phone,
        company,
        tags: tags.join(", "),
      };

      const res = await fetch(`${BASE_URL}/professionals/contacts/update/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.status === false) {
        if (result.errors) {
          const extractedErrors: { [key: string]: string } = {};
          for (const key in result.errors) {
            if (result.errors[key]?.length > 0) {
              extractedErrors[key] = result.errors[key][0];
            }
          }
          setFieldErrors(extractedErrors);
        }
        throw new Error(result.message || "Failed to update contact.");
      }

      toast.success(result.message || "Contact updated successfully!");
      router.push("/contacts");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

//   if (loading) return <div className="p-8 text-center">Loading contact...</div>;

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Edit Contact"
          description="Update client or customer details."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm">
             {loading ? (
          <p className="text-gray-500 text-lg">Loading contact...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xl font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                />
                {fieldErrors.firstname && <p className="text-red-500 text-sm">{fieldErrors.firstname}</p>}
              </div>
              <div>
                <label className="block text-xl font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                />
                {fieldErrors.lastname && <p className="text-red-500 text-sm">{fieldErrors.lastname}</p>}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xl font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                />
                {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xl font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                />
                {fieldErrors.phone && <p className="text-red-500 text-sm">{fieldErrors.phone}</p>}
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xl font-medium mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xl font-medium mb-1">Tags</label>
              <div className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2">
                {tags.map((tag, i) => (
                  <span key={i} className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2">✕</button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type and press Enter..."
                  className="flex-1 border-none outline-none px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
