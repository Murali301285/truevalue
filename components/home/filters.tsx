"use client"

import * as React from "react"
import { Search, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function HomeFilters() {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-xl border border-zinc-200 shadow-sm mb-6 h-[54px] skeleton-loader">
                {/* Skeleton state to prevent layout shift */}
                <div className="w-full h-full bg-zinc-50 rounded animate-pulse" />
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-xl border border-zinc-200 shadow-sm mb-6">

            {/* Left Group: Date & Logic */}
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Select defaultValue="jan-2026">
                    <SelectTrigger className="w-[180px] h-9 bg-zinc-50 border-zinc-200 text-zinc-600 font-medium">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jan-2026">January 2026</SelectItem>
                        <SelectItem value="feb-2026">February 2026</SelectItem>
                        <SelectItem value="mar-2026">March 2026</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="all">
                    <SelectTrigger className="w-[200px] h-9 bg-zinc-50 border-zinc-200 text-zinc-600 font-medium">
                        <Filter className="w-4 h-4 mr-2 opacity-50" />
                        <SelectValue placeholder="Company Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All | Active | Alert</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="alert">Alerts Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Right Group: Search */}
            <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                    placeholder="Search companies..."
                    className="pl-9 h-9 bg-zinc-50 border-zinc-200 focus-visible:ring-emerald-500"
                />
            </div>
        </div>
    )
}
