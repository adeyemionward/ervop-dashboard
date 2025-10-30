'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";



export default function CreateVendor() {
  const handleGoBack = useGoBack();
  const router = useRouter();

  // individual states (no formData object)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
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
        address,
        bank_name: bankName,
        account_number: accountNumber,
      };

      const response = await fetch(`${BASE_URL}/professionals/vendors/create/`, {
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
        throw new Error(result.message || "Failed to create vendor.");
      }

      toast.success(result.message || "Vendor created successfully!");
      router.push("/contacts/vendors");

      // reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
      setAccountNumber("");
      setBankName("");
    } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
      console.error("Vendor creation failed:", error);
    } else {
      toast.error("Something went wrong. Please try again.");
      console.error("Vendor creation failed:", error);
    }
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
          title="Add Vendor"
          description="Add a business supplier or biller to manage, services, and payments."

        />

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
            {isPageLoading ? (
          <p className="text-lg text-gray-600 animate-pulse">Loading form...</p>
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

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-xl font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <input
                type="text"
                id="company"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Chioma's Designs Ltd."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bank_name" className="block text-xl font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bank_name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Access Bank"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.bank_name && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.bank_name}</p>
                )}
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-xl font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                   value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0123456789"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {fieldErrors.account_number && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.account_number}</p>
                )}
              </div>
            </div>

            

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg shadow hover:bg-purple-700 focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Vendor"}
            </button>
          </form>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
