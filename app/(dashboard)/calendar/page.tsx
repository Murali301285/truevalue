'use client';

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, getYear, getMonth, startOfMonth, getDay, endOfMonth } from "date-fns";
import { getCalendarData, DailyCashSummary } from "@/app/actions/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/logic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [companyId, setCompanyId] = useState("ALL");
    const [data, setData] = useState<DailyCashSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedDay, setSelectedDay] = useState<DailyCashSummary | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentDate, companyId]);

    const fetchData = async () => {
        setLoading(true);
        const month = getMonth(currentDate) + 1; // 1-12
        const year = getYear(currentDate);

        // Server Action
        const result = await getCalendarData(month, year, companyId);
        setData(result);
        setLoading(false);
    };

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDayClick = (day: DailyCashSummary) => {
        setSelectedDay(day);
        setIsModalOpen(true);
    };

    // Grid Logic
    const monthStart = startOfMonth(currentDate);
    const startDayIndex = getDay(monthStart); // 0 (Sun) to 6 (Sat)

    // Create blanks for empty cells before start of month
    const blanks = Array.from({ length: startDayIndex });

    return (
        <div className="container mx-auto py-8 h-screen flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Financial Calendar</h1>
                    <p className="text-zinc-500">Track monthly cash flow rhythm.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={companyId} onValueChange={setCompanyId}>
                        <SelectTrigger className="w-[200px] bg-white">
                            <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Companies</SelectItem>
                            <SelectItem value="1">TechFlow Solutions</SelectItem>
                            <SelectItem value="2">GreenLeaf Logistics</SelectItem>
                            {/* In real app, fetch companies list */}
                        </SelectContent>
                    </Select>

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
            <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
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
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-300" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                        {/* Blanks */}
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="bg-zinc-50/30 border-b border-r border-zinc-100 min-h-[100px]" />
                        ))}

                        {/* Data Cells */}
                        {data.map((day) => {
                            const showIn = day.inflow > 0;
                            const showOut = day.outflow > 0;
                            return (
                                <div
                                    key={day.date.toISOString()}
                                    onClick={() => handleDayClick(day)}
                                    className="border-b border-r border-zinc-100 p-2 min-h-[100px] hover:bg-zinc-50 cursor-pointer transition-colors relative group"
                                >
                                    <span className="text-zinc-400 font-medium text-sm block mb-2">{format(day.date, "d")}</span>

                                    <div className="space-y-1">
                                        {showIn && (
                                            <div className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100 flex justify-between">
                                                <span>In</span>
                                                <span>+{formatCurrency(day.inflow).split('.')[0].replace('₹', '')}</span>
                                            </div>
                                        )}
                                        {showOut && (
                                            <div className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-100 flex justify-between">
                                                <span>Out</span>
                                                <span>-{formatCurrency(day.outflow).split('.')[0].replace('₹', '')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Transaction Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedDay && format(selectedDay.date, "MMMM do, yyyy")}</DialogTitle>
                        <DialogDescription>
                            Daily Transaction Summary
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedDay?.transactions.length === 0 ? (
                            <p className="text-center text-zinc-500 py-4">No transactions recorded.</p>
                        ) : (
                            selectedDay?.transactions.map((tx: any) => (
                                <div key={tx.id} className="flex justify-between items-center border-b border-zinc-100 pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{tx.description || "Unspecified"}</p>
                                        <div className="flex gap-2 text-xs text-zinc-400">
                                            <span className="uppercase">{tx.company.name}</span> &bull; <span>{tx.category}</span>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${tx.type === 'INFLOW' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {tx.type === 'INFLOW' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary Footer */}
                    {(selectedDay?.inflow || 0) > 0 || (selectedDay?.outflow || 0) > 0 ? (
                        <div className="bg-zinc-50 p-3 rounded-lg flex justify-between text-sm">
                            <div className="text-emerald-600 font-bold">Total In: {formatCurrency(selectedDay?.inflow || 0)}</div>
                            <div className="text-red-600 font-bold">Total Out: {formatCurrency(selectedDay?.outflow || 0)}</div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
