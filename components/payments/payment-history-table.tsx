"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/logic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { markPaymentAsRefunded } from "@/app/actions/payments";
import { RefreshCcw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Calendar as CalendarIcon, TrendingUp, CreditCard, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type DateRange = "today" | "yesterday" | "last3days" | "lastweek" | "lastmonth" | "last3months" | "custom" | "all";

export function PaymentHistoryTable({ transactions, isAdmin }: { transactions: any[], isAdmin: boolean }) {
    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Data Table States
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10); // 10, 20, or Infinity (All)

    // Advanced Filtering States
    const [dateRange, setDateRange] = useState<DateRange>("all");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const { toast } = useToast();
    const router = useRouter();

    // 1. Filter Data based on Search AND Date Range
    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        // Apply Date Range Filter
        if (dateRange !== "all") {
            const now = new Date();
            let startDate = new Date();
            let endDate = new Date();

            now.setHours(0, 0, 0, 0); // start of today

            if (dateRange === "today") {
                startDate = new Date(now);
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1);
            } else if (dateRange === "yesterday") {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                endDate = new Date(now.getTime() - 1);
            } else if (dateRange === "last3days") {
                startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1);
            } else if (dateRange === "lastweek") {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1);
            } else if (dateRange === "lastmonth") {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1);
            } else if (dateRange === "last3months") {
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1);
            } else if (dateRange === "custom") {
                if (customFrom) {
                    startDate = new Date(customFrom);
                    startDate.setHours(0, 0, 0, 0);
                } else {
                    startDate = new Date(0); // Very old date if not set
                }
                
                if (customTo) {
                    endDate = new Date(customTo);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    endDate = new Date(); // today if not set
                }
            }

            filtered = filtered.filter(t => {
                const txDate = new Date(t.createdAt);
                return txDate >= startDate && txDate <= endDate;
            });
        }

        // Apply Text Search Filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                t.razorpayPaymentId.toLowerCase().includes(lowerQuery) ||
                (t.order.userEmail && t.order.userEmail.toLowerCase().includes(lowerQuery)) ||
                (t.paymentMethod && t.paymentMethod.toLowerCase().includes(lowerQuery))
            );
        }

        return filtered;
    }, [transactions, searchQuery, dateRange, customFrom, customTo]);

    // Calculate Summaries for the Cards based on the FILTERED data
    const summary = useMemo(() => {
        let totalSuccessCount = 0;
        let totalRevenue = 0;
        let refundCount = 0;
        let refundAmount = 0;

        filteredTransactions.forEach(t => {
            if (t.status === "success") {
                totalSuccessCount++;
                totalRevenue += Number(t.amount);

                if (t.isRefunded) {
                    refundCount++;
                    refundAmount += Number(t.amount);
                }
            }
        });

        const netRevenue = totalRevenue - refundAmount;

        return {
            totalSuccessCount,
            totalRevenue,
            netRevenue,
            refundCount,
            refundAmount
        };
    }, [filteredTransactions]);


    // 2. Pagination Math
    const totalPages = pageSize === Infinity ? 1 : Math.ceil(filteredTransactions.length / pageSize);
    const currentData = useMemo(() => {
        if (pageSize === Infinity) return filteredTransactions;
        const startIndex = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(startIndex, startIndex + pageSize);
    }, [filteredTransactions, currentPage, pageSize]);

    // Reset to page 1 if filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, pageSize, dateRange, customFrom, customTo]);

    const handleRefundSubmit = async () => {
        if (!selectedTransactionId || !refundReason.trim()) {
            toast({ title: "Error", description: "Refund reason is required.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        const res = await markPaymentAsRefunded(selectedTransactionId, refundReason);
        setIsProcessing(false);

        if (res.success) {
            toast({ title: "Success", description: "Payment marked as refunded." });
            setIsRefundDialogOpen(false);
            setRefundReason("");
            setSelectedTransactionId(null);
            router.refresh(); 
        } else {
            toast({ title: "Error", description: res.error || "Failed to mark refund.", variant: "destructive" });
        }
    };

    // Excel Export Function
    const exportToExcel = () => {
        if (filteredTransactions.length === 0) {
            toast({ title: "No Data", description: "There is no data to export.", variant: "destructive" });
            return;
        }

        const exportData = filteredTransactions.map((t, index) => {
            const dateObj = new Date(t.createdAt);
            return {
                "Sl No": index + 1,
                "Date": dateObj.toLocaleDateString('en-IN'),
                "Time": dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                "Payment ID (Ref)": t.razorpayPaymentId,
                "User Email": t.order.userEmail || "N/A",
                "Payment Method": t.paymentMethod ? t.paymentMethod.toUpperCase() : "UNKNOWN",
                "Amount (INR)": Number(t.amount),
                "Status": t.isRefunded ? "Refunded" : t.status === "success" ? "Success" : "Failed",
                "Refund Date": t.refundedAt ? new Date(t.refundedAt).toLocaleDateString('en-IN') : "N/A",
                "Refund Reason": t.refundReason || "N/A"
            };
        });

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");

        // Auto-size columns based on content
        const maxWidths = exportData.reduce((acc: any, row) => {
            Object.keys(row).forEach((key) => {
                const val = row[key as keyof typeof row] ? row[key as keyof typeof row].toString() : "";
                acc[key] = Math.max(acc[key] || key.length, val.length);
            });
            return acc;
        }, {});

        worksheet["!cols"] = Object.keys(maxWidths).map((key) => ({
            wch: Math.min(50, maxWidths[key] + 2) // Cap at 50 width
        }));

        // Trigger Download
        XLSX.writeFile(workbook, `Payment_History_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast({ title: "Export Successful", description: "The Excel file has been downloaded." });
    };

    return (
        <div className="space-y-6">
            {/* Header Summary Cards (Admin Only) */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Transactions */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
                            <h3 className="text-2xl font-bold text-gray-900">{summary.totalSuccessCount}</h3>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Net Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">₹{summary.netRevenue.toLocaleString('en-IN')}</h3>
                            <p className="text-xs text-gray-400 mt-1">Gross: ₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Plan Split */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                        <p className="text-sm text-gray-500 font-medium mb-2">Plan Split</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">Express Plan</span>
                            <span className="font-bold text-gray-900">{summary.totalSuccessCount}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div className="bg-brand-red h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {/* Refunds */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Refunds</p>
                            <h3 className="text-2xl font-bold text-gray-900">{summary.refundCount}</h3>
                            <p className="text-xs text-orange-600 font-medium mt-1">-₹{summary.refundAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                
                {/* Advanced Filters Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        
                        {/* Search and Date Range */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Search by Ref ID or Email..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <select 
                                    className="border border-gray-200 rounded-md p-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-red/20 w-full sm:w-auto"
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="last3days">Last 3 Days</option>
                                    <option value="lastweek">Last Week</option>
                                    <option value="lastmonth">Last Month</option>
                                    <option value="last3months">Last 3 Months</option>
                                    <option value="custom">Custom Date...</option>
                                </select>
                            </div>
                        </div>

                        {/* Export and Show Rows */}
                        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                            {isAdmin && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-800"
                                    onClick={exportToExcel}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Export Excel
                                </Button>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Label htmlFor="pageSize" className="text-gray-500 font-medium">Show:</Label>
                                <select 
                                    id="pageSize"
                                    className="border border-gray-200 rounded-md p-1.5 bg-white outline-none focus:ring-2 focus:ring-brand-red/20"
                                    value={pageSize === Infinity ? "all" : pageSize}
                                    onChange={(e) => setPageSize(e.target.value === "all" ? Infinity : Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Custom Date Picker Fields (Only visible if Custom Date is selected) */}
                    {dateRange === "custom" && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200/60 mt-1 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-500">From:</Label>
                                <Input 
                                    type="date" 
                                    className="h-8 text-sm bg-white" 
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-500">To:</Label>
                                <Input 
                                    type="date" 
                                    className="h-8 text-sm bg-white" 
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                />
                            </div>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-8"
                                onClick={() => setCurrentPage(1)} // Just forces a re-render/reset
                            >
                                Apply
                            </Button>
                        </div>
                    )}
                </div>

                {/* Table wrapper */}
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-16">Sl No</th>
                                <th className="px-6 py-4 min-w-[160px]">Date & Time</th>
                                <th className="px-6 py-4">Payment ID (Ref)</th>
                                {isAdmin && <th className="px-6 py-4">User Email</th>}
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 8 : 6} className="px-6 py-12 text-center text-gray-500 italic">
                                        {searchQuery || dateRange !== 'all' ? "No matching records found for these filters." : "No payment history found."}
                                    </td>
                                </tr>
                            ) : currentData.map((t, index) => {
                                // Calculate actual serial number based on pagination
                                const slNo = pageSize === Infinity ? index + 1 : ((currentPage - 1) * pageSize) + index + 1;
                                
                                const dateObj = new Date(t.createdAt);
                                const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 text-gray-400 font-medium">{slNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{formattedDate}</div>
                                            <div className="text-xs text-gray-500">{formattedTime}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                            {t.razorpayPaymentId}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-gray-600">
                                                {t.order.userEmail}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 capitalize">
                                                {t.paymentMethod || "Unknown"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ₹{t.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            {t.isRefunded ? (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Refunded</Badge>
                                            ) : t.status === "success" ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                {!t.isRefunded && t.status === "success" && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 h-8 px-3"
                                                        onClick={() => {
                                                            setSelectedTransactionId(t.id);
                                                            setIsRefundDialogOpen(true);
                                                        }}
                                                    >
                                                        <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Refund
                                                    </Button>
                                                )}
                                                {t.isRefunded && (
                                                    <span className="text-xs text-gray-400 italic block" title={t.refundReason}>
                                                        {new Date(t.refundedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pageSize !== Infinity && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div className="text-xs text-gray-500 font-medium">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} entries
                        </div>
                        <div className="flex items-center gap-1">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="w-8 h-8 rounded-md" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                title="First Page"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="w-8 h-8 rounded-md" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            <div className="px-3 text-sm font-medium text-gray-700">
                                {currentPage} / {totalPages}
                            </div>

                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="w-8 h-8 rounded-md" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="w-8 h-8 rounded-md" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                title="Last Page"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Refund Dialog */}
                <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mark Payment as Refunded</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-gray-500">
                                This action will record that you have processed a refund through the Razorpay Dashboard. 
                                <strong> Note: This does not trigger an actual money transfer. It only updates our records.</strong>
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Refund</Label>
                                <Input 
                                    id="reason" 
                                    placeholder="e.g., User requested cancellation, accidental charge" 
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleRefundSubmit} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isProcessing}>
                                {isProcessing ? "Saving..." : "Confirm Refund"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
