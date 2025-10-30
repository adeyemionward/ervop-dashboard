'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EditContractor() {
  const handleGoBack = useGoBack();
  const router = useRouter();
  const params = useParams();
  const contractorId = params?.id;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

  // Form states
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [status, setStatus] = useState("active");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch contractor details
  useEffect(() => {
    const fetchContractor = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/professionals/contractors/show/${contractorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();

        if (result.status && result.contractor) {
          const c = result.contractor;
          setFirstname(c.firstname || "");
          setLastname(c.lastname || "");
          setEmail(c.email || "");
          setPhone(c.phone || "");
          setCompany(c.company || "");
          setAddress(c.address || "");
          setBankName(c.bank_name || "");
          setAccountNumber(c.account_number || "");
          setStatus(c.status || "active");
        } else {
          toast.error(result.message || "Failed to load contractor details");
        }
      } catch (err) {
        console.error("Failed to fetch contractor:", err);
        toast.error("Error fetching contractor details");
      } finally {
        setLoading(false);
      }
    };

    if (contractorId) fetchContractor();
  }, [BASE_URL, contractorId]);

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const payload = {
        firstname,
        lastname,
        email,
        phone,
        company,
        address,
        bank_name: bankName,
        account_number: accountNumber,
        status,
      };

      const res = await fetch(`${BASE_URL}/professionals/contractors/update/${contractorId}`, {
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
        throw new Error(result.message || "Failed to update contractor.");
      }

      toast.success(result.message || "Contractor updated successfully!");
      router.push("/contacts/contractors");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
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
          title="Edit Contractor"
          description="Update contractor details and account information."
        />

        <div className="bg-white p-8 rounded-xl shadow-sm">
          {loading ? (
            <p className="text-gray-500 text-lg">Loading contractor details...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {fieldErrors.firstname && <p className="text-red-500 text-sm">{fieldErrors.firstname}</p>}
                </div>
                <div>
                  <label className="block text-xl font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xl font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {fieldErrors.phone && <p className="text-red-500 text-sm">{fieldErrors.phone}</p>}
                </div>
              </div>

              {/* Company + Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xl font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Bank Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xl font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xl font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg text-white ${
                  isSubmitting
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
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
