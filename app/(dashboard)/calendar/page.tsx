"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, getYear, getMonth, startOfMonth, getDay } from "date-fns";
import { getCalendarData, DailyCashSummary } from "@/app/actions/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, FileText, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/logic";
import { useSession } from "next-auth/react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<DailyCashSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = async () => {
        setLoading(true);
        const month = getMonth(currentDate) + 1; // 1-12
        const year = getYear(currentDate);

        // Server Action
        const result = await getCalendarData(month, year);
        setData(result);
        setLoading(false);
    };

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    // Grid Logic
    const monthStart = startOfMonth(currentDate);
    const startDayIndex = getDay(monthStart); // 0 (Sun) to 6 (Sat)

    // Create blanks for empty cells before start of month
    const blanks = Array.from({ length: startDayIndex });

    return (
        <div className="container mx-auto py-8 h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Financial Calendar</h1>
                    <p className="text-zinc-500">Track monthly cash flow and platform revenue.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-zinc-200 rounded-md shadow-sm">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 font-bold text-lg min-w-[140px] text-center">
                            {format(currentDate, "MMMM yyyy")}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                {loading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                    </div>
                ) : null}
                
                <div className="grid grid-cols-7 flex-1 auto-rows-fr relative">
                    {/* Blanks */}
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="bg-zinc-50/30 border-b border-r border-zinc-100 min-h-[100px]" />
                    ))}

                    {/* Data Cells */}
                    {data.map((day) => {
                        const showIn = day.inflow > 0;
                        const showOut = day.outflow > 0;
                        const showReports = day.reportsCount > 0;

                        return (
                            <div
                                key={day.date.toISOString()}
                                className="border-b border-r border-zinc-100 p-2 min-h-[120px] hover:bg-zinc-50 transition-colors relative group"
                            >
                                <span className="text-zinc-400 font-medium text-sm block mb-2">{format(day.date, "d")}</span>

                                <div className="space-y-1.5 relative">
                                    {/* Platform Reports Data */}
                                    {showReports && (
                                        <>
                                            <div className="text-xs bg-blue-50 text-blue-700 px-1.5 py-1 rounded font-bold border border-blue-100 flex justify-between items-center cursor-default">
                                                <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Reports</span>
                                                <span>{day.reportsCount}</span>
                                            </div>
                                            {isAdmin && (
                                                <div className="text-xs bg-purple-50 text-purple-700 px-1.5 py-1 rounded font-bold border border-purple-100 flex justify-between items-center cursor-default">
                                                    <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1" /> Revenue</span>
                                                    <span>₹{day.platformRevenue.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}

                                            {/* Custom Hover Tooltip */}
                                            <div className="absolute left-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <div className="bg-white rounded-lg shadow-xl border border-zinc-200 p-3">
                                                    <div className="text-xs font-bold text-zinc-800 mb-2 border-b border-zinc-100 pb-2">
                                                        Reports on {format(day.date, "MMM do, yyyy")}
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                        {day.reports.map((report: any) => (
                                                            <div key={report.id} className="flex justify-between items-start text-xs">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-zinc-700 truncate w-36" title={report.order?.userEmail}>
                                                                        {report.order?.userEmail || "Unknown User"}
                                                                    </span>
                                                                    <span className="text-[10px] text-zinc-400 font-mono">{report.razorpayPaymentId}</span>
                                                                </div>
                                                                {isAdmin && (
                                                                    <span className="font-bold text-emerald-600">₹{Number(report.amount)}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Company Cash Flow Data */}
                                    {showIn && (
                                        <div className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium border border-emerald-100 flex justify-between">
                                            <span>In</span>
                                            <span>+{formatCurrency(day.inflow).split('.')[0].replace('₹', '')}</span>
                                        </div>
                                    )}
                                    {showOut && (
                                        <div className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium border border-red-100 flex justify-between">
                                            <span>Out</span>
                                            <span>-{formatCurrency(day.outflow).split('.')[0].replace('₹', '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
