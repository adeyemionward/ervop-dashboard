'use client';

// import config from "@/config/env";
import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import { useState, useMemo, useEffect, useCallback } from "react"; 
import HeaderTitleCard from "@/components/HeaderTitleCard";
import Modal from "@/components/Modal";
// Make sure this import path points to your updated Modal component
import CreateServiceModal from "@/components/CreateServiceModal"; 
import { useGoBack } from "@/hooks/useGoBack";
import DataTable from "@/components/DataTable";
import { Eye, Pencil, Trash2 } from "lucide-react";

// --- Types ---
interface Service {
    id: number;
    name: string;
    description?: string;
    service_type: string;
    duration?: number;
    price: number;
    status: string; // Changed to string to match your Modal
}


// --- Badge Component ---
const ServiceStatusBadge = ({ status }: { status: string }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    const isActive = status.toLowerCase() === 'active';
    return (
        <span className={`${baseClasses} ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status}
        </span>
    );
};

// --- Main Page Component ---
export default function ServicesPage() {
    

    // --- 1. STATE MANAGEMENT ---
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceStatusFilter, setServiceStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // ✅ FIXED: Added these missing state variables
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [viewingService, setViewingService] = useState<Service | null>(null);

    // Delete States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
 
    const handleGoBack = useGoBack();
    
//   const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';
    console.log("ENV CHECK - BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);
    // console.log("USER TOKEN:", userToken);
    
    // --- 2. DATA FETCHING ---
    // We manually fetch here to have better control over the 'services' state
   const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
        const userToken = localStorage.getItem('token'); // safe: runs in browser
        if (!userToken) throw new Error("No token");

        const res = await fetch(`${BASE_URL}/professionals/services/list`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const result = await res.json();
        if (result.status) setServices(result.services);
        else setError("Failed to load services");
    } catch (err) {
        console.error(err);
        setError("An error occurred");
    } finally {
        setLoading(false);
    }
}, []); 

useEffect(() => {
    fetchServices(); // runs only on client
}, [fetchServices]);


    // --- 3. HANDLERS ---

    // Open "Add New" Modal
    const openAddModal = () => {
        setEditingService(null);
        setViewingService(null);
        setIsModalOpen(true);
    };

    // Open "Edit" Modal
    const openEditModal = (service: Service) => {
        setEditingService(service);
        setViewingService(null);
        setIsModalOpen(true);
    };

    // Open "View" Modal
    const openViewModal = (service: Service) => {
        setViewingService(service);
        setEditingService(null);
        setIsModalOpen(true);
    };

    // Handle updates from the Modal (Success Callback)
    const handleSaveSuccess = (savedService: Service, isEdit: boolean) => {
        if (isEdit) {
            setServices(prev => prev.map(s => s.id === savedService.id ? savedService : s));
        } else {
            setServices(prev => [savedService, ...prev]);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!serviceToDelete) return;
        setIsDeleting(true);
    
        try {
            const res = await fetch(
            `${BASE_URL}/professionals/services/delete/${serviceToDelete.id}`,
            {
                method: "DELETE",
                // headers: { Authorization: `Bearer ${userToken}` },
            }
            );
            const result = await res.json();
    
            if (result.status) {
                setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
                setShowDeleteModal(false);
                setServiceToDelete(null);
            } else {
                //console.error(result.message);
            }
        } catch (error) {
            console.error("11Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setServiceStatusFilter('All');
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setServiceStatusFilter(e.target.value as 'All' | 'active' | 'inactive');
    };

    // --- 4. FILTER LOGIC ---
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearchTerm = searchTerm === '' || service.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = serviceStatusFilter === 'All' || service.status.toLowerCase() === serviceStatusFilter.toLowerCase();
            return matchesSearchTerm && matchesStatus;
        });
    }, [services, searchTerm, serviceStatusFilter]);


    // --- 5. RENDER ---
    return (
        <DashboardLayout>
            <HeaderTitleCard
                onGoBack={handleGoBack} 
                title="Services"
                description="Manage the services you offer to clients."
            >
                <div className="flex flex-col md:flex-row gap-2">
                    <button
                        onClick={openAddModal} // ✅ Uses the handler
                        className="btn-primary flex items-center justify-center"
                    >
                        <Icons.plus />
                        <span>Add New Service</span>
                    </button>
                </div>
            </HeaderTitleCard>

            {/* ✅ MODAL LOGIC */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                // Dynamic Title based on state
                title={viewingService ? "Service Details" : editingService ? "Edit Service" : "Add New Service"}
            >
                <CreateServiceModal 
                    onClose={() => setIsModalOpen(false)} 
                    // Pass whichever service is selected (View or Edit)
                    serviceToEdit={editingService || viewingService} 
                    // Set View Mode if viewingService exists
                    isViewMode={!!viewingService} 
                    onSuccess={handleSaveSuccess}
                />
            </Modal>

            {/* Filters */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex items-center gap-4">
                <div className="relative flex-shrink-0 w-64">
                    <input
                        type="text"
                        placeholder="Search by Service Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icons.search className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                
                <select 
                    value={serviceStatusFilter} 
                    onChange={handleStatusChange} 
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-40 flex-shrink-0">
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <div className="flex-grow"></div> 
                <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium flex items-center space-x-1 rounded-lg"
                        >
                            <Icons.refresh className="h-6 w-6" />
                            <span>Refresh</span>
                        </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <DataTable
                        columns={[
                            {
                                label: "Service Name",
                                field: "name",
                                render: (service) => <span className="font-semibold text-gray-900">{service.name}</span>,
                            },
                            {
                                label: "Service Type",
                                field: "service_type",
                            },
                            {
                                label: "Price",
                                field: "price",
                                render: (service) => <span className="font-medium text-gray-600">{service.price}</span>,
                            },
                            {
                                label: "Status",
                                field: "status",
                                render: (service) => <ServiceStatusBadge status={service.status} />,
                            },
                        ]}
                        data={filteredServices}
                        loading={loading}
                        error={error}
                        itemsPerPage={10}
                        actions={(service) => (
                            <>
                                {/* View Button */}
                                <button 
                                    onClick={() => openViewModal(service)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition w-full text-left"
                                >
                                    <Eye className="w-4 h-4 text-gray-500" /> View
                                </button>
                                
                                {/* Edit Button */}
                                <button 
                                    onClick={() => openEditModal(service)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition w-full text-left"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" /> Edit
                                </button>

                                {/* Delete Button */}
                                <button onClick={() => {
                                    setServiceToDelete(service);
                                    setShowDeleteModal(true);
                                }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                                    <Trash2 className="w-4 h-4 text-red-500" /> Delete
                                </button>
                            </>
                        )}
                    />
                </div>
            </div>

            {/* Delete Modal Confirmation */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-bold">{serviceToDelete?.name}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}