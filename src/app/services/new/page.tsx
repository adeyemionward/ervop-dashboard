'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import clsx from "clsx";
import toast from 'react-hot-toast';
import { handleNumberChange } from '@/app/utils/handleNumberChange';
import { useRouter } from 'next/navigation';

// --- div Page Component ---
export default function CreateService() {
    // State for form inputs
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');
    const [price, setPrice] = useState<number>(0);
    const [serviceType, setServiceType] = useState('physical');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
    console.log('BASE_URL:', BASE_URL); 
    //check if form is filled
    const isFormFilled = name && description && serviceType && status;
    

     // Function to handle form submission on the final step (Step 4)
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setSubmitError('');
            setSuccessMessage('');
            setFieldErrors({});
            setIsSubmitting(true);
            setIsLoading(true);
            
                const payload = {
                    name,
                    description,
                    price,
                    status,
                    serviceType,
                };
    
            try {
                const userToken = localStorage.getItem('token'); 

                if (!userToken) {
                    // Handle the case where the token is not found
                    throw new Error('No authentication token found. Please log in again.');
                }
                const response = await fetch(`${BASE_URL}/professionals/services/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`,
                    },
                    body: JSON.stringify(payload),
                });
    
                const result = await response.json();
    
                if (!response.ok || result.status === false) {
                    // Handle field-specific errors
                    if (result.errors) {
                        const extractedErrors: { [key: string]: string } = {};
                        for (const key in result.errors) {
                            if (result.errors[key]?.length > 0) {
                                extractedErrors[key] = result.errors[key][0]; // take first error
                            }
                        }
                        console.log('Setting fieldErrors:', extractedErrors); // ✅
                        setFieldErrors(extractedErrors);
                    }
    
                    throw new Error(result.message || 'Registration failed. Please fix the errors.');
                }else{
                    toast.success(result.message || 'Service created successfully!');
                    // Optionally redirect or reset form
                    router.push('/services');
                    setSuccessMessage('Service created successfully!');
                    setName('');
                    setDescription('');
                    setPrice(0);
                    setStatus('active');
                    setServiceType('physical');
                    setIsSubmitting(false);
                }
    
            } catch (error: any) {
                setIsSubmitting(false);
                console.error('Registration failed:', error);
                toast.error(error.message || 'Registration failed. Please try again.');
                setIsLoading(false);
            } finally {
                setIsSubmitting(false);
                setIsLoading(false);
            }
        };
    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">

                {/* <!-- Page Header --> */}
                <div className="mb-8">
                    <a href="/services" className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Back to Services
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Service</h1>
                </div>

                {/* <!-- htmlForm Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                       
                        {/* <!-- Service Name --> */}
                        <div>
                            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                            <input 
                                type="text" 
                                id="name"
                                value={name} 
                                onChange={(e) => setName(e.target.value)}  
                                placeholder="e.g. Initial Consultation" 
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>

                        {/* <!-- Service Description --> */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                            <textarea 
                                id="description" 
                                rows={4} 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}  
                                placeholder="Describe what this service includes..." 
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500">

                            </textarea>
                        </div>

                        {/* <!-- status & Price --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    id="status" 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value='active'>Active</option>
                                    <option value='inactive'>Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                                <input 
                                    type="text" 
                                    id="price" 
                                    placeholder="e.g. 25,000 or Free" 
                                    value={price} 
                                    onChange={handleNumberChange(setPrice)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    {fieldErrors.price && (
                                            <p className="text-red-500 text-sm">{fieldErrors.price}</p>
                                        )}
                            </div>

                        </div>

                        {/* <!-- Service Type --> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                            <div className="flex items-center gap-x-6">
                                <div className="flex items-center">
                                    <input 
                                        id="physical" 
                                        name="serviceType" 
                                        type="radio" 
                                        value="physical"
                                        checked={serviceType === 'physical'}
                                        onChange={(e) => setServiceType(e.target.value)} 
                                        className="h-5 w-5 accent-primary-600 border-gray-300 focus:ring-primary-500" />
                                    <label htmlFor="physical" className="ml-2 block text-sm text-gray-900">Physical</label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        id="virtual" 
                                        name="serviceType" 
                                        type="radio" 
                                        value="virtual"
                                        checked={serviceType === 'virtual'}
                                        onChange={(e) => setServiceType(e.target.value)}
                                        className="h-5 w-5 accent-primary-600 border-gray-300 focus:ring-primary-500" />
                                    <label htmlFor="virtual" className="ml-2 block text-sm text-gray-900">Virtual / Phone Call</label>
                                </div>
                            </div>
                        </div>
                        
                        {/* <!-- Form Actions --> */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Cancel</button>
                            <button type="submit"  
                            disabled={!isFormFilled || isLoading}
                            className="bg-purple-600  disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:bg-purple-700"
                            >Save Service</button>
                        </div>
                        
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
