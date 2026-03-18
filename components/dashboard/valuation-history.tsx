"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Download, FileText, Clock, CheckCircle2, AlertCircle, ChevronRight, Eye } from "lucide-react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

// Helper for consistent date formatting
const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Mock Data
const VALUATION_HISTORY = [
    {
        id: "VAL-2026-001",
        date: "2026-01-20",
        companyName: "Acme Innovations Pvt Ltd",
        tier: "Instant",
        status: "Completed",
        amount: 499,
        downloadUrl: "#"
    },
    {
        id: "VAL-2026-002",
        date: "2026-02-10",
        companyName: "Beta Sol Corp",
        tier: "Standard",
        status: "Processing",
        amount: 4999,
        downloadUrl: null
    },
    {
        id: "VAL-2026-003",
        date: "2026-02-12",
        companyName: "Gamma Retailers",
        tier: "Certified",
        status: "Analyst Review",
        amount: 14999,
        downloadUrl: null
    }
]

export function ValuationHistory() {
    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-zinc-900">Valuation History</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filter by Date</Button>
                    <Button variant="outline" size="sm">Filter by Status</Button>
                </div>
            </div>
            <Table>
                <TableHeader className="bg-zinc-50/50">
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {VALUATION_HISTORY.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-zinc-50/50">
                            <TableCell className="font-medium text-zinc-600">
                                {formatDate(item.date)}
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-zinc-900">{item.companyName}</span>
                                <div className="text-xs text-zinc-500">{item.id}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal">
                                    {item.tier}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={item.status} />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <RequestDetailSheet valuation={item} />
                                    {item.status === 'Completed' && (
                                        <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-brand-red">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Completed') {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
    }
    if (status === 'Processing') {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>
    }
    if (status === 'Analyst Review') {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 shadow-none"><FileText className="w-3 h-3 mr-1" /> Analyst Review</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
}

function RequestDetailSheet({ valuation }: { valuation: any }) {
    // Determine progress step
    const steps = ["Uploaded", "Processing", "Analyst Review", "Completed"];
    let currentStepIndex = 1;
    if (valuation.status === 'Analyst Review') currentStepIndex = 2;
    if (valuation.status === 'Completed') currentStepIndex = 3;

    // Calculate estimated date safely using timestamps to avoid Date mutation issues
    const estimatedDate = new Date(new Date(valuation.date).getTime() + (2 * 24 * 60 * 60 * 1000));

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    View Details
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">Request Details</SheetTitle>
                    <SheetDescription>
                        Track the status of your valuation request.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Status Tracker */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-zinc-900">Status Tracker</h4>
                        <div className="relative pl-4 border-l-2 border-zinc-100 space-y-8">
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-brand-red border-brand-red' : 'bg-white border-zinc-300'}`} />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>{step}</span>
                                            {isCurrent && (
                                                <span className="text-xs text-brand-red font-medium animate-pulse">In Progress</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-3 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                        <h4 className="font-semibold text-sm text-zinc-900 mb-2">Company Information</h4>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-zinc-500">Company Name</span>
                            <span className="font-medium text-right">{valuation.companyName}</span>

                            <span className="text-zinc-500">Request ID</span>
                            <span className="font-medium text-right">{valuation.id}</span>

                            <span className="text-zinc-500">Date Submitted</span>
                            <span className="font-medium text-right">{formatDate(valuation.date)}</span>

                            <span className="text-zinc-500">Service Tier</span>
                            <span className="font-medium text-right">{valuation.tier}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    {valuation.status === 'Completed' ? (
                        <div className="space-y-3">
                            <Button className="w-full bg-brand-red hover:bg-red-700 text-white gap-2">
                                <Download className="w-4 h-4" /> Download Report (PDF)
                            </Button>
                            <p className="text-xs text-center text-zinc-400">Generated on {formatDate(valuation.date)}</p>
                        </div>
                    ) : (
                        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3 items-start">
                            <Clock className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-semibold mb-1">Estimated Completion</p>
                                <p>Your report is expected to be ready by {formatDate(estimatedDate)}.</p>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div className="pt-6 border-t border-zinc-100 text-center">
                        <p className="text-sm text-zinc-500 mb-2">Need help with this request?</p>
                        <Button variant="link" className="text-brand-red h-auto p-0">Contact Support</Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
