'use client';

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { handleNumberChange } from "@/app/utils/handleNumberChange";

interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  status: string;
  service_type: string;
}

interface ServiceModalProps {
  onClose: () => void;
  serviceToEdit?: Service | null;
  onSuccess: (service: Service, isEdit: boolean) => void;
  isViewMode?: boolean; // 🆕 Added prop
}

export default function ServiceFormModal({ 
  onClose, 
  serviceToEdit, 
  onSuccess, 
  isViewMode = false // 🆕 Default to false
}: ServiceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [price, setPrice] = useState<number>(0);
  const [serviceType, setServiceType] = useState("physical");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
   
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // ✅ EFFECT: Populate form if editing OR viewing
  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setDescription(serviceToEdit.description || "");
      setStatus(serviceToEdit.status);
      setPrice(serviceToEdit.price);
      setServiceType(serviceToEdit.service_type || "physical"); 
    }
  }, [serviceToEdit]);

  const isFormFilled = name && description && serviceType && status;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return; // Prevent submit in view mode

    setIsLoading(true);

    const payload = {
      name,
      description,
      price,
      status,
      serviceType,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const url = serviceToEdit 
        ? `${BASE_URL}/professionals/services/update/${serviceToEdit.id}` 
        : `${BASE_URL}/professionals/services/create`;
      
      const method = serviceToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.status === false) {
        if (result.errors) {
          const extracted: { [key: string]: string } = {};
          for (const key in result.errors) {
            if (result.errors[key]?.length > 0)
              extracted[key] = result.errors[key][0];
          }
          setFieldErrors(extracted);
        }
        throw new Error(result.message || "Failed to save service");
      }

      toast.success(result.message || `Service ${serviceToEdit ? 'updated' : 'created'} successfully!`);
      
      const returnedService = result.service || result.data || { ...payload, id: serviceToEdit?.id }; 
      
      onSuccess(returnedService, !!serviceToEdit);
      onClose();
      router.refresh();

    } catch (err) {
      console.error(err);
      toast.error("Error saving service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* 🆕 Dynamic Title */}
      <h2 className="text-xl font-bold text-gray-800">
        {isViewMode 
          ? "Service Details" 
          : serviceToEdit 
            ? "Edit Service" 
            : "Add New Service"
        }
      </h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
        <input
          type="text"
          value={name}
          disabled={isViewMode} // 🆕 Disable input
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Consultation"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={description}
          disabled={isViewMode} // 🆕 Disable input
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your service..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>

      {/* Status + Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            disabled={isViewMode} // 🆕 Disable input
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
          <input
            type="text"
            value={price}
            disabled={isViewMode} // 🆕 Disable input
            onChange={handleNumberChange(setPrice)}
            placeholder="e.g. 25,000"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
          {fieldErrors.price && <p className="text-red-500 text-sm">{fieldErrors.price}</p>}
        </div>
      </div>

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
        <div className="flex items-center gap-6">
          <label className={`flex items-center gap-2 ${isViewMode ? 'opacity-60' : ''}`}>
            <input
              type="radio"
              name="serviceType"
              value="physical"
              disabled={isViewMode} // 🆕 Disable input
              checked={serviceType === "physical"}
              onChange={(e) => setServiceType(e.target.value)}
              className="h-5 w-5 accent-purple-600 disabled:cursor-not-allowed"
            />
            Physical
          </label>
          <label className={`flex items-center gap-2 ${isViewMode ? 'opacity-60' : ''}`}>
            <input
              type="radio"
              name="serviceType"
              value="virtual"
              disabled={isViewMode} // 🆕 Disable input
              checked={serviceType === "virtual"}
              onChange={(e) => setServiceType(e.target.value)}
              className="h-5 w-5 accent-purple-600 disabled:cursor-not-allowed"
            />
            Virtual / Phone Call
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {isViewMode ? "Close" : "Cancel"}
        </button>
        
        {/* 🆕 Hide Submit Button in View Mode */}
        {!isViewMode && (
          <button
            type="submit"
            disabled={!isFormFilled || isLoading}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : serviceToEdit ? "Update Service" : "Save Service"}
          </button>
        )}
      </div>
    </form>
  );
}