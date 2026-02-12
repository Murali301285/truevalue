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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react"

// Mock Data matching the screenshot reference
const PORTFOLIO_DATA = [
    {
        id: "1",
        name: "TechStart",
        icon: "T",
        color: "bg-indigo-100 text-indigo-700",
        index: 72,
        stability: 78,
        runway: 28,
        status: "WARNING"
    },
    {
        id: "2",
        name: "MfgCo",
        icon: "M",
        color: "bg-blue-100 text-blue-700",
        index: 65,
        stability: 65,
        runway: 22,
        status: "CRITICAL"
    },
    {
        id: "3",
        name: "SoftCorp",
        icon: "S",
        color: "bg-emerald-100 text-emerald-700",
        index: 88,
        stability: 92,
        runway: 45,
        status: "GOOD"
    },
    {
        id: "4",
        name: "NewVenture",
        icon: "N",
        color: "bg-red-100 text-red-700",
        index: 58,
        stability: 55,
        runway: 18,
        status: "CRITICAL"
    },
    {
        id: "5",
        name: "GrowthCo",
        icon: "G",
        color: "bg-purple-100 text-purple-700",
        index: 79,
        stability: 82,
        runway: 38,
        status: "GOOD"
    }
]

export function PortfolioTable() {
    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-50/50">
                    <TableRow>
                        <TableHead className="w-[300px]">Business Name</TableHead>
                        <TableHead>SBM Index Score</TableHead>
                        <TableHead>Financial Stability</TableHead>
                        <TableHead>Runway (Days)</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {PORTFOLIO_DATA.map((company) => (
                        <TableRow key={company.id} className="cursor-pointer hover:bg-zinc-50/50 transition-colors group">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${company.color}`}>
                                        {company.icon}
                                    </div>
                                    <span className="text-zinc-700 font-semibold text-sm group-hover:text-black">{company.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-zinc-700">{company.index}/100</span>
                                    {/* Mini progress bar */}
                                    <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${company.index >= 80 ? 'bg-emerald-500' : company.index >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                                            style={{ width: `${company.index}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-mono font-medium text-zinc-600">{company.stability}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {company.status === 'GOOD' && <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />}
                                    {company.status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50" />}
                                    {company.status === 'CRITICAL' && <AlertCircle className="w-5 h-5 text-red-500 fill-red-50" />}
                                    <span className={`font-bold ${company.status === 'GOOD' ? 'text-emerald-700' :
                                        company.status === 'WARNING' ? 'text-amber-700' : 'text-red-700'
                                        }`}>
                                        {company.runway} days
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="h-7 text-xs bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900 group-hover:opacity-100 opacity-0 transition-opacity">
                                    View Dashboard <ArrowUpRight className="w-3 h-3 ml-1" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
