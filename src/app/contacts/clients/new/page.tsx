'use client';

import React, { useState } from "react";
import clsx from "clsx"; 
import { toast } from "react-hot-toast";

interface CreateClientModalProps {
  onClose: () => void;
  onCreated?: () => void; // ✅ callback to refresh parent list
}

export default function CreateClientModal({ onClose, onCreated }: CreateClientModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8000/api/v1";

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) setTags(prev => [...prev, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No authentication token found.");

      const payload = {
        firstname: firstName,
        lastname: lastName,
        email,
        phone,
        company,
        tags: tags.join(", "),
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
            if (result.errors[key]?.length > 0) extractedErrors[key] = result.errors[key][0];
          }
          setFieldErrors(extractedErrors);
        }
        throw new Error(result.message || "Failed to create contact.");
      }

      toast.success(result.message || "Contact created successfully!");
      
      // ✅ call parent callback to refresh list
      if (onCreated) onCreated();

      // ✅ close modal
      onClose();

      // reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setTags([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. John"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.firstname && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.firstname}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Doe"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.lastname && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.lastname}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. johndoe@email.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +234 801 234 5678"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          {fieldErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
          )}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Chioma’s Designs Ltd."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
          {tags.map((tag) => (
            <span
              key={tag}
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
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type and press Enter..."
            className="flex-1 border-none focus:ring-0 outline-none px-2 py-1 text-sm"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">Press Enter or comma to add a tag.</p>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition",
            { "opacity-50 cursor-not-allowed": isSubmitting }
          )}
        >
          {isSubmitting ? "Saving..." : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
