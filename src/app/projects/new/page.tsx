'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";



// --- div Page Component ---
export default function CreateProject() {
    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">

                {/* <!-- Page Header --> */}
                <div className="mb-8">
                    <Link href="/projects" className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Back to Projects
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
                </div>

                {/* <!-- htmlForm Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <form className="space-y-8">
                        
                        {/* <!-- Project Title --> */}
                        <div>
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                            <input type="text" id="projectName" placeholder="e.g. Feasibility analysis and market entry" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>

                        {/* <!-- Customer Selection --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                <button type="button" className="w-full flex justify-between items-center text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500 hover:border-purple-500">
                                    <span>Select a customer</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                             <div>
                                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select id="service" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option>In-Progress</option>
                                    <option>On-Hold</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* <!-- Project Description --> */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                            <textarea id="description" rows={4} placeholder="Add a detailed description of the project scope and deliverables..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>

                        {/* <!-- Dates & Value --> */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" id="startDate" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input type="date" id="dueDate" className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                            </div>
                             <div>
                                <label htmlFor="projectValue" className="block text-sm font-medium text-gray-700 mb-1">Project Value (₦)</label>
                                <input type="text" id="projectValue" placeholder="e.g. 450,000" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                        
                        {/* <!-- Tasks Section --> */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Tasks</h3>
                            <div className="space-y-3">
                                {/* <!-- Example Task --> */}
                                <div className="flex items-center gap-3">
                                    <input type="text" placeholder="Enter a task description..." className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                    <button type="button" className="text-red-500 hover:text-red-700 p-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <button type="button" className="mt-4 w-full border-2 border-dashed border-gray-300 text-gray-500 px-4 py-2 rounded-lg hover:border-purple-500 hover:text-purple-500">
                                + Add Task
                            </button>
                        </div>
                        
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 font-medium rounded-sm hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="btn-secondary text-white  font-medium  px-6 py-3 rounded-sm shadow-lg">Save Project</button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
