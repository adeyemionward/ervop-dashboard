'use client';

import React, { useState, useMemo, SVGProps } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";
import Link from "next/link";
import { Icons } from '@/components/icons';
import { Calendar as CalendarIcon, List, Search, ChevronLeft, ChevronRight, Plus, Copy, Share2, Settings2, RefreshCw, X, Clock , CheckCircle} from 'lucide-react';
import clsx from 'clsx';

// --- TYPE DEFINITIONS ---
type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Converted' | 'Inprogress';
type Appointment = {
    id: number;
    appointmentId: string;
    customerName: string;
    service: string;
    appointmentStatus: AppointmentStatus;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM AM/PM
};

// --- MOCK DATA (More detailed for calendar) ---
const allAppointments: Appointment[] = [
    { id: 1, appointmentId: '#APPT-001', customerName: 'Chioma Nwosu', service: 'Initial Consultation', appointmentStatus: 'Completed', date: '2025-08-15', time: '10:00 AM' },
    { id: 2, appointmentId: '#APPT-002', customerName: 'Bolanle Adebayo', service: 'Fabric Selection', appointmentStatus: 'Upcoming', date: '2025-09-28', time: '11:00 AM' },
    { id: 3, appointmentId: '#APPT-003', customerName: 'Musa Ibrahim', service: 'First Fitting', appointmentStatus: 'Cancelled', date: '2025-07-26', time: '02:00 PM' },
    { id: 4, appointmentId: '#APPT-004', customerName: 'Aisha Bello', service: 'Final Fitting', appointmentStatus: 'Completed', date: '2025-07-29', time: '03:30 PM' },
    { id: 5, appointmentId: '#APPT-005', customerName: 'Emeka Okafor', service: 'Initial Consultation', appointmentStatus: 'Upcoming', date: '2025-07-28', time: '01:00 PM' },
    { id: 6, appointmentId: '#APPT-006', customerName: 'Fatima Aliyu', service: 'Measurement', appointmentStatus: 'Completed', date: '2025-07-21', time: '09:00 AM' },
];


// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, mainBg, iconBg, mainText, iconText }: { title: string; value: string; icon: React.ElementType; mainBg: string; iconBg: string; mainText: string; iconText: string; }) => (
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

const AppointmentStatusBadge = ({ status }: { status: AppointmentStatus }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    const statusClasses = {
        'Upcoming': "bg-blue-100 text-blue-800",
        'Completed': "bg-green-100 text-green-800",
        'Converted': "bg-purple-100 text-purple-800",
        'Cancelled': "bg-red-100 text-red-800",
        'Inprogress': "bg-yellow-100 text-yellow-800",
    };
    return <span className={clsx(baseClasses, statusClasses[status])}>{status}</span>;
};

