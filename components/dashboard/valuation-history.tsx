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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, Clock, CheckCircle2, ChevronRight, ChevronDown, Eye, Search, ChevronsLeft, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronsRight, PlusCircle, Building2, MapPin, Receipt, Sparkles, TrendingUp, Calendar, Users, RefreshCw, AlertCircle, ArrowUpRight, DollarSign, Info, Calculator } from "lucide-react"
import React, { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
}

const mapValuationToRow = (val: any) => {
    return {
        id: val.id,
        date: val.createdAt,
        companyName: val.companyName,
        industry: val.industry,
        userName: val.userEmail || "Client",
        phone: val.phone || "N/A",
        tier: (val.purpose === "Preliminary Estimate" || val.purpose === "Express") ? "Express" : "Certified",
        status: val.status || "Completed",
        amount: (val.purpose === "Preliminary Estimate" || val.purpose === "Express") ? 499 : 14999,
        revenue: Number(val.revenue || 0),
        profit: Number(val.ebitda || 0),
        pat: Number(val.pat || 0),
        totalAssets: Number(val.totalAssets || 0),
        totalLiabilities: Number(val.totalLiabilities || 0),
        legalStructure: val.legalStructure || "Private Limited",
        incorporationDate: val.incorporationDate,
        addressLine1: val.addressLine1,
        city: val.city,
        state: val.state,
        pincode: val.pincode,
        pan: val.pan,
        gstNo: val.gstNo,
        cin: val.cin,
        numberOfEmployees: val.numberOfEmployees,
        yearsInOperation: val.yearsInOperation || 1,
        estimatedValue: Number(val.estimatedValue || 0),
        downloadUrl: `/report/${val.id}`
    };
};

// Augmented Mock Data for Admin
export const VALUATION_HISTORY = [
    { id: "VAL-2026-001", date: "2026-01-20", companyName: "Acme Innovations Pvt Ltd", industry: "Technology", userName: "Raj Kumar", phone: "+91 9876543210", tier: "Instant", status: "Completed", amount: 499, revenue: 50000000, profit: 15000000, downloadUrl: "#" },
    { id: "VAL-2026-002", date: "2026-02-10", companyName: "Beta Sol Corp", industry: "Technology", userName: "Raj Kumar", phone: "+91 9876543210", tier: "Standard", status: "Processing", amount: 4999, revenue: 80000000, profit: 25000000, downloadUrl: null },
    { id: "VAL-2026-003", date: "2026-02-12", companyName: "Gamma Retailers", industry: "Retail", userName: "Anita Sharma", phone: "+91 9988776655", tier: "Certified", status: "Analyst Review", amount: 14999, revenue: 120000000, profit: 9000000, downloadUrl: null },
    { id: "VAL-2026-004", date: "2026-02-13", companyName: "Delta Logistics", industry: "Logistics", userName: "Vikram Singh", phone: "+91 9123456789", tier: "Instant", status: "Completed", amount: 499, revenue: 300000000, profit: 45000000, downloadUrl: "#" },
    { id: "VAL-2026-005", date: "2026-02-14", companyName: "Epsilon Tech", industry: "Technology", userName: "Pooja Patel", phone: "+91 9871234560", tier: "Standard", status: "Processing", amount: 4999, revenue: 45000000, profit: 12000000, downloadUrl: null },
    { id: "VAL-2026-006", date: "2026-02-15", companyName: "Zeta Foods", industry: "FMCG", userName: "Arun Verma", phone: "+91 9988112233", tier: "Certified", status: "Analyst Review", amount: 14999, revenue: 90000000, profit: 18000000, downloadUrl: null },
    { id: "VAL-2026-007", date: "2026-02-16", companyName: "Eta Ventures", industry: "Finance", userName: "Sunil Das", phone: "+91 9898989898", tier: "Instant", status: "Completed", amount: 499, revenue: 150000000, profit: 60000000, downloadUrl: "#" },
    { id: "VAL-2026-008", date: "2026-02-17", companyName: "Theta Enterprises", industry: "Retail", userName: "Kiran Rao", phone: "+91 8877665544", tier: "Standard", status: "Processing", amount: 4999, revenue: 60000000, profit: 8000000, downloadUrl: null },
    { id: "VAL-2026-009", date: "2026-02-18", companyName: "Iota Manufacturing", industry: "Manufacturing", userName: "Deepak Choudhary", phone: "+91 7766554433", tier: "Certified", status: "Analyst Review", amount: 14999, revenue: 500000000, profit: 40000000, downloadUrl: null },
    { id: "VAL-2026-010", date: "2026-02-19", companyName: "Kappa Solutions", industry: "Technology", userName: "Ramesh Iyer", phone: "+91 9192939495", tier: "Instant", status: "Completed", amount: 499, revenue: 20000000, profit: 5000000, downloadUrl: "#" },
    { id: "VAL-2026-011", date: "2026-02-20", companyName: "Lambda Soft", industry: "Technology", userName: "Neha Gupta", phone: "+91 9000000000", tier: "Standard", status: "Processing", amount: 4999, revenue: 35000000, profit: 10000000, downloadUrl: null },
    { id: "VAL-2026-012", date: "2026-02-21", companyName: "Mu Holdings", industry: "Finance", userName: "Suresh Menon", phone: "+91 8181818181", tier: "Certified", status: "Analyst Review", amount: 14999, revenue: 250000000, profit: 75000000, downloadUrl: null },
];

