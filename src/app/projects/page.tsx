'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import { Icons } from "@/components/icons";
import { SVGProps, useState, useMemo, Children } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const StatCard = ({ title, value, icon: Icon, mainBg, iconBg, mainText, iconText }: { title: string; value: string; icon: (props: SVGProps<SVGSVGElement>) => JSX.Element; mainBg: string; iconBg: string; mainText: string; iconText: string; }) => (
    <div className={`${mainBg} p-8 rounded-lg shadow-sm flex items-center space-x-4`}>
        <div className={`${iconBg} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div>
            <p className={`text-sm font-medium ${mainText} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${mainText}`}>{value}</p>
        </div>
    </div>
);

export default function ProjectsPage() {
    const handleGoBack = useGoBack();
    return (
        <DashboardLayout>
            
                {/* PAGE TITLE */}
                <HeaderTitleCard onGoBack={handleGoBack} title="Client Work" description="Manage all your client works and track their progress.">
                   <div className="flex flex-col md:flex-row gap-2">

                        <Link href="appointments/calendar" className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-5" fill="currentColor"  viewBox="0 0 16 16">
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
                                <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                            <span>Create Project from Appointment</span>
                        </Link>

                        {/* <Link href="#" className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center justify-center space-x-2">
                        <Icons.export />
                            <span>Export Projects</span>
                        </Link> */}

                        <Link href="projects/new" className="btn-primary flex items-center justify-center">
                            <Icons.plus /> 
                            <span>Create New Project</span>
                        </Link>
                        
                    </div> 
                </HeaderTitleCard>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard title="Total Projects" value="7"  icon={Icons.calendar} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                    <StatCard title="Onhold" value="7" icon={Icons.upcomingAppointments} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" />
                    <StatCard title="Inprogress" value="2" icon={Icons.inprogressAppointments} mainBg="bg-white" iconBg="bg-blue-100" mainText="text-gray-900" iconText="text-blue-800" />
                    <StatCard title="Completed" value="4" icon={Icons.inprogressAppointments} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                    <StatCard title="Cancelled"value="5" icon={Icons.cancelledAppointments} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
                    
                </div>

                <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4">

                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search Name..."
                            value=""
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Time Filter Select */}
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-36">
                        <option value="All">All Time</option>
                        <option value="This Week">Due This Week</option>
                        <option value="Last Week">Due Last Week</option>
                        <option value="This Month">Due This Month</option>
                        <option value="Last Month">Due Last Month</option>
                        <option value="Custom">Custom</option>
                    </select>
                    
                    {/* Status Filter Select */}
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-40">
                        <option value="All">All Statuses</option>
                        <option value="Onhold">Onhold</option>
                        <option value="Completed">Completed</option>
                        <option value="Inprogress">In-progress</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    {/* This spacer is now only active on larger screens */}
                    <div className="hidden md:block md:flex-grow"></div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 w-full md:w-auto">
                        <button className="text-sm text-gray-600 hover:text-primary-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 font-medium">Clear Filters</button>
                        <button className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                            <Icons.refresh className="h-6 w-6 " />
                        </button> 
                    </div>
                </div>
              
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-medium">Project Name</th>
                                    <th scope="col" className="px-6 py-4 font-medium">Customer</th>
                                    <th scope="col" className="px-6 py-4 font-medium">Due Date</th>
                                    <th scope="col" className="px-6 py-4 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-4 font-medium">Progress</th>
                                    <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">Custom Wedding Dress</td>
                                    <td className="px-6 py-4 text-gray-600">Chioma Nwosu</td>
                                    <td className="px-6 py-4 text-gray-600">Aug 25, 2024</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">In Progress</span></td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-600 h-2 rounded-full"  style={{ width: '75%' }}></div>
                                        </div>
                                    </td>
                                    {/* <Link href="/" > */}
                                            
                                    <td className="px-6 py-4 text-right cursor-pointer">
                                        <Link href="/projects/1" className="cursor-pointer">
                                                    
                                        <button className="text-primary-600 hover:text-primary-800 font-semibold">View</button>
                                        </Link>
                                    </td>
                                    {/* </Link> */}
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">Aso-Oke Set for Event</td>
                                    <td className="px-6 py-4 text-gray-600">Bolanle Adebayo</td>
                                    <td className="px-6 py-4 text-gray-600">Jul 10, 2024</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span></td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full"  style={{ width: '100%' }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-600 hover:text-primary-800 font-semibold">View</button>
                                    </td>
                                </tr>
                                 <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">Corporate Uniforms</td>
                                    <td className="px-6 py-4 text-gray-600">Musa Ibrahim</td>
                                    <td className="px-6 py-4 text-gray-600">Sep 15, 2024</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800">On Hold</span></td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-gray-400 h-2 rounded-full"  style={{ width: '20%' }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-600 hover:text-primary-800 font-semibold">View</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                </div>
        </DashboardLayout>
    );
}