// --- CALENDAR COMPONENTS ---
// --- CALENDAR COMPONENTS ---
const CalendarView = ({ appointments }: { appointments: Appointment[] }) => {
    // Note: It's better to initialize selectedDate based on the currentDate to avoid mismatches
    // if you decide to change the initial month later. But for today's date, this is fine.
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(appt => {
            const dateKey = appt.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(appt);
        });
        return map;
    }, [appointments]);

    const selectedDaySchedule = useMemo(() => {
        // FIX #1: Use the consistent, timezone-safe formatDate function
        const dateKey = formatDate(selectedDate);
        return appointmentsByDate.get(dateKey) || [];
    }, [selectedDate, appointmentsByDate]);

    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-24"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // FIX #2: Use the same formatDate function for generating keys
        const dateKey = formatDate(date);
        const hasAppointments = appointmentsByDate.has(dateKey);
        const isSelected = selectedDate.toDateString() === date.toDateString();

        calendarDays.push(
            <div 
                key={day} 
                onClick={() => setSelectedDate(date)}
                className={clsx("h-24 p-2 border-t border-gray-200 cursor-pointer hover:bg-gray-50", {
                    'bg-blue-50': isSelected
                })}
            >
                <div className={clsx("w-8 h-8 flex items-center justify-center rounded-full", {
                    'bg-blue-600 text-white': isSelected
                })}>
                    {day}
                </div>
                {hasAppointments && (
                    <div className="mt-1 flex justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
                    Schedule for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    {selectedDaySchedule.length > 0 ? selectedDaySchedule.map(appt => (
                         <div key={appt.id} className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                             <p className="font-semibold text-blue-800">{appt.time}</p>
                             <p className="text-sm text-blue-700 mt-1">{appt.service}</p>
                             <p className="text-xs text-blue-600 mt-1">with {appt.customerName}</p>
                         </div>
                    )) : (
                        <div className="text-center text-gray-500 p-8">
                             <p className="mt-2 text-sm">No appointments scheduled for this day.</p>
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
                    <div className="font-semibold text-gray-500 py-2">Sun</div>
                    <div className="font-semibold text-gray-500 py-2">Mon</div>
                    <div className="font-semibold text-gray-500 py-2">Tue</div>
                    <div className="font-semibold text-gray-500 py-2">Wed</div>
                    <div className="font-semibold text-gray-500 py-2">Thu</div>
                    <div className="font-semibold text-gray-500 py-2">Fri</div>
                    <div className="font-semibold text-gray-500 py-2">Sat</div>
                    {calendarDays}
                </div>
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 15;

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
        default:
            return { start: '', end: '' };
    }
    return { start: formatDate(start), end: formatDate(end) };
};

// --- MAIN PAGE COMPONENT ---
export default function AppointmentsPage() {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [appointments, setAppointments] = useState(allAppointments);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [datePreset, setDatePreset] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');
    
    const handleGoBack = useGoBack();

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
        const { start, end } = getDateRangeForPreset(preset);
        setDateRange({ start, end });
    };

    const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'start' | 'end') => {
        setDateRange(prev => ({ ...prev, [part]: e.target.value }));
        setDatePreset('Custom');
        setCurrentPage(1);
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(appt => {
            const apptDate = new Date(appt.date);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;
            
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchTerm === '' || 
                                appt.appointmentId.toLowerCase().includes(searchLower) || 
                                appt.customerName.toLowerCase().includes(searchLower);

            const dateMatch = (!startDate || apptDate >= startDate) && (!endDate || apptDate <= endDate);
            const statusMatch = appointmentStatusFilter === 'All' || appt.appointmentStatus === appointmentStatusFilter;
            
            return searchMatch && dateMatch && statusMatch;
        });
    }, [appointments, searchTerm, appointmentStatusFilter, dateRange]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(filteredAppointments.map(appt => appt.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAppointments, currentPage]);

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

    return (
        <DashboardLayout>
            <HeaderTitleCard onGoBack={handleGoBack} title="Appointments" description="Manage your schedule, availability, and client bookings.">
                <div className="flex flex-col md:flex-row gap-2">
                    <Link href="/appointments/availability" className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center space-x-2">
                        <Settings2 className="w-4 h-4" /> 
                        <span>Set Availability</span>
                    </Link>
                    <Link href="/booking-link" className="bg-white border border-purple-300 text-purple-800 px-4 py-2 font-medium rounded-lg hover:bg-purple-50 flex items-center space-x-2">
                        <Copy className="w-4 h-4" /> 
                        <span>Copy Booking Link</span> 
                    </Link>
                    
                    <Link href="/appointments/new" className="btn-primary">
                        <Plus className="w-4 h-4" /> 
                        <span>New Appointment</span>
                    </Link>
                </div> 
            </HeaderTitleCard>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Appointments" value={appointments.length.toString()} icon={CalendarIcon} mainBg="bg-white" iconBg="bg-purple-100" mainText="text-gray-900" iconText="text-purple-800" />
                <StatCard title="Upcoming" value={appointments.filter(a => a.appointmentStatus === 'Upcoming').length.toString()} icon={Clock} mainBg="bg-white" iconBg="bg-blue-100" mainText="text-gray-900" iconText="text-blue-800" />
                <StatCard title="Inprogress" value={appointments.filter(a => a.appointmentStatus === 'Inprogress').length.toString()} icon={RefreshCw} mainBg="bg-white" iconBg="bg-yellow-100" mainText="text-gray-900" iconText="text-yellow-800" />
                <StatCard title="Completed" value={appointments.filter(a => a.appointmentStatus === 'Completed').length.toString()} icon={CheckCircle} mainBg="bg-white" iconBg="bg-green-100" mainText="text-gray-900" iconText="text-green-800" />
                <StatCard title="Cancelled" value={appointments.filter(a => a.appointmentStatus === 'Cancelled').length.toString()} icon={X} mainBg="bg-white" iconBg="bg-red-100" mainText="text-gray-900" iconText="text-red-800" />
            </div>

            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative flex-shrink-0 w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search by ID or Name..."
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Search className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <select value={datePreset} onChange={handleDatePresetChange} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-36 flex-shrink-0">
                    <option value="All">All Time</option>
                    <option value="This Week">This Week</option>
                    <option value="Last Week">Last Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                    <option value="Custom">Custom</option>
                </select>
                {datePreset === 'Custom' && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <input type="date" value={dateRange.start} onChange={e => handleManualDateChange(e, 'start')} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span>-</span>
                        <input type="date" value={dateRange.end} onChange={e => handleManualDateChange(e, 'end')} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                )}
                <select value={appointmentStatusFilter} onChange={(e) => {setAppointmentStatusFilter(e.target.value); setCurrentPage(1);}} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-40 flex-shrink-0">
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Converted">Converted to Project</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <div className="flex-grow"></div>
               
                <div className="flex items-center space-x-2 flex-shrink-0">
                            <button onClick={handleClearFilters} className="text-sm text-gray-600 hover:text-primary-600 p-2  cursor-pointer hover:bg-gray-200 bg-gray-100  font-medium">Clear Filters</button>
                            <button onClick={() => setAppointments(allAppointments)} className="p-2 text-gray-500 cursor-pointer hover:text-primary-600 hover:bg-gray-200 bg-gray-100 rounded-full">
                                <Icons.refresh className="h-6 w-6 " />
                            </button> 
                    </div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
                <button 
                    onClick={() => setView('list')} 
                    className={clsx("font-semibold py-2 px-4 rounded-lg flex items-center", view === 'list' ? 'bg-purple-800 text-white' : 'bg-white text-gray-700 border border-gray-300')}
                >
                    <List className="w-4 h-4 mr-2" /> List View
                </button>
                <button 
                    onClick={() => setView('calendar')} 
                    className={clsx("font-semibold py-2 px-4 rounded-lg flex items-center", view === 'calendar' ? 'bg-purple-800 text-white' : 'bg-white text-gray-700 border border-gray-300')}
                >
                    <CalendarIcon className="w-4 h-4 mr-2" /> Calendar View
                </button>
            </div>

            {view === 'list' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === filteredAppointments.length && filteredAppointments.length > 0} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                    </th>
                                    <th scope="col" className="px-6 py-4">Appointment ID</th>
                                    <th scope="col" className="px-6 py-4">Customer Name</th>
                                    <th scope="col" className="px-6 py-4">Service</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Date & Time</th>
                                    <th scope="col" className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedAppointments.map((appt) => (
                                    <tr key={appt.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="w-4 p-4">
                                            <input type="checkbox" checked={selectedRows.includes(appt.id)} onChange={() => handleSelectRow(appt.id)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{appt.appointmentId}</th>
                                        <td className="px-6 py-4">{appt.customerName}</td>
                                        <td className="px-6 py-4">{appt.service}</td>
                                        <td className="px-6 py-4"><AppointmentStatusBadge status={appt.appointmentStatus} /></td>
                                        <td className="px-6 py-4">{appt.date} at {appt.time}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/appointments/${appt.id}`}>
                                                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200">
                                                    View Details
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between p-4 border-t">
                        <span className="text-sm text-gray-700">
                            Showing <span className="font-semibold">{Math.min(1 + (currentPage - 1) * ITEMS_PER_PAGE, filteredAppointments.length)}</span> to <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAppointments.length)}</span> of <span className="font-semibold">{filteredAppointments.length}</span> Results
                        </span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {view === 'calendar' && (
                <CalendarView appointments={filteredAppointments} />
            )}

        </DashboardLayout>
    );
}