export function AdminKPICards({ valuations }: { valuations?: any[] }) {
    const stats = useMemo(() => {
        const source = valuations && valuations.length > 0 
            ? valuations.map(mapValuationToRow)
            : [...VALUATION_HISTORY];

        const totalValuations = source.length;
        const totalIndustries = new Set(source.map(v => v.industry)).size;
        const totalRevenue = source.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalProfit = source.reduce((acc, curr) => acc + curr.profit, 0);

        return { totalValuations, totalIndustries, totalRevenue, totalProfit };
    }, [valuations]);

    const cards = [
        { label: "Total Valuations", value: stats.totalValuations, tagline: "Generated Reports", bg: "from-blue-50/70 to-white hover:border-blue-200" },
        { label: "Total Industries", value: stats.totalIndustries, tagline: "Sectors Covered", bg: "from-emerald-50/70 to-white hover:border-emerald-200" },
        { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), tagline: "Handled Volume", bg: "from-amber-50/70 to-white hover:border-amber-200" },
        { label: "Total Profit", value: formatCurrency(stats.totalProfit), tagline: "Aggregate Profits", bg: "from-brand-red/5 to-white hover:border-red-200" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    className={`bg-gradient-to-br ${card.bg} rounded-2xl border border-zinc-200 shadow-sm p-6 text-center flex flex-col justify-center cursor-default transition-all hover:shadow-md`}
                >
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">{card.label}</h3>
                    <p className="text-3xl font-extrabold text-zinc-900 mb-1">{card.value}</p>
                    <p className="text-xs text-brand-red font-medium">{card.tagline}</p>
                </motion.div>
            ))}
        </div>
    );
}


