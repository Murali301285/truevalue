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
import { Download, FileText, Clock, CheckCircle2, ChevronRight, ChevronDown, Eye, Search, ChevronsLeft, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronsRight } from "lucide-react"
import React, { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

// Helper for consistent date formatting
const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
}

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

export function AdminKPICards() {
    const stats = useMemo(() => {
        const totalValuations = VALUATION_HISTORY.length;
        const totalIndustries = new Set(VALUATION_HISTORY.map(v => v.industry)).size;
        const totalRevenue = VALUATION_HISTORY.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalProfit = VALUATION_HISTORY.reduce((acc, curr) => acc + curr.profit, 0);

        return { totalValuations, totalIndustries, totalRevenue, totalProfit };
    }, []);

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


export function ValuationHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Grouping by Industry
    const groupedData = useMemo(() => {
        let result = [...VALUATION_HISTORY];

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

    }, [searchTerm]);

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
                                                                                <span className="text-[10px] text-zinc-400 font-mono">{child.id}</span>
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
                                                                                            <a href={child.downloadUrl || "#"} download title="Download Report">
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

export function UserValuationHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        let result = [...VALUATION_HISTORY];
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(item => 
                item.industry.toLowerCase().includes(lowerQuery) || 
                item.companyName.toLowerCase().includes(lowerQuery)
            );
        }
        return result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [searchTerm]);

    const totalPages = itemsPerPage === 'all' ? 1 : Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);

    const paginatedData = useMemo(() => {
        if (itemsPerPage === 'all') return filteredData;
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-semibold text-zinc-900 w-full sm:w-auto">My Valuations</h2>
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
                                        <span className="text-[10px] text-zinc-400 font-mono">{item.id}</span>
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
                                                    <a href={item.downloadUrl || "#"} download title="Download Report">
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
            <div className="border-t p-4 flex items-center justify-between text-sm text-zinc-500 bg-zinc-50 border-zinc-100">
                <div>
                    Showing {filteredData.length === 0 ? 0 : (itemsPerPage === 'all' ? 1 : (currentPage - 1) * itemsPerPage + 1)} to {itemsPerPage === 'all' ? filteredData.length : Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
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
    const steps = ["Uploaded", "Processing", "Analyst Review", "Completed"];
    let currentStepIndex = 1;
    if (valuation.status === 'Analyst Review') currentStepIndex = 2;
    if (valuation.status === 'Completed') currentStepIndex = 3;

    // Calculate estimated date safely using timestamps to avoid Date mutation issues
    const estimatedDate = new Date(new Date(valuation.date).getTime() + (2 * 24 * 60 * 60 * 1000));

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8 shadow-sm border-zinc-300" title="View Details">
                    <Eye className="w-4 h-4 text-zinc-600" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto w-full">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">Request Details</SheetTitle>
                    <SheetDescription>
                        Comprehensive breakdown of the valuation request.
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

                            <span className="text-zinc-500">Industry</span>
                            <span className="font-medium text-right">{valuation.industry}</span>

                            <span className="text-zinc-500">Request ID</span>
                            <span className="font-medium text-right font-mono text-xs">{valuation.id}</span>

                            <span className="text-zinc-500">Date Submitted</span>
                            <span className="font-medium text-right">{formatDate(valuation.date)}</span>

                            <span className="text-zinc-500">Service Tier</span>
                            <span className="font-medium text-right uppercase tracking-wide text-xs">{valuation.tier}</span>
                        </div>
                    </div>

                     {/* User Details */}
                     <div className="space-y-3 p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
                        <h4 className="font-semibold text-sm text-zinc-900 mb-2">User & Financials</h4>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-zinc-500">Client Name</span>
                            <span className="font-medium text-right">{valuation.userName}</span>

                            <span className="text-zinc-500">Phone</span>
                            <span className="font-medium text-right">{valuation.phone}</span>

                            <span className="text-zinc-500">Revenue</span>
                            <span className="font-medium text-right text-zinc-800">{formatCurrency(valuation.revenue)}</span>

                            <span className="text-zinc-500">Profit</span>
                            <span className="font-medium text-right text-emerald-600">{formatCurrency(valuation.profit)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    {valuation.status === 'Completed' ? (
                        <div className="space-y-3">
                            <Button className="w-full bg-brand-red hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-900/10 h-12" asChild>
                                <a href={valuation.downloadUrl || "#"} download>
                                    <Download className="w-5 h-5" /> Download Report (PDF)
                                </a>
                            </Button>
                            <p className="text-xs text-center text-zinc-400">Generated on {formatDate(valuation.date)}</p>
                        </div>
                    ) : (
                        <div className="bg-blue-50/80 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start shadow-sm shadow-blue-900/5">
                            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                            <div>
                                <p className="font-semibold mb-1 text-blue-900">Estimated Completion</p>
                                <p className="text-blue-700">Your report is expected to be ready by {formatDate(estimatedDate)}.</p>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div className="pt-6 border-t border-zinc-100 text-center">
                        <p className="text-sm text-zinc-500 mb-2">Need help with this request?</p>
                        <Button variant="link" className="text-brand-red font-semibold h-auto p-0">Contact Support</Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
