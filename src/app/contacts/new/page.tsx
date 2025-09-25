'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";



export default function CreateContact() {
  const handleGoBack = useGoBack();
  const router = useRouter();

  // individual states (no formData object)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  // page loading state
  const [isPageLoading, setIsPageLoading] = useState(true);
  // simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800); // you can shorten or remove if you plan to fetch data here
    return () => clearTimeout(timer);
  }, []);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const payload = {
        firstname: firstName,
        lastname: lastName,
        email,
        phone,
        company,
        tags: tags.join(", "), // convert array to comma-separated string
      };

      const response = await fetch(`${BASE_URL}/professionals/contacts/create/`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.status === false) {
        if (result.errors) {
          const extractedErrors: { [key: string]: string } = {};
          for (const key in result.errors) {
            if (result.errors[key]?.length > 0) {
              extractedErrors[key] = result.errors[key][0];
            }
          }
          setFieldErrors(extractedErrors);
        }
        throw new Error(result.message || "Failed to create contact.");
      }

      toast.success(result.message || "Contact created successfully!");
      router.push("/contacts");

      // reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setTags([]);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Contact creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Page Header */}
        <HeaderTitleCard
          onGoBack={handleGoBack}
          title="Add Contact"
          description="Add a new client or customer to your unified contact hub."
        />

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
            {isPageLoading ? (
          <p className="text-lg text-gray-600 animate-pulse">Loading contact form...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-xl font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.firstname && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.firstname}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xl font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.lastname && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.lastname}</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-xl font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. johndoe@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-xl font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-xl font-medium text-gray-700 mb-1">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Chioma's Designs Ltd."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Tags with Chips */}
            <div>
              <label htmlFor="tags" className="block text-xl font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                <input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type and press Enter..."
                  className="flex-1 border-none focus:ring-0 outline-none px-2 py-1 text-sm"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Press Enter or comma to add a tag.</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg shadow hover:bg-purple-700 focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Contact"}
            </button>
          </form>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
