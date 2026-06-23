"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import { getUserValuations } from "@/app/actions/valuation"
import { UserValuationHistory, ValuationHistory } from "@/components/dashboard/valuation-history"

export default function ReportsPage() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [selectedReport, setSelectedReport] = useState("")
    const [showReports, setShowReports] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [allValuations, setAllValuations] = useState<any[]>([])
    const [filteredValuations, setFilteredValuations] = useState<any[]>([])

    useEffect(() => {
        async function fetchVals() {
            try {
                const data = await getUserValuations()
                // Only show completed reports (defaulting undefined to Completed)
                const completed = data.filter((v: any) => (v.status || "Completed") === "Completed")
                setAllValuations(completed)
            } catch (e) {
                console.error("Failed to load valuations:", e)
            }
        }
        fetchVals()
    }, [])

    const handleShowReports = () => {
        if (!fromDate || !toDate || (isAdmin && !selectedReport)) return
        setIsLoading(true)
        setShowReports(false)

        setTimeout(() => {
            const start = new Date(fromDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(toDate)
            end.setHours(23, 59, 59, 999)

            const filtered = allValuations.filter(v => {
                const d = new Date(v.createdAt)
                return d >= start && d <= end
            })

            setFilteredValuations(filtered)
            setShowReports(true)
            setIsLoading(false)
        }, 600)
    }

    const reportTypes = [
        "Profit & Loss Statement",
        "Balance Sheet",
        "Cash Flow Statement",
        "GST Filling Report",
        "Vendor Payment Summary",
        "Sales Performance",
        "Expense Analysis",
        "Valuation Report"
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-zinc-500 mt-2">Generate and view completed financial reports for specific time periods.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-end gap-6">
                    {isAdmin && (
                        <div className="w-full md:w-[250px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
                            <Select value={selectedReport} onValueChange={setSelectedReport}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Select Report" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reportTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="w-full md:w-auto">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="pl-10 w-full md:w-[200px]"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="pl-10 w-full md:w-[200px]"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleShowReports}
                        disabled={!fromDate || !toDate || (isAdmin && !selectedReport) || isLoading}
                        className="bg-brand-red hover:bg-[#8e161c] text-white w-full md:w-auto"
                    >
                        {isLoading ? "Generating..." : "Show Reports"}
                    </Button>
                </div>
            </div>

            {/* Results */}
            {showReports && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isAdmin ? (
                        <ValuationHistory valuations={filteredValuations} />
                    ) : (
                        <UserValuationHistory valuations={filteredValuations} />
                    )}
                </div>
            )}
        </div>
    )
}
