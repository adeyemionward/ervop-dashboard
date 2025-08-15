'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import { useState, useMemo } from "react";
import Link from "next/link";
import DataStateWrapper from "@/components/DataStateWrapper";
import { useFetchData } from '@/hooks/useFetchData';
import { LoaderCircle } from 'lucide-react';


const ServiceStatusBadge = ({ status }: { status: 'active' | 'inactive'}) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    const statusClasses = {
        'active': "bg-green-100 text-green-800",
        'inactive': "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};
 const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

// --- Dummy Data ---
const allServices = [
    { id: 1, serviceName: 'First Enquiries', duration: '4 Hours', serviceStatus: 'Active', price: '5000' },
    { id: 2, serviceName: 'First Enquiries', duration: '4 Hours', serviceStatus: 'Inactive', price: '7000' },
    { id: 3, serviceName: 'First Enquiries', duration: '4 Hours', serviceStatus: 'Inactive', price: '2600' },
    { id: 4, serviceName: 'First Enquiries', duration: '4 Hours', serviceStatus: 'Active', price: '10000' },
    { id: 6, serviceName: 'First Enquiries', duration: '4 Hours', serviceStatus: 'Active', price: '2987' },
];



interface Service {
    id: number;
    name: string;
    service_type: string;
    duration: number;
    price: number;
    status: 'active' | 'inactive';
}
interface ServicesResponse {
    status: boolean;
    services: Service[]; // The array of services is inside this property
}

// --- Main Page Component ---
export default function ServicesPage() {
    // const [services, setServices] = useState<Service[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

     // State for filtering and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceStatusFilter, setServiceStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
    const [currentPage, setCurrentPage] = useState(1);

    const handleClearFilters = () => {
        setSearchTerm('');
        setServiceStatusFilter('All');
        setCurrentPage(1);
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

     // Get the services
    const { data, loading, error } = useFetchData<ServicesResponse>('/professionals/services/list');
    // Correctly and safely access the 'services' array
    const services = data?.services || [];


      const filteredServices = useMemo(() => {
             return services.filter(service => {
                 const matchesSearchTerm = searchTerm === '' || service.name.toLowerCase().includes(searchTerm.toLowerCase());
                 const matchesStatus = serviceStatusFilter === 'All' || service.status === serviceStatusFilter.toLowerCase();
                 return matchesSearchTerm && matchesStatus;
             });
         }, [services, searchTerm, serviceStatusFilter]);

    // Handlers
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setServiceStatusFilter(e.target.value as 'All' | 'active' | 'inactive');
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    
    // useEffect(() => {
    //     if (data?.services) {
    //         setServices(data.services);     // Show this list
    //         setAllServices(data.services);  // Keep a backup copy
    //     }
    // }, [data])

   

    // const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);

    return (
        <DashboardLayout>
            {/* <main className="flex-1 p-8 overflow-y-auto"> */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                    
                    <div className="flex items-center space-x-2">

                    <Link href="services/new" className="btn-primary">
                         
                          <Icons.plus className="h-5 w-5 text-gray-400" /> 
                        <span>Add New Service</span>
                    </Link>
                    </div>
                </div>


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
                    <div className="flex-grow"></div> {/* This spacer pushes the buttons to the right */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium flex items-center space-x-1 rounded-lg"
                                >
                                <Icons.refresh className="h-6 w-6" />
                                <span>Refresh</span>
                            </button>
                            {/* <button className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                                <Icons.refresh className="h-6 w-6" />
                            </button>  */}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <DataStateWrapper loading={loading} error={error}>
                            {/* // The table is rendered only when data is available. */}
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Service Name</th>
                                        <th scope="col" className="px-6 py-4">Service Type</th>
                                        <th scope="col" className="px-6 py-4">Price</th>
                                        <th scope="col" className="px-6 py-4">Status</th>
                                        <th scope="col" className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredServices.map((service) => (
                                        <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{service.name}</td>
                                            <td className="px-6 py-4">{service.service_type}</td>
                                            <td className="px-6 py-4">{service.price}</td>
                                            <td className="px-6 py-4"><ServiceStatusBadge status={service.status as 'active' | 'inactive'} /></td>
                                            <td className="px-6 py-4">
                                                <Link href={`/services/${service.id}`}>
                                                    <button className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md cursor-pointer text-xs font-medium hover:bg-gray-200">
                                                        View Details
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DataStateWrapper>
                    </div>
                </div>
            {/* </main> */}
        </DashboardLayout>
    );
}
