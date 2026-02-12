"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";

interface Valuation {
    id: string;
    reportId: string;
    companyName: string;
    date: string;
    status: "COMPLETED" | "PENDING" | "DRAFT";
    value: string;
}

const dummyValuations: Valuation[] = [
    { id: "1", reportId: "VAL-2024-001", companyName: "TechCorp Solutions", date: "2024-02-10", status: "COMPLETED", value: "₹ 4.5 Cr" },
    { id: "2", reportId: "VAL-2024-002", companyName: "GreenGrocers Pvt Ltd", date: "2024-02-08", status: "PENDING", value: "-" },
    { id: "3", reportId: "VAL-2024-003", companyName: "Alpha Logistics", date: "2024-02-05", status: "COMPLETED", value: "₹ 12.8 Cr" },
    { id: "4", reportId: "VAL-2024-004", companyName: "Beta Manufacturing", date: "2024-02-01", status: "DRAFT", value: "-" },
];

export function RecentValuationsTable() {
    const [search, setSearch] = useState("");
    const filtered = dummyValuations.filter(v =>
        v.companyName.toLowerCase().includes(search.toLowerCase()) ||
        v.reportId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by Company or ID..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Sl No</TableHead>
                            <TableHead>Report ID</TableHead>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Value (Indicative)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((valuation, index) => (
                            <TableRow key={valuation.id} className="hover:bg-red-50/10 transition-colors">
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell className="font-mono text-xs text-gray-500">{valuation.reportId}</TableCell>
                                <TableCell className="font-medium text-brand-red">{valuation.companyName}</TableCell>
                                <TableCell>{valuation.date}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={valuation.status === "COMPLETED" ? "default" : "secondary"}
                                        className={
                                            valuation.status === "COMPLETED" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" :
                                                valuation.status === "PENDING" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200" :
                                                    "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200"
                                        }
                                    >
                                        {valuation.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold">{valuation.value}</TableCell>
                                <TableCell className="text-right">
                                    {valuation.status === "COMPLETED" && (
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Download className="h-4 w-4 text-gray-500 hover:text-brand-red" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