export function ValuationHistory({ valuations }: { valuations?: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Grouping by Industry
    const groupedData = useMemo(() => {
        let result = valuations && valuations.length > 0 
            ? valuations.map(mapValuationToRow)
            : [...VALUATION_HISTORY];

        // Search across Industry or Company Name
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.industry.toLowerCase().includes(lowerQuery) || 
                item.companyName.toLowerCase().includes(lowerQuery)
            );
        }

        const groups: Record<string, any[]> = {};
        result.forEach(val => {
            if (!groups[val.industry]) groups[val.industry] = [];
            groups[val.industry].push(val);
        });

        // Convert Object into sorted Industry Parent rows
        return Object.keys(groups).sort().map(ind => ({
            industry: ind,
            children: groups[ind].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), // Latest desc inside child
            count: groups[ind].length,
            totalRevenue: groups[ind].reduce((sum, v) => sum + v.revenue, 0),
            totalProfit: groups[ind].reduce((sum, v) => sum + v.profit, 0),
        }));

    }, [searchTerm, valuations]);

    // Pagination purely on Parent Rows
    const totalPages = itemsPerPage === 'all' ? 1 : Math.max(1, Math.ceil(groupedData.length / itemsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);

    const paginatedParents = useMemo(() => {
        if (itemsPerPage === 'all') return groupedData;
        const start = (currentPage - 1) * itemsPerPage;
        return groupedData.slice(start, start + itemsPerPage);
    }, [groupedData, currentPage, itemsPerPage]);

    const toggleRow = (ind: string) => {
        setExpandedRows(prev => ({ ...prev, [ind]: !prev[ind] }));
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-semibold text-zinc-900 w-full sm:w-auto">Valuation History By Industry</h2>
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search Industry or Company..."
                            className="pl-9 pr-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                        setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Display" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 / pg</SelectItem>
                            <SelectItem value="20">20 / pg</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                            <TableHead className="w-16">Sl No</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead className="text-center">No of Valuations</TableHead>
                            <TableHead className="text-right">Total Revenue</TableHead>
                            <TableHead className="text-right">Total Profit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedParents.length > 0 ? paginatedParents.map((parent, idx) => {
                            const slNo = itemsPerPage === 'all' ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1;
                            const isExpanded = expandedRows[parent.industry];

                            return (
                                <React.Fragment key={parent.industry}>
                                    {/* Parent Row */}
                                    <TableRow 
                                        className="group hover:bg-zinc-100/50 cursor-pointer transition-colors"
                                        onClick={() => toggleRow(parent.industry)}
                                    >
                                        <TableCell className="text-zinc-500 font-medium">
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-brand-red" /> : <ChevronRight className="w-4 h-4" />}
                                                {slNo}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-zinc-900">
                                            {parent.industry}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 font-bold">{parent.count}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-zinc-700">
                                            {formatCurrency(parent.totalRevenue)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-emerald-600">
                                            {formatCurrency(parent.totalProfit)}
                                        </TableCell>
                                    </TableRow>

                                    {/* Child Rows (Sub-Table Layout) */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                           <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                                                <TableCell colSpan={5} className="p-0 border-b-2 border-zinc-200">
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden border-l-4 border-brand-red"
                                                    >
                                                        <div className="p-4 pl-6">
                                                            <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 ml-2 tracking-wider">Valuations under {parent.industry}</h4>
                                                            <Table className="bg-white rounded-lg shadow-sm overflow-hidden border border-zinc-200">
                                                                <TableHeader className="bg-zinc-100/80">
                                                                    <TableRow>
                                                                        <TableHead className="w-12 text-xs">Sl</TableHead>
                                                                        <TableHead className="text-xs">Date</TableHead>
                                                                        <TableHead className="text-xs">Company Name</TableHead>
                                                                        <TableHead className="text-xs">User / Phone</TableHead>
                                                                        <TableHead className="text-xs">Tier</TableHead>
                                                                        <TableHead className="text-xs">Status</TableHead>
                                                                        <TableHead className="text-right text-xs">Revenue / Profit</TableHead>
                                                                        <TableHead className="text-center text-xs w-32">Action</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {parent.children.map((child: any, cIdx: number) => (
                                                                        <TableRow key={child.id} className="hover:bg-zinc-50">
                                                                            <TableCell className="text-xs text-zinc-500 font-medium">{cIdx + 1}</TableCell>
                                                                            <TableCell className="text-xs font-medium text-zinc-700 whitespace-nowrap">{formatDate(child.date)}</TableCell>
                                                                            <TableCell>
                                                                                <span className="font-semibold text-zinc-900 text-sm block">{child.companyName}</span>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <span className="text-sm font-medium text-zinc-800 block">{child.userName}</span>
                                                                                <span className="text-xs text-zinc-500">{child.phone}</span>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Badge variant="outline" className="text-[10px] font-normal uppercase">{child.tier}</Badge>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <StatusBadge status={child.status} />
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                <span className="text-sm text-zinc-700 block font-medium group-hover:text-zinc-900">{formatCurrency(child.revenue)}</span>
                                                                                <span className="text-xs text-emerald-600 font-medium">{formatCurrency(child.profit)}</span>
                                                                            </TableCell>
                                                                            <TableCell className="text-center">
                                                                                <div className="flex items-center justify-center gap-2">
                                                                                    {child.status === 'Completed' && (
                                                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-brand-red" asChild>
                                                                                            <a href={child.downloadUrl || "#"} target="_blank" rel="noopener noreferrer" title="View Report">
                                                                                                <Download className="w-4 h-4" />
                                                                                            </a>
                                                                                        </Button>
                                                                                    )}
                                                                                    <RequestDetailSheet valuation={child} />
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </motion.div>
                                                </TableCell>
                                           </TableRow>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No records found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination Controls */}
            <div className="border-t p-4 flex items-center justify-between text-sm text-zinc-500 bg-zinc-50 border-zinc-100">
                <div>
                    Showing {groupedData.length === 0 ? 0 : (itemsPerPage === 'all' ? 1 : (currentPage - 1) * itemsPerPage + 1)} to {itemsPerPage === 'all' ? groupedData.length : Math.min(currentPage * itemsPerPage, groupedData.length)} of {groupedData.length} records
                </div>
                {itemsPerPage !== 'all' && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-3 font-medium text-zinc-900 border border-zinc-200 h-8 rounded-md flex items-center bg-white shadow-sm">
                            {currentPage} / {totalPages}
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export function UserValuationHistory({ valuations, isDashboard = false }: { valuations?: any[], isDashboard?: boolean }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(isDashboard ? 'all' : 10);

    const sourceData = useMemo(() => {
        if (!valuations) return [];
        return valuations.map(mapValuationToRow);
    }, [valuations]);

    const filteredData = useMemo(() => {
        let data = sourceData;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                item.companyName.toLowerCase().includes(lowerSearch) ||
                item.id.toLowerCase().includes(lowerSearch)
            );
        }
        if (isDashboard) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            return data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            }).slice(0, 5);
        }
        return data;
    }, [sourceData, searchTerm, isDashboard]);

    const totalPages = itemsPerPage === 'all' ? 1 : Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);

    const paginatedData = useMemo(() => {
        if (itemsPerPage === 'all') return filteredData;
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    if (isDashboard && valuations && valuations.length === 0 && !searchTerm) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-red-50/50 via-white to-zinc-50 border border-red-100 rounded-2xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center space-y-6"
            >
                {/* Visual decorative accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl" />

                <div className="p-4 bg-red-50 text-brand-red rounded-full border border-red-100 shadow-inner">
                    <FileText className="w-12 h-12" />
                </div>

                <div className="max-w-md space-y-2">
                    <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                        Welcome to My Dashboard!
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        It looks like you haven't created any valuation requests yet. Generate your first report to get started.
                    </p>
                </div>

                <Link href="/dashboard/new">
                    <Button className="bg-brand-red hover:bg-red-700 text-white font-bold px-8 py-6 text-base rounded-xl shadow-lg shadow-red-900/10 transition-transform active:scale-95">
                        <PlusCircle className="mr-2 h-5 w-5" /> Generate First Report
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <h2 className="text-lg font-semibold text-zinc-900">My Valuations</h2>
                    {isDashboard && (
                        <span className="text-xs font-medium bg-zinc-100 text-zinc-500 px-2 py-1 rounded-md">
                            Showing last 5 reports generated in {new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                    )}
                </div>
                {!isDashboard && (
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Search Company..."
                                className="pl-9 pr-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={itemsPerPage.toString()} onValueChange={(val) => {
                            setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Display" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / pg</SelectItem>
                                <SelectItem value="20">20 / pg</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto w-full">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                            <TableHead className="w-16">Sl No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? paginatedData.map((item, idx) => {
                            const slNo = itemsPerPage === 'all' ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1;
                            return (
                                <TableRow key={item.id} className="hover:bg-zinc-50 transition-colors">
                                    <TableCell className="text-zinc-500 font-medium">{slNo}</TableCell>
                                    <TableCell className="whitespace-nowrap font-medium text-zinc-700">{formatDate(item.date)}</TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-zinc-900 block">{item.companyName}</span>
                                    </TableCell>
                                    <TableCell className="text-zinc-600">{item.industry}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-normal uppercase">{item.tier}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {item.status === 'Completed' && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-brand-red" asChild>
                                                    <a href={item.downloadUrl || "#"} target="_blank" rel="noopener noreferrer" title="View Report">
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <RequestDetailSheet valuation={item} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                    No records found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination Controls */}
            {!isDashboard && (
                <div className="border-t p-4 flex items-center justify-between text-sm text-zinc-500 bg-zinc-50 border-zinc-100">
                    <div>
                        Showing {filteredData.length === 0 ? 0 : (itemsPerPage === 'all' ? 1 : (currentPage - 1) * itemsPerPage + 1)} to {itemsPerPage === 'all' ? filteredData.length : Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
                    </div>
                    {itemsPerPage !== 'all' && (
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-3 font-medium text-zinc-900 border border-zinc-200 h-8 rounded-md flex items-center bg-white shadow-sm">
                                {currentPage} / {totalPages}
                            </div>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
            
            {/* Dashboard Footer Label */}
            {isDashboard && valuations && valuations.length > filteredData.length && (
                <div className="border-t p-4 flex items-center justify-center text-sm text-zinc-500 bg-zinc-50/50 border-zinc-100">
                    <p>For older reports get from <Link href="/dashboard/reports" className="text-brand-red font-semibold hover:underline">Reports section</Link></p>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Completed') {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none text-[10px] uppercase font-bold tracking-wide py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
    }
    if (status === 'Processing') {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none text-[10px] uppercase font-bold tracking-wide py-0.5"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>
    }
    if (status === 'Analyst Review') {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 shadow-none text-[10px] uppercase font-bold tracking-wide py-0.5"><FileText className="w-3 h-3 mr-1" /> Review</Badge>
    }
    return <Badge variant="outline" className="text-[10px] uppercase tracking-wide py-0.5">{status}</Badge>
}

// Ensure the RequestDetailSheet relies strictly on the fields we augmented.
function RequestDetailSheet({ valuation }: { valuation: any }) {
    // Determine progress step
    const steps = [
        { label: "Uploaded", icon: FileText, desc: "Valuation request and data submitted" },
        { label: "Processing", icon: RefreshCw, desc: "Algorithmic parsing & ratio models loaded" },
        { label: "Analyst Review", icon: Search, desc: "Expert verification & adjustment factors" },
        { label: "Completed", icon: Sparkles, desc: "Report compiled and ready for download" }
    ];

    let currentStepIndex = 1;
    if (valuation.status === 'Analyst Review') currentStepIndex = 2;
    if (valuation.status === 'Completed') currentStepIndex = 3;

    // Calculate estimated date safely using timestamps
    const estimatedDate = new Date(new Date(valuation.date).getTime() + (2 * 24 * 60 * 60 * 1000));

    // Check optional address/tax details
    const hasAddress = valuation.addressLine1 || valuation.city || valuation.state || valuation.pincode;
    const fullAddress = [valuation.addressLine1, valuation.city, valuation.state, valuation.pincode].filter(Boolean).join(", ");
    
    const hasTaxDetails = valuation.pan || valuation.gstNo || valuation.cin;

    // Framer motion variants for stagger load
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8 shadow-sm border-zinc-200 hover:border-[#a81b21] hover:text-[#a81b21] transition-all" title="View Details">
                    <Eye className="w-4 h-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto w-full border-l border-zinc-150 p-6 bg-zinc-50/50">
                <SheetHeader className="mb-6 relative pb-4 border-b border-zinc-100">
                    <div className="absolute top-0 right-10 flex gap-2">
                        <Badge className={`${
                            valuation.tier === 'Instant' 
                                ? 'bg-red-50 text-[#a81b21] border-red-100 hover:bg-red-50' 
                                : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50'
                        } border shadow-none text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5`}>
                            {valuation.tier} Tier
                        </Badge>
                        <Badge className={`${
                            valuation.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50'
                                : valuation.status === 'Processing'
                                ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50'
                                : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50'
                        } border shadow-none text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5`}>
                            {valuation.status}
                        </Badge>
                    </div>
                    <SheetTitle className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                        Request Details
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500 text-xs mt-1">
                        Comprehensive summary and live progress tracker for your valuation report.
                    </SheetDescription>
                </SheetHeader>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-6 pb-8"
                >
                    {/* Status Tracker */}
                    <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#a81b21]/10" />
                        <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#a81b21]" /> Live Progress Tracker
                        </h4>
                        
                        <div className="relative pl-7 space-y-6">
                            {/* Running timeline track line */}
                            <div className="absolute left-[9px] top-1.5 bottom-1.5 w-0.5 bg-zinc-100 -z-10" />
                            <div className="absolute left-[9px] top-1.5 w-0.5 bg-[#a81b21]/80 transition-all duration-700 -z-10" 
                                 style={{ height: `${(currentStepIndex / (steps.length - 1)) * 90}%` }}
                            />

                            {steps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.label} className="relative group">
                                        {/* Status Marker Node */}
                                        <div className={`absolute -left-[28px] top-0.5 w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 z-10
                                            ${isCompleted 
                                                ? 'bg-[#a81b21] border-[#a81b21] text-white shadow-sm shadow-red-950/20' 
                                                : isCurrent
                                                ? 'bg-white border-[#a81b21] text-[#a81b21] ring-4 ring-red-50'
                                                : 'bg-white border-zinc-200 text-zinc-300'
                                            }`}
                                        >
                                            {isCompleted && index < currentStepIndex ? (
                                                <CheckCircle2 className="w-3 h-3 fill-white text-[#a81b21]" />
                                            ) : (
                                                <StepIcon className={`w-2.5 h-2.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold transition-colors ${
                                                    isCompleted ? 'text-zinc-900' : 'text-zinc-400'
                                                }`}>
                                                    {step.label}
                                                </span>
                                                {isCurrent && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-[#a81b21] animate-pulse uppercase tracking-wide">
                                                        In Progress
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-zinc-400 leading-snug mt-0.5">{step.desc}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* Company Details */}
                    <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
                        <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#a81b21]" /> Company Profile
                        </h4>
                        <div className="divide-y divide-zinc-100 text-sm">
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Company Name</span>
                                <span className="font-bold text-zinc-800 text-right">{valuation.companyName}</span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Legal Structure</span>
                                <span className="font-semibold text-zinc-700 text-right">{valuation.legalStructure}</span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Industry Segment</span>
                                <span className="font-semibold text-zinc-700 text-right">{valuation.industry}</span>
                            </div>
                            {valuation.incorporationDate && (
                                <div className="flex justify-between py-2.5">
                                    <span className="text-zinc-400 font-medium text-xs">Incorporation Date</span>
                                    <span className="font-semibold text-zinc-700 text-right">{formatDate(valuation.incorporationDate)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Years in Operation</span>
                                <span className="font-semibold text-zinc-700 text-right">{valuation.yearsInOperation} Years</span>
                            </div>
                            {valuation.numberOfEmployees !== undefined && valuation.numberOfEmployees !== null && (
                                <div className="flex justify-between py-2.5">
                                    <span className="text-zinc-400 font-medium text-xs">Employee Count</span>
                                    <span className="font-semibold text-zinc-700 text-right">{valuation.numberOfEmployees} Employees</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Request ID</span>
                                <span className="font-mono text-[10px] text-zinc-500 font-semibold bg-zinc-50 border border-zinc-100 rounded px-1.5 py-0.5 break-all select-all">{valuation.id}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statutory & Tax Details (Conditional Rendering) */}
                    {hasTaxDetails && (
                        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
                            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-[#a81b21]" /> Statutory & Tax Information
                            </h4>
                            <div className="divide-y divide-zinc-100 text-sm">
                                {valuation.pan && (
                                    <div className="flex justify-between py-2.5">
                                        <span className="text-zinc-400 font-medium text-xs">PAN Card</span>
                                        <span className="font-mono font-bold text-zinc-800 tracking-wider uppercase">{valuation.pan.toUpperCase()}</span>
                                    </div>
                                )}
                                {valuation.gstNo && (
                                    <div className="flex justify-between py-2.5">
                                        <span className="text-zinc-400 font-medium text-xs">GST Registration</span>
                                        <span className="font-mono font-bold text-zinc-800 tracking-wider uppercase">{valuation.gstNo.toUpperCase()}</span>
                                    </div>
                                )}
                                {valuation.cin && (
                                    <div className="flex justify-between py-2.5">
                                        <span className="text-zinc-400 font-medium text-xs">Corporate Identification (CIN)</span>
                                        <span className="font-mono font-bold text-zinc-800 tracking-wider uppercase">{valuation.cin.toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Registered Office Address (Conditional Rendering) */}
                    {hasAddress && (
                        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
                            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#a81b21]" /> Registered Address
                            </h4>
                            <div className="text-sm font-semibold text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex gap-2">
                                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                                <span>{fullAddress}</span>
                            </div>
                        </motion.div>
                    )}

                     {/* Financial Snapshot */}
                     <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
                        <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[#a81b21]" /> Financial Performance
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3.5 mb-4">
                            <div className="bg-zinc-50/70 border border-zinc-100 rounded-xl p-3">
                                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Annual Revenue</span>
                                <span className="font-black text-sm text-zinc-800">{formatCurrency(valuation.revenue)}</span>
                            </div>
                            <div className="bg-zinc-50/70 border border-zinc-100 rounded-xl p-3">
                                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">EBITDA (Profit)</span>
                                <span className="font-black text-sm text-zinc-800">{formatCurrency(valuation.profit)}</span>
                            </div>
                        </div>

                        <div className="divide-y divide-zinc-100 text-sm">
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Net Profit (PAT)</span>
                                <span className={`font-bold text-right ${valuation.pat >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatCurrency(valuation.pat)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Total Assets</span>
                                <span className="font-semibold text-zinc-700 text-right">{formatCurrency(valuation.totalAssets)}</span>
                            </div>
                            <div className="flex justify-between py-2.5">
                                <span className="text-zinc-400 font-medium text-xs">Total Liabilities</span>
                                <span className="font-semibold text-zinc-700 text-right">{formatCurrency(valuation.totalLiabilities)}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Calculation Metrics */}
                    {valuation.status === 'Completed' && valuation.estimatedValue > 0 && (
                        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
                            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                <Calculator className="w-3.5 h-3.5 text-[#a81b21]" /> Calculation Metrics
                            </h4>
                            
                            <div className="space-y-3 text-xs mt-3">
                                <div className="space-y-1.5 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">Step 1 – Identify Metric</h4>
                                    <div className="flex flex-col gap-1 text-zinc-600 mt-1">
                                        <div className="flex justify-between"><span>Metric Type =</span> <strong>{valuation.profit > 0 ? "EBITDA" : "Revenue"}</strong></div>
                                        <div className="flex justify-between"><span>Metric Value =</span> <strong>{valuation.profit > 0 ? formatCurrency(valuation.profit) : formatCurrency(valuation.revenue)}</strong></div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">Step 2 – Base Multiple</h4>
                                    <div className="flex flex-col gap-1 text-zinc-600 mt-1">
                                        <div className="flex justify-between">
                                            <span>Base Multiple =</span> 
                                            <strong>{valuation.profit > 0 ? "4.00x" : "1.50x"}</strong>
                                        </div>
                                        <span className="text-[9px] text-zinc-400 italic">Derived from Industry: {valuation.industry}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">Step 3 – Calculate Adjustment Factors</h4>
                                    <ul className="list-disc pl-4 text-zinc-500 space-y-0.5 text-[10px] mt-1 mb-2">
                                        <li>Growth Factor (GF)</li>
                                        <li>Margin Factor (MF)</li>
                                        <li>Risk Factor (RF)</li>
                                        <li>Age Factor (AF)</li>
                                    </ul>
                                    <div className="flex justify-between items-center text-zinc-600 pt-1.5 border-t border-zinc-200/60">
                                        <span>Composite Adjustment =</span>
                                        <strong>{valuation.profit > 0 
                                            ? ((valuation.estimatedValue / valuation.profit) / 4.0).toFixed(2)
                                            : valuation.revenue > 0 
                                                ? ((valuation.estimatedValue / valuation.revenue) / 1.5).toFixed(2)
                                                : "0.00"
                                        }</strong>
                                    </div>
                                </div>

                                <div className="space-y-1.5 bg-brand-red/5 border border-brand-red/10 p-3 rounded-xl">
                                    <h4 className="font-bold text-brand-red uppercase tracking-wider text-[10px]">Step 4 – Final Valuation</h4>
                                    <div className="flex justify-between items-center text-zinc-800 font-mono text-[9px] mt-1">
                                        <span>{valuation.profit > 0 ? formatCurrency(valuation.profit) : formatCurrency(valuation.revenue)} × {valuation.profit > 0 ? "4.00" : "1.50"} × {valuation.profit > 0 
                                            ? ((valuation.estimatedValue / valuation.profit) / 4.0).toFixed(2)
                                            : valuation.revenue > 0 
                                                ? ((valuation.estimatedValue / valuation.revenue) / 1.5).toFixed(2)
                                                : "0.00"
                                        }</span>
                                        <strong className="text-brand-red text-sm">{formatCurrency(valuation.estimatedValue)}</strong>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Valuation Result (Premium Glow Card) */}
                    {valuation.status === 'Completed' && valuation.estimatedValue > 0 && (
                        <motion.div 
                            variants={itemVariants} 
                            whileHover={{ scale: 1.01 }}
                            className="relative overflow-hidden bg-gradient-to-br from-[#a81b21]/5 via-white to-zinc-50 border border-brand-red/15 rounded-3xl p-6 shadow-md shadow-red-900/5"
                        >
                            {/* Sparkle Glow accents */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#a81b21]/5 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#a81b21]/5 rounded-full blur-2xl" />

                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <span className="text-[10px] font-black text-brand-red uppercase tracking-widest flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 animate-spin-slow" /> Estimated Valuation
                                </span>
                                <span className="text-[9px] bg-red-50 text-brand-red font-bold px-2 py-0.5 rounded border border-red-100/50">
                                    Final Report Result
                                </span>
                            </div>

                            <div className="flex items-baseline gap-1.5 relative z-10">
                                <span className="text-3xl font-black text-[#a81b21] tracking-tight">
                                    {formatCurrency(valuation.estimatedValue)}
                                </span>
                                <span className="text-zinc-400 text-xs font-semibold">INR</span>
                            </div>

                            <p className="text-[10px] text-zinc-500 mt-2.5 leading-relaxed relative z-10">
                                Calculations derived using multi-factor DCF models, weighted capital costs, and sector multiples.
                            </p>
                        </motion.div>
                    )}

                    {/* Primary Action Button Area */}
                    <motion.div variants={itemVariants} className="space-y-4 pt-2">
                        {valuation.status === 'Completed' ? (
                            <div className="space-y-3">
                                <Button className="w-full bg-[#a81b21] hover:bg-[#8e161c] text-white gap-2 shadow-lg shadow-red-900/15 h-12 rounded-xl transition-all font-bold tracking-wide active:scale-98" asChild>
                                    <a href={valuation.downloadUrl || "#"} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-5 h-5" /> Download Report (PDF)
                                    </a>
                                </Button>
                                <p className="text-[10px] text-center text-zinc-600 font-semibold flex items-center justify-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-zinc-500" /> Compiled & certified on {formatDate(valuation.date)}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-blue-50/60 border border-blue-100/80 text-blue-900 p-4.5 rounded-2xl text-xs flex gap-3.5 items-start shadow-sm">
                                <Clock className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 animate-pulse" />
                                <div>
                                    <p className="font-bold text-blue-950 mb-1">Estimated Completion</p>
                                    <p className="text-blue-700 leading-relaxed">
                                        Our analysis team is actively working on your request. Your certified valuation is expected to be ready by <strong className="text-blue-950 font-bold">{formatDate(estimatedDate)}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Support & Footer Section */}
                    <motion.div variants={itemVariants} className="pt-6 border-t border-zinc-100 text-center">
                        <p className="text-xs text-zinc-500 font-semibold mb-1.5">Questions regarding this valuation request?</p>
                        <Button variant="link" className="text-brand-red font-bold text-xs h-auto p-0 hover:text-[#8e161c]" asChild>
                            <a href="mailto:support@realsme.com">
                                Contact Support Desk <ArrowUpRight className="w-3 h-3 ml-0.5 inline" />
                            </a>
                        </Button>
                    </motion.div>
                </motion.div>
            </SheetContent>
        </Sheet>
    )
}
