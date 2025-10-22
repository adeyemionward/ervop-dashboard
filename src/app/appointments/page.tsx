'use client';

import React, { useState, useMemo, FC, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { AppointmentStatusBadge } from "@/app/appointments/components/AppointmentStatusBadge";

import Link from "next/link";
import { Calendar as CalendarIcon, List, Search, ChevronLeft, ChevronRight, Plus, Copy, Settings2, RefreshCw, X, Clock , CheckCircle, Trash2, Pencil, Eye, ChevronDown} from 'lucide-react';
import clsx from 'clsx';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import toast from 'react-hot-toast';
import DataTable from '@/components/DataTable';


const useGoBack = () => () => window.history.back();



// --- TYPE DEFINITIONS ---
type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Converted' | 'Inprogress';

// This is the clean, formatted type for the UI
interface Appointment {
    id: number;
    appointmentId: string;
    customerName: string;
    service: string;
    project: string;
    appointmentStatus: AppointmentStatus;
    date: string; // YYYY-MM-DD
    time: string; // Formatted time
    createdAt: string; // Formatted time
}

// This type now matches your new, flat API response
interface ApiAppointment {
    id: number;
    date: string; // YYYY-MM-DD from DB
    time: string; // HH:mm from DB
    appointment_status: AppointmentStatus | null;
    service_id: number;
    service_name: string;
    project_title: string;
    customer_id: number;
    customer_firstname: string;
    customer_lastname: string;
    customer_email: string;
    customer_phone: string;
    created_at: string;
}


// --- REUSABLE COMPONENTS ---
const StatCard: FC<{ title: string; value: string; icon: React.ElementType; mainBg: string; iconBg: string; mainText: string; iconText: string; }> = ({ title, value, icon: Icon, mainBg, iconBg, mainText, iconText }) => (
    <div className={`${mainBg} p-6 rounded-lg shadow-sm flex items-center space-x-4`}>
        <div className={`${iconBg} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div>
            <p className={`text-sm font-medium ${mainText} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${mainText}`}>{value}</p>
        </div>
    </div>
);


// --- CALENDAR COMPONENTS ---
const CalendarView: FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(appt => {
            const dateKey = appt.date;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)?.push(appt);
        });
        return map;
    }, [appointments]);

    const selectedDaySchedule = useMemo(() => {
        const dateKey = formatDate(selectedDate);
        return appointmentsByDate.get(dateKey) || [];
    }, [selectedDate, appointmentsByDate]);

    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-24"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateKey = formatDate(date);
        const hasAppointments = appointmentsByDate.has(dateKey);
        const isSelected = selectedDate.toDateString() === date.toDateString();
        const isToday = new Date().toDateString() === date.toDateString();

        calendarDays.push(
            <div 
                key={day} 
                onClick={() => setSelectedDate(date)}
                className={clsx("h-24 p-2 border-t border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors", { 'bg-purple-50': isSelected })}
            >
                <div className={clsx("w-8 h-8 flex items-center justify-center rounded-full font-medium", {
                    'bg-purple-600 text-white': isSelected,
                    'text-purple-600': isToday && !isSelected,
                })}>
                    {day}
                </div>
                {hasAppointments && (
                    <div className="mt-1 flex justify-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                )}
            </div>
        );
    }

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Schedule for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h3>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {selectedDaySchedule.length > 0 ? selectedDaySchedule.map(appt => (
                        <div key={appt.id} className="p-3 rounded-lg border border-purple-200 bg-purple-50">
                            <p className="font-semibold text-purple-800">{appt.time}</p>
                            <p className="text-sm text-purple-700 mt-1">{appt.service || appt.project || 'General'}</p>
                            <p className="text-xs text-purple-600 mt-1">with {appt.customerName}</p>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 p-8">
                            <p className="mt-2 text-sm">No appointments scheduled.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                    <h3 className="text-lg font-semibold text-gray-900">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-sm">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold text-gray-500 py-2">{day}</div>)}
                    {calendarDays}
                </div>
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 10;

// --- Date Helper Functions ---
const formatDate = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};

const getDateRangeForPreset = (preset: string): { start: string, end: string } => {
    const now = new Date();
    let start: Date, end: Date;
    switch (preset) {
        case 'This Week':
            start = new Date(now.setDate(now.getDate() - now.getDay()));
            end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
        case 'Last Week':
             end = new Date();
             end.setDate(end.getDate() - end.getDay() - 1);
             start = new Date(end);
             start.setDate(start.getDate() - 6);
             break;
        case 'This Month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'Last Month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        default: return { start: '', end: '' };
    }
    return { start: formatDate(start), end: formatDate(end) };
};

// --- MAIN PAGE COMPONENT ---
export default function AppointmentsPage() {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [datePreset, setDatePreset] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');


    //delete appointment
    const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [isOpen, setIsOpen] = useState(false);

  
    // --- Delete function ---
    const deleteAppointment = async (id: number) => {
        try {
            setDeletingId(id);

            const response = await fetch(`${BASE_URL}/professionals/appointments/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userToken}`,
            },
            });

            if (!response.ok) {
            throw new Error('Failed to delete appointment');
            }

            // Remove the deleted appointment from the state
            setAppointments(prev => prev.filter(a => a.id !== id));
            setAppointmentToDelete(null);

            // ✅ Show success toast
            toast.success('Appointment deleted successfully!');
        } catch (err) {
            console.error('Failed to delete appointment:', err);
            toast.error('Failed to delete appointment. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleGoBack = useGoBack();
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    const fetchAppointments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/professionals/appointments/list`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const result = await response.json();
            const apiData = result.data || [];
            
            // Map the new API response to the frontend Appointment type
            const formattedData: Appointment[] = apiData.map((appt: ApiAppointment) => {
                // The date from the API is already in YYYY-MM-DD format, so no changes are needed.
                const formattedDate = appt.date;

                // The time from the API is in HH:mm format, so we format it for display.
                const [hours, minutes] = appt.time.split(':');
                const timeObj = new Date();
                timeObj.setHours(parseInt(hours), parseInt(minutes));
                const appointmentTime = timeObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                const createdAtDate = new Date(appt.created_at);
                const createdAtFormatted = `${createdAtDate.toLocaleDateString()} ${createdAtDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}`;

                return {
                    id: appt.id,
                    appointmentId: `#APPT-${String(appt.id).padStart(3, '0')}`,
                    customerName: `${appt.customer_firstname} ${appt.customer_lastname}`,
                    service: appt.service_name, 
                    project: appt.project_title,
                    appointmentStatus: appt.appointment_status || 'Upcoming', // Default null to Upcoming
                    date: formattedDate,
                    time: appointmentTime,
                    createdAt: createdAtFormatted,
                };
            });
            
            setAppointments(formattedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userToken) {
            fetchAppointments();
        } else {
            setIsLoading(false);
            setError("Authentication token not found.");
        }
    }, [userToken]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setAppointmentStatusFilter('All');
        setDatePreset('All');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };
    
    const handleDatePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const preset = e.target.value;
        setDatePreset(preset);
        setCurrentPage(1);
        if (preset === 'Custom') {
            setDateRange({ start: '', end: '' });
            return;
        }
        setDateRange(getDateRangeForPreset(preset));
    };

    const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'start' | 'end') => {
        setDateRange(prev => ({ ...prev, [part]: e.target.value }));
        setDatePreset('Custom');
        setCurrentPage(1);
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(appt => {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchTerm === '' || 
                appt.appointmentId.toLowerCase().includes(searchLower) || 
                appt.customerName.toLowerCase().includes(searchLower);

            const dateMatch = !dateRange.start || !dateRange.end || (appt.date >= dateRange.start && appt.date <= dateRange.end);
            const statusMatch = appointmentStatusFilter === 'All' || appt.appointmentStatus === appointmentStatusFilter;
            
            return searchMatch && dateMatch && statusMatch;
        });
    }, [appointments, searchTerm, appointmentStatusFilter, dateRange]);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAppointments, currentPage]);

    return (
        <DashboardLayout>
            <HeaderTitleCard
                onGoBack={handleGoBack}
                title="Appointments"
                description="Manage your schedule, availability, and client bookings."
                >
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                        >
                        <span>Quick Actions</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <Link
                        href="/appointments/availability"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                        >
                        <Settings2 className="w-4 h-4 text-purple-600" />
                        <span>Set Availability</span>
                        </Link>

                        <Link
                        href="/booking-link"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                        >
                        <Copy className="w-4 h-4 text-purple-600" />
                        <span>Copy Booking Link</span>
                        </Link>

                        <Link
                        href="/appointments/new"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                        >
                        <Plus className="w-4 h-4 text-purple-600" />
                        <span>New Appointment</span>
                        </Link>
                    </div>
                    )}
                </div>
            </HeaderTitleCard>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Appointments" value={appointments.length.toString()} icon={CalendarIcon} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                <StatCard title="Upcoming" value={appointments.filter(a => a.appointmentStatus === 'Upcoming').length.toString()} icon={Clock} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                <StatCard title="Inprogress" value={appointments.filter(a => a.appointmentStatus === 'Inprogress').length.toString()} icon={RefreshCw} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" />
                <StatCard title="Completed" value={appointments.filter(a => a.appointmentStatus === 'Completed').length.toString()} icon={CheckCircle} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                <StatCard title="Cancelled" value={appointments.filter(a => a.appointmentStatus === 'Cancelled').length.toString()} icon={X} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
            </div>

            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap items-center gap-4 border border-gray-200">
                <div className="relative flex-shrink-0 w-full sm:w-64">
                    <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Search className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <select value={datePreset} onChange={handleDatePresetChange} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-36 flex-shrink-0">
                    <option value="All">All Time</option>
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="Custom">Custom</option>
                </select>
                {datePreset === 'Custom' && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <input type="date" value={dateRange.start} onChange={e => handleManualDateChange(e, 'start')} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <span>-</span>
                        <input type="date" value={dateRange.end} onChange={e => handleManualDateChange(e, 'end')} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                )}
                <select value={appointmentStatusFilter} onChange={(e) => {setAppointmentStatusFilter(e.target.value as AppointmentStatus | 'All'); setCurrentPage(1);}} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-40 flex-shrink-0">
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Converted">Converted to Project</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <div className="flex-grow"></div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={handleClearFilters} className="text-sm text-gray-600 hover:text-purple-600 p-2 cursor-pointer hover:bg-gray-200 bg-gray-100 rounded-md font-medium">Clear Filters</button>
                    <button onClick={fetchAppointments} className="p-2 text-gray-500 cursor-pointer hover:text-purple-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                        {/* <Icons.refresh className="h-6 w-6" /> */}
                         <RefreshCw size={22} />
                    </button> 
                </div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
                <button onClick={() => setView('list')} className={clsx("font-semibold py-2 px-4 rounded-lg flex items-center", view === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300')}>
                    <List className="w-4 h-4 mr-2" /> List View
                </button>
                <button onClick={() => setView('calendar')} className={clsx("font-semibold py-2 px-4 rounded-lg flex items-center", view === 'calendar' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300')}>
                    <CalendarIcon className="w-4 h-4 mr-2" /> Calendar View
                </button>
            </div>

            {view === 'list' && (
                <DataTable
                    columns={[
                        { label: "Appointment ID", field: "appointmentId" },
                        { label: "Customer Name", field: "customerName" },
                        { label: "Purpose", field: "service", default: "General" },
                        { 
                            label: "Status", 
                            field: "appointmentStatus", 
                            default: "Pending",
                            render: (row) => <AppointmentStatusBadge status={row.appointmentStatus} />
                        },
                        { label: "Date & Time", field: "dateTime" },
                        { label: "Created On", field: "createdAt" },
                    ]}
                    data={paginatedAppointments.map(appt => ({
                        ...appt,
                        dateTime: `${new Date(appt.date).toLocaleDateString()} at ${appt.time}`,
                        createdAt: new Date(appt.createdAt).toLocaleString(),
                    }))}
                    loading={isLoading}
                    error={error}
                    itemsPerPage={10} // optional
                    actions={(row) => (
                        <>
                        <Link href={`/appointments/view/${row.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                            <Eye className="w-4 h-4 text-gray-500" /> View
                        </Link>
                        <Link href={`/appointments/edit/${row.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                            <Pencil className="w-4 h-4 text-gray-500" /> Edit
                        </Link>
                        <button onClick={() => setAppointmentToDelete(row)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                            <Trash2 className="w-4 h-4 text-red-500" /> Delete
                        </button>
                        </>
                    )}
                />

            )}
            
            {view === 'calendar' && (
                <CalendarView appointments={filteredAppointments} />
            )}
            <DeleteConfirmModal
                isOpen={!!appointmentToDelete}
                onCancel={() => setAppointmentToDelete(null)}
                onConfirm={() => appointmentToDelete && deleteAppointment(appointmentToDelete.id)}
                title="Delete Appointment"
                message={
                    appointmentToDelete
                    ? `Are you sure you want to delete the appointment with ${appointmentToDelete.customerName} on ${appointmentToDelete.date}?`
                    : ""
                }
                deleting={deletingId === appointmentToDelete?.id}
            />
        </DashboardLayout>
    );
}

