"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Calendar, FileSpreadsheet } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export default function ReportsPage() {
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [selectedReport, setSelectedReport] = useState("")
    const [showReports, setShowReports] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [reportData, setReportData] = useState<any[]>([])

    // Mock Data Generators
    const generateMockData = (type: string) => {
        const baseData = [
            { id: 101, date: "2024-02-15", status: "Ready" },
            { id: 102, date: "2024-02-14", status: "Ready" },
            { id: 103, date: "2024-02-10", status: "Processing" },
            { id: 104, date: "2024-02-01", status: "Ready" },
            { id: 105, date: "2024-01-28", status: "Archived" },
        ]

        return baseData.map(item => ({
            ...item,
            name: `${type} - ${item.date}`,
            type: selectedReport || "General"
        }))
    }

    const handleShowReports = () => {
        if (!fromDate || !toDate || !selectedReport) return
        setIsLoading(true)
        setShowReports(false)

        // Simulate API call
        setTimeout(() => {
            setReportData(generateMockData(selectedReport))
            setShowReports(true)
            setIsLoading(false)
        }, 800)
    }

    // Download Handlers
    const downloadPDF = () => {
        const doc = new jsPDF()
        doc.text(`${selectedReport} - Generated Reports`, 14, 10)

        autoTable(doc, {
            startY: 20,
            head: [['ID', 'Report Name', 'Date', 'Type', 'Status']],
            body: reportData.map(r => [r.id, r.name, r.date, r.type, r.status]),
        })

        doc.save(`${selectedReport.replace(/\s+/g, '_')}_Reports.pdf`)
    }

    const downloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.map(r => ({
            ID: r.id,
            "Report Name": r.name,
            Date: r.date,
            Type: r.type,
            Status: r.status
        })))
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Reports")
        XLSX.writeFile(wb, `${selectedReport.replace(/\s+/g, '_')}_Reports.xlsx`)
    }

    const reportTypes = [
        "Profit & Loss Statement",
        "Balance Sheet",
        "Cash Flow Statement",
        "GST Filling Report",
        "Vendor Payment Summary",
        "Sales Performance",
        "Expense Analysis"
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-zinc-500 mt-2">Generate and view financial reports for specific time periods.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-end gap-6">
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
                        disabled={!fromDate || !toDate || !selectedReport || isLoading}
                        className="bg-brand-red hover:bg-[#8e161c] text-white w-full md:w-auto"
                    >
                        {isLoading ? "Generating..." : "Show Reports"}
                    </Button>
                </div>
            </div>

            {/* Actions */}
            {showReports && reportData.length > 0 && (
                <div className="flex justify-end gap-3 fade-in slide-in-from-bottom-2 duration-500 animate-in">
                    <Button variant="outline" onClick={downloadPDF} className="gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={downloadExcel} className="gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Export Excel
                    </Button>
                </div>
            )}

            {/* Results */}
            {showReports && (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Report Name</TableHead>
                                <TableHead>Date Generated</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">#{report.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-900">{report.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {report.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'Ready'
                                            ? 'bg-green-100 text-green-800'
                                            : report.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {report.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
