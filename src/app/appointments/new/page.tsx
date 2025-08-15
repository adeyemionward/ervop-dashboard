'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";



// --- div Page Component ---
export default function CreateAppointment() {
    return (
        <DashboardLayout>
            <div className="w-full  max-w-4xl mx-auto">

                {/* <!-- Page Header --> */}
                <div className="mb-8">
                    <a href="/appointments" className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Back to Appointments
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900">Schedule Appointment</h1>
                </div>

                {/* <!-- Form Container --> */}
                <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto">
                    <form className="space-y-8">
                        
                        {/* <!-- Customer & Service Section --> */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                <button type="button" className="w-full flex justify-between items-center text-left border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500 hover:border-purple-500">
                                    <span>Select a customer</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                             <div>
                                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                <select id="service" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option>Initial Consultation</option>
                                </select>
                            </div>
                        </div>

                        {/* <!-- Date Picker Section --> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>

                        {/* <!-- Time Slot Section --> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {/* <!-- Available Slot --> */}
                                <button type="button" className="w-full text-center border border-purple-500 text-purple-600 font-semibold rounded-lg py-2 hover:bg-purple-50">09:00 AM</button>
                                {/* <!-- Available Slot --> */}
                                <button type="button" className="w-full text-center border border-purple-500 text-purple-600 font-semibold rounded-lg py-2 hover:bg-purple-50">10:00 AM</button>
                                {/* <!-- Selected Slot --> */}
                                <button type="button" className="w-full text-center border border-purple-600 bg-purple-600 text-white font-semibold rounded-lg py-2">11:00 AM</button>
                                {/* <!-- Unavailable Slot --> */}
                                <button type="button" className="w-full text-center border border-gray-300 text-gray-400 font-semibold rounded-lg py-2 cursor-not-allowed" disabled>12:00 PM</button>
                                {/* <!-- Available Slot --> */}
                                <button type="button" className="w-full text-center border border-purple-500 text-purple-600 font-semibold rounded-lg py-2 hover:bg-purple-50">01:00 PM</button>
                                <button type="button" className="w-full text-center border border-purple-500 text-purple-600 font-semibold rounded-lg py-2 hover:bg-purple-50">02:00 PM</button>
                                <button type="button" className="w-full text-center border border-purple-500 text-purple-600 font-semibold rounded-lg py-2 hover:bg-purple-50">03:00 PM</button>
                            </div>
                        </div>

                        {/* <!-- Notes Section --> */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea id="notes" rows={4} placeholder="Add any specific details for this appointment..." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>
                        
                        {/* <!-- Form Actions --> */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <button type="button" className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-purple-700">Save Appointment</button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
